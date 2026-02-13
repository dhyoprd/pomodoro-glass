'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePomodoroController } from '@/hooks/usePomodoroController';
import { clamp, formatTime } from '@/lib/utils';
import {
  MODES,
  OUTCOME_BLUEPRINTS,
  USE_CASE_PRESETS,
  type UseCasePreset,
} from '@/constants/useCases';
import {
  XP_PER_FOCUS_MINUTE,
  XP_PER_SESSION,
  buildAchievementProgress,
  buildDailyQuestProgress,
  buildGamificationProgress,
} from '@/application/GamificationEngine';

export function PomodoroApp() {
  const { state, controller } = usePomodoroController();
  const [taskText, setTaskText] = useState('');
  const [planningMinutes, setPlanningMinutes] = useState(120);
  const [settingsForm, setSettingsForm] = useState({ focus: '', shortBreak: '', longBreak: '', longBreakInterval: '' });

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
    const onKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (e.code === 'Space' && active?.id !== 'taskInput') {
        e.preventDefault();
        controller.toggleTimer();
      }
      if (e.key.toLowerCase() === 'r') controller.resetTimer();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [controller]);

  const progress = useMemo(
    () => clamp(((state.timer.total - state.timer.remaining) / state.timer.total) * 100 || 0, 0, 100),
    [state.timer.remaining, state.timer.total],
  );

  const weekMaxSessions = useMemo(
    () => Math.max(...state.analytics.week.map((day) => day.sessions), 1),
    [state.analytics.week],
  );

  const gamification = useMemo(() => buildGamificationProgress(state), [state]);

  const achievementProgress = useMemo(() => buildAchievementProgress(state), [state]);

  const questProgress = useMemo(() => buildDailyQuestProgress(state), [state]);

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

  const sessionPlanner = useMemo(() => {
    const settings = activePreset?.settings ?? state.settings;
    const cycleMinutes = settings.focus + settings.shortBreak;
    const estimatedSessions = Math.max(1, Math.floor(planningMinutes / cycleMinutes));
    const estimatedFocusMinutes = estimatedSessions * settings.focus;
    const estimatedXp = estimatedSessions * XP_PER_SESSION + estimatedFocusMinutes * XP_PER_FOCUS_MINUTE;
    const estimatedWeeklyXp = estimatedXp * 5;

    return {
      estimatedSessions,
      estimatedFocusMinutes,
      estimatedXp,
      estimatedWeeklyXp,
      cycleMinutes,
    };
  }, [activePreset?.settings, planningMinutes, state.settings]);

  const rankedPresetPlans = useMemo(() =>
    USE_CASE_PRESETS.map((preset) => {
      const cycleMinutes = preset.settings.focus + preset.settings.shortBreak;
      const sessions = Math.max(1, Math.floor(planningMinutes / cycleMinutes));
      const focusMinutes = sessions * preset.settings.focus;
      const remainder = planningMinutes - sessions * cycleMinutes;
      const focusRatio = focusMinutes / planningMinutes;
      const estimatedXp = sessions * XP_PER_SESSION + focusMinutes * XP_PER_FOCUS_MINUTE;
      const xpPerHour = Math.round((estimatedXp / planningMinutes) * 60);
      const score = focusRatio * 100 - remainder;

      return {
        preset,
        sessions,
        focusMinutes,
        remainder,
        score,
        focusRatio,
        xpPerHour,
      };
    }).sort((a, b) => b.score - a.score),
  [planningMinutes]);

  const recommendedPreset = rankedPresetPlans[0];

  const showQuickOnboarding = state.stats.completed === 0 && state.tasks.length === 0;

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

  return (
    <main className="app">
      <header>
        <h1>Loose</h1>
        <p>Your productivity OS for study and work.</p>
      </header>

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
        <div className="hero-actions">
          <a href="#outcome-blueprints">Start with an outcome</a>
          <a href="#session-planner" className="ghost-link">Plan my day</a>
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
        </div>
      </section>

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
          {recommendedPreset ? (
            <article className="planner-recommendation" aria-live="polite">
              <div>
                <span>Recommended rhythm for {planningMinutes} min</span>
                <strong>{recommendedPreset.preset.icon} {recommendedPreset.preset.name}</strong>
                <small>
                  {recommendedPreset.sessions} sessions · {recommendedPreset.focusMinutes} focus min · {recommendedPreset.remainder} min buffer
                </small>
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

      <section className="timer-card">
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
          <div className="progress-wrap level-progress-wrap" aria-hidden="true">
            <div className="progress-bar level-progress-bar" style={{ width: `${gamification.levelProgress}%` }} />
          </div>
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
                  <div className="preset-actions">
                    <button type="button" disabled={isActive} onClick={() => applyPreset(preset)}>
                      {isActive ? 'Already active' : 'Use blueprint'}
                    </button>
                    <button type="button" className="ghost" onClick={() => applyPresetAndStart(preset)}>
                      Use & start focus
                    </button>
                  </div>
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
                  <small>
                    {preset.settings.focus}/{preset.settings.shortBreak}/{preset.settings.longBreak} min · every {preset.settings.longBreakInterval} sessions
                  </small>
                  <div className="preset-actions">
                    <button type="button" disabled={isActive} onClick={() => applyPreset(preset)}>
                      {isActive ? 'Applied' : 'Apply preset'}
                    </button>
                    <button type="button" className="ghost" onClick={() => applyPresetAndStart(preset)}>
                      Apply & start focus
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

      <section className="tasks">
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
        <div>
          <strong>{activePreset?.name ?? `${activeModeLabel} Session`}</strong>
          <span>{formatTime(state.timer.remaining)} left</span>
        </div>
        <button className="primary" type="button" onClick={() => controller.toggleTimer()}>
          {state.timer.running ? 'Pause' : 'Start Focus'}
        </button>
      </aside>
    </main>
  );
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


