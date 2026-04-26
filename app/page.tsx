"use client";

import MonorailTrack from "./components/MonorailTrack";
import PhaseDisplay from "./components/PhaseDisplay";
import PomodoroControls from "./components/PomodoroControls";
import { usePomodoro } from "./hooks/usePomodoro";

const PHASE_BG: Record<string, string> = {
  focus: "bg-slate-900",
  shortBreak: "bg-[#0d1f12]",
  longBreak: "bg-[#0d1520]",
};

export default function Home() {
  const {
    phase,
    timerState,
    remainingSeconds,
    totalSeconds,
    progress,
    completedSessions,
    config,
    start,
    pause,
    reset,
    skip,
    updateConfig,
  } = usePomodoro();

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center gap-6 px-4 py-10
        transition-colors duration-700 ${PHASE_BG[phase]}`}
    >
      <div className="text-center">
        <h1 className="text-xl md:text-2xl font-mono font-bold tracking-[0.25em] text-slate-300">
          POMODORO MONORAIL
        </h1>
        <p className="text-slate-600 text-xs font-mono tracking-widest mt-1">
          ポモドーロ式モノレールタイマー
        </p>
      </div>

      <div className="w-full flex justify-center px-2">
        <MonorailTrack
          progress={progress}
          phase={phase}
          isRunning={timerState === "running"}
          isFinished={timerState === "finished"}
        />
      </div>

      <PhaseDisplay
        phase={phase}
        timerState={timerState}
        remainingSeconds={remainingSeconds}
        completedSessions={completedSessions}
        sessionsUntilLongBreak={config.sessionsUntilLongBreak}
      />

      <PomodoroControls
        phase={phase}
        timerState={timerState}
        config={config}
        onStart={start}
        onPause={pause}
        onReset={reset}
        onSkip={skip}
        onUpdateConfig={updateConfig}
      />

      <footer className="text-slate-700 text-xs font-mono tracking-wider mt-2">
        発力研究所
      </footer>
    </main>
  );
}
