'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePomodoroController } from '@/hooks/usePomodoroController';
import { clamp, formatTime } from '@/lib/utils';
import {
  MODES,
  OUTCOME_BLUEPRINTS,
  USE_CASE_PRESETS,
  type LaunchPathAudience,
  type UseCasePreset,
} from '@/constants/useCases';
import { LANDING_SOCIAL_PROOF } from '@/constants/landingProof';
import { LANDING_METRICS } from '@/constants/landingMetrics';
import { LANDING_FAQ } from '@/constants/landingFaq';
import {
  XP_PER_FOCUS_MINUTE,
  XP_PER_SESSION,
  buildAchievementProgress,
  buildDailyQuestProgress,
  buildFocusCombo,
  buildFocusHealthScore,
  buildGamificationProgress,
  buildNextMilestone,
} from '@/application/GamificationEngine';
import {
  buildSessionPlannerSummary,
  buildSessionTimeline,
  buildWeeklyMomentumForecast,
  rankPresetPlans,
  recommendPresetByProfile,
  sortPresetPlans,
  type MatchmakerContext,
  type MatchmakerEnergy,
  type MatchmakerGoal,
  type PresetPlanSortMode,
} from '@/application/SessionPlannerEngine';
import {
  buildMatchmakerProfileUrl as buildMatchmakerProfileUrlFromLib,
  buildPresetQuickStartUrl as buildPresetQuickStartUrlFromLib,
  consumeQuickStartParamsFromUrl as consumeQuickStartParamsFromUrlFromLib,
  normalizePlanningMinutes as normalizePlanningMinutesFromLib,
  parseMatchmakerContext as parseMatchmakerContextFromLib,
  parseMatchmakerEnergy as parseMatchmakerEnergyFromLib,
  parseMatchmakerGoal as parseMatchmakerGoalFromLib,
} from '@/lib/quickStart';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type LaunchPathAudienceFilter = LaunchPathAudience | 'all';

const LAUNCH_PATH_AUDIENCE_OPTIONS: ReadonlyArray<{
  id: LaunchPathAudienceFilter;
  label: string;
}> = [
  { id: 'all', label: 'All paths' },
  { id: 'desk', label: 'Desk setup' },
  { id: 'mobile', label: 'Mobile / commute' },
  { id: 'reset', label: 'Momentum reset' },
] as const;

const SECTION_NAV_ITEMS = [
  { id: 'outcome-blueprints', label: '🧭 Outcome', mobileLabel: 'Wins' },
  { id: 'session-planner', label: '🗓️ Planner', mobileLabel: 'Plan' },
  { id: 'focus-timer', label: '⏱️ Timer', mobileLabel: 'Timer' },
  { id: 'task-capture', label: '✅ Tasks', mobileLabel: 'Tasks' },
] as const;

export function PomodoroApp() {
  const { state, controller } = usePomodoroController();
  const [taskText, setTaskText] = useState('');
  const [planningMinutes, setPlanningMinutes] = useState(120);
  const [matchmaker, setMatchmaker] = useState<{
    energy: MatchmakerEnergy;
    context: MatchmakerContext;
    goal: MatchmakerGoal;
  }>({
    energy: 'steady',
    context: 'desk',
    goal: 'consistency',
  });
  const [settingsForm, setSettingsForm] = useState({ focus: '', shortBreak: '', longBreak: '', longBreakInterval: '' });
  const [quickStartLinkStatus, setQuickStartLinkStatus] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installContext, setInstallContext] = useState({ isIosSafari: false, isStandalone: false });
  const [activeSectionId, setActiveSectionId] = useState('focus-timer');
  const [openFaqId, setOpenFaqId] = useState<string | null>(LANDING_FAQ[0]?.id ?? null);
  const [launchPathSortMode, setLaunchPathSortMode] = useState<PresetPlanSortMode>('best-fit');
  const [launchPathAudienceFilter, setLaunchPathAudienceFilter] = useState<LaunchPathAudienceFilter>('all');
  const hasHydratedQuickStart = useRef(false);
  const hasHydratedPlannerPreferences = useRef(false);

  const scrollToSection = (sectionId: string) => {
    if (typeof document === 'undefined') return;

    const section = document.getElementById(sectionId);
    if (!section) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  useEffect(() => {
    setSettingsForm({
      focus: String(state.settings.focus),
      shortBreak: String(state.settings.shortBreak),
      longBreak: String(state.settings.longBreak),
      longBreakInterval: String(state.settings.longBreakInterval),
    });
  }, [state.settings]);

  useEffect(() => {
    document.title = `${formatTime(state.timer.remaining)} • Loose`;
  }, [state.timer.remaining]);

  useEffect(() => {
    const shouldIgnoreHotkeys = (active: HTMLElement | null) => {
      if (!active) return false;
      if (active.isContentEditable) return true;

      const tag = active.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button';
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (shouldIgnoreHotkeys(active)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        controller.toggleTimer();
      }

      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        controller.resetTimer();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [controller]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setInstallContext({
      isIosSafari: isIosDevice && isSafari,
      isStandalone,
    });

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setQuickStartLinkStatus({
        kind: 'success',
        message: 'Loose installed. You can now launch it from your home screen.',
      });
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sections = ['session-planner', 'focus-timer', 'task-capture', 'outcome-blueprints']
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSectionId(visible.target.id);
        }
      },
      {
        root: null,
        threshold: [0.35, 0.6, 0.85],
        rootMargin: '-20% 0px -45% 0px',
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const progress = useMemo(
    () => clamp(((state.timer.total - state.timer.remaining) / state.timer.total) * 100 || 0, 0, 100),
    [state.timer.remaining, state.timer.total],
  );

  const weekMaxSessions = useMemo(
    () => Math.max(...state.analytics.week.map((day) => day.sessions), 1),
    [state.analytics.week],
  );

  const gamification = useMemo(() => buildGamificationProgress(state), [state]);
  const focusCombo = useMemo(() => buildFocusCombo(state), [state]);
  const nextMilestone = useMemo(() => buildNextMilestone(state), [state]);

  const sessionPulse = useMemo(() => {
    const completedInCycle = state.stats.completed % state.settings.longBreakInterval;
    const sessionsUntilLongBreak = state.settings.longBreakInterval - completedInCycle;

    if (state.mode === 'focus') {
      const nextBreak = sessionsUntilLongBreak <= 1 ? 'Long break unlocked next.' : 'Short break next.';
      const baseXpReward = state.settings.focus * XP_PER_FOCUS_MINUTE + XP_PER_SESSION;
      const comboReward = Math.round(baseXpReward * focusCombo.multiplier);

      return {
        title: `+${comboReward} XP if you finish this block (combo x${focusCombo.multiplier.toFixed(1)})`,
        detail: `${nextBreak} ${sessionsUntilLongBreak <= 1 ? '' : `${sessionsUntilLongBreak - 1} more focus win${sessionsUntilLongBreak - 1 === 1 ? '' : 's'} until long break.`}`.trim(),
      };
    }

    if (state.mode === 'shortBreak') {
      return {
        title: 'Recovery run active',
        detail: 'Finishing this short break resets your focus engine for the next XP block.',
      };
    }

    return {
      title: 'Deep recovery active',
      detail: 'Long break complete → fresh cycle starts with maximum focus quality.',
    };
  }, [focusCombo.multiplier, state.mode, state.settings.focus, state.settings.longBreakInterval, state.stats.completed]);

  const achievementProgress = useMemo(() => buildAchievementProgress(state), [state]);

  const questProgress = useMemo(() => buildDailyQuestProgress(state), [state]);

  const socialProofPulse = useMemo(() => {
    const totalFocusWins = LANDING_SOCIAL_PROOF.reduce((sum, story) => {
      const wins = Number(story.focusWins.match(/\d+/)?.[0] ?? 0);
      return sum + wins;
    }, 0);

    const averageStreakLift = LANDING_SOCIAL_PROOF.length
      ? Math.round(
          LANDING_SOCIAL_PROOF.reduce((sum, story) => {
            const lift = Number(story.streakLift.match(/-?\d+/)?.[0] ?? 0);
            return sum + lift;
          }, 0) / LANDING_SOCIAL_PROOF.length,
        )
      : 0;

    return {
      stories: LANDING_SOCIAL_PROOF.length,
      totalFocusWins,
      averageStreakLift,
      blueprintCoverage: new Set(LANDING_SOCIAL_PROOF.map((story) => story.blueprint)).size,
    };
  }, []);

  const focusHealth = useMemo(() => buildFocusHealthScore(state), [state]);

  const momentumStats = useMemo(() => {
    const totalHours = (state.stats.focusMinutes / 60).toFixed(1);
    const avgMinutesPerSession = state.stats.completed
      ? Math.round(state.stats.focusMinutes / state.stats.completed)
      : 0;
    const activeDays = state.analytics.week.filter((day) => day.sessions > 0).length;

    return {
      totalHours,
      avgMinutesPerSession,
      activeDays,
    };
  }, [state.analytics.week, state.stats.completed, state.stats.focusMinutes]);

  const activePreset = useMemo(
    () =>
      USE_CASE_PRESETS.find((preset) =>
        preset.settings.focus === state.settings.focus &&
        preset.settings.shortBreak === state.settings.shortBreak &&
        preset.settings.longBreak === state.settings.longBreak &&
        preset.settings.longBreakInterval === state.settings.longBreakInterval,
      ),
    [state.settings],
  );

  const activeModeLabel = useMemo(
    () => MODES.find((mode) => mode.key === state.mode)?.label ?? 'Focus',
    [state.mode],
  );

  const plannerSettings = activePreset?.settings ?? state.settings;

  const sessionPlanner = useMemo(
    () => buildSessionPlannerSummary(plannerSettings, planningMinutes),
    [plannerSettings, planningMinutes],
  );

  const sessionTimeline = useMemo(
    () => buildSessionTimeline(plannerSettings, planningMinutes),
    [plannerSettings, planningMinutes],
  );

  const plannerRunMinutes = useMemo(
    () => sessionTimeline[sessionTimeline.length - 1]?.endsAtMinute ?? plannerSettings.focus,
    [plannerSettings.focus, sessionTimeline],
  );

  const weeklyMomentumForecast = useMemo(
    () => buildWeeklyMomentumForecast(plannerSettings, planningMinutes, gamification.xpToNextLevel),
    [plannerSettings, planningMinutes, gamification.xpToNextLevel],
  );

  const rankedPresetPlans = useMemo(
    () => rankPresetPlans(USE_CASE_PRESETS, planningMinutes),
    [planningMinutes],
  );

  const launchPathAudienceCounts = useMemo(() => {
    const counts: Record<LaunchPathAudienceFilter, number> = {
      all: rankedPresetPlans.length,
      desk: 0,
      mobile: 0,
      reset: 0,
    };

    rankedPresetPlans.forEach((plan) => {
      plan.preset.audience.forEach((audience) => {
        counts[audience] += 1;
      });
    });

    return counts;
  }, [rankedPresetPlans]);

  const launchPathAudienceOptions = useMemo(
    () => LAUNCH_PATH_AUDIENCE_OPTIONS.map((option) => ({
      ...option,
      label: `${option.label} (${launchPathAudienceCounts[option.id]})`,
    })),
    [launchPathAudienceCounts],
  );

  const filteredLaunchPathPlans = useMemo(
    () => (launchPathAudienceFilter === 'all'
      ? rankedPresetPlans
      : rankedPresetPlans.filter((plan) => plan.preset.audience.includes(launchPathAudienceFilter))),
    [launchPathAudienceFilter, rankedPresetPlans],
  );

  const sortedLaunchPathPlans = useMemo(
    () => sortPresetPlans(filteredLaunchPathPlans, launchPathSortMode),
    [filteredLaunchPathPlans, launchPathSortMode],
  );

  const topPresetScoreboard = sortedLaunchPathPlans.slice(0, 3);

  const launchPathTimings = useMemo(() => {
    const entries = topPresetScoreboard.map((plan) => {
      const timeline = buildSessionTimeline(plan.preset.settings, planningMinutes);
      const totalMinutes = timeline[timeline.length - 1]?.endsAtMinute ?? plan.preset.settings.focus;

      return [
        plan.preset.id,
        {
          totalMinutes,
          finishByLabel: formatFinishBy(totalMinutes),
        },
      ] as const;
    });

    return new Map(entries);
  }, [planningMinutes, topPresetScoreboard]);

  const recommendedPreset = sortedLaunchPathPlans[0] ?? rankedPresetPlans[0];

  const roiProjection = useMemo(() => {
    const dailyFocusHours = Number((sessionPlanner.estimatedFocusMinutes / 60).toFixed(1));
    const weeklyFocusHours = Number((dailyFocusHours * 5).toFixed(1));
    const monthlyFocusHours = Number((dailyFocusHours * 22).toFixed(1));

    const weeklySessions = sessionPlanner.estimatedSessions * 5;
    const monthlySessions = sessionPlanner.estimatedSessions * 22;

    const weeklyXp = sessionPlanner.estimatedXp * 5;
    const monthlyXp = sessionPlanner.estimatedXp * 22;

    return {
      dailyFocusHours,
      weeklyFocusHours,
      monthlyFocusHours,
      weeklySessions,
      monthlySessions,
      weeklyXp,
      monthlyXp,
    };
  }, [sessionPlanner.estimatedFocusMinutes, sessionPlanner.estimatedSessions, sessionPlanner.estimatedXp]);

  const activePlaybookPreset = activePreset ?? recommendedPreset?.preset ?? USE_CASE_PRESETS[0];

  const taskTemplates = useMemo(
    () => activePreset?.taskTemplates ?? recommendedPreset?.preset.taskTemplates ?? USE_CASE_PRESETS[0].taskTemplates,
    [activePreset, recommendedPreset?.preset.taskTemplates],
  );

  const profileRecommendation = useMemo(
    () => recommendPresetByProfile(USE_CASE_PRESETS, matchmaker),
    [matchmaker],
  );

  const rescuePreset = profileRecommendation?.preset ?? recommendedPreset?.preset ?? USE_CASE_PRESETS[0];

  const streakRescue = useMemo(() => {
    const weeklyActiveDays = state.analytics.week.filter((day) => day.sessions > 0).length;
    const hasTodaySession = state.analytics.today.sessions > 0;

    return {
      show: !hasTodaySession,
      weeklyActiveDays,
      nextTarget: Math.min(weeklyActiveDays + 1, 7),
    };
  }, [state.analytics.today.sessions, state.analytics.week]);

  const showQuickOnboarding = state.stats.completed === 0 && state.tasks.length === 0;
  const canTriggerInstall = Boolean(deferredInstallPrompt) || (installContext.isIosSafari && !installContext.isStandalone);
  const installActionLabel = deferredInstallPrompt
    ? 'Install'
    : installContext.isIosSafari && !installContext.isStandalone
      ? 'Add to Home'
      : 'Install';

  const sectionNavIndex = useMemo(
    () => SECTION_NAV_ITEMS.findIndex((item) => item.id === activeSectionId),
    [activeSectionId],
  );

  const nextSectionNavItem = useMemo(() => {
    if (!SECTION_NAV_ITEMS.length) return null;

    const normalizedIndex = sectionNavIndex >= 0 ? sectionNavIndex : 0;
    const nextIndex = (normalizedIndex + 1) % SECTION_NAV_ITEMS.length;
    return SECTION_NAV_ITEMS[nextIndex];
  }, [sectionNavIndex]);

  const onboardingChecklist = useMemo(() => {
    const items = [
      {
        id: 'outcome',
        label: activePreset
          ? `Outcome selected: ${activePreset.name}`
          : 'Pick a use-case blueprint',
        done: Boolean(activePreset),
        action: {
          label: 'Pick outcome',
          run: () => scrollToSection('outcome-blueprints'),
        },
      },
      {
        id: 'task',
        label: state.tasks.length
          ? `Task captured: ${state.tasks[0]?.text ?? 'Ready'}`
          : 'Add your first task',
        done: state.tasks.length > 0,
        action: {
          label: 'Add task',
          run: () => scrollToSection('task-capture'),
        },
      },
      {
        id: 'focus',
        label: state.stats.completed
          ? `First focus win complete (${state.stats.completed} total)`
          : 'Complete one focus session',
        done: state.stats.completed > 0,
        action: {
          label: 'Go to timer',
          run: () => scrollToSection('focus-timer'),
        },
      },
    ];

    const completed = items.filter((item) => item.done).length;
    return {
      items,
      completed,
      percent: Math.round((completed / items.length) * 100),
    };
  }, [activePreset, state.stats.completed, state.tasks]);

  const applyPreset = (preset: UseCasePreset) => {
    controller.updateSettings(preset.settings);
    setSettingsForm({
      focus: String(preset.settings.focus),
      shortBreak: String(preset.settings.shortBreak),
      longBreak: String(preset.settings.longBreak),
      longBreakInterval: String(preset.settings.longBreakInterval),
    });
  };

  const applyPresetAndStart = (preset: UseCasePreset) => {
    applyPreset(preset);
    controller.beginFocusSession();
  };

  const startRecommendedFocusNow = () => {
    const preset = recommendedPreset?.preset ?? USE_CASE_PRESETS[0];
    applyPresetAndStart(preset);
    scrollToSection('focus-timer');
  };

  const addSuggestedTask = (task: string) => {
    const normalizedTask = task.trim().slice(0, 90);
    if (!normalizedTask) return;

    const hasDuplicate = state.tasks.some((item) => item.text.toLowerCase() === normalizedTask.toLowerCase());
    if (hasDuplicate) {
      setTaskText(normalizedTask);
      return;
    }

    controller.addTask(normalizedTask);
    setTaskText('');
  };

  const installLooseApp = async () => {
    if (!deferredInstallPrompt) {
      setQuickStartLinkStatus({
        kind: installContext.isIosSafari && !installContext.isStandalone ? 'success' : 'error',
        message: installContext.isIosSafari && !installContext.isStandalone
          ? 'On iPhone/iPad: tap Share, then “Add to Home Screen” to install Loose.'
          : 'Install option is not available in this browser yet.',
      });
      return;
    }

    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      setQuickStartLinkStatus({
        kind: 'success',
        message: 'Install accepted. Loose is being added to your device.',
      });
    } else {
      setQuickStartLinkStatus({
        kind: 'error',
        message: 'Install dismissed. You can retry anytime from this button.',
      });
    }

    setDeferredInstallPrompt(null);
  };

  const copyPresetQuickStartLink = async (preset: UseCasePreset) => {
    if (typeof window === 'undefined') return;

    if (!navigator.clipboard) {
      setQuickStartLinkStatus({
        kind: 'error',
        message: 'Clipboard unavailable in this browser context.',
      });
      return;
    }

    try {
      const seededTask = state.tasks.find((task) => !task.done)?.text ?? taskText.trim();
      const quickStartUrl = buildPresetQuickStartUrl(window.location.href, preset.id, {
        planningMinutes,
        task: seededTask,
      });
      await navigator.clipboard.writeText(quickStartUrl);
      setQuickStartLinkStatus({
        kind: 'success',
        message: `Copied ${preset.name} quick-start link.`,
      });
    } catch {
      setQuickStartLinkStatus({
        kind: 'error',
        message: 'Could not copy quick-start link. Try again.',
      });
    }
  };

  const copyMatchmakerProfileLink = async () => {
    if (typeof window === 'undefined') return;

    if (!navigator.clipboard) {
      setQuickStartLinkStatus({
        kind: 'error',
        message: 'Clipboard unavailable in this browser context.',
      });
      return;
    }

    try {
      const profileUrl = buildMatchmakerProfileUrl(window.location.href, matchmaker, planningMinutes);
      await navigator.clipboard.writeText(profileUrl);
      setQuickStartLinkStatus({
        kind: 'success',
        message: 'Copied matchmaker profile link.',
      });
    } catch {
      setQuickStartLinkStatus({
        kind: 'error',
        message: 'Could not copy matchmaker profile link. Try again.',
      });
    }
  };

  const shareLink = async (url: string, title: string, text: string, successMessage: string) => {
    if (typeof window === 'undefined') return;

    if (!navigator.share) {
      setQuickStartLinkStatus({
        kind: 'error',
        message: 'Native sharing is unavailable on this device. Try copy link instead.',
      });
      return;
    }

    try {
      await navigator.share({
        title,
        text,
        url,
      });
      setQuickStartLinkStatus({
        kind: 'success',
        message: successMessage,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setQuickStartLinkStatus({
        kind: 'error',
        message: 'Could not open share sheet right now. Try again.',
      });
    }
  };

  const sharePresetQuickStartLink = async (preset: UseCasePreset) => {
    if (typeof window === 'undefined') return;

    const seededTask = state.tasks.find((task) => !task.done)?.text ?? taskText.trim();
    const quickStartUrl = buildPresetQuickStartUrl(window.location.href, preset.id, {
      planningMinutes,
      task: seededTask,
    });

    await shareLink(
      quickStartUrl,
      `Loose quick start · ${preset.name}`,
      `Run ${preset.name} on Loose with one tap.`,
      `Shared ${preset.name} quick-start link.`,
    );
  };

  const shareMatchmakerProfileLink = async () => {
    if (typeof window === 'undefined') return;

    const profileUrl = buildMatchmakerProfileUrl(window.location.href, matchmaker, planningMinutes);

    await shareLink(
      profileUrl,
      'Loose profile matchmaker',
      'Use this profile to get a best-fit Loose rhythm.',
      'Shared matchmaker profile link.',
    );
  };

  useEffect(() => {
    if (hasHydratedPlannerPreferences.current || typeof window === 'undefined') return;

    hasHydratedPlannerPreferences.current = true;

    try {
      const storedPlanningMinutes = Number(window.localStorage.getItem('loose.planningMinutes'));
      if (Number.isFinite(storedPlanningMinutes) && storedPlanningMinutes >= 60) {
        setPlanningMinutes(normalizePlanningMinutes(storedPlanningMinutes));
      }

      const storedMatchmaker = window.localStorage.getItem('loose.matchmakerProfile');
      if (storedMatchmaker) {
        const parsed = JSON.parse(storedMatchmaker) as Partial<{
          energy: MatchmakerEnergy;
          context: MatchmakerContext;
          goal: MatchmakerGoal;
        }>;

        const energy = parseMatchmakerEnergy(parsed.energy ?? null);
        const context = parseMatchmakerContext(parsed.context ?? null);
        const goal = parseMatchmakerGoal(parsed.goal ?? null);

        if (energy && context && goal) {
          setMatchmaker({ energy, context, goal });
        }
      }
    } catch {
      // Ignore malformed local preferences.
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedPlannerPreferences.current || typeof window === 'undefined') return;

    window.localStorage.setItem('loose.planningMinutes', String(planningMinutes));
    window.localStorage.setItem('loose.matchmakerProfile', JSON.stringify(matchmaker));
  }, [matchmaker, planningMinutes]);

  useEffect(() => {
    if (hasHydratedQuickStart.current || typeof window === 'undefined') return;

    hasHydratedQuickStart.current = true;

    const params = new URLSearchParams(window.location.search);
    const presetId = params.get('preset');
    const profileEnergy = parseMatchmakerEnergy(params.get('profileEnergy'));
    const profileContext = parseMatchmakerContext(params.get('profileContext'));
    const profileGoal = parseMatchmakerGoal(params.get('profileGoal'));

    const hasQuickStartPreset = Boolean(presetId);
    const hasProfileSeed = Boolean(profileEnergy && profileContext && profileGoal);

    if (!hasQuickStartPreset && !hasProfileSeed) return;

    const planningMinutesParam = Number(params.get('minutes'));
    if (Number.isFinite(planningMinutesParam) && planningMinutesParam >= 60) {
      setPlanningMinutes(normalizePlanningMinutes(planningMinutesParam));
    }

    if (hasProfileSeed && profileEnergy && profileContext && profileGoal) {
      setMatchmaker({
        energy: profileEnergy,
        context: profileContext,
        goal: profileGoal,
      });
    }

    if (presetId) {
      const preset = USE_CASE_PRESETS.find((item) => item.id === presetId);
      if (preset) {
        const seededTask = params.get('task')?.trim();
        if (seededTask) {
          const normalizedTask = seededTask.slice(0, 90);
          setTaskText(normalizedTask);
          controller.addTask(normalizedTask);
        }

        controller.updateSettings(preset.settings);
        setSettingsForm({
          focus: String(preset.settings.focus),
          shortBreak: String(preset.settings.shortBreak),
          longBreak: String(preset.settings.longBreak),
          longBreakInterval: String(preset.settings.longBreakInterval),
        });

        const shouldAutostart = params.get('autostart') === '1';
        if (shouldAutostart) {
          controller.beginFocusSession();
        }

        const hydrationNotes: string[] = [];
        if (params.get('minutes')) hydrationNotes.push('planner synced');
        if (seededTask) hydrationNotes.push('task imported');
        if (hasProfileSeed) hydrationNotes.push('matchmaker synced');

        setQuickStartLinkStatus({
          kind: 'success',
          message: shouldAutostart
            ? `Quick start loaded: ${preset.name} and timer started${hydrationNotes.length ? ` (${hydrationNotes.join(', ')})` : ''}.`
            : `Quick start loaded: ${preset.name}${hydrationNotes.length ? ` (${hydrationNotes.join(', ')})` : ''}.`,
        });
      }
    } else if (hasProfileSeed) {
      setQuickStartLinkStatus({
        kind: 'success',
        message: 'Matchmaker profile loaded from shared link.',
      });
    }

    consumeQuickStartParamsFromUrl(window.location.href);
  }, [controller]);

  useEffect(() => {
    if (!quickStartLinkStatus) return;

    const timeoutId = window.setTimeout(() => {
      setQuickStartLinkStatus(null);
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [quickStartLinkStatus]);

  return (
    <main className="app">
      <header>
        <h1>Loose</h1>
        <p>Your productivity OS for study and work.</p>
      </header>

      <nav className="section-dock" aria-label="Page sections">
        {SECTION_NAV_ITEMS.map((item) => {
          const isActive = activeSectionId === item.id;

          return (
            <button
              key={`section-dock-${item.id}`}
              type="button"
              className={isActive ? 'active' : ''}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <aside className="mobile-command-bar" aria-label="Mobile quick actions">
        <button type="button" onClick={() => controller.toggleTimer()}>
          {state.timer.running ? '⏸ Pause' : '▶️ Start'}
        </button>
        <button type="button" className="ghost" onClick={() => controller.resetTimer()}>
          ↺ Reset
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => nextSectionNavItem && scrollToSection(nextSectionNavItem.id)}
          disabled={!nextSectionNavItem}
        >
          🧭 {nextSectionNavItem ? `Next: ${nextSectionNavItem.mobileLabel}` : 'Sections'}
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => void installLooseApp()}
          disabled={!canTriggerInstall}
        >
          📲 {installActionLabel}
        </button>
      </aside>

      <section className="startup-hero" aria-label="Loose value proposition">
        <div className="hero-eyebrow">Built for real outcomes, not random timer streaks</div>
        <h2>Turn every study block into measurable momentum.</h2>
        <p>
          Pick a goal, get a battle-tested focus rhythm, and watch your XP, streak, and weekly consistency compound.
        </p>
        <div className="hero-pills">
          <span>⚡ Use-case-first presets</span>
          <span>🎮 Gamified focus loop</span>
          <span>📱 Mobile-ready quick controls</span>
        </div>
        <div className="hero-kpis" aria-label="Proof of momentum">
          <article>
            <strong>{gamification.xp.toLocaleString()}</strong>
            <span>Total XP</span>
          </article>
          <article>
            <strong>{state.stats.completed}</strong>
            <span>Focus wins</span>
          </article>
          <article>
            <strong>{state.analytics.streak.best}d</strong>
            <span>Best streak</span>
          </article>
        </div>
        <div className="hero-actions">
          <a href="#outcome-blueprints">Start with an outcome</a>
          <button type="button" className="ghost" onClick={startRecommendedFocusNow}>
            Run best-fit focus now
          </button>
          <a href="#session-planner" className="ghost-link">Plan my day</a>
          <button
            type="button"
            className="ghost install-cta"
            onClick={() => void installLooseApp()}
            disabled={!deferredInstallPrompt && !(installContext.isIosSafari && !installContext.isStandalone)}
          >
            {deferredInstallPrompt
              ? 'Install Loose app'
              : installContext.isIosSafari && !installContext.isStandalone
                ? 'Install on iPhone'
                : 'Install unavailable'}
          </button>
        </div>
        {installContext.isIosSafari && !installContext.isStandalone ? (
          <p className="install-hint" role="status">iOS install: Share → Add to Home Screen.</p>
        ) : null}
      </section>

      <section className="landing-metrics-strip" aria-label="Loose startup proof metrics">
        {LANDING_METRICS.map((metric) => (
          <article key={metric.id}>
            <div className="landing-metric-head">
              <strong>{metric.icon} {metric.label}</strong>
              <span>{metric.value}</span>
            </div>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="launch-paths" aria-label="Quick launch paths">
        <div className="launch-paths-head">
          <h2>Pick a launch path for today</h2>
          <span>One tap to run a proven rhythm for your available {planningMinutes} minutes.</span>
          <div className="launch-path-audience" role="group" aria-label="Launch path audience filter">
            {launchPathAudienceOptions.map((option) => {
              const isActive = launchPathAudienceFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={isActive ? 'active' : ''}
                  aria-pressed={isActive}
                  onClick={() => setLaunchPathAudienceFilter(option.id)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <label className="launch-path-sort" htmlFor="launch-path-sort-mode">
            Sort by
            <select
              id="launch-path-sort-mode"
              value={launchPathSortMode}
              onChange={(event) => setLaunchPathSortMode(event.target.value as PresetPlanSortMode)}
            >
              <option value="best-fit">Best fit</option>
              <option value="xp-hour">XP per hour</option>
              <option value="fast-finish">Fast finish cycle</option>
            </select>
          </label>
        </div>
        {topPresetScoreboard.length ? (
          <div className="launch-paths-grid">
            {topPresetScoreboard.map((plan) => (
              <article key={`launch-${plan.preset.id}`} className="launch-path-card">
                <div className="launch-path-card-head">
                  <strong>{plan.preset.icon} {plan.preset.name}</strong>
                  <span>{Math.round(plan.focusRatio * 100)}% focus density</span>
                </div>
                <p>{plan.preset.outcome}</p>
                <div className="preset-tags" aria-label={`${plan.preset.name} ideal for`}>
                  {plan.preset.idealFor.map((item) => (
                    <span key={`${plan.preset.id}-${item}`}>{item}</span>
                  ))}
                </div>
                <ul>
                  <li><span>Rhythm</span><strong>{plan.preset.settings.focus}/{plan.preset.settings.shortBreak}/{plan.preset.settings.longBreak}</strong></li>
                  <li><span>Sessions/day</span><strong>{plan.sessions}</strong></li>
                  <li><span>Projected XP/hour</span><strong>{plan.xpPerHour}</strong></li>
                  <li>
                    <span>Finish by (if started now)</span>
                    <strong>{launchPathTimings.get(plan.preset.id)?.finishByLabel ?? formatFinishBy(plan.preset.settings.focus)}</strong>
                  </li>
                </ul>
                <div className="preset-actions">
                  <button type="button" onClick={() => applyPreset(plan.preset)}>Apply path</button>
                  <button type="button" className="ghost" onClick={() => applyPresetAndStart(plan.preset)}>Run now</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="launch-path-empty" role="status">
            <span>No paths match this audience yet.</span>
            <button type="button" className="ghost" onClick={() => setLaunchPathAudienceFilter('all')}>
              Reset to all paths
            </button>
          </div>
        )}
      </section>

      <section className="landing-social-proof" aria-label="Real use-case momentum wins">
        <div className="landing-social-proof-head">
          <h2>Outcome-first wins from real focus routines</h2>
          <span>Short stories mapped directly to Loose blueprints.</span>
        </div>
        <div className="landing-social-proof-pulse" aria-label="Social proof summary">
          <article>
            <span>Stories</span>
            <strong>{socialProofPulse.stories}</strong>
          </article>
          <article>
            <span>Focus wins logged</span>
            <strong>{socialProofPulse.totalFocusWins}</strong>
          </article>
          <article>
            <span>Avg streak lift</span>
            <strong>+{socialProofPulse.averageStreakLift} days</strong>
          </article>
          <article>
            <span>Blueprint coverage</span>
            <strong>{socialProofPulse.blueprintCoverage} paths</strong>
          </article>
        </div>
        <div className="landing-social-proof-grid">
          {LANDING_SOCIAL_PROOF.map((story) => (
            <article key={story.id}>
              <div className="story-head">
                <strong>{story.icon} {story.archetype}</strong>
                <span>{story.blueprint}</span>
              </div>
              <p>{story.quote}</p>
              <ul aria-label={`Momentum stats for ${story.archetype}`}>
                <li><span>Outcome</span><strong>{story.outcome}</strong></li>
                <li><span>Streak lift</span><strong>{story.streakLift}</strong></li>
                <li><span>Focus sessions</span><strong>{story.focusWins}</strong></li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="startup-proof" aria-label="How Loose works">
        <div className="startup-proof-head">
          <h2>How teams and solo builders use Loose in under 60 seconds</h2>
          <span>Use-case-first flow designed for quick activation.</span>
        </div>
        <div className="startup-proof-grid">
          <article>
            <strong>1) Pick your outcome</strong>
            <p>Choose exam prep, deep-work sprint, or momentum restart. Loose auto-maps to the best rhythm.</p>
          </article>
          <article>
            <strong>2) Run the session engine</strong>
            <p>Start instantly with one tap. Timer mode, XP, streaks, and breaks stay synchronized in one loop.</p>
          </article>
          <article>
            <strong>3) Compound visible wins</strong>
            <p>Track weekly consistency, unlock milestones, and ship real progress instead of random timer noise.</p>
          </article>
        </div>
      </section>

      <section className="landing-faq" aria-label="Frequently asked questions about Loose">
        <div className="landing-faq-head">
          <h2>FAQ</h2>
          <span>Quick answers before you start your first session.</span>
        </div>
        <div className="landing-faq-grid">
          {LANDING_FAQ.map((item) => {
            const isOpen = openFaqId === item.id;

            return (
              <article key={item.id}>
                <button
                  type="button"
                  className="faq-toggle"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqId((current) => (current === item.id ? null : item.id))}
                >
                  <h3>{item.question}</h3>
                  <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen ? <p>{item.answer}</p> : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="roi-strip" aria-label="Focus return-on-time projection">
        <div className="roi-strip-head">
          <h2>What this plan returns in 1 week and 1 month</h2>
          <span>Use-case-first projection based on your current daily plan ({planningMinutes} min/day).</span>
        </div>
        <div className="roi-strip-grid">
          <article>
            <strong>1 Day</strong>
            <p>{roiProjection.dailyFocusHours}h focused</p>
            <small>{sessionPlanner.estimatedSessions} sessions · {sessionPlanner.estimatedXp} XP</small>
          </article>
          <article>
            <strong>1 Week (5 days)</strong>
            <p>{roiProjection.weeklyFocusHours}h focused</p>
            <small>{roiProjection.weeklySessions} sessions · {roiProjection.weeklyXp} XP</small>
          </article>
          <article>
            <strong>1 Month (22 days)</strong>
            <p>{roiProjection.monthlyFocusHours}h focused</p>
            <small>{roiProjection.monthlySessions} sessions · {roiProjection.monthlyXp} XP</small>
          </article>
        </div>
      </section>

      <section className="use-case-playbook" aria-label="Use-case execution playbook">
        <div className="use-case-playbook-head">
          <h2>{activePlaybookPreset.icon} {activePlaybookPreset.name} Playbook</h2>
          <span>Use-case-first execution guide. Switch presets to load a different runbook.</span>
        </div>
        <div className="use-case-playbook-grid">
          <article>
            <strong>Objective</strong>
            <p>{activePlaybookPreset.playbook.objective}</p>
          </article>
          <article>
            <strong>Kickoff</strong>
            <p>{activePlaybookPreset.playbook.kickoff}</p>
          </article>
          <article>
            <strong>Loop</strong>
            <p>{activePlaybookPreset.playbook.loop}</p>
          </article>
          <article>
            <strong>Review</strong>
            <p>{activePlaybookPreset.playbook.review}</p>
          </article>
        </div>
      </section>

      <section className="preset-scoreboard" aria-label="Top preset scorecard">
        <div className="preset-scoreboard-head">
          <h2>Best-fit presets for your {planningMinutes}-minute plan</h2>
          <span>Ranked by focus density and low context-switch waste.</span>
        </div>
        <div className="preset-scoreboard-grid">
          {topPresetScoreboard.map((plan, index) => (
            <article key={`score-${plan.preset.id}`} className="preset-scoreboard-card">
              <div className="preset-scoreboard-rank">#{index + 1}</div>
              <strong>{plan.preset.icon} {plan.preset.name}</strong>
              <p>{plan.preset.description}</p>
              <ul>
                <li><span>Focus ratio</span><strong>{Math.round(plan.focusRatio * 100)}%</strong></li>
                <li><span>Sessions</span><strong>{plan.sessions}</strong></li>
                <li><span>XP/hour</span><strong>{plan.xpPerHour}</strong></li>
              </ul>
              <div className="preset-scoreboard-actions">
                <button type="button" onClick={() => applyPreset(plan.preset)}>Apply rhythm</button>
                <button type="button" className="ghost" onClick={() => applyPresetAndStart(plan.preset)}>Run now</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {showQuickOnboarding ? (
        <section className="quick-onboarding" aria-label="Quick onboarding">
          <div className="quick-onboarding-head">
            <h2>Choose your first win</h2>
            <span>Pick an outcome, auto-apply the rhythm, and start your first focus block.</span>
          </div>
          <div className="quick-onboarding-grid">
            {OUTCOME_BLUEPRINTS.map((blueprint) => {
              const preset = USE_CASE_PRESETS.find((item) => item.id === blueprint.presetId);
              if (!preset) return null;

              return (
                <button
                  type="button"
                  className="quick-onboarding-card"
                  key={`quick-${blueprint.id}`}
                  onClick={() => applyPresetAndStart(preset)}
                >
                  <strong>{blueprint.icon} {blueprint.title}</strong>
                  <span>{blueprint.summary}</span>
                  <small>
                    {preset.settings.focus}/{preset.settings.shortBreak}/{preset.settings.longBreak} min • every {preset.settings.longBreakInterval} sessions
                  </small>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="onboarding-progress" aria-label="First-win onboarding progress">
        <div className="onboarding-progress-head">
          <h2>First-Win Checklist</h2>
          <span>{onboardingChecklist.completed}/{onboardingChecklist.items.length} complete</span>
        </div>
        <div className="progress-wrap" aria-hidden="true">
          <div className="progress-bar onboarding-progress-bar" style={{ width: `${onboardingChecklist.percent}%` }} />
        </div>
        <ul>
          {onboardingChecklist.items.map((item) => (
            <li key={item.id} className={item.done ? 'done' : ''}>
              <strong>{item.done ? '✅' : '⬜'}</strong>
              <span>{item.label}</span>
              {!item.done ? (
                <button type="button" className="onboarding-action" onClick={item.action.run}>
                  {item.action.label}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="momentum" aria-label="Momentum snapshot">
        <div className="momentum-head">
          <h2>Momentum Snapshot</h2>
          <span>Proof your system is compounding.</span>
        </div>
        <div className="momentum-grid">
          <article className="momentum-card">
            <strong>⏱️ {momentumStats.totalHours}h</strong>
            <p>Total focused hours tracked</p>
          </article>
          <article className="momentum-card">
            <strong>🍅 {formatAverageMinutes(momentumStats.avgMinutesPerSession)}m</strong>
            <p>Average minutes per completed session</p>
          </article>
          <article className="momentum-card">
            <strong>📈 {momentumStats.activeDays}/7</strong>
            <p>Active days this week</p>
          </article>
          <article className="momentum-card">
            <strong>🧭 {focusHealth.score} · {focusHealth.tier}</strong>
            <p>Focus Health Score ({focusHealth.metrics.weeklySessions} sessions, {focusHealth.metrics.streak}d streak)</p>
            <small>{focusHealth.recommendation}</small>
          </article>
        </div>
      </section>

      {streakRescue.show ? (
        <section className="streak-rescue" aria-label="Momentum rescue">
          <div className="streak-rescue-head">
            <h2>Keep your streak alive today</h2>
            <span>{streakRescue.weeklyActiveDays}/7 active days this week</span>
          </div>
          <p>
            One focused block today pushes you to <strong>{streakRescue.nextTarget}/7 active days</strong>. Start with the best-fit rhythm and lock in momentum.
          </p>
          <div className="streak-rescue-actions">
            <button type="button" onClick={() => applyPresetAndStart(rescuePreset)}>
              {rescuePreset.icon} Rescue with {rescuePreset.name}
            </button>
            <button type="button" className="ghost" onClick={() => scrollToSection('session-planner')}>
              Tune plan first
            </button>
          </div>
        </section>
      ) : null}

      <section id="session-planner" className="session-planner" aria-label="Daily session planner">
        <div className="planner-head">
          <h2>Daily Session Planner</h2>
          <span>Model your day before you start.</span>
        </div>
        <div className="planner-body">
          <label htmlFor="planningMinutes">Available deep-work time: {planningMinutes} min</label>
          <input
            id="planningMinutes"
            type="range"
            min={60}
            max={360}
            step={15}
            value={planningMinutes}
            onChange={(e) => setPlanningMinutes(Number(e.target.value))}
          />
          <div className="planner-metrics">
            <article>
              <strong>{sessionPlanner.estimatedSessions}</strong>
              <span>Estimated sessions</span>
            </article>
            <article>
              <strong>{sessionPlanner.estimatedFocusMinutes}m</strong>
              <span>Focused minutes</span>
            </article>
            <article>
              <strong>{sessionPlanner.estimatedXp}</strong>
              <span>Projected daily XP</span>
            </article>
            <article>
              <strong>{sessionPlanner.estimatedWeeklyXp}</strong>
              <span>5-day XP runway</span>
            </article>
          </div>
          <article className="planner-forecast" aria-label="Weekly momentum forecast">
            <div className="planner-headline">
              <strong>Weekly Momentum Forecast</strong>
              <span>If you repeat this daily plan for 5 workdays.</span>
            </div>
            <ul>
              <li><span>Focus time</span><strong>{weeklyMomentumForecast.focusHours}h</strong></li>
              <li><span>Sessions</span><strong>{weeklyMomentumForecast.sessions}</strong></li>
              <li><span>XP gain</span><strong>{weeklyMomentumForecast.xp}</strong></li>
              <li><span>Next level ETA</span><strong>{weeklyMomentumForecast.milestoneEtaDays} day{weeklyMomentumForecast.milestoneEtaDays === 1 ? '' : 's'}</strong></li>
            </ul>
          </article>
          <article className="matchmaker-card" aria-label="Use-case matchmaker">
            <div className="planner-headline">
              <strong>Preset Matchmaker</strong>
              <span>Tell Loose your context and get a fit recommendation.</span>
            </div>
            <div className="matchmaker-grid">
              <label>
                <span>Energy</span>
                <select value={matchmaker.energy} onChange={(e) => setMatchmaker((prev) => ({ ...prev, energy: e.target.value as MatchmakerEnergy }))}>
                  <option value="low">Low</option>
                  <option value="steady">Steady</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                <span>Context</span>
                <select value={matchmaker.context} onChange={(e) => setMatchmaker((prev) => ({ ...prev, context: e.target.value as MatchmakerContext }))}>
                  <option value="desk">Desk</option>
                  <option value="mobile">Mobile / commute</option>
                </select>
              </label>
              <label>
                <span>Goal</span>
                <select value={matchmaker.goal} onChange={(e) => setMatchmaker((prev) => ({ ...prev, goal: e.target.value as MatchmakerGoal }))}>
                  <option value="consistency">Build consistency</option>
                  <option value="depth">Go deep</option>
                  <option value="restart">Restart momentum</option>
                </select>
              </label>
            </div>
            {profileRecommendation ? (
              <div className="matchmaker-recommendation">
                <strong>
                  {profileRecommendation.preset.icon} {profileRecommendation.preset.name} · {profileRecommendation.confidence}% fit
                </strong>
                {profileRecommendation.reasons.map((reason) => (
                  <small key={reason}>{reason}</small>
                ))}
                <div className="preset-actions">
                  <button type="button" className="ghost" onClick={() => applyPreset(profileRecommendation.preset)}>
                    Apply this profile fit
                  </button>
                  <button type="button" className="ghost" onClick={() => void copyMatchmakerProfileLink()}>
                    Copy profile link
                  </button>
                  <button type="button" className="ghost" onClick={() => void shareMatchmakerProfileLink()}>
                    Share profile
                  </button>
                </div>
              </div>
            ) : null}
          </article>
          {sessionTimeline.length ? (
            <div className="timeline-strip" aria-label="Session timeline preview">
              {sessionTimeline.slice(0, 8).map((block) => (
                <article className={`timeline-block ${block.kind}`} key={block.id}>
                  <strong>{formatTimelineLabel(block.kind)}</strong>
                  <span>{block.minutes}m</span>
                </article>
              ))}
              {sessionTimeline.length > 8 ? <small>+{sessionTimeline.length - 8} more blocks in this plan</small> : null}
            </div>
          ) : null}
          {recommendedPreset ? (
            <article className="planner-recommendation" aria-live="polite">
              <div>
                <span>Recommended rhythm for {planningMinutes} min</span>
                <strong>{recommendedPreset.preset.icon} {recommendedPreset.preset.name}</strong>
                <small>
                  {recommendedPreset.sessions} sessions · {recommendedPreset.focusMinutes} focus min · {recommendedPreset.remainder} min buffer
                </small>
                <small>Start now → wraps around {formatFinishBy(plannerRunMinutes)}</small>
                <small>{recommendedPreset.preset.momentumTip}</small>
                <div className="preset-tags" aria-label={`${recommendedPreset.preset.name} ideal for`}>
                  {recommendedPreset.preset.idealFor.map((item) => (
                    <span key={`planner-rec-${recommendedPreset.preset.id}-${item}`}>{item}</span>
                  ))}
                </div>
              </div>
              <div className="preset-actions">
                <button type="button" onClick={() => applyPreset(recommendedPreset.preset)}>Apply</button>
                <button type="button" className="ghost" onClick={() => applyPresetAndStart(recommendedPreset.preset)}>
                  Apply & start
                </button>
              </div>
            </article>
          ) : null}
          {rankedPresetPlans.length ? (
            <div className="planner-fit-grid" aria-label="Preset fit ranking">
              {rankedPresetPlans.slice(0, 3).map((plan, index) => {
                const isTopPick = index === 0;
                const isActivePlan = plan.preset.id === activePreset?.id;

                return (
                  <article className={`planner-fit-card ${isTopPick ? 'top' : ''} ${isActivePlan ? 'active' : ''}`} key={`fit-${plan.preset.id}`}>
                    <div className="planner-fit-head">
                      <strong>{isTopPick ? 'Top pick' : `Option ${index + 1}`}</strong>
                      <span>{plan.preset.icon} {plan.preset.name}</span>
                    </div>
                    <small>{plan.sessions} sessions · {plan.focusMinutes} focus min · {plan.remainder} min buffer</small>
                    <small>
                      Focus density: {Math.round(plan.focusRatio * 100)}% · XP/hour: {plan.xpPerHour}
                    </small>
                    <button type="button" className="ghost" disabled={isActivePlan} onClick={() => applyPreset(plan.preset)}>
                      {isActivePlan ? 'Current setup' : 'Switch to this'}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : null}
          <p>
            Based on {activePreset?.name ?? 'current settings'} ({sessionPlanner.cycleMinutes} min per focus cycle).
          </p>
        </div>
      </section>

      <section id="focus-timer" className="timer-card">
          <div className="mode-row">
            {MODES.map((mode) => (
              <button
                key={mode.key}
                className={`mode ${state.mode === mode.key ? 'active' : ''}`}
                onClick={() => controller.setMode(mode.key)}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="time">{formatTime(state.timer.remaining)}</div>

          <div className="controls">
            <button className="primary" onClick={() => controller.toggleTimer()}>
              {state.timer.running ? 'Pause' : 'Start'}
            </button>
            <button className="ghost" onClick={() => controller.resetTimer()}>
              Reset
            </button>
          </div>

          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="session-pulse" aria-live="polite">
            <strong>{sessionPulse.title}</strong>
            <span>{sessionPulse.detail}</span>
          </div>
        </section>

      <section className="stats">
          <div>
            <span className="label">Completed (All Time)</span>
            <strong>{state.stats.completed}</strong>
          </div>
          <div>
            <span className="label">Focus Minutes (All Time)</span>
            <strong>{state.stats.focusMinutes}</strong>
          </div>
        </section>

      <section className="analytics">
          <div className="analytics-grid">
            <div><span className="label">Today Sessions</span><strong>{state.analytics.today.sessions}</strong></div>
            <div><span className="label">Today Minutes</span><strong>{state.analytics.today.focusMinutes}</strong></div>
            <div><span className="label">Current Streak</span><strong>{state.analytics.streak.current}d</strong></div>
            <div><span className="label">Best Streak</span><strong>{state.analytics.streak.best}d</strong></div>
          </div>
          <div className="week-bars" aria-label="Last 7 days session activity">
            {state.analytics.week.map((day) => {
              const h = Math.max((day.sessions / weekMaxSessions) * 100, day.sessions ? 12 : 4);
              return (
                <div className="week-bar-item" key={day.day}>
                  <div
                    className="week-bar-fill"
                    style={{ height: `${h}%` }}
                    title={`${day.day}: ${day.sessions} sessions (${day.focusMinutes}m)`}
                  />
                  <span className="week-bar-label">{day.day}</span>
                </div>
              );
            })}
          </div>
          <div className="recent-sessions" aria-label="Recent focus wins">
            <div className="recent-sessions-head">
              <h3>Recent Wins</h3>
              <span>{state.recentSessions.length} logged</span>
            </div>
            {!state.recentSessions.length ? (
              <p>No completed focus sessions yet — your first win starts now.</p>
            ) : (
              <ul>
                {state.recentSessions.map((session) => (
                  <li key={session.id}>
                    <strong>🍅 {session.focusMinutes}m focus</strong>
                    <span>{formatSessionDate(session.completedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

      <section className="level-card" aria-label="Gamification progress">
          <div className="level-head">
            <h2>Level {gamification.level}</h2>
            <strong>{gamification.xp.toLocaleString()} XP</strong>
          </div>
          <p>{gamification.xpToNextLevel} XP to unlock Level {gamification.level + 1}</p>
          <p>
            Combo streak today: <strong>{focusCombo.streak}</strong> session{focusCombo.streak === 1 ? '' : 's'} ·
            reward multiplier <strong>x{focusCombo.multiplier.toFixed(1)}</strong>
          </p>
          <div className="progress-wrap level-progress-wrap" aria-hidden="true">
            <div className="progress-bar level-progress-bar" style={{ width: `${gamification.levelProgress}%` }} />
          </div>
        </section>

      <section className="next-milestone" aria-label="Next milestone">
          <div className="quests-head">
            <h2>Next Unlock</h2>
            <span>Small target, visible momentum.</span>
          </div>
          {nextMilestone.nextAchievement ? (
            <article className="milestone-card">
              <div>
                <strong>
                  {nextMilestone.nextAchievement.icon} {nextMilestone.nextAchievement.title}
                </strong>
                <p>
                  {nextMilestone.nextAchievement.remaining} {nextMilestone.nextAchievement.unit} left ({nextMilestone.nextAchievement.progressValue}/{nextMilestone.nextAchievement.target})
                </p>
              </div>
              <small>Level up pace: about {nextMilestone.sessionsUntilLevelUp} more focus session{nextMilestone.sessionsUntilLevelUp === 1 ? '' : 's'}.</small>
            </article>
          ) : (
            <article className="milestone-card complete">
              <strong>🏆 All current milestones unlocked</strong>
              <p>More milestones coming in the next release.</p>
            </article>
          )}
        </section>

      <section className="achievements" aria-label="Milestones">
          <div className="quests-head">
            <h2>Milestones</h2>
            <span>{achievementProgress.filter((item) => item.unlocked).length}/{achievementProgress.length} unlocked</span>
          </div>
          <div className="achievement-grid">
            {achievementProgress.map((achievement) => (
              <article className={`achievement-card ${achievement.unlocked ? 'unlocked' : ''}`} key={achievement.id}>
                <div className="achievement-top">
                  <strong>{achievement.icon} {achievement.title}</strong>
                  <span>{achievement.progressValue}/{achievement.target} {achievement.unit}</span>
                </div>
                <div className="progress-wrap" aria-hidden="true">
                  <div className="progress-bar achievement-progress-bar" style={{ width: `${achievement.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

      <section className="quests" aria-label="Daily quests">
          <div className="quests-head">
            <h2>Daily Quests</h2>
            <span>{questProgress.filter((quest) => quest.complete).length}/{questProgress.length} complete</span>
          </div>
          <div className="quest-grid">
            {questProgress.map((quest) => (
              <article className={`quest-card ${quest.complete ? 'complete' : ''}`} key={quest.id}>
                <div className="quest-top">
                  <strong>{quest.icon} {quest.title}</strong>
                  <span>{quest.progressValue}/{quest.target}</span>
                </div>
                <p>{quest.description}</p>
                <div className="progress-wrap" aria-hidden="true">
                  <div className="progress-bar quest-progress-bar" style={{ width: `${quest.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

      <section id="outcome-blueprints" className="blueprints" aria-label="Outcome blueprints">
          <div className="presets-head">
            <h2>Plan by Outcome</h2>
            <span>Pick the result you want. Loose maps it to a timer rhythm.</span>
          </div>
          {quickStartLinkStatus ? (
            <p className={`quick-start-link-status ${quickStartLinkStatus.kind}`} aria-live="polite">
              {quickStartLinkStatus.message}
            </p>
          ) : null}
          <div className="blueprint-grid">
            {OUTCOME_BLUEPRINTS.map((blueprint) => {
              const preset = USE_CASE_PRESETS.find((item) => item.id === blueprint.presetId);
              if (!preset) return null;

              const isActive = activePreset?.id === preset.id;

              return (
                <article className={`blueprint-card ${isActive ? 'active' : ''}`} key={blueprint.id}>
                  <h3>{blueprint.icon} {blueprint.title}</h3>
                  <p>{blueprint.summary}</p>
                  <small>Recommended rhythm: {preset.name}</small>
                  <div className="preset-tags" aria-label="Best-fit situations">
                    {preset.idealFor.map((tag) => (
                      <span key={`${blueprint.id}-${tag}`}>{tag}</span>
                    ))}
                  </div>
                  <small>{preset.momentumTip}</small>
                  <div className="preset-actions">
                    <button type="button" disabled={isActive} onClick={() => applyPreset(preset)}>
                      {isActive ? 'Already active' : 'Use blueprint'}
                    </button>
                    <button type="button" className="ghost" onClick={() => applyPresetAndStart(preset)}>
                      Use & start focus
                    </button>
                    <button type="button" className="ghost" onClick={() => void copyPresetQuickStartLink(preset)}>
                      Copy quick-start link
                    </button>
                    <button type="button" className="ghost" onClick={() => void sharePresetQuickStartLink(preset)}>
                      Share quick-start
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      <section className="preset-selector" aria-label="Use-case selector matrix">
        <div className="presets-head">
          <h2>Use-Case Selector Matrix</h2>
          <span>Pick by situation first. Loose handles the timer math.</span>
        </div>
        <div className="selector-grid">
          {USE_CASE_PRESETS.map((preset) => {
            const isActive = activePreset?.id === preset.id;
            const cycleMinutes = preset.settings.focus + preset.settings.shortBreak;

            return (
              <article className={`selector-card ${isActive ? 'active' : ''}`} key={`selector-${preset.id}`}>
                <div className="selector-head">
                  <strong>{preset.icon} {preset.name}</strong>
                  <span>{preset.outcome}</span>
                </div>
                <small>Best when: {preset.idealFor.slice(0, 2).join(' · ')}</small>
                <small>
                  Rhythm: {preset.settings.focus}m focus / {preset.settings.shortBreak}m break · long break every {preset.settings.longBreakInterval}
                </small>
                <small>Cycle length: {cycleMinutes} min</small>
                <button type="button" className="ghost" disabled={isActive} onClick={() => applyPresetAndStart(preset)}>
                  {isActive ? 'Current active setup' : 'Use this rhythm now'}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="presets" aria-label="Use-case presets">
          <div className="presets-head">
            <h2>Start from a Use Case</h2>
            <span>{activePreset ? `Active: ${activePreset.name}` : 'Choose a rhythm that matches your day.'}</span>
          </div>
          <div className="preset-grid">
            {USE_CASE_PRESETS.map((preset) => {
              const isActive = activePreset?.id === preset.id;

              return (
                <article className={`preset-card ${isActive ? 'active' : ''}`} key={preset.id}>
                  <h3>{preset.icon} {preset.name}</h3>
                  <p>{preset.description}</p>
                  <small>{preset.outcome}</small>
                  <div className="preset-tags" aria-label="Best-fit situations">
                    {preset.idealFor.map((tag) => (
                      <span key={`${preset.id}-${tag}`}>{tag}</span>
                    ))}
                  </div>
                  <small>
                    {preset.settings.focus}/{preset.settings.shortBreak}/{preset.settings.longBreak} min · every {preset.settings.longBreakInterval} sessions
                  </small>
                  <small>{preset.momentumTip}</small>
                  <div className="preset-actions">
                    <button type="button" disabled={isActive} onClick={() => applyPreset(preset)}>
                      {isActive ? 'Applied' : 'Apply preset'}
                    </button>
                    <button type="button" className="ghost" onClick={() => applyPresetAndStart(preset)}>
                      Apply & start focus
                    </button>
                    <button type="button" className="ghost" onClick={() => void copyPresetQuickStartLink(preset)}>
                      Copy quick-start link
                    </button>
                    <button type="button" className="ghost" onClick={() => void sharePresetQuickStartLink(preset)}>
                      Share quick-start
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      <section className="settings">
          <div className="settings-head"><h2>Timer Settings</h2></div>
          <form
            className="settings-form"
            onSubmit={(e) => {
              e.preventDefault();
              controller.updateSettings(settingsForm);
            }}
          >
            <label><span>Focus</span><input value={settingsForm.focus} onChange={(e) => setSettingsForm((s) => ({ ...s, focus: e.target.value }))} type="number" min={10} max={90} required /></label>
            <label><span>Short Break</span><input value={settingsForm.shortBreak} onChange={(e) => setSettingsForm((s) => ({ ...s, shortBreak: e.target.value }))} type="number" min={1} max={30} required /></label>
            <label><span>Long Break</span><input value={settingsForm.longBreak} onChange={(e) => setSettingsForm((s) => ({ ...s, longBreak: e.target.value }))} type="number" min={5} max={60} required /></label>
            <label><span>Long Break Every</span><input value={settingsForm.longBreakInterval} onChange={(e) => setSettingsForm((s) => ({ ...s, longBreakInterval: e.target.value }))} type="number" min={2} max={8} required /></label>
            <button type="submit">Save</button>
            <button type="button" className="ghost" onClick={() => controller.resetSettingsToDefaults()}>Defaults</button>
          </form>
          <p className={`settings-status ${state.settingsStatus?.kind ?? ''}`} aria-live="polite">{state.settingsStatus?.message ?? ''}</p>
        </section>

      <section id="task-capture" className="tasks">
          <div className="tasks-head">
            <h2>Tasks</h2>
            <form
              id="taskForm"
              onSubmit={(e) => {
                e.preventDefault();
                const text = taskText.trim();
                if (!text) return;
                controller.addTask(text);
                setTaskText('');
              }}
            >
              <input id="taskInput" value={taskText} onChange={(e) => setTaskText(e.target.value)} type="text" maxLength={90} placeholder="What are you studying?" required />
              <button type="submit">Add</button>
            </form>
          </div>
          <div className="task-templates" aria-label="Suggested task starters">
            <span>Quick add from {activePreset?.name ?? 'recommended rhythm'}:</span>
            <div className="task-template-list" role="list">
              {taskTemplates.map((template) => (
                <button
                  key={`${activePreset?.id ?? 'recommended'}-${template.text}`}
                  type="button"
                  className="ghost task-template-chip"
                  onClick={() => addSuggestedTask(template.text)}
                >
                  {template.icon} {template.text}
                </button>
              ))}
            </div>
          </div>
          <ul id="taskList">
            {!state.tasks.length ? (
              <li><span>No tasks yet. Add one above ✨</span></li>
            ) : (
              state.tasks.map((task) => (
                <li key={task.id} className={task.done ? 'done' : ''}>
                  <span>{task.text}</span>
                  <div className="task-actions">
                    <button onClick={() => controller.toggleTask(task.id)}>{task.done ? 'Undo' : 'Done'}</button>
                    <button onClick={() => controller.deleteTask(task.id)}>Delete</button>
                  </div>
                </li>
              ))
            )}
          </ul>
      </section>

      <aside className="mobile-quick-start" aria-label="Mobile quick start">
        <div className="mobile-quick-summary">
          <strong>{activePreset?.name ?? `${activeModeLabel} Session`}</strong>
          <span>{formatTime(state.timer.remaining)} left</span>
          <small>
            {state.tasks.find((task) => !task.done)?.text ?? 'No active task yet — add one above.'}
          </small>
        </div>
        <div className="mobile-quick-actions">
          <button className="primary" type="button" onClick={() => controller.toggleTimer()}>
            {state.timer.running ? 'Pause' : 'Start Focus'}
          </button>
          <div className="mobile-shortcuts" role="group" aria-label="Quick section shortcuts">
            {SECTION_NAV_ITEMS.map((item) => {
              const isActive = activeSectionId === item.id;

              return (
                <button
                  key={`mobile-shortcut-${item.id}`}
                  type="button"
                  className={`ghost ${isActive ? 'active-shortcut' : ''}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.mobileLabel}
                </button>
              );
            })}
          </div>
          <div className="mobile-mode-actions" role="group" aria-label="Quick mode actions">
            <button type="button" className="ghost" onClick={() => controller.setMode('focus')}>
              Focus
            </button>
            <button
              type="button"
              className="ghost"
              title={`Run rescue preset: ${rescuePreset.name}`}
              onClick={() => {
                applyPresetAndStart(rescuePreset);
                scrollToSection('focus-timer');
              }}
            >
              Rescue
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => void installLooseApp()}
              disabled={!canTriggerInstall}
            >
              {installActionLabel}
            </button>
          </div>
        </div>
      </aside>
    </main>
  );
}

function buildPresetQuickStartUrl(
  currentUrl: string,
  presetId: string,
  options?: { task?: string; planningMinutes?: number },
): string {
  return buildPresetQuickStartUrlFromLib(currentUrl, presetId, options);
}

function buildMatchmakerProfileUrl(
  currentUrl: string,
  profile: { energy: MatchmakerEnergy; context: MatchmakerContext; goal: MatchmakerGoal },
  planningMinutes: number,
): string {
  return buildMatchmakerProfileUrlFromLib(currentUrl, profile, planningMinutes);
}

function consumeQuickStartParamsFromUrl(currentUrl: string): void {
  consumeQuickStartParamsFromUrlFromLib(currentUrl);
}

function parseMatchmakerEnergy(value: string | null): MatchmakerEnergy | null {
  return parseMatchmakerEnergyFromLib(value);
}

function parseMatchmakerContext(value: string | null): MatchmakerContext | null {
  return parseMatchmakerContextFromLib(value);
}

function parseMatchmakerGoal(value: string | null): MatchmakerGoal | null {
  return parseMatchmakerGoalFromLib(value);
}

function normalizePlanningMinutes(value: number): number {
  return normalizePlanningMinutesFromLib(value);
}

function formatFinishBy(minutesFromNow: number): string {
  const safeMinutes = Math.max(0, Math.round(minutesFromNow));
  const target = new Date(Date.now() + safeMinutes * 60 * 1000);

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(target);
}

function formatAverageMinutes(value: number): string {
  return value > 0 ? String(value) : '—';
}

function formatSessionDate(isoDate: string): string {
  const date = new Date(isoDate);

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatTimelineLabel(kind: 'focus' | 'shortBreak' | 'longBreak'): string {
  if (kind === 'focus') return '🎯 Focus';
  if (kind === 'shortBreak') return '☕ Short break';
  return '🛋️ Long break';
}


