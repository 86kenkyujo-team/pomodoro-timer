"use client";

import { useMemo } from "react";

interface MonorailTrackProps {
  progress: number; // 0 to 1
  isFinished: boolean;
  isRunning: boolean;
}

// Oval track parameters
const CX = 400;
const CY = 220;
const RX = 310;
const RY = 150;

function getPointOnEllipse(angle: number) {
  return {
    x: CX + RX * Math.cos(angle),
    y: CY + RY * Math.sin(angle),
  };
}

function getEllipseAngle(t: number) {
  // t goes from 0 to 1, train starts at the rightmost point and goes clockwise
  // Starting angle: -π/2 (top), going clockwise
  return -Math.PI / 2 + t * 2 * Math.PI;
}

// Approximate ellipse circumference using Ramanujan's formula
function ellipseCircumference(rx: number, ry: number) {
  const h = Math.pow((rx - ry) / (rx + ry), 2);
  return Math.PI * (rx + ry) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

const CIRCUMFERENCE = ellipseCircumference(RX, RY);

// Build the SVG arc path for a portion of the ellipse (0 to progress)
function buildProgressPath(progress: number): string {
  if (progress <= 0) return "";
  if (progress >= 1) {
    // Full ellipse
    return `M ${CX + RX * Math.cos(-Math.PI / 2)} ${CY + RY * Math.sin(-Math.PI / 2)}
      A ${RX} ${RY} 0 1 1 ${CX + RX * Math.cos(-Math.PI / 2) - 0.001} ${CY + RY * Math.sin(-Math.PI / 2)}`;
  }

  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + progress * 2 * Math.PI;
  const start = getPointOnEllipse(startAngle);
  const end = getPointOnEllipse(endAngle);
  const largeArc = progress > 0.5 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${RX} ${RY} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function MonorailTrack({ progress, isFinished, isRunning }: MonorailTrackProps) {
  const trainAngle = getEllipseAngle(progress);
  const trainPos = getPointOnEllipse(trainAngle);

  // Train rotation angle (tangent to ellipse)
  const delta = 0.001;
  const nextAngle = trainAngle + delta;
  const nextPos = getPointOnEllipse(nextAngle);
  const trainRotation = Math.atan2(nextPos.y - trainPos.y, nextPos.x - trainPos.x) * (180 / Math.PI);

  const progressPath = useMemo(() => buildProgressPath(progress), [progress]);

  // Station position (start = top of ellipse)
  const stationPos = getPointOnEllipse(-Math.PI / 2);

  const trackColor = isFinished ? "#f87171" : "#334155";
  const progressColor = isFinished ? "#ef4444" : isRunning ? "#38bdf8" : "#60a5fa";
  const glowColor = isFinished ? "rgba(239,68,68,0.6)" : isRunning ? "rgba(56,189,248,0.6)" : "rgba(96,165,250,0.4)";

  return (
    <svg
      viewBox="0 0 800 440"
      className="w-full max-w-2xl"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="trainGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="trainBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <radialGradient id="stationGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Track support pillars */}
      {[0, 0.15, 0.3, 0.5, 0.65, 0.8].map((t, i) => {
        const angle = getEllipseAngle(t);
        const pos = getPointOnEllipse(angle);
        return (
          <line
            key={i}
            x1={pos.x}
            y1={pos.y + 8}
            x2={pos.x}
            y2={pos.y + 40}
            stroke="#1e3a5f"
            strokeWidth="6"
            strokeLinecap="round"
          />
        );
      })}

      {/* Base track (full ellipse) */}
      <ellipse
        cx={CX}
        cy={CY}
        rx={RX}
        ry={RY}
        fill="none"
        stroke={trackColor}
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Track rail details (inner) */}
      <ellipse
        cx={CX}
        cy={CY}
        rx={RX}
        ry={RY}
        fill="none"
        stroke="#1e3a5f"
        strokeWidth="4"
        strokeDasharray="20 10"
        opacity="0.5"
      />

      {/* Progress arc */}
      {progress > 0 && (
        <path
          d={progressPath}
          fill="none"
          stroke={progressColor}
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#glow)"
          style={{ transition: "stroke 0.5s ease" }}
        />
      )}

      {/* Station marker */}
      <circle
        cx={stationPos.x}
        cy={stationPos.y}
        r={20}
        fill="rgba(253,230,138,0.15)"
        stroke="#fde68a"
        strokeWidth="2"
      />
      <circle
        cx={stationPos.x}
        cy={stationPos.y}
        r={8}
        fill="#fde68a"
        filter="url(#glow)"
      />
      <text
        x={stationPos.x}
        y={stationPos.y - 28}
        textAnchor="middle"
        fill="#fde68a"
        fontSize="11"
        fontFamily="monospace"
        letterSpacing="1"
      >
        STATION
      </text>

      {/* Train */}
      <g
        transform={`translate(${trainPos.x}, ${trainPos.y}) rotate(${trainRotation})`}
        filter="url(#trainGlow)"
      >
        {/* Train glow aura */}
        <ellipse rx={28} ry={12} fill={glowColor} />

        {/* Train body */}
        <rect x={-22} y={-8} width={44} height={16} rx={5} fill="url(#trainBody)" />

        {/* Train windows */}
        <rect x={-14} y={-5} width={8} height={6} rx={1.5} fill="#0ea5e9" opacity="0.8" />
        <rect x={-2} y={-5} width={8} height={6} rx={1.5} fill="#0ea5e9" opacity="0.8" />
        <rect x={10} y={-5} width={8} height={6} rx={1.5} fill="#0ea5e9" opacity="0.8" />

        {/* Front light */}
        <circle cx={22} cy={0} r={3} fill="#fef9c3" opacity={isRunning ? 1 : 0.5} />
        {isRunning && (
          <circle cx={22} cy={0} r={6} fill="#fef9c3" opacity={0.3} />
        )}

        {/* Undercarriage */}
        <rect x={-18} y={7} width={36} height={4} rx={1} fill="#475569" />
      </g>

      {/* Finished flash overlay */}
      {isFinished && (
        <ellipse
          cx={CX}
          cy={CY}
          rx={RX}
          ry={RY}
          fill="none"
          stroke="#ef4444"
          strokeWidth="4"
          opacity="0.5"
        >
          <animate attributeName="opacity" values="0.5;0;0.5" dur="0.8s" repeatCount="indefinite" />
        </ellipse>
      )}
    </svg>
  );
}
