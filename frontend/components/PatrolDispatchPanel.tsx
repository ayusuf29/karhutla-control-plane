"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Wrench,
  Send,
  Loader2,
  Sparkles,
  Users,
  Flame,
  FileText,
  ShieldAlert,
  MapPin,
  Radio,
} from "lucide-react";
import { PatrolCard, Waypoint, DispatchResponse, TacticalActionPlan } from "@/types";
import { useTranslation } from "@/context/LanguageContext";
import DispatchOrderModal from "@/components/DispatchOrderModal";

interface PatrolDispatchPanelProps {
  patrolCards: PatrolCard[];
  onDispatchSquad: (squadId: string) => Promise<DispatchResponse | null>;
  dispatchedSquads: Record<string, DispatchResponse>;
  tacticalActionPlan?: TacticalActionPlan;
  selectedRegion?: string;
}

export default function PatrolDispatchPanel({
  patrolCards,
  onDispatchSquad,
  dispatchedSquads,
  tacticalActionPlan,
  selectedRegion,
}: PatrolDispatchPanelProps) {
  const { t, language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedSquadIndex, setSelectedSquadIndex] = useState<number>(0);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);

  // Automatically synchronize active squad with selectedRegion from HeaderCommandBar
  useEffect(() => {
    if (!patrolCards || patrolCards.length === 0) return;

    if (!selectedRegion || selectedRegion === "ALL") {
      const idx = patrolCards.findIndex(
        (s) =>
          s.squadId.includes("CHARLIE") ||
          s.regionName.toLowerCase().includes("lintas")
      );
      setSelectedSquadIndex(idx >= 0 ? idx : 0);
      return;
    }

    if (selectedRegion === "KUBU_RAYA") {
      const idx = patrolCards.findIndex(
        (s) =>
          s.squadId.includes("KBR") ||
          s.squadName.toLowerCase().includes("kubu") ||
          s.regionName.toLowerCase().includes("kubu")
      );
      if (idx >= 0) setSelectedSquadIndex(idx);
      return;
    }

    if (selectedRegion === "PULANG_PISAU") {
      const idx = patrolCards.findIndex(
        (s) =>
          s.squadId.includes("PLP") ||
          s.squadName.toLowerCase().includes("pulang") ||
          s.regionName.toLowerCase().includes("pulang")
      );
      if (idx >= 0) setSelectedSquadIndex(idx);
      return;
    }

    if (selectedRegion === "SUMATERA") {
      const idx = patrolCards.findIndex(
        (s) =>
          s.squadId.includes("RIAU") ||
          s.squadName.toLowerCase().includes("sumatera") ||
          s.regionName.toLowerCase().includes("sumatera")
      );
      if (idx >= 0) setSelectedSquadIndex(idx);
      return;
    }

    if (selectedRegion === "KALIMANTAN") {
      const idx = patrolCards.findIndex(
        (s) =>
          s.squadId.includes("CHARLIE") ||
          s.regionName.toLowerCase().includes("lintas") ||
          s.squadId.includes("KBR")
      );
      if (idx >= 0) setSelectedSquadIndex(idx);
      return;
    }

    // Specific district selection (e.g. "Kalimantan Barat::Kubu Raya::Sungai Raya" or "Riau::Siak::Dayun")
    const lower = selectedRegion.toLowerCase();
    if (
      lower.includes("kubu raya") ||
      lower.includes("pontianak") ||
      lower.includes("mempawah") ||
      lower.includes("ketapang") ||
      lower.includes("kalimantan barat")
    ) {
      const idx = patrolCards.findIndex(
        (s) =>
          s.squadId.includes("KBR") ||
          s.squadName.toLowerCase().includes("kubu") ||
          s.regionName.toLowerCase().includes("kubu")
      );
      if (idx >= 0) {
        setSelectedSquadIndex(idx);
        return;
      }
    }

    if (
      lower.includes("pulang pisau") ||
      lower.includes("kapuas") ||
      lower.includes("katingan") ||
      lower.includes("palangka raya") ||
      lower.includes("kotawaringin") ||
      lower.includes("kalimantan tengah")
    ) {
      const idx = patrolCards.findIndex(
        (s) =>
          s.squadId.includes("PLP") ||
          s.squadName.toLowerCase().includes("pulang") ||
          s.regionName.toLowerCase().includes("pulang")
      );
      if (idx >= 0) {
        setSelectedSquadIndex(idx);
        return;
      }
    }

    if (
      lower.includes("riau") ||
      lower.includes("siak") ||
      lower.includes("pelalawan") ||
      lower.includes("bengkalis") ||
      lower.includes("dumai") ||
      lower.includes("jambi") ||
      lower.includes("sumatera") ||
      lower.includes("aceh") ||
      lower.includes("sumsel") ||
      lower.includes("ogan komering ilir") ||
      lower.includes("musi banyuasin")
    ) {
      const idx = patrolCards.findIndex(
        (s) =>
          s.squadId.includes("RIAU") ||
          s.squadName.toLowerCase().includes("sumatera") ||
          s.regionName.toLowerCase().includes("sumatera")
      );
      if (idx >= 0) {
        setSelectedSquadIndex(idx);
        return;
      }
    }

    // Fallback to taskforce delta / charlie
    const fallbackIdx = patrolCards.findIndex(
      (s) =>
        s.squadId.includes("CHARLIE") ||
        s.regionName.toLowerCase().includes("lintas")
    );
    setSelectedSquadIndex(fallbackIdx >= 0 ? fallbackIdx : 0);
  }, [selectedRegion, patrolCards]);

  const currentSquad = patrolCards[selectedSquadIndex] || patrolCards[0];
  const dispatchReceipt = currentSquad ? dispatchedSquads[currentSquad.squadId] : null;

  const handleDispatch = async () => {
    if (!currentSquad) return;
    setIsDispatching(true);
    try {
      const receipt = await onDispatchSquad(currentSquad.squadId);
      if (receipt) {
        setIsDispatchModalOpen(true);
      }
    } finally {
      setIsDispatching(false);
    }
  };

  if (!patrolCards || patrolCards.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20 px-4">
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="pointer-events-auto w-full max-w-4xl bg-obsidian-surface/95 backdrop-blur-xl border border-sentinel-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Panel Header & Toggle */}
          <div className="px-4 py-2.5 border-b border-sentinel-border bg-obsidian/85 flex items-center justify-between gap-3">
            {/* Left: Indicator & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-bold text-slate-100 tracking-wide truncate">
                  {t.patrolTitle}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30 shrink-0">
                  {t.patrolSolverBadge}
                </span>
              </div>
            </div>

            {/* Right: Auto-assigned squad indicator & Collapse Toggle (Manual Daops selection removed) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-obsidian border border-sentinel-border text-xs font-mono shadow-sm">
                <Truck className="w-3.5 h-3.5 text-sentinel-cyan shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] hidden sm:inline">
                    {language === "id" ? "Pos Daops:" : "Assigned Base:"}
                  </span>
                  <span className="font-bold text-sentinel-cyan">
                    {currentSquad.regionName.replace("Kab. ", "")}
                  </span>
                </div>
                {dispatchReceipt ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {language === "id" ? "TERDISPOSISI" : "DISPATCHED"}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                    {language === "id" ? "SIAGA" : "STANDBY"}
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                aria-label="Toggle panel"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && currentSquad && (
            <div className="p-4 space-y-3.5 max-h-[380px] overflow-y-auto">
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
                    {language === "id" ? "Jarak:" : "Distance:"}{" "}
                    <span className="font-bold text-amber-400">{currentSquad.estimatedTotalDistanceKm} km</span>
                  </div>
                  <div className="px-2 py-1 rounded bg-obsidian/60 border border-white/5 text-slate-300">
                    {language === "id" ? "Durasi:" : "Duration:"}{" "}
                    <span className="font-bold text-sentinel-cyan">
                      {currentSquad.estimatedDurationHours} {language === "id" ? "Jam" : "Hours"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Daops Station Metadata from Database */}
              {currentSquad.daopsName && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-obsidian/70 border border-sentinel-cyan/20 text-xs font-mono">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-sentinel-cyan shrink-0" />
                    <span className="text-slate-400">{language === "id" ? "Markas Posko:" : "Station:"}</span>
                    <span className="font-bold text-slate-100 truncate">{currentSquad.daopsName}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {currentSquad.commanderName && (
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-400">{language === "id" ? "Komandan:" : "Cmdr:"}</span>
                        <span className="font-semibold text-emerald-300">{currentSquad.commanderName}</span>
                      </div>
                    )}
                    {currentSquad.radioFrequency && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        <Radio className="w-3 h-3" />
                        <span>{currentSquad.radioFrequency}</span>
                      </div>
                    )}
                    {currentSquad.personnelCount && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
                        {currentSquad.personnelCount} {language === "id" ? "Personel" : "Crew"}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Google DeepMind Supervisor Agent Tactical Briefing Card */}
              {(() => {
                const activePlan = currentSquad?.tacticalActionPlan || tacticalActionPlan;
                if (!activePlan) return null;
                return (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-sentinel-cyan/10 via-obsidian to-purple-900/10 border border-sentinel-cyan/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-sentinel-cyan">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{language === "id" ? "Instruksi Taktis AI Supervisor" : "AI Supervisor Tactical Brief"}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          • {currentSquad.regionName.replace("Kab. ", "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {activePlan.aiEngine || "DeepMind AI"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40">
                          {activePlan.threatLevel || "EXTREME"}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {activePlan.situationAssessment || activePlan.executiveSummary}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded bg-obsidian/80 border border-white/10 text-[10px] text-slate-300 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        {activePlan.fireBreakStrategy}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-obsidian/80 border border-white/10 text-[10px] text-slate-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-sentinel-cyan" />
                        {activePlan.recommendedPersonnel}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Waypoints Sequence List */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{t.patrolWaypoints} ({currentSquad.waypoints.length} {language === "id" ? "Titik Patroli" : "Waypoints"})</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {language === "id" ? "Urutan TSP Minimum Distance" : "TSP Minimum Distance Order"}
                  </span>
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
                        {language === "id" ? "Estimasi Tiba:" : "ETA:"}{" "}
                        <span className="font-mono text-amber-300">{wp.estimatedArrival}</span>
                      </div>

                      <div className="text-[10px] text-slate-300 bg-white/5 p-1 rounded">
                        {language === "id" ? "Tindakan:" : "Action:"}{" "}
                        <span className="text-sentinel-cyan font-medium">{wp.prescribedAction}</span>
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

                {/* Dispatch Button or View Mission Order Button */}
                {dispatchReceipt ? (
                  <button
                    onClick={() => setIsDispatchModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all border border-emerald-400/40 group"
                  >
                    <FileText className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
                    <span>
                      {language === "id"
                        ? "Buka Surat Tugas (SPT) & Monitoring Armada"
                        : "View Mission Order & Fleet Monitoring"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/30 text-emerald-200 border border-emerald-400/40">
                      {dispatchReceipt.dispatchId}
                    </span>
                  </button>
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
                    <span>{t.patrolBtnDispatch}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Official Dispatch Order Modal & Fleet Command Monitoring */}
      <DispatchOrderModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        squad={currentSquad}
        receipt={dispatchReceipt}
        allSquads={patrolCards}
        dispatchedSquads={dispatchedSquads}
        tacticalActionPlan={currentSquad?.tacticalActionPlan || tacticalActionPlan}
      />
    </>
  );
}
