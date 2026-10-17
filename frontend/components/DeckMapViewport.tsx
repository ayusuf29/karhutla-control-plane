"use client";

import React, { useState, useMemo, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, BitmapLayer } from "@deck.gl/layers";
import { TileLayer } from "@deck.gl/geo-layers";
import { GeoJsonFeature, GeoJsonFeatureCollection, RiskCategory, DistrictHierarchyItem } from "@/types";
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
import { useTranslation } from "@/context/LanguageContext";

interface DeckMapViewportProps {
  geojsonData: GeoJsonFeatureCollection | null;
  selectedCell: GeoJsonFeature | null;
  onSelectCell: (cell: GeoJsonFeature | null) => void;
  selectedRegion: string;
}

export type BaseMapStyle = "DARK" | "SATELLITE" | "STREET" | "NONE";

interface BaseMapProvider {
  id: BaseMapStyle;
  labelKey: "basemapSatellite" | "basemapDark" | "basemapStreet" | "basemapGrid";
  icon: string;
  url: string;
  maxZoom: number;
  attribution: string;
}

const BASE_MAP_PROVIDERS: Record<BaseMapStyle, BaseMapProvider> = {
  SATELLITE: {
    id: "SATELLITE",
    labelKey: "basemapSatellite",
    icon: "🛰️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 19,
    attribution: "© ESRI World Imagery",
  },
  DARK: {
    id: "DARK",
    labelKey: "basemapDark",
    icon: "🌑",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    maxZoom: 16,
    attribution: "© ESRI Dark Canvas",
  },
  STREET: {
    id: "STREET",
    labelKey: "basemapStreet",
    icon: "🗺️",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 19,
    attribution: "© OpenStreetMap",
  },
  NONE: {
    id: "NONE",
    labelKey: "basemapGrid",
    icon: "⬛",
    url: "",
    maxZoom: 19,
    attribution: "Vector Grid Minimalist",
  },
};

const INITIAL_VIEW_STATE = {
  longitude: 108.0,
  latitude: -0.8,
  zoom: 5.4,
  pitch: 30,
  bearing: 0,
  maxZoom: 16,
  minZoom: 4,
};

const REGION_COORDINATES: Record<string, { longitude: number; latitude: number; zoom: number; pitch: number }> = {
  ALL: { longitude: 108.0, latitude: -0.8, zoom: 5.4, pitch: 30 },
  KALIMANTAN: { longitude: 112.5, latitude: -1.5, zoom: 6.8, pitch: 35 },
  KUBU_RAYA: { longitude: 109.35, latitude: -0.28, zoom: 11.2, pitch: 42 },
  PULANG_PISAU: { longitude: 114.25, latitude: -2.75, zoom: 11.2, pitch: 42 },
  SUMATERA: { longitude: 102.5, latitude: 0.5, zoom: 6.6, pitch: 35 },
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
  const { t, language } = useTranslation();
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
  const [districtsCatalog, setDistrictsCatalog] = useState<Record<string, DistrictHierarchyItem>>({});

  // Load district catalog for camera transitions and bounding boxes
  React.useEffect(() => {
    fetch("/data/district_hierarchy.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.districts)) {
          const map: Record<string, DistrictHierarchyItem> = {};
          data.districts.forEach((d: DistrictHierarchyItem) => {
            map[d.id] = d;
            map[d.district] = d;
          });
          setDistrictsCatalog(map);
        }
      })
      .catch((err) => console.warn("DeckMapViewport failed to load districts:", err));
  }, []);

  // Dynamic alpha for hexagons
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

    if (selectedRegion === "KALIMANTAN") {
      features = features.filter((f) => f.properties.centroidLon && f.properties.centroidLon >= 108.0);
    } else if (selectedRegion === "SUMATERA") {
      features = features.filter((f) => f.properties.centroidLon && f.properties.centroidLon < 108.0);
    } else if (selectedRegion === "KUBU_RAYA") {
      features = features.filter(
        (f) =>
          f.properties.regency === "Kubu Raya" ||
          (f.properties.centroidLon &&
            f.properties.centroidLon >= 108.5 &&
            f.properties.centroidLon <= 111.0 &&
            f.properties.centroidLat &&
            f.properties.centroidLat >= -1.2 &&
            f.properties.centroidLat <= 0.8)
      );
    } else if (selectedRegion === "PULANG_PISAU") {
      features = features.filter(
        (f) =>
          f.properties.regency === "Pulang Pisau" ||
          (f.properties.centroidLon &&
            f.properties.centroidLon >= 113.0 &&
            f.properties.centroidLon <= 115.8 &&
            f.properties.centroidLat &&
            f.properties.centroidLat >= -3.8 &&
            f.properties.centroidLat <= -1.8)
      );
    } else if (selectedRegion && selectedRegion !== "ALL") {
      const distInfo = districtsCatalog[selectedRegion];
      const distName = distInfo
        ? distInfo.district
        : selectedRegion.includes("::")
        ? selectedRegion.split("::")[2]
        : selectedRegion;

      features = features.filter((f) => {
        if (f.properties.district && f.properties.district.toLowerCase() === distName.toLowerCase()) {
          return true;
        }
        if (distInfo && distInfo.bounds && f.properties.centroidLon && f.properties.centroidLat) {
          const [minX, minY, maxX, maxY] = distInfo.bounds;
          return (
            f.properties.centroidLon >= minX - 0.03 &&
            f.properties.centroidLon <= maxX + 0.03 &&
            f.properties.centroidLat >= minY - 0.03 &&
            f.properties.centroidLat <= maxY + 0.03
          );
        }
        return false;
      });
    }

    return {
      ...geojsonData,
      features,
    };
  }, [geojsonData, activeFilter, selectedRegion, districtsCatalog]);

  // Handle region fly-to effect
  React.useEffect(() => {
    let target = REGION_COORDINATES[selectedRegion];
    if (!target) {
      const distInfo = districtsCatalog[selectedRegion];
      if (distInfo && distInfo.center) {
        target = {
          longitude: distInfo.center[0],
          latitude: distInfo.center[1],
          zoom: 11.6,
          pitch: 38,
        };
      } else {
        target = REGION_COORDINATES.ALL;
      }
    }
    setViewState((prev) => ({
      ...prev,
      ...target,
      transitionDuration: 1000,
    }));
  }, [selectedRegion, districtsCatalog]);

  // Deck.gl Layer Composition
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
              image: props.data,
              bounds: [bbox.west, bbox.south, bbox.east, bbox.north],
            });
          },
        })
      );
    }

    // 2. High-Performance H3 Hexagon GeoJSON Layer
    if (filteredData) {
      activeLayers.push(
        new GeoJsonLayer({
          id: "karhutla-h3-risk-layer",
          data: filteredData as any,
          pickable: true,
          stroked: true,
          filled: true,
          extruded: is3DMode,
          wireframe: false,
          lineWidthMinPixels: 1,

          // Elevation based on Fire Risk Probability (0.0 to 1.0) * Height Scale
          getElevation: (f: any) => {
            if (!is3DMode) return 0;
            const score = f.properties.riskScore || 0;
            const baseElev = Math.pow(score, 1.8) * 1400;
            return Math.max(baseElev, 60);
          },

          // Dynamic RGBA fill color with alpha transparency
          getFillColor: (f: any) => {
            const category: RiskCategory = f.properties.riskCategory || "UNKNOWN";
            const baseColor = COLOR_MAPPING[category] || COLOR_MAPPING.UNKNOWN;

            // Highlight selected cell
            if (selectedCell && selectedCell.properties.h3Index === f.properties.h3Index) {
              return [0, 240, 255, 240];
            }

            return [baseColor[0], baseColor[1], baseColor[2], hexAlpha];
          },

          // Tactical Line Border Color
          getLineColor: (f: any) => {
            if (selectedCell && selectedCell.properties.h3Index === f.properties.h3Index) {
              return [0, 240, 255, 255]; // Cyan neon glow for selection
            }
            if (f.properties.riskCategory === "EXTREME") {
              return [255, 100, 100, 200];
            }
            return [255, 255, 255, 40];
          },

          getLineWidth: (f: any) => {
            if (selectedCell && selectedCell.properties.h3Index === f.properties.h3Index) {
              return 3;
            }
            return 1;
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

          onClick: (info: any) => {
            if (info.object) {
              onSelectCell(info.object as GeoJsonFeature);
            } else {
              onSelectCell(null);
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
      {/* Background Cartographic Grid */}
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
            <span>{t.hoverRisk}:</span>
            <span className="font-bold text-amber-400">
              {(hoverInfo.object.properties.riskScore * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-slate-300 text-[11px] flex justify-between gap-3">
            <span>{t.hoverGwl}:</span>
            <span className="font-bold text-cyan-400">
              {hoverInfo.object.properties.gwlCm} cm
            </span>
          </div>
          <div className="text-[10px] text-slate-400 italic pt-0.5">
            {t.hoverClickHint}
          </div>
        </div>
      )}

      {/* Bottom-Left Tactical Legend & Layer Filters */}
      <div className="absolute bottom-6 left-6 z-20 hidden sm:flex flex-col gap-2 bg-obsidian-surface/90 backdrop-blur-md p-3 rounded-xl border border-sentinel-border shadow-xl">
        <div className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between gap-2">
          <span>{t.filterTitle}</span>
          <span className="text-[9px] text-slate-500">Filter</span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs font-mono">
          {[
            { cat: "EXTREME" as const, label: t.filterExtreme, count: "≥ 85%", color: "bg-hazard-extreme" },
            { cat: "HIGH" as const, label: t.filterHigh, count: "60-84%", color: "bg-hazard-high" },
            { cat: "MEDIUM" as const, label: t.filterMedium, count: "30-59%", color: "bg-hazard-medium" },
            { cat: "LOW" as const, label: t.filterLow, count: "< 30%", color: "bg-hazard-low" },
          ].map((item) => (
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
            title={t.basemapLabel}
          >
            <Layers className="w-4 h-4 text-sentinel-cyan" />
            <span className="font-mono text-[11px]">{currentProvider.icon} {t[currentProvider.labelKey]}</span>
          </button>

          {/* Basemap Options Popover */}
          {isBasemapMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-obsidian-surface/95 backdrop-blur-md border border-sentinel-border rounded-xl shadow-2xl p-2 z-30 flex flex-col gap-1 font-mono text-xs">
              <div className="px-2 py-1 text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/10 font-bold">
                {t.basemapLabel}
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
                      <span>{t[prov.labelKey]}</span>
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
            title={is3DMode ? t.toggle3dOn : t.toggle3dOff}
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
            title={isTransparentHex ? t.toggleTransOn : t.toggleTransOff}
          >
            <Eye className="w-4 h-4" />
          </button>

          <div className="h-px w-full bg-white/10 my-0.5" />

          {/* Navigation Zoom & Reset */}
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px w-full bg-white/10 my-0.5" />
          <button
            onClick={handleResetView}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Kalimantan Perspective"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Map Source Attribution */}
      <div className="absolute bottom-2 right-4 z-10 pointer-events-none text-[9px] font-mono text-slate-500/80 bg-obsidian/60 px-2 py-0.5 rounded backdrop-blur-sm">
        {currentProvider.attribution} • H3 Spatial Res 8
      </div>
    </div>
  );
}
