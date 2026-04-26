"use client";

import { useState } from "react";
import { TimerState } from "../hooks/useTimer";

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSetDuration: (minutes: number, seconds: number) => void;
}

export default function TimerControls({
  state,
  onStart,
  onPause,
  onReset,
  onSetDuration,
}: TimerControlsProps) {
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);

  const handleSet = () => {
    onSetDuration(minutes, seconds);
  };

  const presets = [
    { label: "1分", m: 1, s: 0 },
    { label: "3分", m: 3, s: 0 },
    { label: "5分", m: 5, s: 0 },
    { label: "10分", m: 10, s: 0 },
    { label: "25分", m: 25, s: 0 },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Preset buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setMinutes(p.m);
              setSeconds(p.s);
              onSetDuration(p.m, p.s);
            }}
            className="px-3 py-1.5 text-sm font-mono rounded-full border border-sky-500/40
                       text-sky-300 hover:bg-sky-500/20 hover:border-sky-400 transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={state === "running"}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom duration input */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={99}
            value={minutes}
            onChange={(e) => setMinutes(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
            disabled={state === "running"}
            className="w-16 text-center text-xl font-mono bg-slate-800 border border-slate-600
                       rounded-lg px-2 py-2 text-white focus:outline-none focus:border-sky-500
                       disabled:opacity-50"
          />
          <span className="text-slate-400 font-mono text-lg">分</span>
        </div>
        <span className="text-slate-500 text-2xl font-mono">:</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            disabled={state === "running"}
            className="w-16 text-center text-xl font-mono bg-slate-800 border border-slate-600
                       rounded-lg px-2 py-2 text-white focus:outline-none focus:border-sky-500
                       disabled:opacity-50"
          />
          <span className="text-slate-400 font-mono text-lg">秒</span>
        </div>
        <button
          onClick={handleSet}
          disabled={state === "running"}
          className="px-4 py-2 text-sm font-mono rounded-lg bg-slate-700 border border-slate-600
                     text-slate-300 hover:bg-slate-600 hover:text-white transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          セット
        </button>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-4">
        {state !== "running" ? (
          <button
            onClick={onStart}
            disabled={state === "finished"}
            className="px-8 py-3 rounded-full font-mono text-base font-semibold
                       bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30
                       transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                       disabled:shadow-none"
          >
            {state === "paused" ? "▶ 再開" : "▶ スタート"}
          </button>
        ) : (
          <button
            onClick={onPause}
            className="px-8 py-3 rounded-full font-mono text-base font-semibold
                       bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/30
                       transition-all active:scale-95"
          >
            ⏸ 一時停止
          </button>
        )}

        <button
          onClick={onReset}
          className="px-6 py-3 rounded-full font-mono text-base font-semibold
                     bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white
                     border border-slate-600 transition-all active:scale-95"
        >
          ↺ リセット
        </button>
      </div>
    </div>
  );
}
