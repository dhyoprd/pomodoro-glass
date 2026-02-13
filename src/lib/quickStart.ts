import { clamp } from '@/lib/utils';

export type QuickStartMatchmakerEnergy = 'low' | 'steady' | 'high';
export type QuickStartMatchmakerContext = 'desk' | 'mobile';
export type QuickStartMatchmakerGoal = 'consistency' | 'depth' | 'restart';

export type LaunchSourceBadge = {
  icon: string;
  label: string;
  detail: string;
};

const PLANNING_MINUTES_MIN = 30;
const PLANNING_MINUTES_MAX = 360;
const PLANNING_MINUTES_STEP = 15;

const LAUNCH_SOURCE_BADGES: Record<string, LaunchSourceBadge> = {
  'shortcut-deep-work': {
    icon: '🚀',
    label: 'Deep Work shortcut',
    detail: 'Jumped in from your home-screen deep work launcher.',
  },
  'shortcut-rescue': {
    icon: '🚑',
    label: 'Momentum Rescue shortcut',
    detail: 'Fast restart path activated from your shortcut.',
  },
  'shortcut-commute': {
    icon: '🚌',
    label: 'Commute shortcut',
    detail: 'Mobile sprint mode launched for short focus windows.',
  },
  'shortcut-planner': {
    icon: '🗓️',
    label: 'Planner shortcut',
    detail: 'Opened straight into planning so you can pick the best rhythm.',
  },
  'quickstart-copy': {
    icon: '🔗',
    label: 'Quick-start link',
    detail: 'Loaded from a shared preset launch link.',
  },
  'quickstart-share': {
    icon: '🔗',
    label: 'Quick-start link',
    detail: 'Loaded from a shared preset launch link.',
  },
  'profile-copy': {
    icon: '🧬',
    label: 'Matchmaker profile link',
    detail: 'Loaded from a shared profile recommendation link.',
  },
  'profile-share': {
    icon: '🧬',
    label: 'Matchmaker profile link',
    detail: 'Loaded from a shared profile recommendation link.',
  },
  pwa: {
    icon: '📲',
    label: 'Installed app',
    detail: 'Running in app mode for faster one-tap focus launches.',
  },
};

export function buildPresetQuickStartUrl(
  currentUrl: string,
  presetId: string,
  options?: { task?: string; planningMinutes?: number; source?: string; autostart?: boolean },
): string {
  const url = new URL(currentUrl);
  url.searchParams.set('preset', presetId);

  if (options?.autostart ?? true) {
    url.searchParams.set('autostart', '1');
  } else {
    url.searchParams.delete('autostart');
  }

  if (options?.task) {
    url.searchParams.set('task', options.task.slice(0, 90));
  }

  if (typeof options?.planningMinutes === 'number' && Number.isFinite(options.planningMinutes)) {
    url.searchParams.set('minutes', String(normalizePlanningMinutes(options.planningMinutes)));
  }

  if (options?.source) {
    url.searchParams.set('source', options.source);
  }

  return url.toString();
}

export function buildMatchmakerProfileUrl(
  currentUrl: string,
  profile: {
    energy: QuickStartMatchmakerEnergy;
    context: QuickStartMatchmakerContext;
    goal: QuickStartMatchmakerGoal;
  },
  planningMinutes: number,
  options?: { source?: string },
): string {
  const url = new URL(currentUrl);
  url.searchParams.set('profileEnergy', profile.energy);
  url.searchParams.set('profileContext', profile.context);
  url.searchParams.set('profileGoal', profile.goal);
  url.searchParams.set('minutes', String(normalizePlanningMinutes(planningMinutes)));

  if (options?.source) {
    url.searchParams.set('source', options.source);
  }

  return url.toString();
}

export function consumeQuickStartParamsFromUrl(currentUrl: string): void {
  if (typeof window === 'undefined') return;

  const url = new URL(currentUrl);
  const hadQuickStartParams =
    url.searchParams.has('preset') ||
    url.searchParams.has('autostart') ||
    url.searchParams.has('task') ||
    url.searchParams.has('minutes') ||
    url.searchParams.has('profileEnergy') ||
    url.searchParams.has('profileContext') ||
    url.searchParams.has('profileGoal') ||
    url.searchParams.has('source');

  if (!hadQuickStartParams) return;

  url.searchParams.delete('preset');
  url.searchParams.delete('autostart');
  url.searchParams.delete('task');
  url.searchParams.delete('minutes');
  url.searchParams.delete('profileEnergy');
  url.searchParams.delete('profileContext');
  url.searchParams.delete('profileGoal');
  url.searchParams.delete('source');

  const nextPath = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, '', nextPath);
}

export function parseMatchmakerEnergy(value: string | null): QuickStartMatchmakerEnergy | null {
  if (value === 'low' || value === 'steady' || value === 'high') return value;
  return null;
}

export function parseMatchmakerContext(value: string | null): QuickStartMatchmakerContext | null {
  if (value === 'desk' || value === 'mobile') return value;
  return null;
}

export function parseMatchmakerGoal(value: string | null): QuickStartMatchmakerGoal | null {
  if (value === 'consistency' || value === 'depth' || value === 'restart') return value;
  return null;
}

export function normalizePlanningMinutes(value: number): number {
  const steppedValue = Math.round(value / PLANNING_MINUTES_STEP) * PLANNING_MINUTES_STEP;
  return clamp(steppedValue, PLANNING_MINUTES_MIN, PLANNING_MINUTES_MAX);
}

export function buildLaunchSourceBadge(source: string | null): LaunchSourceBadge | null {
  if (!source) return null;
  return LAUNCH_SOURCE_BADGES[source] ?? null;
}
