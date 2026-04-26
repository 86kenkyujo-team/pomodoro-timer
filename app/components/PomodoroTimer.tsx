"use client";

import { useEffect, useRef } from "react";
import { usePomodoro, Phase } from "../hooks/usePomodoro";

const PHASE_CONFIG = {
  focus: {
    label: "FOCUS",
    labelJa: "集中",
    color: "from-rose-500 to-orange-500",
    ringColor: "stroke-rose-500",
    bgGlow: "radial-gradient(ellipse at center, rgba(244,63,94,0.15) 0%, transparent 70%)",
    textColor: "text-rose-400",
    buttonColor: "bg-rose-500 hover:bg-rose-400 shadow-rose-500/40",
    dotColor: "bg-rose-400",
    borderColor: "border-rose-500/30",
  },
  shortBreak: {
    label: "SHORT BREAK",
    labelJa: "小休憩",
    color: "from-emerald-500 to-teal-500",
    ringColor: "stroke-emerald-500",
    bgGlow: "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 70%)",
    textColor: "text-emerald-400",
    buttonColor: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/40",
    dotColor: "bg-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  longBreak: {
    label: "LONG BREAK",
    labelJa: "長休憩",
    color: "from-sky-500 to-indigo-500",
    ringColor: "stroke-sky-500",
    bgGlow: "radial-gradient(ellipse at center, rgba(14,165,233,0.12) 0%, transparent 70%)",
    textColor: "text-sky-400",
    buttonColor: "bg-sky-500 hover:bg-sky-400 shadow-sky-500/40",
    dotColor: "bg-sky-400",
    borderColor: "border-sky-500/30",
  },
} as const;

const SIZE = 280;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function PomodoroTimer() {
  const {
    phase, timerState, remainingSeconds, totalSeconds, progress,
    completedSessions, config,
    start, pause, reset, skip, updateConfig,
  } = usePomodoro();

  const cfg = PHASE_CONFIG[phase];
  const isRunning = timerState === "running";
  const isFinished = timerState === "finished";
  const isPaused = timerState === "paused";

  const mm = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const ss = String(remainingSeconds % 60).padStart(2, "0");

  const dashOffset = CIRC * (1 - progress);
  const warning = isRunning && remainingSeconds <= 10;

  // Tick sound via Web Audio
  const audioCtx = useRef<AudioContext | null>(null);
  const prevSeconds = useRef(remainingSeconds);
  useEffect(() => {
    if (isRunning && prevSeconds.current !== remainingSeconds) {
      prevSeconds.current = remainingSeconds;
      try {
        if (!audioCtx.current) audioCtx.current = new AudioContext();
        const ctx = audioCtx.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = warning ? 880 : 440;
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch {
        // AudioContext not available
      }
    }
  }, [remainingSeconds, isRunning, warning]);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      {/* Phase tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-full">
        {(["focus", "shortBreak", "longBreak"] as Phase[]).map((p) => {
          const c = PHASE_CONFIG[p];
          const active = phase === p;
          return (
            <button
              key={p}
              onClick={() => !isRunning && skip()}
              disabled={isRunning || phase === p}
              className={`flex-1 py-2 rounded-lg text-xs font-mono tracking-wider transition-all
                ${active
                  ? `bg-gradient-to-r ${c.color} text-white shadow-lg`
                  : "text-slate-500 hover:text-slate-300 disabled:cursor-default"
                }`}
            >
              {c.labelJa}
            </button>
          );
        })}
      </div>

      {/* Ring timer */}
      <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
        {/* Glow background */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: cfg.bgGlow }} />

        {/* SVG ring */}
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          {/* Track */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
          {/* Progress */}
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            className={`${cfg.ringColor} transition-all duration-1000`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 8px currentColor)`,
              transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center gap-1">
          <span className={`text-xs font-mono tracking-[0.3em] ${cfg.textColor} opacity-70`}>
            {cfg.label}
          </span>
          <span className={`font-mono font-bold text-6xl tracking-widest leading-none
            ${isFinished ? cfg.textColor : warning ? "text-amber-300" : "text-white"}
            ${warning || isFinished ? "animate-pulse" : ""}`}>
            {mm}<span className="opacity-30 text-5xl">:</span>{ss}
          </span>
          <span className="text-slate-600 text-xs font-mono">
            {isFinished ? "完了" : isPaused ? "停止中" : isRunning ? "実行中" : "待機中"}
          </span>
        </div>
      </div>

      {/* Pomodoro dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: config.sessionsUntilLongBreak }).map((_, i) => {
          const filled = i < (completedSessions % config.sessionsUntilLongBreak);
          return (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500
              ${filled
                ? `${cfg.dotColor} shadow-[0_0_8px_currentColor]`
                : "bg-white/10 border border-white/20"
              }`}
            />
          );
        })}
        <span className="text-slate-600 text-xs font-mono ml-2">{completedSessions} 完了</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 w-full justify-center">
        <button onClick={reset}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10
            text-slate-400 hover:text-white transition-all flex items-center justify-center text-lg">
          ↺
        </button>

        <button
          onClick={isRunning ? pause : start}
          className={`flex-1 max-w-[180px] h-14 rounded-full font-mono font-semibold text-base
            text-white shadow-lg transition-all active:scale-95 ${cfg.buttonColor}`}
        >
          {isRunning ? "⏸ 停止" : isFinished ? "▶ 次へ" : isPaused ? "▶ 再開" : "▶ スタート"}
        </button>

        <button onClick={skip}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10
            text-slate-400 hover:text-white transition-all flex items-center justify-center text-lg">
          ⏭
        </button>
      </div>

      {/* Config */}
      <div className={`w-full rounded-2xl border p-4 ${cfg.borderColor} bg-white/[0.02]`}>
        <p className="text-slate-600 text-xs font-mono tracking-widest mb-3 text-center">TIME SETTINGS</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "focusMinutes" as const, label: "集中", color: "focus-within:border-rose-500/60" },
            { key: "shortBreakMinutes" as const, label: "小休憩", color: "focus-within:border-emerald-500/60" },
            { key: "longBreakMinutes" as const, label: "長休憩", color: "focus-within:border-sky-500/60" },
          ].map(({ key, label, color }) => (
            <label key={key} className="flex flex-col items-center gap-1.5">
              <span className="text-slate-500 text-xs font-mono">{label}</span>
              <div className={`flex items-center gap-1 w-full rounded-lg border border-white/10
                bg-white/5 px-2 py-1.5 transition-all ${color}`}>
                <input
                  type="number"
                  min={1} max={60}
                  value={config[key]}
                  disabled={isRunning}
                  onChange={(e) => updateConfig({ [key]: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)) })}
                  className="w-full bg-transparent text-center text-white font-mono text-sm
                    focus:outline-none disabled:opacity-40"
                />
                <span className="text-slate-600 text-xs shrink-0">分</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
