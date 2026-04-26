"use client";

import MonorailTrack from "./components/MonorailTrack";
import TimerControls from "./components/TimerControls";
import TimeDisplay from "./components/TimeDisplay";
import { useTimer } from "./hooks/useTimer";

export default function Home() {
  const { remainingSeconds, totalSeconds, progress, state, setDuration, start, pause, reset } =
    useTimer();

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-8 px-4 py-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-[0.2em] text-sky-400">
          MONORAIL TIMER
        </h1>
        <p className="text-slate-500 text-xs font-mono tracking-widest mt-1">
          モノレール式タイマー
        </p>
      </div>

      {/* Track SVG */}
      <div className="w-full flex justify-center px-4">
        <MonorailTrack
          progress={progress}
          isFinished={state === "finished"}
          isRunning={state === "running"}
        />
      </div>

      {/* Time display */}
      <TimeDisplay
        remainingSeconds={remainingSeconds}
        totalSeconds={totalSeconds}
        state={state}
      />

      {/* Controls */}
      <TimerControls
        state={state}
        onStart={start}
        onPause={pause}
        onReset={reset}
        onSetDuration={setDuration}
      />

      {/* Footer */}
      <footer className="text-slate-700 text-xs font-mono tracking-wider mt-4">
        発力研究所
      </footer>
    </main>
  );
}
