import React, { useState } from "react";
import { motion } from "framer-motion";

const regions = [
  { id: "left_amygdala", label: "Amygdala", cx: 235, cy: 234, rx: 42, ry: 30 },
  { id: "left_cerebellar_exterior", label: "Cerebellar ext.", cx: 183, cy: 305, rx: 64, ry: 32 },
  { id: "splenium_corpus_callosum_md", label: "Splenium MD", cx: 355, cy: 190, rx: 60, ry: 26 },
  { id: "paracentral_volume", label: "Paracentral", cx: 415, cy: 146, rx: 52, ry: 28 },
  { id: "superior_fronto_occipital_fasciculus_axd", label: "SFOF AxD", cx: 500, cy: 178, rx: 90, ry: 24 },
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function colorFor(v) {
  const t = Math.max(0, Math.min(1, (v - -1) / 2));
  if (t < 0.5) {
    const k = t / 0.5;
    return `rgb(${Math.round(lerp(220, 245, k))},${Math.round(lerp(38, 245, k))},${Math.round(lerp(38, 245, k))})`;
  }
  const k = (t - 0.5) / 0.5;
  return `rgb(${Math.round(lerp(245, 37, k))},${Math.round(lerp(245, 99, k))},${Math.round(lerp(245, 235, k))})`;
}

export default function BrainMap({ nodes, metric, selectedRoi, onSelectRoi }) {
  const [hoveredRoi, setHoveredRoi] = useState(null);

  return (
    <svg viewBox="0 0 760 420" className="w-full h-auto">
      <defs>
        <filter id="regionShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="5" floodOpacity="0.12" />
        </filter>
        <filter id="regionGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="brainGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#f5f0e8" />
          <stop offset="100%" stopColor="#e8e0d4" />
        </radialGradient>
        <pattern id="brainTexture" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="0.4" fill="#d4cdc2" opacity="0.4" />
        </pattern>
      </defs>

      {/* Brain silhouette */}
      <path
        d="M99 216c0-92 81-162 196-162h118c118 0 213 71 213 160 0 87-94 157-211 157H296c-118 0-197-67-197-155Z"
        fill="url(#brainGrad)"
        stroke="#c4b9ab"
        strokeWidth="2.5"
      />
      <path
        d="M99 216c0-92 81-162 196-162h118c118 0 213 71 213 160 0 87-94 157-211 157H296c-118 0-197-67-197-155Z"
        fill="url(#brainTexture)"
        opacity="0.5"
      />

      {/* Sulci lines for realism */}
      <path d="M200 120 Q280 160 310 240" fill="none" stroke="#d0c7ba" strokeWidth="1.5" opacity="0.5" />
      <path d="M350 100 Q380 180 370 290" fill="none" stroke="#d0c7ba" strokeWidth="1.5" opacity="0.5" />
      <path d="M450 120 Q500 200 520 300" fill="none" stroke="#d0c7ba" strokeWidth="1.5" opacity="0.5" />
      <path d="M160 200 Q250 180 400 200" fill="none" stroke="#d0c7ba" strokeWidth="1" opacity="0.4" />

      {/* Regions */}
      {regions.map((r) => {
        const node = nodes.find((n) => n.roi === r.id);
        const val = node ? node[metric] : 0;
        const fill = colorFor(val);
        const isSelected = selectedRoi === r.id;
        const isHovered = hoveredRoi === r.id;

        return (
          <g key={r.id}>
            <motion.ellipse
              cx={r.cx}
              cy={r.cy}
              rx={r.rx}
              ry={r.ry}
              fill={fill}
              stroke={isSelected ? "#0f766e" : "#7a6f62"}
              strokeWidth={isSelected ? 3 : 1.5}
              filter={isHovered || isSelected ? "url(#regionGlow)" : "url(#regionShadow)"}
              style={{ cursor: "pointer" }}
              initial={false}
              animate={{
                rx: isHovered ? r.rx + 4 : r.rx,
                ry: isHovered ? r.ry + 3 : r.ry,
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onMouseEnter={() => setHoveredRoi(r.id)}
              onMouseLeave={() => setHoveredRoi(null)}
              onClick={() => onSelectRoi(r.id)}
            />
            <text
              x={r.cx}
              y={r.cy + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#2d2820"
              pointerEvents="none"
              className="select-none"
            >
              {r.label}
            </text>
            {(isHovered || isSelected) && (
              <text
                x={r.cx}
                y={r.cy + r.ry + 16}
                textAnchor="middle"
                fontSize="10"
                fill="#6f6a63"
                pointerEvents="none"
              >
                {val > 0 ? "+" : ""}{val.toFixed(2)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
