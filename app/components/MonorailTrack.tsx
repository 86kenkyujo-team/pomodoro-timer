"use client";

import { useMemo } from "react";
import { Phase } from "../hooks/usePomodoro";

interface MonorailTrackProps {
  progress: number;
  phase: Phase;
  isRunning: boolean;
  isFinished: boolean;
}

const CX = 400;
const CY = 210;
const RX = 310;
const RY = 145;

function getPointOnEllipse(angle: number) {
  return {
    x: CX + RX * Math.cos(angle),
    y: CY + RY * Math.sin(angle),
  };
}

function getEllipseAngle(t: number) {
  return -Math.PI / 2 + t * 2 * Math.PI;
}

function buildProgressPath(progress: number): string {
  if (progress <= 0) return "";
  if (progress >= 1) {
    const sx = CX + RX * Math.cos(-Math.PI / 2);
    const sy = CY + RY * Math.sin(-Math.PI / 2);
    return `M ${sx} ${sy} A ${RX} ${RY} 0 1 1 ${sx - 0.001} ${sy}`;
  }
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + progress * 2 * Math.PI;
  const start = getPointOnEllipse(startAngle);
  const end = getPointOnEllipse(endAngle);
  const largeArc = progress > 0.5 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${RX} ${RY} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const PHASE_COLORS = {
  focus: {
    track: "#3f1f1f",
    progress: "#f87171",
    trainGlow: "rgba(239,68,68,0.5)",
    trainFill: "url(#trainFocus)",
    light: "#fef2f2",
  },
  shortBreak: {
    track: "#1a3320",
    progress: "#4ade80",
    trainGlow: "rgba(34,197,94,0.5)",
    trainFill: "url(#trainShort)",
    light: "#f0fdf4",
  },
  longBreak: {
    track: "#1a2a3f",
    progress: "#60a5fa",
    trainGlow: "rgba(59,130,246,0.5)",
    trainFill: "url(#trainLong)",
    light: "#eff6ff",
  },
};

export default function MonorailTrack({ progress, phase, isRunning, isFinished }: MonorailTrackProps) {
  const colors = PHASE_COLORS[phase];
  const trainAngle = getEllipseAngle(progress);
  const trainPos = getPointOnEllipse(trainAngle);
  const nextPos = getPointOnEllipse(trainAngle + 0.001);
  const trainRotation = Math.atan2(nextPos.y - trainPos.y, nextPos.x - trainPos.x) * (180 / Math.PI);
  const progressPath = useMemo(() => buildProgressPath(progress), [progress]);
  const stationPos = getPointOnEllipse(-Math.PI / 2);
  const pillars = [0, 0.12, 0.25, 0.38, 0.5, 0.62, 0.75, 0.88];

  return (
    <svg viewBox="0 0 800 420" className="w-full max-w-2xl" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="trainGlowFilter">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="trainFocus" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fecaca" /><stop offset="100%" stopColor="#fca5a5" />
        </linearGradient>
        <linearGradient id="trainShort" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bbf7d0" /><stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <linearGradient id="trainLong" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bfdbfe" /><stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>

      {pillars.map((t, i) => {
        const pos = getPointOnEllipse(getEllipseAngle(t));
        return <line key={i} x1={pos.x} y1={pos.y + 8} x2={pos.x} y2={pos.y + 38}
          stroke="#1e2a3a" strokeWidth="6" strokeLinecap="round" />;
      })}

      <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke={colors.track} strokeWidth="12" />
      <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none"
        stroke="#0f172a" strokeWidth="4" strokeDasharray="18 12" opacity="0.6" />

      {progress > 0 && (
        <path d={progressPath} fill="none" stroke={colors.progress} strokeWidth="10"
          strokeLinecap="round" filter="url(#glow)" style={{ transition: "stroke 0.5s" }} />
      )}

      <circle cx={stationPos.x} cy={stationPos.y} r={18}
        fill="rgba(253,230,138,0.1)" stroke="#fde68a" strokeWidth="2" />
      <circle cx={stationPos.x} cy={stationPos.y} r={7} fill="#fde68a" filter="url(#glow)" />
      <text x={stationPos.x} y={stationPos.y - 26} textAnchor="middle"
        fill="#fde68a" fontSize="10" fontFamily="monospace" letterSpacing="1.5">START</text>

      <g transform={`translate(${trainPos.x}, ${trainPos.y}) rotate(${trainRotation})`}
        filter="url(#trainGlowFilter)">
        <ellipse rx={26} ry={11} fill={colors.trainGlow} />
        <rect x={-22} y={-8} width={44} height={16} rx={5} fill={colors.trainFill} />
        <rect x={-14} y={-5} width={8} height={6} rx={1.5} fill="#0f172a" opacity="0.6" />
        <rect x={-2} y={-5} width={8} height={6} rx={1.5} fill="#0f172a" opacity="0.6" />
        <rect x={10} y={-5} width={8} height={6} rx={1.5} fill="#0f172a" opacity="0.6" />
        <circle cx={22} cy={0} r={3} fill={colors.light} opacity={isRunning ? 1 : 0.4} />
        {isRunning && <circle cx={22} cy={0} r={6} fill={colors.light} opacity={0.25} />}
        <rect x={-18} y={7} width={36} height={3} rx={1} fill="#1e293b" />
      </g>

      {isFinished && (
        <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none"
          stroke={colors.progress} strokeWidth="4" opacity="0.5">
          <animate attributeName="opacity" values="0.5;0;0.5" dur="0.7s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}
