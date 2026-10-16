"use client";

import React from "react";
import { Flame, ShieldAlert, Droplets, Radar, CloudRain, RefreshCw, Activity, Layers } from "lucide-react";
import { AssessorSummary } from "@/types";

interface HeaderCommandBarProps {
  summary: AssessorSummary | null;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  onTriggerReassessment: () => void;
  isReassessing: boolean;
  onOpenOmcModal: () => void;
  onOpenSarModal: () => void;
  omcCount: number;
  sarCount: number;
}

export default function HeaderCommandBar({
  summary,
  selectedRegion,
  onSelectRegion,
  onTriggerReassessment,
  isReassessing,
  onOpenOmcModal,
  onOpenSarModal,
  omcCount,
  sarCount,
}: HeaderCommandBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-obsidian/90 backdrop-blur-md border-b border-sentinel-border px-4 flex items-center justify-between">
      {/* Left: Branding & Region Pills */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-xs uppercase text-slate-100">
                Nusantara Fire Sentinel
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                POC LIVE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight">
              GCP-AMD HYBRID CONTROL PLANE • POSTGIS H3 RES 8
            </div>
          </div>
        </div>

        {/* Region Filter Selector */}
        <div className="h-6 w-px bg-white/10 hidden md:block" />
        <div className="hidden lg:flex items-center gap-1 bg-obsidian-surface p-0.5 rounded-lg border border-sentinel-border">
          {[
            { id: "ALL", label: "Seluruh Pilot" },
            { id: "KUBU_RAYA", label: "Kubu Raya" },
            { id: "PULANG_PISAU", label: "Pulang Pisau" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRegion(r.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                selectedRegion === r.id
                  ? "bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Mission Critical Metric Counters */}
      <div className="hidden md:flex items-center gap-2">
        {/* Extreme Alert Pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-mono tabular-nums ${
            summary && summary.extremeRiskCount > 0
              ? "bg-rose-950/40 border-rose-500/40 text-rose-300 beacon-extreme"
              : "bg-obsidian-surface border-sentinel-border text-slate-400"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>KRITIS EXTREME:</span>
          <span className="font-bold text-rose-400 text-sm">
            {summary ? summary.extremeRiskCount : 0}
          </span>
        </div>

        {/* Average Ground Water Level */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-obsidian-surface border border-sentinel-border text-xs font-mono tabular-nums text-slate-300">
          <Droplets className="w-3.5 h-3.5 text-sentinel-cyan" />
          <span>RATA GWL:</span>
          <span
            className={`font-bold ${
              summary && summary.averageGwlCm < -40.0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {summary ? summary.averageGwlCm : 0} cm
          </span>
        </div>

        {/* SAR Pre-Burn Alerts Button */}
        <button
          onClick={onOpenSarModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-surface border border-sentinel-border hover:border-amber-500/40 text-xs font-mono tabular-nums text-slate-300 transition-colors"
        >
          <Radar className="w-3.5 h-3.5 text-amber-400" />
          <span>SAR ALERTS:</span>
          <span className="font-bold text-amber-400">{sarCount}</span>
        </button>

        {/* OMC Cloud Seeding Button */}
        <button
          onClick={onOpenOmcModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-surface border border-sentinel-border hover:border-sentinel-cyan/40 text-xs font-mono tabular-nums text-slate-300 transition-colors"
        >
          <CloudRain className="w-3.5 h-3.5 text-sentinel-cyan" />
          <span>OMC TARGET:</span>
          <span className="font-bold text-sentinel-cyan">{omcCount}</span>
        </button>
      </div>

      {/* Right: Simulation & Dispatch Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTriggerReassessment}
          disabled={isReassessing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-cyan-900/20 transition-all border border-cyan-400/30"
          title="Menjalankan simulasi kondisi cuaca kemarau ekstrem via Risk Assessor Agent & Python Worker"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReassessing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">
            {isReassessing ? "Mengevaluasi..." : "Simulasi Kemarau"}
          </span>
        </button>
      </div>
    </header>
  );
}
