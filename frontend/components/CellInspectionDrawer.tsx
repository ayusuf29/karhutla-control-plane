"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  Droplets,
  Sun,
  Wind,
  Navigation,
  Compass,
  FileText,
  MapPin,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import { GeoJsonFeature } from "@/types";
import PeatDomeVisualizer3D from "./PeatDomeVisualizer3D";
import { useTranslation } from "@/context/LanguageContext";

interface CellInspectionDrawerProps {
  selectedCell: GeoJsonFeature | null;
  onClose: () => void;
  onFocusPatrolRoute: (h3Index: string) => void;
}

export default function CellInspectionDrawer({
  selectedCell,
  onClose,
  onFocusPatrolRoute,
}: CellInspectionDrawerProps) {
  const { t, language } = useTranslation();

  if (!selectedCell) return null;

  const props = selectedCell.properties;
  const isExtreme = props.riskCategory === "EXTREME";
  const isHigh = props.riskCategory === "HIGH";

  // Category styles
  const getBadgeStyle = (category: string) => {
    switch (category) {
      case "EXTREME":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40 beacon-extreme";
      case "HIGH":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      case "MEDIUM":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 440, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 440, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed top-16 right-4 bottom-4 w-96 md:w-[420px] z-30 bg-obsidian-surface/95 backdrop-blur-xl border border-sentinel-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-sentinel-border flex items-center justify-between bg-obsidian/40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sentinel-cyan" />
            <h2 className="text-sm font-semibold tracking-wide text-slate-100">
              {t.drawerTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={t.drawerBtnClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main Identifier & Risk Banner */}
          <div className="bg-obsidian/60 p-3 rounded-lg border border-sentinel-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">H3 INDEX RES 8</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${getBadgeStyle(
                  props.riskCategory
                )}`}
              >
                {props.riskCategory} RISK
              </span>
            </div>
            <div className="font-mono text-base font-bold text-slate-100 tracking-wider">
              {props.h3Index}
            </div>
            {props.district && (
              <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/30 px-2 py-1 rounded border border-rose-500/20">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="font-semibold text-slate-100">
                  Kec. {props.district}
                </span>
                <span className="text-slate-400 text-[10px]">
                  ({props.regency}, {props.province})
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
              <span className="text-slate-400">{t.drawerRiskScore}:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {(props.riskScore * 100).toFixed(1)}% ({props.riskScore.toFixed(3)})
              </span>
            </div>
          </div>

          {/* 3D Procedural Peat Dome Layer */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sentinel-cyan" />
              {t.drawerTab3D} & GWL
            </div>
            <PeatDomeVisualizer3D
              peatDepthMeters={props.peatDepthMeters || 2.0}
              gwlCm={props.gwlCm || -35.0}
              riskCategory={props.riskCategory}
            />
          </div>

          {/* Telemetry Sensor Grid */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sentinel-cyan" />
              {t.drawerTabOverview}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* GWL */}
              <div className="p-2.5 rounded-lg bg-obsidian/40 border border-sentinel-border">
                <div className="text-[10px] text-slate-400 uppercase">{t.drawerGwlLabel}</div>
                <div
                  className={`text-base font-mono font-bold tabular-nums ${
                    (props.gwlCm || 0) < -40.0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {props.gwlCm !== undefined ? `${props.gwlCm} cm` : "N/A"}
                </div>
                <div className="text-[9px] text-slate-500">
                  {language === "id" ? "Ambang Batas PP 57: -40.0 cm" : "PP 57/2016 Limit: -40.0 cm"}
                </div>
              </div>

              {/* HTH */}
              <div className="p-2.5 rounded-lg bg-obsidian/40 border border-sentinel-border">
                <div className="text-[10px] text-slate-400 uppercase">
                  {language === "id" ? "HARI TANPA HUJAN (HTH)" : "DAYS WITHOUT RAIN"}
                </div>
                <div className="text-base font-mono font-bold tabular-nums text-amber-400">
                  {props.daysWithoutRain !== undefined
                    ? `${props.daysWithoutRain} ${language === "id" ? "Hari" : "Days"}`
                    : "N/A"}
                </div>
                <div className="text-[9px] text-slate-500">BMKG Micro Anomaly</div>
              </div>

              {/* VPD */}
              <div className="p-2.5 rounded-lg bg-obsidian/40 border border-sentinel-border">
                <div className="text-[10px] text-slate-400 uppercase">VAPOR DEFICIT (VPD)</div>
                <div className="text-base font-mono font-bold tabular-nums text-cyan-400">
                  {props.vpdKpa !== undefined ? `${props.vpdKpa} kPa` : "N/A"}
                </div>
                <div className="text-[9px] text-slate-500">
                  {language === "id" ? "Tingkat Pengeringan Udara" : "Atmospheric Drying Rate"}
                </div>
              </div>

              {/* Peat Depth */}
              <div className="p-2.5 rounded-lg bg-obsidian/40 border border-sentinel-border">
                <div className="text-[10px] text-slate-400 uppercase">{t.drawerPeatDepth}</div>
                <div className="text-base font-mono font-bold tabular-nums text-emerald-400">
                  {props.peatDepthMeters !== undefined ? `${props.peatDepthMeters} m` : "N/A"}
                </div>
                <div className="text-[9px] text-slate-500">
                  {language === "id" ? "Kubah Gambut Dalam" : "Deep Peat Dome"}
                </div>
              </div>
            </div>
          </div>

          {/* Access & Concession Info */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-sentinel-cyan" />
              {language === "id" ? "AKSESIBILITAS & KONSESI" : "ACCESSIBILITY & CONCESSION"}
            </div>
            <div className="p-3 rounded-lg bg-obsidian/40 border border-sentinel-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.drawerCanalDistance}:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {props.distanceToCanalMeters} m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.drawerRoadDistance}:</span>
                <span className="font-mono font-semibold text-slate-200">
                  {props.distanceToRoadMeters} m
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/5">
                <span className="text-slate-400">
                  {language === "id" ? "Wilayah / Konsesi HGU:" : "HGU Concession:"}
                </span>
                <span className="font-mono font-bold text-sentinel-cyan">
                  {props.concessionId || "NON-KONSESI"}
                </span>
              </div>
              {props.sarClearingDetected && (
                <div className="p-2 rounded bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-[11px]">{t.drawerSarDetected}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prescriptive Action Recommendation */}
          <div className="p-3 rounded-lg bg-gradient-to-br from-obsidian-surface to-obsidian border border-sentinel-cyan/30 space-y-1.5">
            <div className="text-[11px] font-mono text-sentinel-cyan flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {language === "id" ? "REKOMENDASI INTERVENSI PRESKRIPTIF" : "PRESCRIPTIVE ACTION RECOMMENDATION"}
            </div>
            <div className="text-xs text-slate-200 font-medium">
              {props.recommendedAction || (language === "id"
                ? "Aktivasi pembasahan kubah kanal dan patroli darat harian."
                : "Activate canal block rewetting and daily ground patrol.")}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-sentinel-border bg-obsidian/60 flex items-center gap-2">
          <button
            onClick={() => onFocusPatrolRoute(props.h3Index)}
            className="flex-1 py-2 px-3 rounded-lg bg-sentinel-cyan/20 hover:bg-sentinel-cyan/30 border border-sentinel-cyan/40 text-sentinel-cyan text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            {t.drawerBtnPrioritize}
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
