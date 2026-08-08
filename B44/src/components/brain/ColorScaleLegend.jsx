import React from "react";
import { SCALE_MIN, SCALE_MAX } from "@/data/brainConfig";

// Gradient stops mirror the exact SCALE_MIN/SCALE_MAX domain used by SketchfabBrain's
// colorForValue, so the legend always matches the rendered colors.
export default function ColorScaleLegend() {
  return (
    <div className="flex items-center gap-3 mt-4 flex-wrap">
      <div
        className="h-3 rounded-full flex-1 min-w-32"
        style={{
          background: "linear-gradient(to right, rgb(220,38,38), rgb(245,245,230), rgb(37,99,235))",
          border: "1px solid #e2ddd6",
        }}
      />
      <div className="flex justify-between w-full text-xs text-stone-400 -mt-1">
        <span>Negative / risk ({SCALE_MIN.toFixed(2)})</span>
        <span>Neutral</span>
        <span>Positive / protective ({SCALE_MAX.toFixed(2)})</span>
      </div>
    </div>
  );
}
