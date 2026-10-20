"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Flame,
  ShieldAlert,
  Droplets,
  Radar,
  CloudRain,
  RefreshCw,
  MapPin,
  ChevronDown,
  Check,
  Globe,
  Search,
  X,
  Compass,
} from "lucide-react";
import { AssessorSummary, DistrictHierarchyItem } from "@/types";
import { useTranslation } from "@/context/LanguageContext";

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
  activeScenarioName?: string | null;
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
  activeScenarioName,
}: HeaderCommandBarProps) {
  const { t, language, setLanguage } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtsList, setDistrictsList] = useState<DistrictHierarchyItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load 175 district hierarchical catalog
  useEffect(() => {
    fetch("/data/district_hierarchy.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.districts)) {
          setDistrictsList(data.districts);
        }
      })
      .catch((err) => console.warn("Failed to load district hierarchy:", err));
  }, []);

  const macroOptions = [
    {
      id: "ALL",
      label: t.regionAll,
      badge: t.regionAllBadge,
      subtitle: t.regionAllSubtitle,
    },
    {
      id: "SUMATERA",
      label: t.regionSumatera,
      badge: t.regionSumateraBadge,
      subtitle: t.regionSumateraSubtitle,
    },
    {
      id: "KALIMANTAN",
      label: t.regionKalimantan,
      badge: t.regionKalimantanBadge,
      subtitle: t.regionKalimantanSubtitle,
    },
    {
      id: "KUBU_RAYA",
      label: t.regionKubuRaya,
      badge: t.regionKubuRayaBadge,
      subtitle: t.regionKubuRayaSubtitle,
    },
    {
      id: "PULANG_PISAU",
      label: t.regionPulangPisau,
      badge: t.regionPulangPisauBadge,
      subtitle: t.regionPulangPisauSubtitle,
    },
  ];

  // Resolve current active item
  const currentDistrict = useMemo(() => {
    if (!selectedRegion) return null;
    return districtsList.find(
      (d) =>
        d.id === selectedRegion ||
        d.district === selectedRegion ||
        selectedRegion.endsWith(`::${d.district}`)
    );
  }, [selectedRegion, districtsList]);

  const currentMacro = macroOptions.find((r) => r.id === selectedRegion);

  const displayLabel = currentDistrict
    ? `Kec. ${currentDistrict.district}`
    : currentMacro?.label || t.regionAll;

  const displayBadge = currentDistrict
    ? currentDistrict.regency
    : currentMacro?.badge || t.regionAllBadge;

  // Filtered districts list
  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) {
      return districtsList.slice(0, 15);
    }
    const q = searchQuery.toLowerCase();
    return districtsList.filter(
      (d) =>
        d.district.toLowerCase().includes(q) ||
        d.regency.toLowerCase().includes(q) ||
        d.province.toLowerCase().includes(q)
    );
  }, [searchQuery, districtsList]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isDropdownOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 bg-obsidian/90 backdrop-blur-md border-b border-sentinel-border px-4 flex items-center justify-between">
      {/* Left: Branding & Region Dropdown */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider text-xs uppercase text-slate-100">
                {t.brandTitle}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.pocBadge}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight">
              {t.brandTagline}
            </div>
          </div>
        </div>

        {/* Region Dropdown Selector */}
        <div className="h-6 w-px bg-white/10 hidden sm:block" />
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-surface/90 hover:bg-obsidian-surface border ${
              currentDistrict
                ? "border-rose-500/50 bg-rose-950/20 text-rose-200"
                : "border-sentinel-border hover:border-sentinel-cyan/40 text-slate-200"
            } text-xs font-medium transition-all shadow-sm`}
            aria-label={t.regionDropdownTitle}
          >
            {selectedRegion === "ALL" ? (
              <Globe className="w-3.5 h-3.5 text-sentinel-cyan shrink-0" />
            ) : (
              <MapPin className={`w-3.5 h-3.5 ${currentDistrict ? "text-rose-400" : "text-amber-400"} shrink-0`} />
            )}
            <span className="font-semibold text-slate-100 max-w-[140px] md:max-w-[200px] truncate">
              {displayLabel}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/5 text-slate-300 border border-white/10 hidden md:inline shrink-0">
              {displayBadge}
            </span>
            {currentDistrict && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRegion("ALL");
                }}
                title="Reset ke Semua Wilayah"
                className="p-0.5 hover:bg-white/20 rounded text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu (Searchable Combobox) */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-80 md:w-96 rounded-xl bg-obsidian-surface/95 backdrop-blur-xl border border-sentinel-border shadow-2xl z-50 flex flex-col overflow-hidden">
              {/* Search Bar Input */}
              <div className="p-2.5 border-b border-white/10 bg-obsidian/70 flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchDistrictPlaceholder}
                  className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Scrollable Results Container */}
              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {/* 1. Macro Coverage (Shown if no search query) */}
                {!searchQuery.trim() && (
                  <div>
                    <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-white/5 flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-sentinel-cyan" />
                      {t.sectionMacro}
                    </div>
                    {macroOptions.map((option) => {
                      const isSelected = selectedRegion === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            onSelectRegion(option.id);
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? "bg-sentinel-cyan/15 text-sentinel-cyan font-semibold"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              {option.id === "ALL" ? (
                                <Globe className="w-3 h-3 text-sentinel-cyan" />
                              ) : (
                                <MapPin className="w-3 h-3 text-amber-400" />
                              )}
                              <span>{option.label}</span>
                              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-white/5 border border-white/10 text-slate-400">
                                {option.badge}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 pl-4 mt-0.5">
                              {option.subtitle}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sentinel-cyan shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Districts Section */}
                <div>
                  <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-white/5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-3 h-3 text-rose-400" />
                      {t.sectionDistricts}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {filteredDistricts.length} {searchQuery ? "cocok" : "prioritas"}
                    </span>
                  </div>

                  {filteredDistricts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      {t.noDistrictFound} &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredDistricts.map((d) => {
                      const isSelected = selectedRegion === d.id || selectedRegion.endsWith(`::${d.district}`);
                      return (
                        <button
                          key={d.id}
                          onClick={() => {
                            onSelectRegion(d.id);
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? "bg-rose-500/20 text-rose-300 font-semibold border-l-2 border-rose-500"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span className="font-medium text-slate-100">Kec. {d.district}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 pl-4 mt-0.5 truncate">
                              {d.regency}, {d.province}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
                              {d.h3Count} sel
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
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
          <span>{t.metricCriticalExtreme}</span>
          <span className="font-bold text-rose-400 text-sm">
            {summary ? summary.extremeRiskCount.toLocaleString() : 0}
          </span>
        </div>

        {/* Average Ground Water Level */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-obsidian-surface border border-sentinel-border text-xs font-mono tabular-nums text-slate-300">
          <Droplets className="w-3.5 h-3.5 text-sentinel-cyan" />
          <span>{t.metricAvgGwl}</span>
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
          <span>{t.metricSarAlerts}</span>
          <span className="font-bold text-amber-400">
            {(summary ? summary.sarClearingAlerts : sarCount).toLocaleString()}
          </span>
        </button>

        {/* OMC Cloud Seeding Button */}
        <button
          onClick={onOpenOmcModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-surface border border-sentinel-border hover:border-sentinel-cyan/40 text-xs font-mono tabular-nums text-slate-300 transition-colors"
        >
          <CloudRain className="w-3.5 h-3.5 text-sentinel-cyan" />
          <span>{t.metricOmcTarget}</span>
          <span className="font-bold text-sentinel-cyan">
            {(summary?.omcTargetCount ?? (omcCount || (summary && summary.extremeRiskCount > 0 ? Math.min(25, Math.floor(summary.extremeRiskCount / 4) + 2) : 0))).toLocaleString()}
          </span>
        </button>
      </div>

      {/* Right: Language Switcher & Simulation Controls */}
      <div className="flex items-center gap-2">
        {/* Bilingual Switcher (ID / EN) */}
        <div className="flex items-center bg-obsidian-surface p-0.5 rounded-lg border border-sentinel-border shadow-sm">
          <button
            onClick={() => setLanguage("id")}
            className={`px-2 py-1 text-[11px] font-mono font-bold rounded transition-all flex items-center gap-1 ${
              language === "id"
                ? "bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Bahasa Indonesia"
          >
            <span>🇮🇩</span>
            <span>ID</span>
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`px-2 py-1 text-[11px] font-mono font-bold rounded transition-all flex items-center gap-1 ${
              language === "en"
                ? "bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="English Language"
          >
            <span>🇬🇧</span>
            <span>EN</span>
          </button>
        </div>

        {/* Simulation Button */}
        <button
          onClick={onTriggerReassessment}
          disabled={isReassessing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all border ${
            activeScenarioName
              ? "bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white border-amber-400/50 shadow-rose-950/40 ring-1 ring-amber-400/30"
              : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-400/30 shadow-cyan-900/20"
          } disabled:opacity-50`}
          title={t.btnSimulationTooltip}
        >
          {activeScenarioName ? (
            <Flame className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
          ) : (
            <RefreshCw className={`w-3.5 h-3.5 ${isReassessing ? "animate-spin" : ""}`} />
          )}
          <span className="hidden sm:inline truncate max-w-[150px]">
            {isReassessing
              ? t.btnEvaluating
              : activeScenarioName
              ? activeScenarioName
              : t.btnSimulation}
          </span>
        </button>
      </div>
    </header>
  );
}
