"use client";

import React, { useState, useEffect } from "react";
import {
  Radar,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Flame,
  CloudRain,
  Radio,
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface TacticalLoadingOverlayProps {
  isLoadingGrid: boolean;
  hasGridData: boolean;
  isReassessing?: boolean;
  isSyncingTelemetry?: boolean;
  activeScenarioName?: string | null;
  totalCells?: number;
}

export default function TacticalLoadingOverlay({
  isLoadingGrid,
  hasGridData,
  isReassessing = false,
  isSyncingTelemetry = false,
  activeScenarioName,
  totalCells = 124545,
}: TacticalLoadingOverlayProps) {
  const { t, language } = useTranslation();
  const isId = language === "id";

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Timer for loading duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoadingGrid || isReassessing || isSyncingTelemetry) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoadingGrid, isReassessing, isSyncingTelemetry]);

  // Determine stage based on elapsed time (0-4s: Stage 1, 4-10s: Stage 2, 10s+: Stage 3)
  const activeStage = elapsedSeconds < 4 ? 1 : elapsedSeconds < 10 ? 2 : 3;

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  // Pseudo-progress percentage that smoothly approaches 94% over 18 seconds
  const progressPercent = Math.min(
    95,
    Math.round(15 + (elapsedSeconds / 18) * 80)
  );

  // =========================================================================
  // 1. FULLSCREEN INITIAL LOADING HUD (Ketika GeoJSON belum ada sama sekali)
  // =========================================================================
  if (isLoadingGrid && !hasGridData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-xl animate-in fade-in duration-300">
        {/* Futuristic Cybernetic HUD Container */}
        <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-slate-950/95 border border-sentinel-cyan/40 text-slate-100 shadow-2xl shadow-cyan-950/60 p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Background grid lines effect */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c70a_1px,transparent_1px),linear-gradient(to_bottom,#0284c70a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Top corner brackets */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-sentinel-cyan" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-sentinel-cyan" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-sentinel-cyan" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-sentinel-cyan" />

          {/* Radar Scanner Animation */}
          <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
            {/* Concentric Range Rings */}
            <div className="absolute inset-0 rounded-full border border-sentinel-cyan/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border border-cyan-500/30" />
            <div className="absolute inset-6 rounded-full border border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: "12s" }} />
            <div className="absolute inset-10 rounded-full border border-amber-500/40" />

            {/* Sweep Beam */}
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-sentinel-cyan/80 animate-spin" style={{ animationDuration: "2.5s" }} />

            {/* Center Core */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-cyan-950/60">
              <Radar className="w-7 h-7 text-white animate-pulse" />
            </div>
          </div>

          {/* Title & Badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40 tracking-wider">
              POSTGIS H3 RESOLUTION 8
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              NATIONWIDE ~65MB
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide mb-1 font-mono uppercase">
            {t.loadingGridTitle}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
            {t.loadingGridSubtitle}
          </p>

          {/* Real-time Status Log Steps */}
          <div className="w-full max-w-md space-y-2 text-left text-xs font-mono mb-5">
            {/* Stage 1 */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                activeStage === 1
                  ? "bg-cyan-950/50 border-sentinel-cyan text-cyan-200 shadow-md shadow-cyan-950/40"
                  : activeStage > 1
                  ? "bg-white/5 border-emerald-500/30 text-emerald-300"
                  : "bg-white/5 border-white/5 text-slate-500"
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">
                [1/3] {t.loadingStage1}
              </span>
              {activeStage > 1 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
              )}
            </div>

            {/* Stage 2 */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                activeStage === 2
                  ? "bg-cyan-950/50 border-sentinel-cyan text-cyan-200 shadow-md shadow-cyan-950/40"
                  : activeStage > 2
                  ? "bg-white/5 border-emerald-500/30 text-emerald-300"
                  : "bg-white/5 border-white/5 text-slate-500"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">
                [2/3] {t.loadingStage2}
              </span>
              {activeStage > 2 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : activeStage === 2 ? (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
              ) : null}
            </div>

            {/* Stage 3 */}
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                activeStage === 3
                  ? "bg-amber-950/50 border-amber-500 text-amber-200 shadow-md shadow-amber-950/40"
                  : "bg-white/5 border-white/5 text-slate-500"
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">
                [3/3] {t.loadingStage3}
              </span>
              {activeStage === 3 && (
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
              )}
            </div>
          </div>

          {/* Progress Bar & Live Counter */}
          <div className="w-full max-w-md mb-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 text-sentinel-cyan">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>
                  {isId ? "WAKTU BERJALAN" : "ELAPSED TIME"}: {formatTime(elapsedSeconds)}
                </span>
              </span>
              <span className="text-slate-300 font-bold">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cache Reassurance Callout */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-[11px] text-slate-400 flex items-start gap-2 max-w-md text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-sentinel-cyan mt-0.5" />
            <p className="leading-snug">
              {t.loadingCacheHint}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. TACTICAL TOP-CENTER HUD BANNER (Ketika simulasi / sync berjalan di peta)
  // =========================================================================
  if (isReassessing || isSyncingTelemetry || (isLoadingGrid && hasGridData)) {
    const isRain =
      activeScenarioName &&
      (activeScenarioName.toLowerCase().includes("hujan") ||
        activeScenarioName.toLowerCase().includes("rain") ||
        activeScenarioName.toLowerCase().includes("omc") ||
        activeScenarioName.toLowerCase().includes("pembasahan"));

    return (
      <div className="fixed top-18 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-sentinel-cyan/50 shadow-2xl shadow-cyan-950/50 text-slate-100">
          {/* Animated Icon */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isRain
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : isReassessing
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40"
            }`}
          >
            {isRain ? (
              <CloudRain className="w-4 h-4 animate-bounce" />
            ) : isReassessing ? (
              <Flame className="w-4 h-4 animate-pulse" />
            ) : (
              <RefreshCw className="w-4 h-4 animate-spin" />
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                {isReassessing
                  ? t.loadingReassessingTitle
                  : isSyncingTelemetry
                  ? t.loadingSyncTitle
                  : t.loadingGridTitle}
              </span>
              <span className="w-2 h-2 rounded-full bg-sentinel-cyan animate-ping" />
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">
              {isReassessing
                ? activeScenarioName
                  ? `${activeScenarioName} • ${totalCells.toLocaleString()} sel`
                  : t.loadingReassessingSubtitle
                : isSyncingTelemetry
                ? t.loadingSyncSubtitle
                : t.loadingStage2}
            </p>
          </div>

          {/* Elapsed Timer Tag */}
          <div className="shrink-0 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-sentinel-cyan font-bold">
            {formatTime(elapsedSeconds)}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

