"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Flame,
  Droplets,
  Wind,
  Radar,
  RefreshCw,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Trash2,
  CloudRain,
} from "lucide-react";
import {
  SimulationRunResult,
  SimulationHistoryItem,
  SimulationStats,
} from "@/types";
import { useTranslation } from "@/context/LanguageContext";

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulationApplied: () => void;
  activeScenarioName?: string | null;
  initialMode?: "DROUGHT" | "RAIN";
}

type TabType = "NEW" | "HISTORY";
type StepPhase = "FORM" | "RUNNING" | "RESULT";
type SimulationMode = "DROUGHT" | "RAIN";

interface PresetScenario {
  id: string;
  category: SimulationMode;
  nameId: string;
  nameEn: string;
  icon: string;
  dwrDelta: number;
  gwlDelta: number;
  vpdDelta: number;
  sarBoost: boolean;
  badge: string;
  descriptionId: string;
  descriptionEn: string;
}

const PRESETS: PresetScenario[] = [
  // Drought Scenarios
  {
    id: "7d",
    category: "DROUGHT",
    nameId: "Kemarau Pendek (7 Hari)",
    nameEn: "7-Day Short Dry Spell",
    icon: "🌤️",
    dwrDelta: 7,
    gwlDelta: -10.0,
    vpdDelta: 0.6,
    sarBoost: false,
    badge: "Waspada Awal",
    descriptionId: "Deplesi air tanah ringan (-10 cm), memicu status High di area sekitar kanal drainase.",
    descriptionEn: "Mild groundwater depletion (-10 cm), triggering High status along drainage canals.",
  },
  {
    id: "14d",
    category: "DROUGHT",
    nameId: "Puncak El Niño (14 Hari)",
    nameEn: "14-Day Peak El Niño",
    icon: "🔥",
    dwrDelta: 14,
    gwlDelta: -18.0,
    vpdDelta: 1.2,
    sarBoost: true,
    badge: "Rekomendasi Demo",
    descriptionId: "Kubah gambut menembus batas kritis PP 57/2016 (< -40 cm). Lonjakan sel Extreme di Riau & Kalteng.",
    descriptionEn: "Peat dome breaches critical threshold (< -40 cm). Extreme cell spike across Sumatra & Kalimantan.",
  },
  {
    id: "25d",
    category: "DROUGHT",
    nameId: "Krisis Ekstrem Multi-Minggu (25 Hari)",
    nameEn: "25-Day Extreme Crisis",
    icon: "🌋",
    dwrDelta: 25,
    gwlDelta: -30.0,
    vpdDelta: 2.2,
    sarBoost: true,
    badge: "Bencana Darurat",
    descriptionId: "Kekeringan parah berkepanjangan. Target Operasi Semai Awan (OMC) dan sekat bakar melonjak masif.",
    descriptionEn: "Prolonged severe drought. Target cloud seeding (OMC) and firebreak interventions spike massively.",
  },

  // Rain Scenarios (Tahap 2: Simulasi Hujan & Pembasahan)
  {
    id: "rain_omc",
    category: "RAIN",
    nameId: "Intervensi OMC Sukses (3 Hari)",
    nameEn: "OMC Success Intervention (3 Days)",
    icon: "✈️",
    dwrDelta: -7,
    gwlDelta: 8.0,
    vpdDelta: -0.6,
    sarBoost: false,
    badge: "Presipitasi OMC",
    descriptionId: "Operasi semai awan memicu hujan lokal. Muka air tanah pulih +8 cm, menekan hotspot potensial.",
    descriptionEn: "Cloud seeding operation induces local rainfall. Groundwater recovers by +8 cm, suppressing ignition.",
  },
  {
    id: "rain_monsoon",
    category: "RAIN",
    nameId: "Hujan Monsun Tropis (7-10 Hari)",
    nameEn: "Tropical Monsoon Rainfall (7-10 Days)",
    icon: "🌧️",
    dwrDelta: -14,
    gwlDelta: 18.0,
    vpdDelta: -1.2,
    sarBoost: false,
    badge: "Pembasahan Alami",
    descriptionId: "Presipitasi merata membasahi kubah gambut. Muka air tanah melonjak ke zona aman (> -40 cm).",
    descriptionEn: "Widespread monsoon rainfall rehydrates peat domes. GWL rises safely above -40 cm threshold.",
  },
  {
    id: "rain_deluge",
    category: "RAIN",
    nameId: "Hujan Lebat / Saturasi (+15 Hari)",
    nameEn: "Continuous Heavy Deluge (+15 Days)",
    icon: "🌊",
    dwrDelta: -25,
    gwlDelta: 30.0,
    vpdDelta: -2.0,
    sarBoost: false,
    badge: "Saturasi Penuh",
    descriptionId: "Hujan lebat kontinu menyebabkan lahan gambut tergenang/saturasi total. Risiko karhutla kembali nihil.",
    descriptionEn: "Prolonged torrential rainfall brings peat to 100% saturation. Fire ignition risk drops to near zero.",
  },
];

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_HEADERS = {
  "ngrok-skip-browser-warning": "true",
};

export default function SimulationModal({
  isOpen,
  onClose,
  onSimulationApplied,
  activeScenarioName,
  initialMode = "DROUGHT",
}: SimulationModalProps) {
  const { language } = useTranslation();
  const isId = language === "id";

  const [activeTab, setActiveTab] = useState<TabType>("NEW");
  const [stepPhase, setStepPhase] = useState<StepPhase>("FORM");
  const [simMode, setSimMode] = useState<SimulationMode>(initialMode);

  // Form State
  const [selectedPresetId, setSelectedPresetId] = useState<string>("14d");
  const [scenarioName, setScenarioName] = useState<string>(
    isId ? "Puncak El Niño Nasional (14 Hari)" : "National Peak El Niño (14 Days)"
  );
  const [dwrDelta, setDwrDelta] = useState<number>(14);
  const [gwlDelta, setGwlDelta] = useState<number>(-18.0);
  const [vpdDelta, setVpdDelta] = useState<number>(1.2);
  const [sarBoost, setSarBoost] = useState<boolean>(true);

  // Sync mode when initialMode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSimMode(initialMode);
      if (initialMode === "RAIN") {
        const defaultRain = PRESETS.find((p) => p.id === "rain_monsoon")!;
        setSelectedPresetId(defaultRain.id);
        setScenarioName(isId ? defaultRain.nameId : defaultRain.nameEn);
        setDwrDelta(defaultRain.dwrDelta);
        setGwlDelta(defaultRain.gwlDelta);
        setVpdDelta(defaultRain.vpdDelta);
        setSarBoost(defaultRain.sarBoost);
      } else {
        const defaultDrought = PRESETS.find((p) => p.id === "14d")!;
        setSelectedPresetId(defaultDrought.id);
        setScenarioName(isId ? defaultDrought.nameId : defaultDrought.nameEn);
        setDwrDelta(defaultDrought.dwrDelta);
        setGwlDelta(defaultDrought.gwlDelta);
        setVpdDelta(defaultDrought.vpdDelta);
        setSarBoost(defaultDrought.sarBoost);
      }
    }
  }, [isOpen, initialMode, isId]);

  // Execution & Result State
  const [runResult, setRunResult] = useState<SimulationRunResult | null>(null);
  const [historyList, setHistoryList] = useState<SimulationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [executionStep, setExecutionStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simElapsedSeconds, setSimElapsedSeconds] = useState<number>(0);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Switch Category Tab (Drought vs Rain)
  const handleSwitchMode = (mode: SimulationMode) => {
    setSimMode(mode);
    if (mode === "RAIN") {
      const p = PRESETS.find((pr) => pr.id === "rain_monsoon")!;
      handleSelectPreset(p);
    } else {
      const p = PRESETS.find((pr) => pr.id === "14d")!;
      handleSelectPreset(p);
    }
  };

  // Apply Preset
  const handleSelectPreset = (p: PresetScenario) => {
    setSelectedPresetId(p.id);
    setScenarioName(isId ? p.nameId : p.nameEn);
    setDwrDelta(p.dwrDelta);
    setGwlDelta(p.gwlDelta);
    setVpdDelta(p.vpdDelta);
    setSarBoost(p.sarBoost);
  };

  // Fetch History
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/simulation/history`, {
        headers: API_HEADERS,
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (err) {
      console.warn("Failed to fetch simulation history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setStepPhase("FORM");
      setErrorMessage(null);
    }
  }, [isOpen, fetchHistory]);

  // Execute Simulation
  const handleRunSimulation = async () => {
    setStepPhase("RUNNING");
    setExecutionStep(1);
    setErrorMessage(null);
    setSimElapsedSeconds(0);

    // Live execution timer & progression across 124,545 nationwide cells (~15-25s)
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSimElapsedSeconds(elapsed);
      if (elapsed >= 16) {
        setExecutionStep(3);
      } else if (elapsed >= 5) {
        setExecutionStep(2);
      } else {
        setExecutionStep(1);
      }
    }, 1000);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/simulation/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...API_HEADERS },
        body: JSON.stringify({
          scenarioName,
          dwrDelta,
          gwlDelta,
          vpdDelta,
          sarBoost,
        }),
      });

      if (!res.ok) {
        throw new Error(`Simulation request failed with status: ${res.status}`);
      }

      const result: SimulationRunResult = await res.json();
      setRunResult(result);
      setStepPhase("RESULT");
      onSimulationApplied();
      fetchHistory();
    } catch (err: any) {
      console.error("Simulation run error:", err);
      setErrorMessage(err.message || "Gagal menjalankan simulasi.");
      setStepPhase("FORM");
    } finally {
      clearInterval(timerInterval);
    }
  };

  // Reset to Baseline
  const handleResetToBaseline = async () => {
    setIsResetting(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/simulation/reset`, {
        method: "POST",
        headers: API_HEADERS,
      });
      if (res.ok) {
        onSimulationApplied();
        await fetchHistory();
        onClose();
      }
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setIsResetting(false);
    }
  };

  // Apply historical scenario
  const handleApplyHistory = async (id: number) => {
    setStepPhase("RUNNING");
    setExecutionStep(1);
    setSimElapsedSeconds(0);

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSimElapsedSeconds(elapsed);
      if (elapsed >= 10) {
        setExecutionStep(3);
      } else if (elapsed >= 3) {
        setExecutionStep(2);
      }
    }, 1000);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/simulation/apply/${id}`, {
        method: "POST",
        headers: API_HEADERS,
      });
      if (res.ok) {
        const result: SimulationRunResult = await res.json();
        setRunResult(result);
        setStepPhase("RESULT");
        onSimulationApplied();
        fetchHistory();
      }
    } catch (err) {
      console.error("Apply history error:", err);
      setStepPhase("FORM");
    } finally {
      clearInterval(timerInterval);
    }
  };

  // Delete historical item
  const handleDeleteHistory = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/simulation/${id}`, {
        method: "DELETE",
        headers: API_HEADERS,
      });
      if (res.ok) {
        setHistoryList((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error("Delete history error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-950/95 border border-sentinel-cyan/30 text-slate-100 shadow-2xl shadow-cyan-950/40 flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-900 to-obsidian-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/50">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {isId
                    ? "Pusat Simulasi Krisis Iklim & Prediksi Proaktif"
                    : "Climate Crisis & Proactive Prediction Simulator"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40">
                  WHAT-IF ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isId
                  ? "Uji ketahanan 124.545 sel gambut nasional terhadap gelombang panas El Niño & kekeringan"
                  : "Stress-test 124,545 national peat cells under extreme El Niño heatwaves & drought"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {stepPhase === "FORM" && (
          <div className="px-6 pt-3 border-b border-white/10 flex items-center gap-4 bg-slate-900/50 shrink-0">
            <button
              onClick={() => setActiveTab("NEW")}
              className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "NEW"
                  ? "border-sentinel-cyan text-sentinel-cyan"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isId ? "Buat Simulasi Baru" : "Configure Simulation"}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("HISTORY");
                fetchHistory();
              }}
              className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === "HISTORY"
                  ? "border-sentinel-cyan text-sentinel-cyan"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{isId ? "Riwayat Simulasi" : "Simulation History"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/10 text-slate-300">
                {historyList.length}
              </span>
            </button>

            {activeScenarioName && (
              <div className="ml-auto pb-3 flex items-center gap-1.5 text-[11px] text-amber-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Active: {activeScenarioName}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ======================================================== */}
          {/* PHASE 1: FORM INPUT */}
          {/* ======================================================== */}
          {stepPhase === "FORM" && activeTab === "NEW" && (
            <div className="space-y-6">
              {/* Category Mode Switcher: Kemarau vs Hujan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block">
                    {isId ? "Mode Skenario Simulasi:" : "Simulation Scenario Mode:"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {simMode === "DROUGHT"
                      ? (isId ? "Simulasi kekeringan, gelombang panas, dan lonjakan risiko karhutla" : "Simulate drought, extreme heat, and fire risk surges")
                      : (isId ? "Simulasi presipitasi hujan monsun, pembasahan kubah gambut, & intervensi OMC" : "Simulate monsoon rainfall, peat dome re-wetting & cloud seeding")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-obsidian rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("DROUGHT")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      simMode === "DROUGHT"
                        ? "bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-rose-950/40 ring-1 ring-amber-400/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isId ? "Kemarau" : "Drought"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("RAIN")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      simMode === "RAIN"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <CloudRain className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{isId ? "Hujan (Pembasahan)" : "Rain (Rewetting)"}</span>
                  </button>
                </div>
              </div>

              {/* Presets Cards */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                  1. {isId ? "Pilih Skenario Cepat (Quick Presets):" : "Select Quick Scenario Preset:"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRESETS.filter((p) => p.category === simMode).map((p) => {
                    const isSelected = selectedPresetId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? simMode === "RAIN"
                              ? "bg-gradient-to-b from-cyan-950/70 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-400/50"
                              : "bg-gradient-to-b from-amber-950/70 to-slate-900 border-amber-400 shadow-lg shadow-rose-950/30 ring-1 ring-amber-400/50"
                            : "bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90 text-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{p.icon}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                              isSelected
                                ? simMode === "RAIN"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-white/5 text-slate-400 border border-white/10"
                            }`}
                          >
                            {p.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1">
                          {isId ? p.nameId : p.nameEn}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                          {isId ? p.descriptionId : p.descriptionEn}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5">
                          <span>
                            {p.dwrDelta >= 0 ? `+${p.dwrDelta}d HTH` : `${p.dwrDelta}d HTH`}
                          </span>
                          <span>•</span>
                          <span className={p.gwlDelta >= 0 ? "text-cyan-400" : "text-rose-400"}>
                            {p.gwlDelta >= 0 ? `+${p.gwlDelta}cm` : `${p.gwlDelta}cm`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders Configuration */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-sentinel-cyan" />
                    2. {isId ? "Penyesuaian Parameter Biofisik" : "Biophysical Parameter Tuning"}
                  </span>
                  <span className="text-[11px] font-mono text-sentinel-cyan">
                    124.545 {isId ? "Sel Nasional" : "National Cells"}
                  </span>
                </div>

                {/* Slider 1: Days Without Rain */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {isId ? "Perubahan Hari Tanpa Hujan (ΔHTH):" : "Days Without Rain Shift (ΔDWR):"}
                    </span>
                    <span className={`font-mono font-bold ${dwrDelta < 0 ? "text-cyan-400" : "text-amber-400"}`}>
                      {dwrDelta > 0 ? `+${dwrDelta}` : dwrDelta} {isId ? "Hari" : "Days"}
                      {dwrDelta < 0 && (isId ? " (Hujan Aktif)" : " (Rain Active)")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-30}
                    max={30}
                    step={1}
                    value={dwrDelta}
                    onChange={(e) => {
                      setDwrDelta(Number(e.target.value));
                      setSelectedPresetId("custom");
                    }}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span className="text-cyan-400">-30d (Hujan Masif)</span>
                    <span>0d (Baseline)</span>
                    <span className="text-amber-400">+30d (Kekeringan Ekstrem)</span>
                  </div>
                </div>

                {/* Slider 2: Groundwater Depletion / Rewetting */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      {isId ? "Perubahan Muka Air Tanah (ΔGWL):" : "Groundwater Level Shift (ΔGWL):"}
                    </span>
                    <span className={`font-mono font-bold ${gwlDelta >= 0 ? "text-cyan-400" : "text-rose-400"}`}>
                      {gwlDelta > 0 ? `+${gwlDelta.toFixed(1)}` : gwlDelta.toFixed(1)} cm
                      {gwlDelta > 0 && (isId ? " (Pembasahan)" : " (Rewetting)")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-35}
                    max={35}
                    step={1}
                    value={gwlDelta}
                    onChange={(e) => {
                      setGwlDelta(Number(e.target.value));
                      setSelectedPresetId("custom");
                    }}
                    className={`w-full ${gwlDelta >= 0 ? "accent-cyan-400" : "accent-rose-500"} bg-slate-800 h-1.5 rounded-lg cursor-pointer`}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span className="text-rose-400">-35 cm (Kering Kritis)</span>
                    <span>0 cm (Baseline)</span>
                    <span className="text-cyan-400">+35 cm (Saturasi Gambut)</span>
                  </div>
                </div>

                {/* Slider 3: VPD */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-purple-400" />
                      {isId ? "Defisit Tekanan Uap Udara (ΔVPD):" : "Vapor Pressure Deficit (ΔVPD):"}
                    </span>
                    <span className={`font-mono font-bold ${vpdDelta < 0 ? "text-cyan-400" : "text-purple-400"}`}>
                      {vpdDelta > 0 ? `+${vpdDelta.toFixed(1)}` : vpdDelta.toFixed(1)} kPa
                      {vpdDelta < 0 && (isId ? " (Lembap Basah)" : " (Humid Moist)")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-2.5}
                    max={3.0}
                    step={0.1}
                    value={vpdDelta}
                    onChange={(e) => {
                      setVpdDelta(Number(e.target.value));
                      setSelectedPresetId("custom");
                    }}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span className="text-cyan-400">-2.5 kPa (Atmosfer Sangat Basah)</span>
                    <span>0.0 kPa</span>
                    <span className="text-purple-400">+3.0 kPa (Atmosfer Kering)</span>
                  </div>
                </div>

                {/* SAR Boost Toggle */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-white flex items-center gap-1.5">
                      <Radar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isId ? "Simulasi Tebas Lahan Liar (SAR Anomaly Boost)" : "Simulate Land Clearing Spikes (SAR)"}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isId
                        ? "Meningkatkan deteksi penurunan gelombang radar Sentinel-1 pada area berisiko tinggi"
                        : "Inject backscatter drop anomalies on high-risk concession boundaries"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSarBoost(!sarBoost)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      sarBoost ? "bg-amber-500" : "bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        sarBoost ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Scenario Name Input */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  3. {isId ? "Beri Nama Skenario Simulasi:" : "Scenario Name Label:"}
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-sentinel-cyan font-medium"
                  placeholder="Misal: Skenario Krisis El Niño Puncak 2026"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SIMULATION HISTORY */}
          {/* ======================================================== */}
          {stepPhase === "FORM" && activeTab === "HISTORY" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs text-slate-400">
                  {isId
                    ? "Daftar skenario simulasi yang pernah disimpan di database."
                    : "Saved historical simulation runs in PostgreSQL."}
                </span>
                <button
                  onClick={handleResetToBaseline}
                  disabled={isResetting}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
                  <span>
                    {isResetting
                      ? isId
                        ? "Memulihkan Baseline..."
                        : "Restoring Baseline..."
                      : isId
                      ? "Kembali ke Data Asli (Baseline)"
                      : "Restore Real Baseline"}
                  </span>
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-sentinel-cyan" />
                  <span>Memuat riwayat simulasi...</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <History className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>{isId ? "Belum ada riwayat simulasi yang tersimpan." : "No saved simulation history yet."}</p>
                  <button
                    onClick={() => setActiveTab("NEW")}
                    className="mt-3 text-sentinel-cyan hover:underline text-xs"
                  >
                    {isId ? "Jalankan simulasi pertama Anda sekarang" : "Run your first simulation now"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        item.isActive
                          ? "bg-cyan-950/40 border-sentinel-cyan shadow-md shadow-cyan-950/20"
                          : "bg-slate-900/60 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.scenarioName}
                          </h4>
                          {item.isActive && (
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40">
                              AKTIF DI PETA
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                          <span>+{item.dwrDelta}d HTH</span>
                          <span>•</span>
                          <span className="text-rose-400">{item.gwlDelta}cm GWL</span>
                          <span>•</span>
                          <span>+{item.vpdDelta}kPa</span>
                          <span>•</span>
                          <span className="text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-rose-400">
                            {item.extremeCount} Sel Extreme
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {item.executionTimeMs} ms
                          </div>
                        </div>

                        {!item.isActive && (
                          <button
                            onClick={() => handleApplyHistory(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-sentinel-cyan/20 hover:bg-sentinel-cyan/30 text-sentinel-cyan border border-sentinel-cyan/40 text-xs font-semibold flex items-center gap-1 transition-all"
                            title="Terapkan ke peta"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Terapkan</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Hapus riwayat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* PHASE 2: RUNNING ANIMATION (Tetap di tengah modal) */}
          {/* ======================================================== */}
          {stepPhase === "RUNNING" && (
            <div className="py-8 text-center space-y-5">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-sentinel-cyan/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-amber-500/40 animate-spin" />
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-rose-600 flex items-center justify-center shadow-xl shadow-rose-950/60">
                  <Cpu className="w-7 h-7 text-white animate-pulse" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sentinel-cyan/20 border border-sentinel-cyan/40 text-[11px] font-mono text-sentinel-cyan mb-2">
                  <span className="w-2 h-2 rounded-full bg-sentinel-cyan animate-ping" />
                  <span>
                    {isId ? "WAKTU BERJALAN" : "ELAPSED TIME"}: {Math.floor(simElapsedSeconds / 60).toString().padStart(2, "0")}:{(simElapsedSeconds % 60).toString().padStart(2, "0")}s
                  </span>
                  <span>•</span>
                  <span>{isId ? "ESTIMASI: ~20 DETIK" : "EST: ~20 SEC"}</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">
                  {simMode === "RAIN"
                    ? (isId ? "Mengevaluasi Skenario Hujan & Pembasahan Gambut..." : "Evaluating Monsoon & Rewetting Scenario...")
                    : (isId ? "Mengevaluasi Skenario Krisis Iklim & Kemarau..." : "Evaluating Climate Crisis & Drought Scenario...")}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {isId
                    ? "Injeksi parameter ke 124.545 sel heksagon Kesatuan Hidrologis Gambut (Sumatera, Kalimantan, Papua)"
                    : "Injecting parameters into 124,545 national peatland cells (Sumatra, Kalimantan, Papua)"}
                </p>
              </div>

              {/* Dynamic Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(94, Math.round(15 + (simElapsedSeconds / 22) * 80))}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{isId ? "Memproses 124.545 sel..." : "Processing 124,545 cells..."}</span>
                  <span>{Math.min(94, Math.round(15 + (simElapsedSeconds / 22) * 80))}%</span>
                </div>
              </div>

              {/* Step Progression Indicators */}
              <div className="max-w-md mx-auto space-y-2 text-left text-xs font-mono">
                <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-all ${
                  executionStep >= 1 ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-300" : "bg-white/5 border-white/5 text-slate-500"
                }`}>
                  <Layers className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">
                    1. {isId ? "Menyiapkan 124.545 vektor parameter biofisik & cuaca" : "Preparing 124,545 biophysical & weather vectors"}
                  </span>
                  {executionStep > 1 && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-all ${
                  executionStep >= 2 ? "bg-amber-950/40 border-amber-500/40 text-amber-300" : "bg-white/5 border-white/5 text-slate-500"
                }`}>
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">
                    2. {isId ? "Inferensi model XGBoost GPU / High-throughput Matrix" : "XGBoost GPU / High-throughput Matrix inference"}
                  </span>
                  {executionStep > 2 && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center gap-2.5 transition-all ${
                  executionStep >= 3 ? "bg-rose-950/40 border-rose-500/40 text-rose-300" : "bg-white/5 border-white/5 text-slate-500"
                }`}>
                  <Flame className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">
                    3. {isId ? "Menyimpan snapshot PostGIS & rute patroli VRP preskriptif" : "Persisting PostGIS snapshots & VRP patrol routes"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PHASE 3: RESULT REVIEW (Tetap di tengah modal) */}
          {/* ======================================================== */}
          {stepPhase === "RESULT" && runResult && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900 border border-emerald-500/40 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{isId ? "Simulasi Berhasil Dijalankan & Disimpan!" : "Simulation Evaluated & Saved!"}</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {runResult.executionTimeMs} ms
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Skenario <span className="font-semibold text-white">&quot;{runResult.scenarioName}&quot;</span> kini telah aktif diterapkan ke visualisasi peta 3D dan kalkulasi armada lapangan.
                  </p>
                </div>
              </div>

              {/* Comparison Matrix (Sebelum vs Sesudah) */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                  {isId ? "Perbandingan Dampak Krisis (Sebelum vs Sesudah):" : "Crisis Impact Matrix (Before vs After):"}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Extreme Risk Spike */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30">
                    <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                      <span>RISIKO EXTREME</span>
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-rose-400 mb-1">
                      {runResult.after.extremeCount}{" "}
                      <span className="text-xs text-slate-400 font-normal">sel</span>
                    </div>
                    <div className="text-[10px] font-mono font-semibold text-rose-300">
                      +{runResult.deltas.extremeDiff} sel ({runResult.before.extremeCount} → {runResult.after.extremeCount})
                    </div>
                  </div>

                  {/* GWL Depletion */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                    <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                      <span>RATA-RATA GWL</span>
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-cyan-400 mb-1">
                      {runResult.after.avgGwlCm}{" "}
                      <span className="text-xs text-slate-400 font-normal">cm</span>
                    </div>
                    <div className="text-[10px] font-mono text-amber-400">
                      Δ {runResult.deltas.avgGwlDiff} cm deplesi
                    </div>
                  </div>

                  {/* SAR Alerts */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30">
                    <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                      <span>RADAR SAR ALERTS</span>
                      <Radar className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-400 mb-1">
                      {runResult.after.sarAlerts}{" "}
                      <span className="text-xs text-slate-400 font-normal">titik</span>
                    </div>
                    <div className="text-[10px] font-mono text-amber-300">
                      +{runResult.deltas.sarAlertsDiff} anomali tebas
                    </div>
                  </div>

                  {/* OMC Target Areas */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30">
                    <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                      <span>TARGET SEMAI OMC</span>
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-purple-400 mb-1">
                      {runResult.after.omcTargets}{" "}
                      <span className="text-xs text-slate-400 font-normal">area</span>
                    </div>
                    <div className="text-[10px] font-mono text-purple-300">
                      +{runResult.deltas.omcTargetsDiff} zona prioritas
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanatory summary text */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed font-sans">
                <p>
                  <strong>Dampak Operasional:</strong> Lonjakan tingkat kekeringan gambut telah memicu sistem untuk secara otomatis memperbarui rute patroli darat Manggala Agni via solver OR-Tools, menaikkan prioritas penutupan pintu sekat kanal, dan mengajukan koordinat semai awan (OMC) baru kepada tim operasi lapangan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between shrink-0">
          {stepPhase === "FORM" && activeTab === "NEW" && (
            <>
              <button
                type="button"
                onClick={handleResetToBaseline}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isId ? "Reset ke Data Riil" : "Reset to Real Baseline"}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  {isId ? "Batal" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-rose-600 hover:from-cyan-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 flex items-center gap-2 transition-all border border-cyan-400/30"
                >
                  <Flame className="w-4 h-4" />
                  <span>{isId ? "Jalankan Inferensi XGBoost GPU" : "Run XGBoost GPU Inference"}</span>
                </button>
              </div>
            </>
          )}

          {stepPhase === "FORM" && activeTab === "HISTORY" && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
              >
                {isId ? "Tutup" : "Close"}
              </button>
            </div>
          )}

          {stepPhase === "RESULT" && (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStepPhase("FORM");
                  setActiveTab("HISTORY");
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>{isId ? "Lihat Semua Riwayat" : "View All History"}</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStepPhase("FORM")}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {isId ? "Uji Parameter Lain" : "Tune Parameters"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/40 transition-all flex items-center gap-1.5"
                >
                  <span>{isId ? "Tutup & Eksplorasi Peta" : "Close & Explore Map"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
