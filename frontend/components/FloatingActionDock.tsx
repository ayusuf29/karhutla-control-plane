"use client";

import React from "react";
import {
  Flame,
  CloudRain,
  Radar,
  Plane,
  Sparkles,
  Zap,
  Calendar,
  RefreshCw,
  Check,
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface FloatingActionDockProps {
  onOpenDroughtSimulation: () => void;
  onOpenRainSimulation: () => void;
  onOpenSarModal: () => void;
  onOpenOmcModal: () => void;
  sarCount: number;
  omcCount: number;
  activeScenarioName?: string | null;
  isReassessing?: boolean;
  lastFetchedDate?: string | null;
  todayDate?: string;
  onSyncTelemetry?: () => void;
  isSyncingTelemetry?: boolean;
}

export default function FloatingActionDock({
  onOpenDroughtSimulation,
  onOpenRainSimulation,
  onOpenSarModal,
  onOpenOmcModal,
  sarCount,
  omcCount,
  activeScenarioName,
  isReassessing = false,
  lastFetchedDate,
  todayDate,
  onSyncTelemetry,
  isSyncingTelemetry = false,
}: FloatingActionDockProps) {
  const { language } = useTranslation();
  const isId = language === "id";

  const isDroughtActive =
    activeScenarioName &&
    (activeScenarioName.toLowerCase().includes("kemarau") ||
      activeScenarioName.toLowerCase().includes("el niño") ||
      activeScenarioName.toLowerCase().includes("drought") ||
      activeScenarioName.toLowerCase().includes("krisis"));

  const isRainActive =
    activeScenarioName &&
    (activeScenarioName.toLowerCase().includes("hujan") ||
      activeScenarioName.toLowerCase().includes("rain") ||
      activeScenarioName.toLowerCase().includes("pembasahan") ||
      activeScenarioName.toLowerCase().includes("monsun"));

  return (
    <div
      className="fixed top-20 left-4 z-30 flex flex-col gap-2.5"
      role="toolbar"
      aria-label={isId ? "Bilah Kontrol Taktis" : "Tactical Command Dock"}
    >
      {/* Container Dock Panel */}
      <div className="bg-obsidian-surface/90 backdrop-blur-xl border border-sentinel-border p-2 rounded-2xl shadow-2xl shadow-black/60 flex flex-col gap-2 transition-all">
        {/* Section Mini Label */}
        <div className="px-2 pt-1 pb-1 flex items-center justify-between border-b border-white/5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-sentinel-cyan" />
            <span className="hidden md:inline">
              {isId ? "Kontrol Aksi" : "Tactical Actions"}
            </span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* 1. Tombol Simulasi Kemarau */}
        <button
          onClick={onOpenDroughtSimulation}
          disabled={isReassessing}
          className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all border ${
            isDroughtActive
              ? "bg-gradient-to-r from-amber-950/80 to-rose-950/80 border-amber-500/60 shadow-lg shadow-amber-950/50 ring-1 ring-amber-400/40 text-amber-200"
              : "bg-obsidian/70 hover:bg-white/10 border-white/5 hover:border-amber-500/40 text-slate-200 hover:text-white"
          } disabled:opacity-50`}
          title={isId ? "Buka Simulasi Krisis Kemarau & El Niño" : "Open Drought & El Niño Simulation"}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
              isDroughtActive
                ? "bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-md shadow-rose-950/50"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:bg-amber-500/25"
            }`}
          >
            <Flame className={`w-4 h-4 ${isDroughtActive ? "animate-pulse" : ""}`} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold tracking-wide">
                {isId ? "Simulasi Kemarau" : "Drought Simulation"}
              </span>
              {isDroughtActive && (
                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {isId ? "Aktif" : "Active"}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {isId ? "El Niño & Deplesi Air" : "El Niño & GWL Depletion"}
            </span>
          </div>
        </button>

        {/* 2. Tombol Simulasi Hujan */}
        <button
          onClick={onOpenRainSimulation}
          disabled={isReassessing}
          className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all border ${
            isRainActive
              ? "bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-cyan-500/60 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/40 text-cyan-200"
              : "bg-obsidian/70 hover:bg-white/10 border-white/5 hover:border-sentinel-cyan/40 text-slate-200 hover:text-white"
          } disabled:opacity-50`}
          title={isId ? "Buka Simulasi Hujan & Pembasahan Gambut" : "Open Rainfall & Rewetting Simulation"}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
              isRainActive
                ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-950/50"
                : "bg-cyan-500/15 text-sentinel-cyan border border-cyan-500/30 group-hover:bg-cyan-500/25"
            }`}
          >
            <CloudRain className={`w-4 h-4 ${isRainActive ? "animate-bounce" : ""}`} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold tracking-wide">
                {isId ? "Simulasi Hujan" : "Rain Simulation"}
              </span>
              {isRainActive && (
                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  {isId ? "Aktif" : "Active"}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {isId ? "Monsun & Pembasahan" : "Monsoon & Peat Rewetting"}
            </span>
          </div>
        </button>

        <div className="h-px w-full bg-white/10 my-0.5" />

        {/* 3. Tombol SAR Pre-Burn Alerts */}
        <button
          onClick={onOpenSarModal}
          className="group relative flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left bg-obsidian/70 hover:bg-white/10 border border-white/5 hover:border-amber-500/40 text-slate-200 hover:text-white transition-all shadow-sm"
          title={isId ? "Buka Peringatan Dini Sentinel-1 SAR Pre-Burn" : "Open Sentinel-1 SAR Alerts"}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:bg-amber-500/25 transition-transform group-hover:scale-105">
              <Radar className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wide">
                {isId ? "Radar SAR" : "SAR Alerts"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isId ? "Deteksi Kliring Lahan" : "Pre-Burn Land Clearing"}
              </span>
            </div>
          </div>

          {/* Badge Count */}
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            {sarCount.toLocaleString()}
          </span>
        </button>

        {/* 4. Tombol Operasi Modifikasi Cuaca (OMC) */}
        <button
          onClick={onOpenOmcModal}
          className="group relative flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left bg-obsidian/70 hover:bg-white/10 border border-white/5 hover:border-sentinel-cyan/40 text-slate-200 hover:text-white transition-all shadow-sm"
          title={isId ? "Buka Target Operasi Modifikasi Cuaca (Semai Awan)" : "Open Weather Modification Operations"}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30 flex items-center justify-center shrink-0 group-hover:bg-sentinel-cyan/25 transition-transform group-hover:scale-105">
              <Plane className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wide">
                {isId ? "Operasi OMC" : "OMC Operations"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isId ? "Semai Awan NaCl" : "Cloud Seeding Sorties"}
              </span>
            </div>
          </div>

          {/* Badge Count */}
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/30 shrink-0">
            {omcCount.toLocaleString()}
          </span>
        </button>

        {/* 5. Telemetry Real-Time Status & Conditional Update Action */}
        {lastFetchedDate && (
          <div className="pt-1.5 border-t border-white/10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{isId ? "Data Cuaca:" : "Weather Data:"}</span>
              </span>
              <span className="text-slate-200 font-semibold">{lastFetchedDate}</span>
            </div>

            {/* VALIDATION: Only display Update button if todayDate != lastFetchedDate */}
            {todayDate && lastFetchedDate !== todayDate ? (
              <button
                onClick={onSyncTelemetry}
                disabled={isSyncingTelemetry}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition-all disabled:opacity-50"
                title={
                  isId
                    ? `Update data real-time & retrain XGBoost dari ${lastFetchedDate} ke ${todayDate}`
                    : `Fetch real-time data & retrain XGBoost from ${lastFetchedDate} to ${todayDate}`
                }
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTelemetry ? "animate-spin" : ""}`} />
                <span>
                  {isSyncingTelemetry
                    ? (isId ? "Melatih Model..." : "Retraining...")
                    : (isId ? "Update Data Real-Time" : "Sync Real-Time Data")}
                </span>
              </button>
            ) : todayDate && lastFetchedDate === todayDate ? (
              <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>{isId ? "Data Terkini (Hari Ini)" : "Up to Date (Today)"}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
