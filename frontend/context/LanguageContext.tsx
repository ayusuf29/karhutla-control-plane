"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "id" | "en";

export interface Translations {
  // Brand & Header
  brandTitle: string;
  brandTagline: string;
  pocBadge: string;
  regionAll: string;
  regionAllBadge: string;
  regionAllSubtitle: string;
  regionKalimantan: string;
  regionKalimantanBadge: string;
  regionKalimantanSubtitle: string;
  regionSumatera: string;
  regionSumateraBadge: string;
  regionSumateraSubtitle: string;
  regionKubuRaya: string;
  regionKubuRayaBadge: string;
  regionKubuRayaSubtitle: string;
  regionPulangPisau: string;
  regionPulangPisauBadge: string;
  regionPulangPisauSubtitle: string;
  regionDropdownTitle: string;
  searchDistrictPlaceholder: string;
  sectionMacro: string;
  sectionDistricts: string;
  noDistrictFound: string;
  metricCriticalExtreme: string;
  metricAvgGwl: string;
  metricSarAlerts: string;
  metricOmcTarget: string;
  btnEvaluating: string;
  btnSimulation: string;
  btnSimulationTooltip: string;
  langSwitchAria: string;

  // Map & Controls
  basemapLabel: string;
  basemapSatellite: string;
  basemapDark: string;
  basemapStreet: string;
  basemapGrid: string;
  toggle3dOn: string;
  toggle3dOff: string;
  toggleTransOn: string;
  toggleTransOff: string;
  filterTitle: string;
  filterExtreme: string;
  filterHigh: string;
  filterMedium: string;
  filterLow: string;
  filterAll: string;
  hoverCell: string;
  hoverRisk: string;
  hoverGwl: string;
  hoverPeatDepth: string;
  hoverCanalDist: string;
  hoverClickHint: string;

  // Patrol Dispatch Panel
  patrolTitle: string;
  patrolSolverBadge: string;
  patrolSelectTeam: string;
  patrolAllTeams: string;
  patrolTeamLabel: string;
  patrolObjective: string;
  patrolWaypoints: string;
  patrolPersonnel: string;
  patrolEquipments: string;
  patrolStatusDispatched: string;
  patrolStatusReady: string;
  patrolBtnDispatch: string;
  patrolBtnDispatching: string;
  patrolDispatchReceipt: string;
  patrolApprovedBy: string;
  patrolDaopsHeadquarters: string;

  // Google DeepMind Tactical Briefing
  deepmindSupervisorBadge: string;
  deepmindBriefingTitle: string;
  deepmindTacticalAction: string;
  deepmindFirebreakTarget: string;
  deepmindRewettingOrder: string;
  deepmindPersonnelAlloc: string;
  deepmindCanalDistance: string;

  // Cell Inspection Drawer
  drawerTitle: string;
  drawerCellIndex: string;
  drawerRiskScore: string;
  drawerGwlLabel: string;
  drawerGwlCritical: string;
  drawerGwlSafe: string;
  drawerPeatDepth: string;
  drawerFwi: string;
  drawerCanalDistance: string;
  drawerRoadDistance: string;
  drawerSarAnomaly: string;
  drawerSarDetected: string;
  drawerSarNormal: string;
  drawerTabOverview: string;
  drawerTab3D: string;
  drawerTabActions: string;
  drawerBtnPrioritize: string;
  drawerBtnClose: string;

  // OMC Modal
  omcModalTitle: string;
  omcModalSubtitle: string;
  omcColAircraft: string;
  omcColPayload: string;
  omcColTarget: string;
  omcColCloudCover: string;
  omcColAction: string;
  omcBtnLaunch: string;

  // SAR Modal
  sarModalTitle: string;
  sarModalSubtitle: string;
  sarColCell: string;
  sarColType: string;
  sarColConfidence: string;
  sarColDetectionDate: string;
  sarColAction: string;
  sarBtnInspect: string;
}

const translations: Record<Language, Translations> = {
  id: {
    // Brand & Header
    brandTitle: "Nusantara Fire Sentinel",
    brandTagline: "GCP-AMD HYBRID CONTROL PLANE",
    pocBadge: "LIVE",
    regionAll: "Semua Wilayah",
    regionAllBadge: "Nasional",
    regionAllSubtitle: "35,216 Heksagon Gambut Sumatera & Kalimantan",
    regionKalimantan: "Kalimantan (Kubah Gambut)",
    regionKalimantanBadge: "Borneo",
    regionKalimantanSubtitle: "11,551 Sel Gambut Kalbar, Kalteng & Kalsel",
    regionSumatera: "Sumatera (Kubah Gambut)",
    regionSumateraBadge: "Sumatera",
    regionSumateraSubtitle: "23,665 Sel Gambut Riau, Jambi & Sumsel",
    regionKubuRaya: "Kab. Kubu Raya",
    regionKubuRayaBadge: "Kalbar",
    regionKubuRayaSubtitle: "Posko Daops Pontianak",
    regionPulangPisau: "Kab. Pulang Pisau",
    regionPulangPisauBadge: "Kalteng",
    regionPulangPisauSubtitle: "Kubah Gambut Sebangau & Kahayan",
    regionDropdownTitle: "PILIH CAKUPAN WILAYAH GAMBUT",
    searchDistrictPlaceholder: "Cari kecamatan / kabupaten (175 kecamatan)...",
    sectionMacro: "CAKUPAN MAKRO & WILAYAH",
    sectionDistricts: "KECAMATAN PRIORITAS GAMBUT (175 KECAMATAN)",
    noDistrictFound: "Tidak ada kecamatan yang cocok",
    metricCriticalExtreme: "KRITIS EXTREME:",
    metricAvgGwl: "RATA GWL:",
    metricSarAlerts: "SAR ALERTS:",
    metricOmcTarget: "OMC TARGET:",
    btnEvaluating: "Mengevaluasi...",
    btnSimulation: "Simulasi Kemarau",
    btnSimulationTooltip: "Menjalankan simulasi kondisi cuaca kemarau ekstrem via Risk Assessor Agent & Python Worker",
    langSwitchAria: "Pilih Bahasa Sistem",

    // Map & Controls
    basemapLabel: "Peta Dasar",
    basemapSatellite: "Citra Satelit",
    basemapDark: "Dark Taktis",
    basemapStreet: "Peta Wilayah",
    basemapGrid: "Grid Obsidian",
    toggle3dOn: "3D Elevasi Aktif",
    toggle3dOff: "2D Datar",
    toggleTransOn: "Transparan",
    toggleTransOff: "Solid Hex",
    filterTitle: "TINGKAT RISIKO BAHAYA API",
    filterExtreme: "Extreme Risk",
    filterHigh: "High Risk",
    filterMedium: "Medium Risk",
    filterLow: "Low Risk",
    filterAll: "Semua Tingkat",
    hoverCell: "Sel H3",
    hoverRisk: "Indeks Risiko",
    hoverGwl: "Muka Air Tanah (GWL)",
    hoverPeatDepth: "Kedalaman Gambut",
    hoverCanalDist: "Jarak ke Kanal",
    hoverClickHint: "Klik sel untuk inspeksi taktis mendalam",

    // Patrol Dispatch Panel
    patrolTitle: "OPTIMALISASI RUTE PATROLI PRESKRIPTIF",
    patrolSolverBadge: "VRP SOLVER (OR-TOOLS)",
    patrolSelectTeam: "Pilih Regu Patroli Daops",
    patrolAllTeams: "Semua Regu Aktif",
    patrolTeamLabel: "Regu Patroli",
    patrolObjective: "Tujuan Utama Misi",
    patrolWaypoints: "Titik Singgah Kritis",
    patrolPersonnel: "Alokasi Personel",
    patrolEquipments: "Peralatan Taktis",
    patrolStatusDispatched: "TERKIRIM (OPERASIONAL)",
    patrolStatusReady: "SIAP DISPOSISI",
    patrolBtnDispatch: "Setujui & Luncurkan Tim Patroli",
    patrolBtnDispatching: "Mengirim Perintah Operasi...",
    patrolDispatchReceipt: "Disposisi Resmi Diterbitkan",
    patrolApprovedBy: "Disetujui Oleh:",
    patrolDaopsHeadquarters: "Komandan Daops Manggala Agni (Pusat Pengendali Operasi)",

    // Google DeepMind & AMD Instinct Tactical Briefing
    deepmindSupervisorBadge: "KOGNITIF SUPERVISOR AGENT • AMD INSTINCT CLOUD (TEAM 1348)",
    deepmindBriefingTitle: "Briefing Taktis Pemadaman Preskriptif",
    deepmindTacticalAction: "Instruksi Tindakan Lapangan:",
    deepmindFirebreakTarget: "Titik Penyekatan Api (Firebreak):",
    deepmindRewettingOrder: "Instruksi Pembasahan Kanal:",
    deepmindPersonnelAlloc: "Rekomendasi Personel & Pompa:",
    deepmindCanalDistance: "Jarak Kanal Terdekat:",

    // Cell Inspection Drawer
    drawerTitle: "Inspeksi Sel Taktis",
    drawerCellIndex: "Indeks Sel H3:",
    drawerRiskScore: "Probabilitas Risiko Karhutla",
    drawerGwlLabel: "Kedalaman Muka Air Tanah (GWL)",
    drawerGwlCritical: "KRITIS: Gambut Mengering di Bawah -40cm (Rentan Terbakar Dalam)",
    drawerGwlSafe: "AMAN: Gambut Cukup Terbasahi",
    drawerPeatDepth: "Kedalaman Gambut",
    drawerFwi: "Fire Weather Index (FWI)",
    drawerCanalDistance: "Jarak ke Sekat Kanal",
    drawerRoadDistance: "Jarak ke Akses Jalan",
    drawerSarAnomaly: "Deteksi SAR Sentinel-1",
    drawerSarDetected: "TERDETEKSI: Anomali Penurunan Backscatter VV/VH (Indikasi Land Clearing)",
    drawerSarNormal: "NORMAL: Tutupan Kanopi Stabil",
    drawerTabOverview: "Ikhtisar",
    drawerTab3D: "Profil 3D Gambut",
    drawerTabActions: "Aksi Pencegahan",
    drawerBtnPrioritize: "Prioritaskan Rute Patroli Daops",
    drawerBtnClose: "Tutup Panel",

    // OMC Modal
    omcModalTitle: "Operasi Modifikasi Cuaca (OMC) - Cloud Seeding",
    omcModalSubtitle: "Rekomendasi Penaburan Garam NaCl pada Awan Cumulus Congestus untuk Pembasahan Kubah Gambut Kritis",
    omcColAircraft: "Armada Pesawat",
    omcColPayload: "Muatan NaCl",
    omcColTarget: "Zona Target Penaburan",
    omcColCloudCover: "Potensi Awan",
    omcColAction: "Status Operasi",
    omcBtnLaunch: "Kirim Instruksi OMC ke Posko Udara",

    // SAR Modal
    sarModalTitle: "Deteksi Dini SAR Sentinel-1 (Anomali Pra-Karhutla)",
    sarModalSubtitle: "Analisis Polarimetrik Radar Backscatter (VV/VH) Mendeteksi Pembukaan Lahan Sebelum Muncul Titik Panas",
    sarColCell: "Indeks H3",
    sarColType: "Tipe Anomali",
    sarColConfidence: "Tingkat Keyakinan",
    sarColDetectionDate: "Waktu Lintasan Radar",
    sarColAction: "Aksi",
    sarBtnInspect: "Inspeksi Sel di Peta",
  },
  en: {
    // Brand & Header
    brandTitle: "Nusantara Fire Sentinel",
    brandTagline: "GCP-AMD HYBRID CONTROL PLANE • POSTGIS H3 RES 8",
    pocBadge: "LIVE",
    regionAll: "All Regions",
    regionAllBadge: "National",
    regionAllSubtitle: "35,216 Peat H3 Cells across Sumatra & Kalimantan",
    regionKalimantan: "Kalimantan (Peat Domes)",
    regionKalimantanBadge: "Borneo",
    regionKalimantanSubtitle: "11,551 Peat Cells across West, Central & South Kal",
    regionSumatera: "Sumatra (Peat Domes)",
    regionSumateraBadge: "Sumatra",
    regionSumateraSubtitle: "23,665 Peat Cells across Riau, Jambi & South Sumatra",
    regionKubuRaya: "Kubu Raya Regency",
    regionKubuRayaBadge: "West Kal",
    regionKubuRayaSubtitle: "Pontianak Daops Post",
    regionPulangPisau: "Pulang Pisau Regency",
    regionPulangPisauBadge: "Central Kal",
    regionPulangPisauSubtitle: "Sebangau & Kahayan Peat Domes",
    regionDropdownTitle: "SELECT PEATLAND COVERAGE",
    searchDistrictPlaceholder: "Search district / regency (175 districts)...",
    sectionMacro: "MACRO & REGIONAL COVERAGE",
    sectionDistricts: "PEATLAND PRIORITY DISTRICTS (175 DISTRICTS)",
    noDistrictFound: "No matching districts found",
    metricCriticalExtreme: "CRITICAL EXTREME:",
    metricAvgGwl: "AVG GWL:",
    metricSarAlerts: "SAR ALERTS:",
    metricOmcTarget: "OMC TARGET:",
    btnEvaluating: "Evaluating...",
    btnSimulation: "Drought Simulation",
    btnSimulationTooltip: "Simulate extreme drought weather conditions via Risk Assessor Agent & Python Worker",
    langSwitchAria: "Select System Language",

    // Map & Controls
    basemapLabel: "Base Map",
    basemapSatellite: "Satellite Imagery",
    basemapDark: "Tactical Dark",
    basemapStreet: "Street Map",
    basemapGrid: "Obsidian Grid",
    toggle3dOn: "3D Elevation Active",
    toggle3dOff: "2D Flat",
    toggleTransOn: "Transparent",
    toggleTransOff: "Solid Hex",
    filterTitle: "FIRE DANGER RISK LEVEL",
    filterExtreme: "Extreme Risk",
    filterHigh: "High Risk",
    filterMedium: "Medium Risk",
    filterLow: "Low Risk",
    filterAll: "All Levels",
    hoverCell: "H3 Cell",
    hoverRisk: "Risk Index",
    hoverGwl: "Ground Water Level (GWL)",
    hoverPeatDepth: "Peat Depth",
    hoverCanalDist: "Distance to Canal",
    hoverClickHint: "Click cell for deep tactical inspection",

    // Patrol Dispatch Panel
    patrolTitle: "PRESCRIPTIVE PATROL ROUTE OPTIMIZATION",
    patrolSolverBadge: "VRP SOLVER (OR-TOOLS)",
    patrolSelectTeam: "Select Daops Patrol Team",
    patrolAllTeams: "All Active Squads",
    patrolTeamLabel: "Patrol Squad",
    patrolObjective: "Primary Mission Objective",
    patrolWaypoints: "Critical Waypoints",
    patrolPersonnel: "Personnel Allocation",
    patrolEquipments: "Tactical Equipment",
    patrolStatusDispatched: "DISPATCHED (ACTIVE)",
    patrolStatusReady: "READY FOR DISPATCH",
    patrolBtnDispatch: "Approve & Dispatch Patrol Squad",
    patrolBtnDispatching: "Dispatching Order...",
    patrolDispatchReceipt: "Official Dispatch Order Issued",
    patrolApprovedBy: "Approved By:",
    patrolDaopsHeadquarters: "Manggala Agni Daops Commander (Mission Command Center)",

    // Google DeepMind & AMD Instinct Tactical Briefing
    deepmindSupervisorBadge: "COGNITIVE SUPERVISOR AGENT • AMD INSTINCT CLOUD (TEAM 1348)",
    deepmindBriefingTitle: "Prescriptive Tactical Suppression Briefing",
    deepmindTacticalAction: "Field Tactical Instructions:",
    deepmindFirebreakTarget: "Firebreak Barrier Coordinates:",
    deepmindRewettingOrder: "Canal Rewetting & Flooding Order:",
    deepmindPersonnelAlloc: "Squad & Floating Pump Recommendation:",
    deepmindCanalDistance: "Nearest Canal Distance:",

    // Cell Inspection Drawer
    drawerTitle: "Tactical Cell Inspection",
    drawerCellIndex: "H3 Cell Index:",
    drawerRiskScore: "Karhutla Probability Risk Score",
    drawerGwlLabel: "Ground Water Level (GWL)",
    drawerGwlCritical: "CRITICAL: Peat Drying Below -40cm (Severe Underground Fire Risk)",
    drawerGwlSafe: "SAFE: Peat Well Hydrated",
    drawerPeatDepth: "Peat Depth",
    drawerFwi: "Fire Weather Index (FWI)",
    drawerCanalDistance: "Distance to Canal Block",
    drawerRoadDistance: "Distance to Road Access",
    drawerSarAnomaly: "Sentinel-1 SAR Detection",
    drawerSarDetected: "DETECTED: VV/VH Backscatter Drop Anomaly (Indicates Land Clearing)",
    drawerSarNormal: "NORMAL: Canopy Cover Stable",
    drawerTabOverview: "Overview",
    drawerTab3D: "3D Peat Profile",
    drawerTabActions: "Preventive Action",
    drawerBtnPrioritize: "Prioritize Daops Patrol Route",
    drawerBtnClose: "Close Panel",

    // OMC Modal
    omcModalTitle: "Weather Modification Operations (OMC) - Cloud Seeding",
    omcModalSubtitle: "NaCl Cloud Seeding on Cumulus Congestus Formations for Critical Peat Dome Rewetting",
    omcColAircraft: "Aircraft Fleet",
    omcColPayload: "NaCl Payload",
    omcColTarget: "Target Seeding Zone",
    omcColCloudCover: "Potential Cloud Cover",
    omcColAction: "Operation Status",
    omcBtnLaunch: "Transmit OMC Flight Orders to Air Command",

    // SAR Modal
    sarModalTitle: "Sentinel-1 SAR Early Warning (Pre-Burn Anomaly)",
    sarModalSubtitle: "Polarimetric Radar Backscatter (VV/VH) Analysis Detecting Land Clearing Before Ignition Hotspots",
    sarColCell: "H3 Index",
    sarColType: "Anomaly Type",
    sarColConfidence: "Confidence Level",
    sarColDetectionDate: "Radar Acquisition Timestamp",
    sarColAction: "Action",
    sarBtnInspect: "Inspect Cell on Map",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "id",
  setLanguage: () => { },
  t: translations.id,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sentinel_lang") as Language;
      if (saved && (saved === "id" || saved === "en")) {
        setLanguageState(saved);
      }
    } catch {
      // localStorage unavailable during SSR
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("sentinel_lang", lang);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
