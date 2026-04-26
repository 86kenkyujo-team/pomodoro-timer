"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type Phase = "focus" | "shortBreak" | "longBreak";
export type TimerState = "idle" | "running" | "paused" | "finished";

export interface PomodoroConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
}

const DEFAULT_CONFIG: PomodoroConfig = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
};

export interface UsePomodoroReturn {
  phase: Phase;
  timerState: TimerState;
  remainingSeconds: number;
  totalSeconds: number;
  progress: number;
  completedSessions: number;
  config: PomodoroConfig;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  updateConfig: (c: Partial<PomodoroConfig>) => void;
}

function phaseDuration(phase: Phase, config: PomodoroConfig): number {
  if (phase === "focus") return config.focusMinutes * 60;
  if (phase === "shortBreak") return config.shortBreakMinutes * 60;
  return config.longBreakMinutes * 60;
}

function nextPhase(phase: Phase, completedSessions: number, config: PomodoroConfig): Phase {
  if (phase === "focus") {
    const newCount = completedSessions + 1;
    return newCount % config.sessionsUntilLongBreak === 0 ? "longBreak" : "shortBreak";
  }
  return "focus";
}

export function usePomodoro(): UsePomodoroReturn {
  const [config, setConfig] = useState<PomodoroConfig>(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<Phase>("focus");
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_CONFIG.focusMinutes * 60);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_CONFIG.focusMinutes * 60);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(phase);
  const completedRef = useRef(completedSessions);
  const configRef = useRef(config);

  phaseRef.current = phase;
  completedRef.current = completedSessions;
  configRef.current = config;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advancePhase = useCallback(() => {
    const currentPhase = phaseRef.current;
    const currentCompleted = completedRef.current;
    const currentConfig = configRef.current;

    const newCompleted = currentPhase === "focus" ? currentCompleted + 1 : currentCompleted;
    const next = nextPhase(currentPhase, currentCompleted, currentConfig);
    const duration = phaseDuration(next, currentConfig);

    setCompletedSessions(newCompleted);
    setPhase(next);
    setTotalSeconds(duration);
    setRemainingSeconds(duration);
    setTimerState("finished");
  }, []);

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            advancePhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [timerState, clearTimer, advancePhase]);

  const start = useCallback(() => {
    if (timerState === "idle" || timerState === "paused" || timerState === "finished") {
      setTimerState("running");
    }
  }, [timerState]);

  const pause = useCallback(() => {
    if (timerState === "running") {
      clearTimer();
      setTimerState("paused");
    }
  }, [timerState, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    const duration = phaseDuration(phase, config);
    setRemainingSeconds(duration);
    setTotalSeconds(duration);
    setTimerState("idle");
  }, [phase, config, clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
    advancePhase();
  }, [clearTimer, advancePhase]);

  const updateConfig = useCallback((partial: Partial<PomodoroConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      configRef.current = next;
      return next;
    });
  }, []);

  // Sync totalSeconds when config changes while idle
  useEffect(() => {
    if (timerState === "idle") {
      const duration = phaseDuration(phase, config);
      setTotalSeconds(duration);
      setRemainingSeconds(duration);
    }
  }, [config, phase, timerState]);

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

  return {
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
  };
}
