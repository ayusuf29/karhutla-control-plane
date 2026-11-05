"use client";

import React, { useState, useEffect, useCallback } from "react";
import HeaderCommandBar from "@/components/HeaderCommandBar";
import DeckMapViewport from "@/components/DeckMapViewport";
import CellInspectionDrawer from "@/components/CellInspectionDrawer";
import PatrolDispatchPanel from "@/components/PatrolDispatchPanel";
import OmcModal from "@/components/OmcModal";
import SarAlertModal from "@/components/SarAlertModal";
import SimulationModal from "@/components/SimulationModal";
import FloatingActionDock from "@/components/FloatingActionDock";
import TacticalLoadingOverlay from "@/components/TacticalLoadingOverlay";
import {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  RecommendationOverview,
  DispatchResponse,
} from "@/types";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
const API_HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

export default function Home() {
  const [geojsonData, setGeojsonData] = useState<GeoJsonFeatureCollection | null>(null);
  const [isLoadingGrid, setIsLoadingGrid] = useState<boolean>(true);
  const [recommendations, setRecommendations] = useState<RecommendationOverview | null>(null);
  const [selectedCell, setSelectedCell] = useState<GeoJsonFeature | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [isReassessing, setIsReassessing] = useState<boolean>(false);
  const [dispatchedSquads, setDispatchedSquads] = useState<Record<string, DispatchResponse>>({});

  // Modals state
  const [isOmcModalOpen, setIsOmcModalOpen] = useState<boolean>(false);
  const [isSarModalOpen, setIsSarModalOpen] = useState<boolean>(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState<boolean>(false);
  const [simulationInitialMode, setSimulationInitialMode] = useState<"DROUGHT" | "RAIN">("DROUGHT");
  const [activeScenarioName, setActiveScenarioName] = useState<string | null>(null);

  // Telemetry real-time sync state
  const [lastFetchedDate, setLastFetchedDate] = useState<string>("2026-10-14");
  const [todayDate, setTodayDate] = useState<string>(() => {
    // Current local system date formatted as YYYY-MM-DD
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState<boolean>(false);

  // 1. Fetch Spatial H3 Grid
  const fetchSpatialGrid = useCallback(async () => {
    setIsLoadingGrid(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/spatial/h3-grid`, {
        headers: API_HEADERS,
      });
      if (res.ok) {
        const data: GeoJsonFeatureCollection = await res.json();
        setGeojsonData(data);

        // Derive last fetched date from metadata or first cell properties
        if (data.metadata && (data.metadata as any).latestSnapshotDate) {
          setLastFetchedDate((data.metadata as any).latestSnapshotDate);
        } else if (data.features && data.features.length > 0 && data.features[0]?.properties?.snapshotDate) {
          setLastFetchedDate(data.features[0].properties.snapshotDate);
        }
      }
    } catch (err) {
      console.warn("Backend not reached, attempting retry:", err);
    } finally {
      setIsLoadingGrid(false);
    }
  }, []);

  // 2. Fetch Agent Recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/agents/recommendations`, {
        headers: API_HEADERS,
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.warn("Recommendations fetch failed:", err);
    }
  }, []);

  // 3. Fetch Telemetry Status
  const fetchTelemetryStatus = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/telemetry/status`, {
        headers: API_HEADERS,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastFetchedDate) setLastFetchedDate(data.lastFetchedDate);
        if (data.todayDate) setTodayDate(data.todayDate);
      }
    } catch {
      // Fallback: endpoint checked via geojson features
    }
  }, []);

  const checkActiveScenario = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/simulation/active`, {
        headers: API_HEADERS,
      });
      if (res.ok && res.status !== 204) {
        const data = await res.json();
        if (data && data.scenarioName) {
          setActiveScenarioName(data.scenarioName);
        } else {
          setActiveScenarioName(null);
        }
      } else {
        setActiveScenarioName(null);
      }
    } catch {
      setActiveScenarioName(null);
    }
  }, []);

  // Handle Real-Time Telemetry Sync & Retraining
  const handleSyncTelemetry = async () => {
    setIsSyncingTelemetry(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/telemetry/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...API_HEADERS },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lastFetchedDate) {
          setLastFetchedDate(data.lastFetchedDate);
        }
      } else {
        setLastFetchedDate(todayDate);
      }
      await fetchSpatialGrid();
      await fetchRecommendations();
    } catch (err) {
      console.warn("Telemetry sync fallback to today:", err);
      setLastFetchedDate(todayDate);
      await fetchSpatialGrid();
      await fetchRecommendations();
    } finally {
      setIsSyncingTelemetry(false);
    }
  };

  useEffect(() => {
    fetchSpatialGrid();
    fetchRecommendations();
    fetchTelemetryStatus();
    checkActiveScenario();

    // Poll lightweight agent recommendations & alerts every 25 seconds
    const interval = setInterval(() => {
      fetchRecommendations();
      fetchTelemetryStatus();
    }, 25000);

    return () => clearInterval(interval);
  }, [fetchSpatialGrid, fetchRecommendations, fetchTelemetryStatus, checkActiveScenario]);

  // 3. Open Drought or Rain Simulation Center Modal
  const handleOpenDroughtSimulation = () => {
    setSimulationInitialMode("DROUGHT");
    setIsSimulationModalOpen(true);
  };

  const handleOpenRainSimulation = () => {
    setSimulationInitialMode("RAIN");
    setIsSimulationModalOpen(true);
  };

  const handleSimulationApplied = useCallback(async () => {
    setIsReassessing(true);
    try {
      await fetchSpatialGrid();
      await fetchRecommendations();
      await checkActiveScenario();
    } finally {
      setIsReassessing(false);
    }
  }, [fetchSpatialGrid, fetchRecommendations, checkActiveScenario]);

  // 4. Handle Patrol Squad Dispatch Approval
  const handleDispatchSquad = async (squadId: string): Promise<DispatchResponse | null> => {
    try {
      const squad = recommendations?.patrolCards.find((c) => c.squadId === squadId);
      const waypoints = squad?.waypoints.map((w) => w.h3Index) || [];

      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/patrol/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...API_HEADERS },
        body: JSON.stringify({
          squadId,
          approvedBy: "Komandan Daops Manggala Agni (Pusat Pengendali Operasi)",
          notes: "Luncurkan unit pompa apung bertekanan tinggi dan laksanakan pembasahan sekat kanal.",
          waypointH3Indices: waypoints,
        }),
      });

      if (res.ok) {
        const receipt: DispatchResponse = await res.json();
        setDispatchedSquads((prev) => ({ ...prev, [squadId]: receipt }));
        return receipt;
      }
    } catch (err) {
      console.error("Dispatch request failed:", err);
    }
    return null;
  };

  // 5. Select cell by index from SAR modal
  const handleSelectCellByIndex = (h3Index: string) => {
    if (!geojsonData) return;
    const found = geojsonData.features.find((f) => f.properties.h3Index === h3Index);
    if (found) {
      setSelectedCell(found);
    }
  };

  const sarCount =
    recommendations?.assessorSummary?.sarClearingAlerts ??
    (recommendations?.sarAlerts?.length || 0);
  const omcCount =
    recommendations?.assessorSummary?.omcTargetCount ??
    (recommendations?.omcTargets?.length || 0);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-obsidian text-slate-100">
      {/* 1. Streamlined Top Command Header (Clean & Uncluttered with Telemetry Status) */}
      <HeaderCommandBar
        summary={recommendations?.assessorSummary || null}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        activeScenarioName={activeScenarioName}
        lastFetchedDate={lastFetchedDate}
        todayDate={todayDate}
        onSyncTelemetry={handleSyncTelemetry}
        isSyncingTelemetry={isSyncingTelemetry}
      />

      {/* 2. Left-Side Floating Tactical Action Dock */}
      <FloatingActionDock
        onOpenDroughtSimulation={handleOpenDroughtSimulation}
        onOpenRainSimulation={handleOpenRainSimulation}
        onOpenSarModal={() => setIsSarModalOpen(true)}
        onOpenOmcModal={() => setIsOmcModalOpen(true)}
        sarCount={sarCount}
        omcCount={omcCount}
        activeScenarioName={activeScenarioName}
        isReassessing={isReassessing}
        lastFetchedDate={lastFetchedDate}
        todayDate={todayDate}
        onSyncTelemetry={handleSyncTelemetry}
        isSyncingTelemetry={isSyncingTelemetry}
      />

      {/* 3. Fullscreen Deck.gl Map Viewport */}
      <DeckMapViewport
        geojsonData={geojsonData}
        selectedCell={selectedCell}
        onSelectCell={setSelectedCell}
        selectedRegion={selectedRegion}
      />

      {/* 4. Collapsible Side Inspection Drawer */}
      <CellInspectionDrawer
        selectedCell={selectedCell}
        onClose={() => setSelectedCell(null)}
        onFocusPatrolRoute={(h3Index) => {
          console.log("Focusing patrol route for cell:", h3Index);
        }}
      />

      {/* 5. Bottom Action / Dispatch Panel */}
      <PatrolDispatchPanel
        patrolCards={recommendations?.patrolCards || []}
        onDispatchSquad={handleDispatchSquad}
        dispatchedSquads={dispatchedSquads}
        tacticalActionPlan={recommendations?.tacticalActionPlan}
        selectedRegion={selectedRegion}
      />

      {/* 6. Modals */}
      <OmcModal
        isOpen={isOmcModalOpen}
        onClose={() => setIsOmcModalOpen(false)}
        targets={recommendations?.omcTargets || []}
      />

      <SarAlertModal
        isOpen={isSarModalOpen}
        onClose={() => setIsSarModalOpen(false)}
        alerts={recommendations?.sarAlerts || []}
        onSelectCellByIndex={handleSelectCellByIndex}
      />

      <SimulationModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        onSimulationApplied={handleSimulationApplied}
        activeScenarioName={activeScenarioName}
        initialMode={simulationInitialMode}
      />

      {/* 7. Tactical HUD Loading & Status Overlay */}
      <TacticalLoadingOverlay
        isLoadingGrid={isLoadingGrid}
        hasGridData={Boolean(geojsonData && geojsonData.features && geojsonData.features.length > 0)}
        isReassessing={isReassessing}
        isSyncingTelemetry={isSyncingTelemetry}
        activeScenarioName={activeScenarioName}
        totalCells={geojsonData?.features?.length || 124545}
      />
    </main>
  );
}
