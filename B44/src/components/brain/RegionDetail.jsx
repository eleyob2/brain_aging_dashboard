import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Brain, AlertTriangle, Shield } from "lucide-react";

export default function RegionDetail({ node }) {
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
        <Brain className="w-10 h-10 opacity-30" />
        <p className="text-sm">Click a brain region to explore its data</p>
      </div>
    );
  }

  const groupData = [
    { name: "Carrier ?", value: node.carrier_female_toy, color: "#e11d48" },
    { name: "Carrier ?", value: node.carrier_male_toy, color: "#f97316" },
    { name: "Non-carrier ?", value: node.noncarrier_female_toy, color: "#6366f1" },
    { name: "Non-carrier ?", value: node.noncarrier_male_toy, color: "#0ea5e9" },
  ];

  const effectData = [
    { name: "APOE-e4", value: node.apoe_e4_effect },
    { name: "Age", value: node.age_effect },
    { name: "Sex mod. ?", value: node.sex_modifier_female },
    { name: "Alcohol", value: node.alcohol_interaction },
    { name: "Diet", value: node.diet_interaction },
  ].filter((d) => d.value !== 0);

  const systemColors = {
    limbic: "bg-rose-100 text-rose-700",
    cerebellar: "bg-amber-100 text-amber-700",
    "white matter": "bg-blue-100 text-blue-700",
    cortical: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">{node.label}</h3>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${systemColors[node.system] || "bg-gray-100 text-gray-600"}`}>
            {node.system}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {node.alz}
          </span>
          <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-medium">
            {node.ad_link_score >= 0.7 ? <AlertTriangle className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
            AD link: {(node.ad_link_score * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Group comparison chart */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Group Comparison (Toy Values)
        </p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupData} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e2dc" horizontal={false} />
              <XAxis type="number" domain={[-1, 0.5]} tick={{ fontSize: 10 }} stroke="#b0a898" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} stroke="#b0a898" />
              <Tooltip
                contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e2dc" }}
                formatter={(v) => [v.toFixed(2), "Value"]}
              />
              <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                {groupData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Effect sizes */}
      {effectData.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Active Interactions
          </p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={effectData} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e2dc" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#b0a898" />
                <YAxis domain={[-1, 1]} tick={{ fontSize: 10 }} stroke="#b0a898" />
                <Tooltip
                  contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid #e5e2dc" }}
                  formatter={(v) => [v.toFixed(2), "Effect"]}
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                  {effectData.map((d, i) => (
                    <Cell key={i} fill={d.value < 0 ? "#ef4444" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Note */}
      <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-amber-300 pl-3 italic">
        {node.note}
      </p>
    </div>
  );
}
