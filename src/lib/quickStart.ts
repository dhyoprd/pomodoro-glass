import { clamp } from '@/lib/utils';

export type QuickStartMatchmakerEnergy = 'low' | 'steady' | 'high';
export type QuickStartMatchmakerContext = 'desk' | 'mobile';
export type QuickStartMatchmakerGoal = 'consistency' | 'depth' | 'restart';

const PLANNING_MINUTES_MIN = 60;
const PLANNING_MINUTES_MAX = 360;
const PLANNING_MINUTES_STEP = 15;

export function buildPresetQuickStartUrl(
  currentUrl: string,
  presetId: string,
  options?: { task?: string; planningMinutes?: number },
): string {
  const url = new URL(currentUrl);
  url.searchParams.set('preset', presetId);
  url.searchParams.set('autostart', '1');

  if (options?.task) {
    url.searchParams.set('task', options.task.slice(0, 90));
  }

  if (typeof options?.planningMinutes === 'number' && Number.isFinite(options.planningMinutes)) {
    url.searchParams.set('minutes', String(normalizePlanningMinutes(options.planningMinutes)));
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
): string {
  const url = new URL(currentUrl);
  url.searchParams.set('profileEnergy', profile.energy);
  url.searchParams.set('profileContext', profile.context);
  url.searchParams.set('profileGoal', profile.goal);
  url.searchParams.set('minutes', String(normalizePlanningMinutes(planningMinutes)));
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
    url.searchParams.has('profileGoal');

  if (!hadQuickStartParams) return;

  url.searchParams.delete('preset');
  url.searchParams.delete('autostart');
  url.searchParams.delete('task');
  url.searchParams.delete('minutes');
  url.searchParams.delete('profileEnergy');
  url.searchParams.delete('profileContext');
  url.searchParams.delete('profileGoal');

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
