"use client";

import PomodoroTimer from "./components/PomodoroTimer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 py-12">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 w-full">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-mono font-bold tracking-[0.15em] text-white">
            POMODORO
          </h1>
          <p className="text-slate-600 text-xs font-mono tracking-[0.3em] mt-1">
            ポモドーロタイマー ／ 発力研究所
          </p>
        </div>

        <PomodoroTimer />
      </div>
    </main>
  );
}
