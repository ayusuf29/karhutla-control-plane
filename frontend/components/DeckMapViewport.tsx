"use client";

import React, { useState, useMemo, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, BitmapLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { GeoJsonFeature, GeoJsonFeatureCollection, RiskCategory } from "@/types";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  MapPin,
  Layers,
  Globe,
  Satellite,
  Compass,
  Box,
  Eye,
  Sliders,
} from "lucide-react";

interface DeckMapViewportProps {
  geojsonData: GeoJsonFeatureCollection | null;
  selectedCell: GeoJsonFeature | null;
  onSelectCell: (cell: GeoJsonFeature | null) => void;
  selectedRegion: string;
}

export type BaseMapStyle = "DARK" | "SATELLITE" | "STREET" | "NONE";

interface BaseMapProvider {
  id: BaseMapStyle;
  label: string;
  icon: string;
  url: string;
  maxZoom: number;
  attribution: string;
}

const BASE_MAP_PROVIDERS: Record<BaseMapStyle, BaseMapProvider> = {
  SATELLITE: {
    id: "SATELLITE",
    label: "Citra Satelit",
    icon: "🛰️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
    attribution: "© ESRI World Imagery",
  },
  DARK: {
    id: "DARK",
    label: "Dark Taktis",
    icon: "🌑",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 16,
    attribution: "© ESRI Dark Canvas",
  },
  STREET: {
    id: "STREET",
    label: "Peta Wilayah",
    icon: "🗺️",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  },
  NONE: {
    id: "NONE",
    label: "Grid Obsidian",
    icon: "⬛",
    url: "",
    maxZoom: 19,
    attribution: "Mode Minimalis Vektor",
  },
};

const INITIAL_VIEW_STATE = {
  longitude: 111.8,
  latitude: -1.6,
  zoom: 6.8,
  pitch: 35,
  bearing: 0,
  maxZoom: 16,
  minZoom: 4,
};

const REGION_COORDINATES: Record<string, { longitude: number; latitude: number; zoom: number; pitch: number }> = {
  ALL: { longitude: 111.8, latitude: -1.6, zoom: 6.8, pitch: 35 },
  KUBU_RAYA: { longitude: 109.35, latitude: -0.28, zoom: 11.2, pitch: 42 },
  PULANG_PISAU: { longitude: 114.25, latitude: -2.75, zoom: 11.2, pitch: 42 },
};

// Tactical Risk RGBA mapping
const COLOR_MAPPING: Record<RiskCategory, [number, number, number, number]> = {
  EXTREME: [239, 68, 68, 230], // Crimson Red
  HIGH: [249, 115, 22, 210],    // Deep Orange
  MEDIUM: [245, 158, 11, 190],  // Amber Yellow
  LOW: [16, 185, 129, 170],     // Emerald Green
  UNKNOWN: [100, 116, 139, 120],// Slate
};

export default function DeckMapViewport({
  geojsonData,
  selectedCell,
  onSelectCell,
  selectedRegion,
}: DeckMapViewportProps) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    object: GeoJsonFeature | null;
  } | null>(null);

  const [activeFilter, setActiveFilter] = useState<RiskCategory | "ALL">("ALL");
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>("SATELLITE");
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [isTransparentHex, setIsTransparentHex] = useState<boolean>(true);
  const [isBasemapMenuOpen, setIsBasemapMenuOpen] = useState<boolean>(false);

  // Dynamic alpha for hexagons: when transparent, terrain underneath is clearly visible
  const hexAlpha = useMemo(() => {
    if (isTransparentHex) {
      return baseMapStyle === "SATELLITE" ? 150 : 180;
    }
    return 235;
  }, [isTransparentHex, baseMapStyle]);

  // Filter features based on active risk filter and region
  const filteredData = useMemo(() => {
    if (!geojsonData || !geojsonData.features) return null;

    let features = geojsonData.features;

    if (activeFilter !== "ALL") {
      features = features.filter((f) => f.properties.riskCategory === activeFilter);
    }

    if (selectedRegion === "KUBU_RAYA") {
      features = features.filter(
        (f) => f.properties.centroidLon && f.properties.centroidLon < 112.0
      );
    } else if (selectedRegion === "PULANG_PISAU") {
      features = features.filter(
        (f) => f.properties.centroidLon && f.properties.centroidLon >= 112.0
      );
    }

    return {
      ...geojsonData,
      features,
    };
  }, [geojsonData, activeFilter, selectedRegion]);

  // Handle region fly-to effect
  React.useEffect(() => {
    const target = REGION_COORDINATES[selectedRegion] || REGION_COORDINATES.ALL;
    setViewState((prev) => ({
      ...prev,
      ...target,
      transitionDuration: 1000,
    }));
  }, [selectedRegion]);

  // Deck.gl Layer Composition: Base Tile Layer + H3 Hexagon Layer
  const layers = useMemo(() => {
    const activeLayers: any[] = [];

    // 1. Geographic Base Map Raster Tile Layer
    if (baseMapStyle !== "NONE") {
      const provider = BASE_MAP_PROVIDERS[baseMapStyle];
      activeLayers.push(
        new TileLayer({
          id: `basemap-tile-layer-${baseMapStyle}`,
          data: provider.url,
          minZoom: 0,
          maxZoom: provider.maxZoom,
          tileSize: 256,
          renderSubLayers: (props: any) => {
            const { bbox } = props.tile;
            if (!bbox) return null;
            const { data, ...restProps } = props;
            return new BitmapLayer(restProps, {
              image: data,
              bounds: [bbox.west, bbox.south, bbox.east, bbox.north],
            });
          },
        })
      );
    }

    // 2. Spatial H3 Hexagonal Risk Extrusions
    if (filteredData) {
      activeLayers.push(
        new GeoJsonLayer({
          id: "h3-peat-hexagons",
          data: filteredData as any,
          filled: true,
          stroked: true,
          extruded: is3DMode,
          getElevation: (f: any) => {
            if (!is3DMode) return 0;
            const score = f.properties.riskScore || 0;
            return score * 450; // Dynamic 3D elevation based on fire risk probability
          },
          getFillColor: (f: any) => {
            const cat = (f.properties.riskCategory as RiskCategory) || "LOW";
            if (selectedCell && selectedCell.properties.h3Index === f.properties.h3Index) {
              return [56, 189, 248, 240]; // Selected highlight Cyan
            }
            const baseColor = COLOR_MAPPING[cat] || COLOR_MAPPING.LOW;
            return [baseColor[0], baseColor[1], baseColor[2], hexAlpha];
          },
          getLineColor: (f: any) => {
            if (selectedCell && selectedCell.properties.h3Index === f.properties.h3Index) {
              return [255, 255, 255, 255];
            }
            return [255, 255, 255, 60];
          },
          getLineWidth: 2,
          lineWidthUnits: "pixels",
          lineWidthMinPixels: 1,
          pickable: true,
          autoHighlight: true,
          highlightColor: [56, 189, 248, 120],
          onClick: (info: any) => {
            if (info.object) {
              onSelectCell(info.object as GeoJsonFeature);
            }
          },
          onHover: (info: any) => {
            if (info.object) {
              setHoverInfo({
                x: info.x,
                y: info.y,
                object: info.object as GeoJsonFeature,
              });
            } else {
              setHoverInfo(null);
            }
          },
          updateTriggers: {
            getFillColor: [selectedCell ? selectedCell.properties.h3Index : null, hexAlpha],
            getElevation: [filteredData, is3DMode],
          },
        })
      );
    }

    return activeLayers;
  }, [baseMapStyle, filteredData, selectedCell, onSelectCell, is3DMode, hexAlpha]);

  const handleZoomIn = useCallback(() => {
    setViewState((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 1, 15) }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewState((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 1, 4) }));
  }, []);

  const handleResetView = useCallback(() => {
    setViewState(INITIAL_VIEW_STATE);
  }, []);

  const currentProvider = BASE_MAP_PROVIDERS[baseMapStyle];

  return (
    <div className="relative w-full h-full bg-obsidian overflow-hidden">
      {/* Background Cartographic Grid (visible in NONE mode or under transparent tiles) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.08) 0%, transparent 60%),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />

      {/* Main Deck.GL Canvas */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: newViewState }: any) => setViewState(newViewState)}
        controller={{ dragPan: true, scrollZoom: true, doubleClickZoom: true }}
        layers={layers}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "default")}
      />

      {/* Interactive Tooltip on Hover */}
      {hoverInfo && hoverInfo.object && (
        <div
          className="pointer-events-none absolute z-50 px-3 py-2 rounded-lg bg-obsidian/95 border border-sentinel-border shadow-2xl backdrop-blur-md text-xs font-mono space-y-1 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-400">H3 RES 8</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                hoverInfo.object.properties.riskCategory === "EXTREME"
                  ? "bg-rose-500/20 text-rose-400"
                  : hoverInfo.object.properties.riskCategory === "HIGH"
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {hoverInfo.object.properties.riskCategory}
            </span>
          </div>
          <div className="font-bold text-slate-100">{hoverInfo.object.properties.h3Index}</div>
          <div className="text-slate-300 text-[11px] pt-1 border-t border-white/10 flex justify-between gap-3">
            <span>Probabilitas Api:</span>
            <span className="font-bold text-amber-400">
              {(hoverInfo.object.properties.riskScore * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-slate-300 text-[11px] flex justify-between gap-3">
            <span>Muka Air Gambut:</span>
            <span className="font-bold text-cyan-400">
              {hoverInfo.object.properties.gwlCm} cm
            </span>
          </div>
        </div>
      )}

      {/* Bottom-Left Tactical Legend & Layer Filters */}
      <div className="absolute bottom-6 left-6 z-20 hidden sm:flex flex-col gap-2 bg-obsidian-surface/90 backdrop-blur-md p-3 rounded-xl border border-sentinel-border shadow-xl">
        <div className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between gap-2">
          <span>Tingkat Risiko Bahaya Api</span>
          <span className="text-[9px] text-slate-500">Filter</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs font-mono">
          {(
            [
              { cat: "EXTREME", label: "Extreme Risk", count: "≥ 85%", color: "bg-hazard-extreme" },
              { cat: "HIGH", label: "High Risk", count: "60-84%", color: "bg-hazard-high" },
              { cat: "MEDIUM", label: "Medium Risk", count: "30-59%", color: "bg-hazard-medium" },
              { cat: "LOW", label: "Low Risk", count: "< 30%", color: "bg-hazard-low" },
            ] as const
          ).map((item) => (
            <button
              key={item.cat}
              onClick={() => setActiveFilter(activeFilter === item.cat ? "ALL" : item.cat)}
              className={`flex items-center justify-between gap-3 px-2 py-1 rounded transition-colors ${
                activeFilter === item.cat
                  ? "bg-white/10 border border-white/20 text-white"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm ${item.color} ${item.cat === "EXTREME" ? "animate-pulse" : ""}`} />
                <span>{item.label}</span>
              </div>
              <span className="text-[10px] text-slate-400">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top-Right Tactical Map Controls & Basemap Switcher */}
      <div className="absolute top-20 right-4 z-20 flex flex-col items-end gap-2">
        {/* Basemap Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setIsBasemapMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 bg-obsidian-surface/90 backdrop-blur-md border border-sentinel-border rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:border-sentinel-cyan/50 transition-all shadow-xl"
            title="Ganti Lapisan Peta Dasar"
          >
            <Layers className="w-4 h-4 text-sentinel-cyan" />
            <span className="font-mono text-[11px]">{currentProvider.icon} {currentProvider.label}</span>
          </button>

          {/* Basemap Options Popover */}
          {isBasemapMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-obsidian-surface/95 backdrop-blur-md border border-sentinel-border rounded-xl shadow-2xl p-2 z-30 flex flex-col gap-1 font-mono text-xs">
              <div className="px-2 py-1 text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/10 font-bold">
                Pilih Lapisan Peta
              </div>
              {(Object.keys(BASE_MAP_PROVIDERS) as BaseMapStyle[]).map((key) => {
                const prov = BASE_MAP_PROVIDERS[key];
                const isActive = baseMapStyle === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setBaseMapStyle(key);
                      setIsBasemapMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40 font-semibold"
                        : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{prov.icon}</span>
                      <span>{prov.label}</span>
                    </span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tactical Display Tools (3D Extrusion, Opacity, Zoom) */}
        <div className="flex flex-col gap-1.5 bg-obsidian-surface/90 backdrop-blur-md p-1.5 rounded-xl border border-sentinel-border shadow-xl">
          {/* 3D Extrusion Toggle */}
          <button
            onClick={() => setIs3DMode((prev) => !prev)}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              is3DMode
                ? "bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            }`}
            title={is3DMode ? "Mode 3D Elevasi Aktif" : "Mode 2D Datar Aktif"}
          >
            <Box className="w-4 h-4" />
          </button>

          {/* Hexagon Transparency Toggle */}
          <button
            onClick={() => setIsTransparentHex((prev) => !prev)}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              isTransparentHex
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            }`}
            title={isTransparentHex ? "Heksagon Semi-Transparan (Tekstur Peta Terlihat)" : "Heksagon Solid"}
          >
            <Eye className="w-4 h-4" />
          </button>

          <div className="h-px w-full bg-white/10 my-0.5" />

          {/* Navigation Zoom & Reset */}
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Perbesar Peta (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Perkecil Peta (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px w-full bg-white/10 my-0.5" />
          <button
            onClick={handleResetView}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Perspektif Kalimantan"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Map Source Attribution */}
      <div className="absolute bottom-2 right-4 z-10 pointer-events-none text-[9px] font-mono text-slate-500/80 bg-obsidian/60 px-2 py-0.5 rounded backdrop-blur-sm">
        {currentProvider.attribution} • H3 Spasial Resolusi 8
      </div>
    </div>
  );
}

