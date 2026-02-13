'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePomodoroController } from '@/hooks/usePomodoroController';
import { clamp, formatTime } from '@/lib/utils';

const MODES = [
  { key: 'focus', label: 'Focus' },
  { key: 'shortBreak', label: 'Short Break' },
  { key: 'longBreak', label: 'Long Break' },
] as const;

export function PomodoroApp() {
  const { state, controller } = usePomodoroController();
  const [taskText, setTaskText] = useState('');
  const [settingsForm, setSettingsForm] = useState({ focus: '', shortBreak: '', longBreak: '' });

  useEffect(() => {
    setSettingsForm({
      focus: String(state.settings.focus),
      shortBreak: String(state.settings.shortBreak),
      longBreak: String(state.settings.longBreak),
    });
  }, [state.settings]);

  useEffect(() => {
    document.title = `${formatTime(state.timer.remaining)} • Pomodoro Glass`;
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

  return (
    <>
      <div className="bg" />
      <main className="app glass">
        <header>
          <h1>Pomodoro Glass</h1>
          <p>Focus beautifully.</p>
        </header>

        <section className="timer-card glass-inner">
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

        <section className="stats glass-inner">
          <div>
            <span className="label">Completed (All Time)</span>
            <strong>{state.stats.completed}</strong>
          </div>
          <div>
            <span className="label">Focus Minutes (All Time)</span>
            <strong>{state.stats.focusMinutes}</strong>
          </div>
        </section>

        <section className="analytics glass-inner">
          <div className="analytics-grid">
            <div><span className="label">Today Sessions</span><strong>{state.analytics.today.sessions}</strong></div>
            <div><span className="label">Today Minutes</span><strong>{state.analytics.today.focusMinutes}</strong></div>
            <div><span className="label">Current Streak</span><strong>{state.analytics.streak.current}d</strong></div>
            <div><span className="label">Best Streak</span><strong>{state.analytics.streak.best}d</strong></div>
          </div>
          <div className="week-bars" aria-label="Last 7 days session activity">
            {state.analytics.week.map((day) => {
              const max = Math.max(...state.analytics.week.map((w) => w.sessions), 1);
              const h = Math.max((day.sessions / max) * 100, day.sessions ? 12 : 4);
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

        <section className="settings glass-inner">
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
            <button type="submit">Save</button>
            <button type="button" className="ghost" onClick={() => controller.resetSettingsToDefaults()}>Defaults</button>
          </form>
          <p className={`settings-status ${state.settingsStatus?.kind ?? ''}`} aria-live="polite">{state.settingsStatus?.message ?? ''}</p>
        </section>

        <section className="tasks glass-inner">
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
              <li><span>No tasks yet. Add one above ?</span></li>
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
    </>
  );
}

