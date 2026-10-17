"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Radar, ShieldAlert, ArrowRight } from "lucide-react";
import { SarAlert } from "@/types";
import { useTranslation } from "@/context/LanguageContext";

interface SarAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SarAlert[];
  onSelectCellByIndex: (h3Index: string) => void;
}

export default function SarAlertModal({
  isOpen,
  onClose,
  alerts,
  onSelectCellByIndex,
}: SarAlertModalProps) {
  const { t, language } = useTranslation();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="w-full max-w-2xl bg-obsidian-surface border border-sentinel-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-sentinel-border bg-obsidian/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Radar className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {t.sarModalTitle}
                </h3>
                <div className="text-[10px] text-slate-400 font-mono">
                  {language === "id"
                    ? "SAR C-BAND CHANGE DETECTION • PENGAWASAN TEBAS-BAKAR (PRE-BURN)"
                    : "SAR C-BAND CHANGE DETECTION • PRE-BURN SLASH-AND-CLEAR SURVEILLANCE"}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
              aria-label={t.drawerBtnClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto space-y-3">
            <div className="text-xs text-slate-300 leading-relaxed bg-obsidian/40 p-3 rounded-lg border border-white/5">
              {t.sarModalSubtitle}
            </div>

            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.alertId}
                  className="p-3 rounded-lg bg-obsidian/70 border border-sentinel-border hover:border-amber-500/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="font-mono text-xs font-bold text-slate-100">
                        {alert.alertId}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {t.sarColConfidence}: {(alert.radarConfidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-1">
                    <div>
                      {t.sarColCell}: <span className="text-slate-200">{alert.h3Index}</span>
                    </div>
                    <div>
                      {t.sarColDetectionDate}: <span className="text-slate-300">{alert.detectedAt}</span>
                    </div>
                    <div className="col-span-2">
                      {language === "id" ? "Konsesi Terkait:" : "Concession:"}{" "}
                      <span className="text-sentinel-cyan">{alert.concessionId}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 italic pt-1 border-t border-white/5 flex items-center justify-between">
                    <span>{alert.anomalyType}</span>
                    <button
                      onClick={() => {
                        onSelectCellByIndex(alert.h3Index);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors not-italic"
                    >
                      <span>{t.sarBtnInspect}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
