"use client";

import React, { useState, useEffect, useCallback } from "react";
import HeaderCommandBar from "@/components/HeaderCommandBar";
import DeckMapViewport from "@/components/DeckMapViewport";
import CellInspectionDrawer from "@/components/CellInspectionDrawer";
import PatrolDispatchPanel from "@/components/PatrolDispatchPanel";
import OmcModal from "@/components/OmcModal";
import SarAlertModal from "@/components/SarAlertModal";
import {
  GeoJsonFeature,
  GeoJsonFeatureCollection,
  RecommendationOverview,
  DispatchResponse,
} from "@/types";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function Home() {
  const [geojsonData, setGeojsonData] = useState<GeoJsonFeatureCollection | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationOverview | null>(null);
  const [selectedCell, setSelectedCell] = useState<GeoJsonFeature | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [isReassessing, setIsReassessing] = useState<boolean>(false);
  const [dispatchedSquads, setDispatchedSquads] = useState<Record<string, DispatchResponse>>({});

  // Modals state
  const [isOmcModalOpen, setIsOmcModalOpen] = useState<boolean>(false);
  const [isSarModalOpen, setIsSarModalOpen] = useState<boolean>(false);

  // 1. Fetch Spatial H3 Grid
  const fetchSpatialGrid = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/spatial/h3-grid`);
      if (res.ok) {
        const data = await res.json();
        setGeojsonData(data);
      }
    } catch (err) {
      console.warn("Backend not reached, attempting retry:", err);
    }
  }, []);

  // 2. Fetch Agent Recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/agents/recommendations`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.warn("Recommendations fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchSpatialGrid();
    fetchRecommendations();

    // Poll lightweight agent recommendations & alerts every 25 seconds
    // (Large spatial grid is loaded once on mount and refreshed upon simulation)
    const interval = setInterval(() => {
      fetchRecommendations();
    }, 25000);

    return () => clearInterval(interval);
  }, [fetchSpatialGrid, fetchRecommendations]);

  // 3. Trigger Drought Reassessment Simulation
  const handleTriggerReassessment = async () => {
    setIsReassessing(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/agents/reassess`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchSpatialGrid();
        await fetchRecommendations();
      }
    } catch (err) {
      console.error("Reassessment trigger error:", err);
    } finally {
      setIsReassessing(false);
    }
  };

  // 4. Handle Patrol Squad Dispatch Approval
  const handleDispatchSquad = async (squadId: string): Promise<DispatchResponse | null> => {
    try {
      const squad = recommendations?.patrolCards.find((c) => c.squadId === squadId);
      const waypoints = squad?.waypoints.map((w) => w.h3Index) || [];

      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/patrol/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-obsidian text-slate-100">
      {/* 1. Floating Top Command Header */}
      <HeaderCommandBar
        summary={recommendations?.assessorSummary || null}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
        onTriggerReassessment={handleTriggerReassessment}
        isReassessing={isReassessing}
        onOpenOmcModal={() => setIsOmcModalOpen(true)}
        onOpenSarModal={() => setIsSarModalOpen(true)}
        omcCount={recommendations?.omcTargets?.length || 0}
        sarCount={recommendations?.sarAlerts?.length || 0}
      />

      {/* 2. Fullscreen Deck.gl Map Viewport */}
      <DeckMapViewport
        geojsonData={geojsonData}
        selectedCell={selectedCell}
        onSelectCell={setSelectedCell}
        selectedRegion={selectedRegion}
      />

      {/* 3. Collapsible Side Inspection Drawer */}
      <CellInspectionDrawer
        selectedCell={selectedCell}
        onClose={() => setSelectedCell(null)}
        onFocusPatrolRoute={(h3Index) => {
          // Focus or prioritize cell
          console.log("Focusing patrol route for cell:", h3Index);
        }}
      />

      {/* 4. Bottom Action / Dispatch Panel */}
      <PatrolDispatchPanel
        patrolCards={recommendations?.patrolCards || []}
        onDispatchSquad={handleDispatchSquad}
        dispatchedSquads={dispatchedSquads}
        tacticalActionPlan={recommendations?.tacticalActionPlan}
        selectedRegion={selectedRegion}
      />

      {/* 5. Modals */}
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
    </main>
  );
}
