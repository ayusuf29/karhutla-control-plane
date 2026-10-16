"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Navigation,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Clock,
  Compass,
  AlertOctagon,
  Truck,
  Wrench,
  Send,
  Loader2,
  Sparkles,
  ShieldAlert,
  Users,
  Flame,
} from "lucide-react";
import { PatrolCard, Waypoint, DispatchResponse, TacticalActionPlan } from "@/types";

interface PatrolDispatchPanelProps {
  patrolCards: PatrolCard[];
  onDispatchSquad: (squadId: string) => Promise<DispatchResponse | null>;
  dispatchedSquads: Record<string, DispatchResponse>;
  tacticalActionPlan?: TacticalActionPlan;
}

export default function PatrolDispatchPanel({
  patrolCards,
  onDispatchSquad,
  dispatchedSquads,
  tacticalActionPlan,
}: PatrolDispatchPanelProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedSquadIndex, setSelectedSquadIndex] = useState<number>(0);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  const currentSquad = patrolCards[selectedSquadIndex] || patrolCards[0];
  const dispatchReceipt = currentSquad ? dispatchedSquads[currentSquad.squadId] : null;

  const handleDispatch = async () => {
    if (!currentSquad) return;
    setIsDispatching(true);
    try {
      await onDispatchSquad(currentSquad.squadId);
    } finally {
      setIsDispatching(false);
    }
  };

  if (!patrolCards || patrolCards.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-[720px] z-20 bg-obsidian-surface/95 backdrop-blur-xl border border-sentinel-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Panel Header & Toggle */}
      <div className="px-4 py-2.5 border-b border-sentinel-border bg-obsidian/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-100 tracking-wide">
              OPTIMALISASI RUTE PATROLI PRESKRIPTIF
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30">
              VRP SOLVER (OR-TOOLS)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Squad selector tabs */}
          <div className="flex items-center gap-1 bg-obsidian p-0.5 rounded-lg border border-white/5">
            {patrolCards.map((card, idx) => {
              const isDispatched = !!dispatchedSquads[card.squadId];
              return (
                <button
                  key={card.squadId}
                  onClick={() => setSelectedSquadIndex(idx)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-all ${
                    selectedSquadIndex === idx
                      ? "bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {card.regionName.replace("Kab. ", "")}
                  {isDispatched && " (TERKIRIM)"}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && currentSquad && (
        <div className="p-4 space-y-3.5 max-h-[360px] overflow-y-auto">
          {/* Squad Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/5">
            <div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-sentinel-cyan" />
                {currentSquad.squadName}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {currentSquad.primaryObjective}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="px-2 py-1 rounded bg-obsidian/60 border border-white/5 text-slate-300">
                Jarak: <span className="font-bold text-amber-400">{currentSquad.estimatedTotalDistanceKm} km</span>
              </div>
              <div className="px-2 py-1 rounded bg-obsidian/60 border border-white/5 text-slate-300">
                Durasi: <span className="font-bold text-sentinel-cyan">{currentSquad.estimatedDurationHours} Jam</span>
              </div>
            </div>
          </div>

          {/* Google DeepMind Supervisor Agent Tactical Briefing Card */}
          {tacticalActionPlan && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 via-obsidian/80 to-purple-950/30 border border-indigo-500/30 shadow-lg space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-200 tracking-wide flex items-center gap-1.5">
                      GOOGLE DEEPMIND TACTICAL BRIEFING
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {tacticalActionPlan.threatLevel}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-indigo-300/80">
                  {tacticalActionPlan.aiEngine}
                </div>
              </div>

              {/* Assessment Text */}
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {tacticalActionPlan.situationAssessment}
              </p>

              {/* Tactical Recommendations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <div className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-400" /> REKOMENDASI PERSONEL:
                  </div>
                  <div className="text-slate-200 font-medium">
                    {tacticalActionPlan.recommendedPersonnel}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <div className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" /> STRATEGI SEKAT API & AIR:
                  </div>
                  <div className="text-amber-200/90 font-medium line-clamp-2">
                    {tacticalActionPlan.fireBreakStrategy}
                  </div>
                </div>
              </div>

              {/* Equipment Tags */}
              {tacticalActionPlan.specificEquipment && tacticalActionPlan.specificEquipment.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-mono text-slate-400">Peralatan Wajib:</span>
                  {tacticalActionPlan.specificEquipment.map((eq, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-200 border border-indigo-500/25"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sequential Waypoint Cards */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>URUTAN TITIK INSPEKSI TEROPTIMASI (MAX 4 TITIK/HARI):</span>
              <span>KUOTA DAOPS TERCAPAI: {currentSquad.waypoints.length}/4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentSquad.waypoints.map((wp: Waypoint) => (
                <div
                  key={wp.sequence}
                  className="p-2.5 rounded-lg bg-obsidian/70 border border-sentinel-border hover:border-sentinel-cyan/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-sentinel-cyan/20 border border-sentinel-cyan/40 text-sentinel-cyan text-[11px] font-mono font-bold flex items-center justify-center">
                      {wp.sequence}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                        wp.riskCategory === "EXTREME"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {wp.riskCategory} ({(wp.riskScore * 100).toFixed(0)}%)
                    </span>
                  </div>

                  <div className="font-mono text-xs font-semibold text-slate-200">
                    {wp.h3Index}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Estimasi Tiba: <span className="font-mono text-amber-300">{wp.estimatedArrival}</span>
                  </div>

                  <div className="text-[10px] text-slate-300 bg-white/5 p-1 rounded">
                    Tindakan: <span className="text-sentinel-cyan font-medium">{wp.prescribedAction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Action & Confirmation Receipt */}
          <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Equipment pill */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Wrench className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate max-w-[320px]">
                {currentSquad.recommendedEquipment.slice(0, 2).join(", ")}
              </span>
            </div>

            {/* Dispatch Button */}
            {dispatchReceipt ? (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>DISPATCH RESMI: {dispatchReceipt.dispatchId}</span>
              </div>
            ) : (
              <button
                onClick={handleDispatch}
                disabled={isDispatching}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all border border-emerald-400/30"
              >
                {isDispatching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Approve & Dispatch Regu Manggala Agni</span>
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
