"use client";

import { Phase, TimerState } from "../hooks/usePomodoro";

interface PhaseDisplayProps {
  phase: Phase;
  timerState: TimerState;
  remainingSeconds: number;
  completedSessions: number;
  sessionsUntilLongBreak: number;
}

const PHASE_LABELS: Record<Phase, string> = {
  focus: "集中",
  shortBreak: "小休憩",
  longBreak: "長休憩",
};

const PHASE_EN: Record<Phase, string> = {
  focus: "FOCUS",
  shortBreak: "SHORT BREAK",
  longBreak: "LONG BREAK",
};

const PHASE_COLORS: Record<Phase, string> = {
  focus: "text-red-400",
  shortBreak: "text-green-400",
  longBreak: "text-blue-400",
};

const PHASE_GLOW: Record<Phase, string> = {
  focus: "rgba(248,113,113,0.4)",
  shortBreak: "rgba(74,222,128,0.4)",
  longBreak: "rgba(96,165,250,0.4)",
};

export default function PhaseDisplay({
  phase,
  timerState,
  remainingSeconds,
  completedSessions,
  sessionsUntilLongBreak,
}: PhaseDisplayProps) {
  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const ss = String(remainingSeconds % 60).padStart(2, "0");
  const colorClass = PHASE_COLORS[phase];

  const isWarning = timerState === "running" && remainingSeconds <= 10;
  const isFinished = timerState === "finished";

  const dotsTotal = sessionsUntilLongBreak;
  const dotsFilled = completedSessions % sessionsUntilLongBreak;

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* Phase label */}
      <div className="flex items-center gap-3">
        <span className={`font-mono text-xs tracking-[0.3em] uppercase ${colorClass} opacity-80`}>
          {PHASE_EN[phase]}
        </span>
        <span className="text-slate-600 text-xs">|</span>
        <span className="font-mono text-xs tracking-widest text-slate-400">
          {PHASE_LABELS[phase]}
        </span>
      </div>

      {/* Time */}
      <div
        className={`font-mono text-7xl md:text-8xl font-bold tracking-widest
          ${isFinished ? colorClass : isWarning ? "text-amber-400" : "text-white"}
          ${isWarning || isFinished ? "animate-pulse" : ""}`}
        style={{ textShadow: timerState === "running" ? `0 0 24px ${PHASE_GLOW[phase]}` : undefined }}
      >
        {mm}<span className="opacity-40 mx-1">:</span>{ss}
      </div>

      {/* Status message */}
      <div className="h-5 flex items-center">
        {isFinished && (
          <span className={`font-mono text-xs tracking-widest ${colorClass} animate-bounce`}>
            {phase === "focus" ? "■ 集中セッション完了 ■" : "■ 休憩終了 ■"}
          </span>
        )}
        {timerState === "paused" && (
          <span className="font-mono text-xs tracking-widest text-slate-500">— 一時停止中 —</span>
        )}
        {timerState === "idle" && (
          <span className="font-mono text-xs tracking-widest text-slate-600">— 待機中 —</span>
        )}
        {isWarning && !isFinished && (
          <span className="font-mono text-xs tracking-widest text-amber-400">まもなく終点</span>
        )}
      </div>

      {/* Pomodoro dots */}
      <div className="flex items-center gap-2 mt-1">
        {Array.from({ length: dotsTotal }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              i < dotsFilled
                ? "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]"
                : "bg-slate-700 border border-slate-600"
            }`}
          />
        ))}
        <span className="text-slate-600 text-xs font-mono ml-2">
          {completedSessions} セッション完了
        </span>
      </div>
    </div>
  );
}
