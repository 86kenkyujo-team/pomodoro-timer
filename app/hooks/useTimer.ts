"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type TimerState = "idle" | "running" | "paused" | "finished";

export interface UseTimerReturn {
  totalSeconds: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  progress: number; // 0 to 1 (elapsed / total)
  state: TimerState;
  setDuration: (minutes: number, seconds: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useTimer(): UseTimerReturn {
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [state, setState] = useState<TimerState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setState("finished");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [state, clearTimer]);

  const setDuration = useCallback((minutes: number, seconds: number) => {
    const total = minutes * 60 + seconds;
    setTotalSeconds(total);
    setRemainingSeconds(total);
    setState("idle");
  }, []);

  const start = useCallback(() => {
    if (state === "idle" || state === "paused") {
      setState("running");
    }
  }, [state]);

  const pause = useCallback(() => {
    if (state === "running") {
      clearTimer();
      setState("paused");
    }
  }, [state, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setRemainingSeconds(totalSeconds);
    setState("idle");
  }, [totalSeconds, clearTimer]);

  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progress = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0;

  return {
    totalSeconds,
    remainingSeconds,
    elapsedSeconds,
    progress,
    state,
    setDuration,
    start,
    pause,
    reset,
  };
}
