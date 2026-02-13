'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePomodoroController } from '@/hooks/usePomodoroController';
import { clamp, formatTime } from '@/lib/utils';

const MODES = [
  { key: 'focus', label: 'Focus' },
  { key: 'shortBreak', label: 'Short Break' },
  { key: 'longBreak', label: 'Long Break' },
] as const;

const XP_PER_SESSION = 100;
const XP_PER_FOCUS_MINUTE = 2;
const XP_PER_LEVEL = 500;

const DAILY_QUESTS = [
  {
    id: 'quest-focus-minutes',
    icon: '⚡',
    title: 'Focus Momentum',
    target: 120,
    description: 'Accumulate 120 focused minutes today.',
    getProgress: (state: ReturnType<typeof usePomodoroController>['state']) => state.analytics.today.focusMinutes,
  },
  {
    id: 'quest-sessions',
    icon: '🍅',
    title: 'Pomodoro Finisher',
    target: 4,
    description: 'Complete 4 sessions in a day.',
    getProgress: (state: ReturnType<typeof usePomodoroController>['state']) => state.analytics.today.sessions,
  },
  {
    id: 'quest-task-clear',
    icon: '✅',
    title: 'Task Clarity',
    target: 3,
    description: 'Close out 3 tasks from your queue.',
    getProgress: (state: ReturnType<typeof usePomodoroController>['state']) => state.tasks.filter((task) => task.done).length,
  },
] as const;

const USE_CASE_PRESETS = [
  {
    id: 'student-revision',
    icon: '🎓',
    name: 'Student Revision',
    description: 'Steady pace for lectures, homework, and exam prep.',
    outcome: 'Best for consistency over long study days.',
    settings: { focus: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
  },
  {
    id: 'deep-work',
    icon: '🧠',
    name: 'Deep Work Sprint',
    description: 'Longer focus windows for coding or writing sessions.',
    outcome: 'Fewer switches, more deep concentration.',
    settings: { focus: 50, shortBreak: 10, longBreak: 20, longBreakInterval: 3 },
  },
  {
    id: 'high-energy',
    icon: '⚡',
    name: 'High-Energy Loop',
    description: 'Short cycles for quick wins when motivation is low.',
    outcome: 'Fast momentum when energy is scattered.',
    settings: { focus: 15, shortBreak: 3, longBreak: 10, longBreakInterval: 4 },
  },
] as const;

const OUTCOME_BLUEPRINTS = [
  {
    id: 'exam-week',
    icon: '📚',
    title: 'Exam Week Coverage',
    summary: 'Sustain 4-6 hours/day without burnout.',
    presetId: 'student-revision',
  },
  {
    id: 'ship-feature',
    icon: '🚀',
    title: 'Ship a Feature Fast',
    summary: 'Protect deep blocks and reduce context switching.',
    presetId: 'deep-work',
  },
  {
    id: 'reset-momentum',
    icon: '🪫',
    title: 'Recover Momentum',
    summary: 'Use shorter loops to rebuild consistency.',
    presetId: 'high-energy',
  },
] as const;

export function PomodoroApp() {
  const { state, controller } = usePomodoroController();
  const [taskText, setTaskText] = useState('');
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

  const gamification = useMemo(() => {
    const xp = state.stats.completed * XP_PER_SESSION + state.stats.focusMinutes * XP_PER_FOCUS_MINUTE;
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const levelBaseXp = (level - 1) * XP_PER_LEVEL;
    const xpIntoLevel = xp - levelBaseXp;
    const xpToNextLevel = XP_PER_LEVEL - xpIntoLevel;
    const levelProgress = clamp((xpIntoLevel / XP_PER_LEVEL) * 100, 0, 100);

    return { xp, level, xpToNextLevel, levelProgress };
  }, [state.stats.completed, state.stats.focusMinutes]);

  const questProgress = useMemo(
    () =>
      DAILY_QUESTS.map((quest) => {
        const progressValue = quest.getProgress(state);
        const progress = clamp((progressValue / quest.target) * 100, 0, 100);
        const complete = progressValue >= quest.target;

        return {
          ...quest,
          progressValue,
          progress,
          complete,
        };
      }),
    [state],
  );

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

  const applyPreset = (preset: (typeof USE_CASE_PRESETS)[number]) => {
    controller.updateSettings(preset.settings);
    setSettingsForm({
      focus: String(preset.settings.focus),
      shortBreak: String(preset.settings.shortBreak),
      longBreak: String(preset.settings.longBreak),
      longBreakInterval: String(preset.settings.longBreakInterval),
    });
  };

  const applyPresetAndStart = (preset: (typeof USE_CASE_PRESETS)[number]) => {
    applyPreset(preset);
    controller.beginFocusSession();
  };

  return (
    <main className="app">
      <header>
        <h1>Loose</h1>
        <p>Your productivity OS for study and work.</p>
      </header>

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

      <section className="blueprints" aria-label="Outcome blueprints">
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
    </main>
  );
}

function formatAverageMinutes(value: number): string {
  return value > 0 ? String(value) : '—';
}

