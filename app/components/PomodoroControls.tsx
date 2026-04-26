"use client";

import { Phase, TimerState, PomodoroConfig } from "../hooks/usePomodoro";

interface PomodoroControlsProps {
  phase: Phase;
  timerState: TimerState;
  config: PomodoroConfig;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onUpdateConfig: (c: Partial<PomodoroConfig>) => void;
}

const PHASE_BUTTON: Record<Phase, string> = {
  focus: "bg-red-500 hover:bg-red-400 shadow-red-500/30",
  shortBreak: "bg-green-500 hover:bg-green-400 shadow-green-500/30",
  longBreak: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/30",
};

export default function PomodoroControls({
  phase,
  timerState,
  config,
  onStart,
  onPause,
  onReset,
  onSkip,
  onUpdateConfig,
}: PomodoroControlsProps) {
  const btnColor = PHASE_BUTTON[phase];
  const isRunning = timerState === "running";

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      {/* Main controls */}
      <div className="flex items-center gap-4">
        {!isRunning ? (
          <button
            onClick={onStart}
            className={`px-10 py-3 rounded-full font-mono text-base font-semibold
              text-white shadow-lg transition-all active:scale-95 ${btnColor}`}
          >
            {timerState === "paused" ? "▶ 再開" : timerState === "finished" ? "▶ 次へ" : "▶ スタート"}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-10 py-3 rounded-full font-mono text-base font-semibold
              bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/30
              transition-all active:scale-95"
          >
            ⏸ 一時停止
          </button>
        )}

        <button
          onClick={onReset}
          className="px-5 py-3 rounded-full font-mono text-sm font-medium
            bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white
            border border-slate-700 transition-all active:scale-95"
        >
          ↺
        </button>

        <button
          onClick={onSkip}
          className="px-5 py-3 rounded-full font-mono text-sm font-medium
            bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white
            border border-slate-700 transition-all active:scale-95"
          title="次のフェーズへスキップ"
        >
          ⏭
        </button>
      </div>

      {/* Config */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-mono text-slate-500">
        <label className="flex items-center gap-2">
          <span className="text-red-400">集中</span>
          <input
            type="number" min={1} max={60} value={config.focusMinutes}
            disabled={isRunning}
            onChange={(e) => onUpdateConfig({ focusMinutes: Math.max(1, Math.min(60, parseInt(e.target.value) || 25)) })}
            className="w-12 text-center bg-slate-800 border border-slate-700 rounded px-1 py-0.5
              text-white focus:outline-none focus:border-red-500 disabled:opacity-40"
          />
          <span>分</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-green-400">小休憩</span>
          <input
            type="number" min={1} max={30} value={config.shortBreakMinutes}
            disabled={isRunning}
            onChange={(e) => onUpdateConfig({ shortBreakMinutes: Math.max(1, Math.min(30, parseInt(e.target.value) || 5)) })}
            className="w-12 text-center bg-slate-800 border border-slate-700 rounded px-1 py-0.5
              text-white focus:outline-none focus:border-green-500 disabled:opacity-40"
          />
          <span>分</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-blue-400">長休憩</span>
          <input
            type="number" min={1} max={60} value={config.longBreakMinutes}
            disabled={isRunning}
            onChange={(e) => onUpdateConfig({ longBreakMinutes: Math.max(1, Math.min(60, parseInt(e.target.value) || 15)) })}
            className="w-12 text-center bg-slate-800 border border-slate-700 rounded px-1 py-0.5
              text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
          />
          <span>分</span>
        </label>
      </div>
    </div>
  );
}
