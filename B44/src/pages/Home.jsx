import React, { useMemo, useState } from "react";
import BrainMap from "@/components/brain/BrainMap";
import SketchfabBrain from "@/components/brain/SketchfabBrain";
import NetworkGraph from "@/components/brain/NetworkGraph";
import RegionDetail from "@/components/brain/RegionDetail";
import ColorScaleLegend from "@/components/brain/ColorScaleLegend";
import { nodes, edges, metrics, pathways } from "@/data/brainConfig";

export default function Home() {
  const [metric, setMetric] = useState(metrics[0].value);
  const [focusGroup, setFocusGroup] = useState(pathways[0].value);
  const [selectedRoi, setSelectedRoi] = useState(nodes[0]?.roi || null);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.roi === selectedRoi) || null,
    [selectedRoi],
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Brain Aging Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Unified Cognition & Pathway Explorer</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Explore how genetic risk, lifestyle, and region-specific brain metrics interact in one combined dashboard.
              Select a metric and pathway to update the visualizations in real time.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Metric</p>
              <select
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={metric}
                onChange={(event) => setMetric(event.target.value)}
              >
                {metrics.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Pathway filter</p>
              <select
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={focusGroup}
                onChange={(event) => setFocusGroup(event.target.value)}
              >
                {pathways.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Interactive Brain Map</p>
                  <p className="mt-1 text-sm text-slate-500">Click any region to inspect values and effects.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                  Showing {metrics.find((item) => item.value === metric)?.label}
                </div>
              </div>
              <div className="mt-6">
                <BrainMap nodes={nodes} metric={metric} selectedRoi={selectedRoi} onSelectRoi={setSelectedRoi} />
              </div>
              <ColorScaleLegend />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">3D Brain Overlay</p>
                  <p className="mt-1 text-sm text-slate-500">Spatial view mapped to the same metric and selection.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                  Selected region: {selectedNode?.label || "None"}
                </div>
              </div>
              <div className="mt-6">
                <SketchfabBrain nodes={nodes} metric={metric} selectedRoi={selectedRoi} onSelectRoi={setSelectedRoi} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <p className="text-sm font-semibold text-slate-900">Pathway Network</p>
              <p className="mt-1 text-sm text-slate-500">Explore how risk factors and brain regions connect to Alzheimer's vulnerability.</p>
              <div className="mt-6">
                <NetworkGraph edges={edges} focusGroup={focusGroup} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
              <p className="text-sm font-semibold text-slate-900">Region detail</p>
              <p className="mt-1 text-sm text-slate-500">Detailed metric comparisons for the selected region.</p>
              <div className="mt-6">
                <RegionDetail node={selectedNode} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
