import React, { useState } from "react";
import { motion } from "framer-motion";

const positions = {
  "Smoking": [65, 30],
  "Age": [65, 75],
  "APOE-e4": [65, 135],
  "Female sex": [65, 200],
  "Excessive alcohol": [65, 265],
  "Healthy diet": [65, 325],
  "Moderate alcohol": [65, 385],
  "Left amygdala": [260, 70],
  "Left cerebellar exterior": [260, 145],
  "Splenium MD": [260, 220],
  "Paracentral volume": [260, 295],
  "SFOF AxD": [260, 370],
  "Brain structure": [430, 170],
  "AD vulnerability": [430, 310],
};

const nodeTypes = {
  "Smoking": "factor",
  "Age": "factor",
  "APOE-e4": "factor",
  "Female sex": "factor",
  "Excessive alcohol": "factor",
  "Healthy diet": "factor",
  "Moderate alcohol": "factor",
  "Left amygdala": "region",
  "Left cerebellar exterior": "region",
  "Splenium MD": "region",
  "Paracentral volume": "region",
  "SFOF AxD": "region",
  "Brain structure": "region",
  "AD vulnerability": "outcome",
};

const groupColors = {
  "carrier pathway": "#0f766e",
  "lifestyle pathway": "#2563eb",
  "global pathway": "#a16207",
};

export default function NetworkGraph({ edges, focusGroup }) {
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const filteredEdges = focusGroup === "all"
    ? edges
    : edges.filter((e) => e.group === focusGroup);

  const activeNodeNames = new Set();
  filteredEdges.forEach((e) => {
    activeNodeNames.add(e.source);
    activeNodeNames.add(e.target);
  });

  function getCurve(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const midX = x1 + dx * 0.5;
    const offset = Math.abs(y2 - y1) * 0.15;
    return `M${x1},${y1} C${midX - offset},${y1} ${midX + offset},${y2} ${x2},${y2}`;
  }

  return (
    <svg viewBox="0 0 500 420" className="w-full h-auto">
      <defs>
        <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
        </filter>
        <marker id="arrowCarrier" viewBox="0 0 10 8" refX="10" refY="4" markerWidth="8" markerHeight="6" orient="auto">
          <path d="M0 0 L10 4 L0 8 Z" fill="#0f766e" opacity="0.6" />
        </marker>
        <marker id="arrowLifestyle" viewBox="0 0 10 8" refX="10" refY="4" markerWidth="8" markerHeight="6" orient="auto">
          <path d="M0 0 L10 4 L0 8 Z" fill="#2563eb" opacity="0.6" />
        </marker>
        <marker id="arrowGlobal" viewBox="0 0 10 8" refX="10" refY="4" markerWidth="8" markerHeight="6" orient="auto">
          <path d="M0 0 L10 4 L0 8 Z" fill="#a16207" opacity="0.6" />
        </marker>
      </defs>

      {/* Edges */}
      {filteredEdges.map((e, i) => {
        const s = positions[e.source];
        const t = positions[e.target];
        if (!s || !t) return null;
        const color = groupColors[e.group] || "#9a8f80";
        const isHovered = hoveredEdge === i;
        const markerId = e.group === "carrier pathway" ? "arrowCarrier" : e.group === "lifestyle pathway" ? "arrowLifestyle" : "arrowGlobal";

        return (
          <g key={i} onMouseEnter={() => setHoveredEdge(i)} onMouseLeave={() => setHoveredEdge(null)}>
            <motion.path
              d={getCurve(s[0], s[1], t[0], t[1])}
              fill="none"
              stroke={color}
              strokeWidth={isHovered ? 3 : 1.5}
              strokeDasharray={e.group === "global pathway" ? "6 3" : "none"}
              opacity={isHovered ? 1 : 0.5}
              markerEnd={`url(#${markerId})`}
              initial={false}
              animate={{ strokeWidth: isHovered ? 3 : 1.5, opacity: isHovered ? 1 : 0.5 }}
              transition={{ duration: 0.2 }}
            />
            <text
              x={(s[0] + t[0]) / 2}
              y={(s[1] + t[1]) / 2 - 8}
              textAnchor="middle"
              fontSize="9.5"
              fill={color}
              opacity={isHovered ? 1 : 0.6}
              fontWeight={isHovered ? "600" : "400"}
              className="pointer-events-none select-none"
            >
              {e.label}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {Object.entries(positions).map(([name, [x, y]]) => {
        const type = nodeTypes[name];
        const isActive = focusGroup === "all" || activeNodeNames.has(name);
        const isHov = hoveredNode === name;

        const fills = {
          factor: { bg: "#f0fdf4", stroke: "#16a34a", text: "#15803d" },
          region: { bg: "#f8fafc", stroke: "#64748b", text: "#334155" },
          outcome: { bg: "#fef2f2", stroke: "#dc2626", text: "#b91c1c" },
        };
        const style = fills[type];

        return (
          <g
            key={name}
            opacity={isActive ? 1 : 0.25}
            onMouseEnter={() => setHoveredNode(name)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: "pointer" }}
          >
            <motion.rect
              x={x - 56}
              y={y - 16}
              width={112}
              height={32}
              rx={10}
              fill={isHov ? style.stroke : style.bg}
              stroke={style.stroke}
              strokeWidth={isHov ? 2.5 : 1}
              filter="url(#nodeShadow)"
              initial={false}
              animate={{ scale: isHov ? 1.08 : 1 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
              transition={{ duration: 0.2 }}
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="600"
              fill={isHov ? "#fff" : style.text}
              className="pointer-events-none select-none"
            >
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
