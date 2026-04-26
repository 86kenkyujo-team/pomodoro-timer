"use client";

import { TimerState } from "../hooks/useTimer";

interface TimeDisplayProps {
  remainingSeconds: number;
  totalSeconds: number;
  state: TimerState;
}

export default function TimeDisplay({ remainingSeconds, totalSeconds, state }: TimeDisplayProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  const colorClass =
    state === "finished"
      ? "text-red-400"
      : state === "running" && remainingSeconds <= 10
      ? "text-amber-400"
      : "text-white";

  const pulse = state === "finished" || (state === "running" && remainingSeconds <= 10);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        className={`font-mono text-6xl md:text-7xl font-bold tracking-widest ${colorClass}
                    ${pulse ? "animate-pulse" : ""}`}
        style={{ textShadow: state === "running" ? "0 0 20px rgba(56,189,248,0.5)" : undefined }}
      >
        {mm}<span className="opacity-60 mx-1">:</span>{ss}
      </div>

      {state === "finished" && (
        <div className="text-red-400 font-mono text-sm tracking-widest animate-bounce mt-1">
          ■ 終点到着 ■
        </div>
      )}

      {state === "running" && remainingSeconds <= 10 && remainingSeconds > 0 && (
        <div className="text-amber-400 font-mono text-xs tracking-widest mt-1">
          まもなく終点
        </div>
      )}

      {(state === "idle" || state === "paused") && (
        <div className="text-slate-500 font-mono text-xs tracking-widest mt-1">
          {state === "paused" ? "— 一時停止中 —" : "— 待機中 —"}
        </div>
      )}
    </div>
  );
}
