"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CloudRain, Plane, ShieldCheck, MapPin } from "lucide-react";
import { OmcTarget } from "@/types";
import { useTranslation } from "@/context/LanguageContext";

interface OmcModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: OmcTarget[];
}

export default function OmcModal({ isOpen, onClose, targets }: OmcModalProps) {
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
              <div className="w-7 h-7 rounded-lg bg-sentinel-cyan/20 border border-sentinel-cyan/40 flex items-center justify-center">
                <CloudRain className="w-4 h-4 text-sentinel-cyan" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {t.omcModalTitle}
                </h3>
                <div className="text-[10px] text-slate-400 font-mono">
                  {language === "id"
                    ? "KOORDINASI BMKG & TNI AU • PERSEMAIAN AWAN KUMULUS PREVENTIF"
                    : "BMKG & AIR FORCE COORDINATION • PREVENTIVE CUMULUS CLOUD SEEDING"}
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
              {t.omcModalSubtitle}
            </div>

            <div className="space-y-2">
              {targets.map((target, idx) => (
                <div
                  key={target.h3Index}
                  className="p-3 rounded-lg bg-obsidian/70 border border-sentinel-border hover:border-sentinel-cyan/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-sentinel-cyan/20 text-sentinel-cyan text-xs font-mono font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {target.h3Index}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {target.priority}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 pt-1">
                    <div>
                      {language === "id" ? "Koordinat:" : "Coordinates:"}{" "}
                      <span className="text-slate-200">
                        {target.latitude.toFixed(3)}, {target.longitude.toFixed(3)}
                      </span>
                    </div>
                    <div>
                      {t.hoverGwl}:{" "}
                      <span className="text-rose-400 font-bold">{target.gwlCm} cm</span>
                    </div>
                    <div>
                      {t.omcColCloudCover}:{" "}
                      <span className="text-sentinel-cyan">{target.cloudTargetType}</span>
                    </div>
                    <div>
                      {t.omcColPayload}:{" "}
                      <span className="text-amber-400">{target.saltAgentPayload}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 italic pt-1 border-t border-white/5">
                    {target.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-sentinel-border bg-obsidian/60 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-sentinel-cyan/20 hover:bg-sentinel-cyan/30 text-sentinel-cyan border border-sentinel-cyan/40 text-xs font-bold transition-all"
            >
              {t.omcBtnLaunch}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
