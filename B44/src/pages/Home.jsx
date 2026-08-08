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

  const selectedMetricLabel = metrics.find((item) => item.value === metric)?.label || "Metric";
  const selectedPathwayLabel = pathways.find((item) => item.value === focusGroup)?.label || "Pathway";
  const regionLabel = selectedNode?.label || "Select a region";

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm shadow-slate-200/70 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Brain aging dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Unified cognition and pathway explorer</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Explore how regional brain metrics and pathway-level interactions shift together in one focused view.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Metric</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={metric}
                  onChange={(event) => setMetric(event.target.value)}
                >
                  {metrics.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Pathway view</span>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={focusGroup}
                  onChange={(event) => setFocusGroup(event.target.value)}
                >
                  {pathways.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Current metric</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{selectedMetricLabel}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Pathway focus</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{selectedPathwayLabel}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Selected region</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{regionLabel}</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Interactive brain map</p>
                  <p className="mt-1 text-sm text-slate-500">Click any region to inspect values and effects in context.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  Showing {selectedMetricLabel}
                </div>
              </div>
              <div className="mt-6">
                <BrainMap nodes={nodes} metric={metric} selectedRoi={selectedRoi} onSelectRoi={setSelectedRoi} />
              </div>
              <div className="mt-4">
                <ColorScaleLegend />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">3D brain overlay</p>
                  <p className="mt-1 text-sm text-slate-500">A spatial view of the same selected region and metric.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  Region: {regionLabel}
                </div>
              </div>
              <div className="mt-6">
                <SketchfabBrain nodes={nodes} metric={metric} selectedRoi={selectedRoi} onSelectRoi={setSelectedRoi} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
              <p className="text-sm font-semibold text-slate-900">Pathway network</p>
              <p className="mt-1 text-sm text-slate-500">Trace how risk factors and brain regions connect across the selected pathway.</p>
              <div className="mt-6">
                <NetworkGraph edges={edges} focusGroup={focusGroup} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
              <p className="text-sm font-semibold text-slate-900">Region detail</p>
              <p className="mt-1 text-sm text-slate-500">Review a focused breakdown for the active region selection.</p>
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
