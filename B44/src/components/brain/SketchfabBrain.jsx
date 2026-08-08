import React, { useState } from "react";
import { REGION_OVERLAYS, SCALE_MIN, SCALE_MAX } from "@/data/brainConfig";

function lerp(a, b, t) {return a + (b - a) * t;}

function colorForValue(v) {
  const t = Math.max(0, Math.min(1, (v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)));
  if (t < 0.5) {
    const k = t / 0.5;
    return { r: Math.round(lerp(220, 250, k)), g: Math.round(lerp(38, 250, k)), b: Math.round(lerp(38, 250, k)) };
  }
  const k = (t - 0.5) / 0.5;
  return { r: Math.round(lerp(250, 37, k)), g: Math.round(lerp(250, 99, k)), b: Math.round(lerp(250, 235, k)) };
}

function labelForValue(v) {
  if (v < -0.03) return "Negative / risk";
  if (v > 0.03) return "Positive / protective";
  return "Neutral";
}

export default function SketchfabBrain({ nodes, metric, selectedRoi, onSelectRoi }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-stone-50" style={{ height: 400 }}>
      <img src="https://media.base44.com/images/public/6a43d9cf4e4f3c77f8cc365d/d70e4f6e2_brain.png"
      alt="Brain anatomy"
      className="w-full h-full object-contain opacity-100"
      draggable={false} />
      
      {/* Overlay hotspots */}
      {REGION_OVERLAYS.map((region) => {
        const node = nodes?.find((n) => n.roi === region.id);
        const val = node ? node[metric] ?? 0 : 0;
        const col = colorForValue(val);
        const rgb = `rgb(${col.r},${col.g},${col.b})`;
        const isSelected = selectedRoi === region.id;
        const isHovered = hovered === region.id;

        return (
          <div
            key={region.id}
            className="absolute"
            style={{ left: `${region.x}%`, top: `${region.y}%`, transform: "translate(-50%, -50%)" }}
            onMouseEnter={() => setHovered(region.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelectRoi(region.id)}>
            
            {/* Pulse ring for selected */}
            {isSelected &&
            <div
              className="absolute rounded-full"
              style={{
                width: 40, height: 40,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                background: rgb,
                opacity: 0.25,
                animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite"
              }} />

            }

            {/* Main dot */}
            <div
              className="relative rounded-full border-2 border-white cursor-pointer transition-all duration-200"
              style={{
                width: isSelected || isHovered ? 22 : 16,
                height: isSelected || isHovered ? 22 : 16,
                background: rgb,
                boxShadow: `0 0 ${isSelected ? 18 : isHovered ? 12 : 7}px 3px ${rgb}`
              }} />
            
            {/* Tooltip */}
            {(isHovered || isSelected) &&
            <div
              className="absolute z-20 whitespace-nowrap text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none"
              style={{
                background: "rgba(20,18,15,0.88)",
                color: "#fff",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)"
              }}>
              
                <div>{region.label}</div>
                <div style={{ color: rgb, fontWeight: 400, fontSize: 10 }}>
                  {labelForValue(val)} ({val > 0 ? "+" : ""}{val.toFixed(2)})
                </div>
              </div>
            }
          </div>);

      })}

      <style>{`
        @keyframes ping {
          75%, 100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
        }
      `}</style>
    </div>);

}
