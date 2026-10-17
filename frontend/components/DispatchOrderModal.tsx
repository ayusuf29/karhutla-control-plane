"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  Users,
  Wrench,
  FileText,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
} from "lucide-react";
import { PatrolCard, DispatchResponse, TacticalActionPlan } from "@/types";
import { useTranslation } from "@/context/LanguageContext";

interface DispatchOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  squad: PatrolCard | null;
  receipt: DispatchResponse | null;
  allSquads: PatrolCard[];
  dispatchedSquads: Record<string, DispatchResponse>;
  tacticalActionPlan?: TacticalActionPlan;
}

export default function DispatchOrderModal({
  isOpen,
  onClose,
  squad,
  receipt,
  allSquads,
  dispatchedSquads,
  tacticalActionPlan,
}: DispatchOrderModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"DOCUMENT" | "FLEET">("DOCUMENT");

  if (!isOpen || !squad) return null;

  const currentReceipt = receipt || dispatchedSquads[squad.squadId];
  const dispatchId = currentReceipt ? currentReceipt.dispatchId : "DSP-DRAFT";
  const approvedBy = currentReceipt ? currentReceipt.approvedBy : "Komandan Daops Manggala Agni (Pusat Pengendali Operasi)";
  const dispatchDate = currentReceipt?.approvedAt
    ? new Date(currentReceipt.approvedAt).toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "medium",
      })
    : new Date().toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "medium",
      });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-obsidian-surface border border-sentinel-border rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 print:border-none print:shadow-none print:my-0 print:bg-white print:text-black">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-4 border-b border-sentinel-border bg-obsidian/80 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                Surat Perintah Tugas Operasi Patroli
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {dispatchId}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Pusat Pengendalian Operasi Karhutla • Kementerian LHK
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center bg-obsidian p-1 rounded-lg border border-white/5 mr-2 text-xs font-mono">
              <button
                onClick={() => setActiveTab("DOCUMENT")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "DOCUMENT"
                    ? "bg-sentinel-cyan/20 text-sentinel-cyan font-semibold border border-sentinel-cyan/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📄 Surat Tugas (SPT)
              </button>
              <button
                onClick={() => setActiveTab("FLEET")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "FLEET"
                    ? "bg-sentinel-cyan/20 text-sentinel-cyan font-semibold border border-sentinel-cyan/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                📡 Monitoring Regu ({Object.keys(dispatchedSquads).length}/{allSquads.length})
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Document View */}
        {activeTab === "DOCUMENT" ? (
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[80vh] print:max-h-none print:overflow-visible print:p-8 text-slate-200 print:text-black">
            {/* Official Header (Kop Dokumen Resmi) */}
            <div className="text-center pb-4 border-b-2 border-slate-300 print:border-black space-y-1">
              <div className="font-serif tracking-widest text-xs uppercase text-slate-400 print:text-slate-700 font-bold">
                KEMENTERIAN LINGKUNGAN HIDUP DAN KEHUTANAN REPUBLIK INDONESIA
              </div>
              <div className="font-serif font-black text-sm md:text-base tracking-wider text-slate-100 print:text-black uppercase">
                DIREKTORAT PENGENDALIAN KEBAKARAN HUTAN DAN LAHAN • BRIGADE PENGENDALIAN KEBAKARAN HUTAN (MANGGALA AGNI)
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600 font-mono">
                SISTEM KOMANDO NUSANTARA FIRE SENTINEL • INTEGRASI GCP-AMD CLOUD-EDGE HYBRID
              </div>
              <div className="pt-2">
                <span className="font-bold underline text-sm uppercase tracking-wide text-amber-400 print:text-black">
                  SURAT PERINTAH TUGAS OPERASI PATROLI PRESKRIPTIF
                </span>
                <div className="text-[11px] font-mono text-slate-400 print:text-slate-700">
                  Nomor: {dispatchId} / SPT-MANGGALA-AGNI / {new Date().getFullYear()}
                </div>
              </div>
            </div>

            {/* Directive Legal Context */}
            <div className="bg-obsidian/60 print:bg-slate-100 p-4 rounded-xl border border-sentinel-border print:border-slate-300 text-xs space-y-1.5">
              <div className="font-semibold text-slate-200 print:text-black flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
                DASAR HUKUM DAN PERINTAH OPERASIONAL:
              </div>
              <p className="text-slate-300 print:text-slate-700 text-[11px] leading-relaxed">
                Menindaklanjuti telemetri peringatan dini penurunan Tinggi Muka Air Tanah Gambut (GWL &lt; -40 cm sesuai Peraturan Pemerintah No. 57 Tahun 2016) serta hasil optimasi rute matematis VRP (Vehicle Routing Problem), Komandan memerintahkan regu berikut untuk melaksanakan operasi patroli preskriptif, pembasahan sekat kanal, dan penindakan dini.
              </p>
            </div>

            {/* Squad & Deployment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-obsidian/40 print:bg-slate-50 border border-sentinel-border print:border-slate-300 space-y-2">
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  UNIT PELAKSANA TUGAS:
                </div>
                <div className="font-bold text-sm text-slate-100 print:text-black flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sentinel-cyan print:text-blue-700" />
                  {squad.squadName}
                </div>
                <div className="text-slate-300 print:text-slate-700">
                  Wilayah Posko Daops: <span className="font-semibold">{squad.daopsName || squad.regionName}</span>
                </div>
                {squad.commanderName && (
                  <div className="text-slate-300 print:text-slate-700">
                    Komandan Lapangan: <span className="font-semibold text-emerald-400 print:text-black">{squad.commanderName}</span> ({squad.personnelCount || 30} Personel) • Radio: <span className="font-mono text-amber-400 print:text-black font-semibold">{squad.radioFrequency || "146.500 MHz"}</span>
                  </div>
                )}
                <div className="text-slate-400 print:text-slate-600 text-[11px]">
                  Fokus Misi: {squad.primaryObjective}
                </div>
                <div className="pt-2 border-t border-white/5 print:border-slate-200 flex items-center gap-4 text-[11px] font-mono">
                  <span>Jarak Tempuh: <strong className="text-amber-400 print:text-black">{squad.estimatedTotalDistanceKm} km</strong></span>
                  <span>Estimasi: <strong className="text-sentinel-cyan print:text-black">{squad.estimatedDurationHours} jam</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-obsidian/40 print:bg-slate-50 border border-sentinel-border print:border-slate-300 space-y-2">
                <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  KOMPOSISI PERSONEL & PERALATAN WAJIB:
                </div>
                <div className="flex items-center gap-2 text-slate-200 print:text-black font-semibold">
                  <Users className="w-4 h-4 text-amber-400 print:text-amber-700" />
                  1 Regu Inti Daops (6 Personel) + 4 Relawan MPA Desa
                </div>
                <div className="space-y-1 text-[11px] text-slate-300 print:text-slate-700">
                  <div>• 1 Unit Kendaraan Taktis Double Cabin 4x4 (No. Lambung MA-04)</div>
                  <div>• 1 Mesin Pompa Apung Honda WT20X (High Head Multi-Stage)</div>
                  <div>• 300 Meter Selang Kanvas 1.5 Inch & 2 Nozzle Peat Injector</div>
                  <div>• 1 Alat Ukur Muka Air Tanah (Peat Ruler) & GPS Garmin</div>
                </div>
              </div>
            </div>

            {/* Waypoints Target Table */}
            <div className="space-y-2">
              <div className="font-mono text-[11px] text-slate-400 print:text-slate-700 uppercase tracking-wider font-bold flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                TITIK SASARAN INSPEKSI TEROPTIMASI (RUTE VRP SOLVER):
              </div>
              <div className="overflow-x-auto rounded-lg border border-sentinel-border print:border-slate-300">
                <table className="w-full text-left text-xs">
                  <thead className="bg-obsidian/80 print:bg-slate-200 text-slate-400 print:text-black font-mono text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Urutan</th>
                      <th className="py-2 px-3">H3 Index</th>
                      <th className="py-2 px-3">Koordinat (Lat, Lon)</th>
                      <th className="py-2 px-3">Tingkat Risiko</th>
                      <th className="py-2 px-3">Tindakan Lapangan Wajib</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-slate-200 text-[11px] font-mono">
                    {squad.waypoints.map((wp) => (
                      <tr key={wp.h3Index} className="hover:bg-white/5 print:hover:bg-transparent">
                        <td className="py-2 px-3 font-bold text-sentinel-cyan print:text-black">
                          Titik #{wp.sequence}
                        </td>
                        <td className="py-2 px-3 text-slate-200 print:text-black font-semibold">
                          {wp.h3Index}
                        </td>
                        <td className="py-2 px-3 text-slate-400 print:text-slate-700">
                          {wp.latitude.toFixed(4)}, {wp.longitude.toFixed(4)}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                              wp.riskCategory === "EXTREME"
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                            }`}
                          >
                            {wp.riskCategory}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-300 print:text-slate-800 font-sans">
                          {wp.riskCategory === "EXTREME"
                            ? "Pembuatan parit sekat api 3-4m & aktivasi pembasahan pipa gambut"
                            : "Pengukuran GWL, inspeksi pintu sekat kanal & patroli sosialisasi warga"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tactical Supervisor Special Directive */}
            {tacticalActionPlan && (
              <div className="p-3.5 rounded-xl bg-purple-950/20 print:bg-slate-100 border border-purple-500/30 print:border-slate-300 text-xs space-y-1">
                <div className="font-semibold text-purple-300 print:text-purple-900 flex items-center gap-1.5 text-[11px]">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  INSTRUKSI TAKTIS KHUSUS GOOGLE DEEPMIND SUPERVISOR:
                </div>
                <p className="text-slate-300 print:text-slate-700 text-[11px] leading-relaxed">
                  {tacticalActionPlan.situationAssessment || tacticalActionPlan.executiveSummary}
                </p>
              </div>
            )}

            {/* Official Signatures (Kolom Tanda Tangan Resmi) */}
            <div className="pt-6 border-t-2 border-slate-300 print:border-black grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-12">
                <div className="text-slate-400 print:text-slate-700">
                  Diterima oleh Komandan Regu Lapangan,
                </div>
                <div>
                  <div className="font-bold underline text-slate-100 print:text-black uppercase">
                    ( KEPALA REGU DAOPS )
                  </div>
                  <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono">
                    NIP. 19850412 201001 1 008
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  <div className="text-slate-400 print:text-slate-700">
                    Ditetapkan di Pos Komando Utama, {dispatchDate.split(" pukul ")[0]}
                  </div>
                  <div className="font-bold text-slate-200 print:text-black">
                    Pemberi Perintah Operasi,
                  </div>
                </div>
                <div>
                  <div className="font-bold underline text-slate-100 print:text-black uppercase">
                    {approvedBy}
                  </div>
                  <div className="text-[10px] text-slate-400 print:text-slate-600 font-mono">
                    NIP. 19780824 200312 1 002
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Modal Body: Fleet Monitoring View */
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[80vh] text-xs">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                Pusat Monitoring Status Operasional Seluruh Regu Lapangan
              </h3>
              <p className="text-slate-400 text-xs">
                Status disposisi real-time seluruh unit Daops Manggala Agni di Kalimantan & Sumatera.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allSquads.map((s) => {
                const rec = dispatchedSquads[s.squadId];
                const isDispatched = !!rec;
                return (
                  <div
                    key={s.squadId}
                    className={`p-4 rounded-xl border transition-all ${
                      isDispatched
                        ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg"
                        : "bg-obsidian/40 border-sentinel-border"
                    } space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <Truck
                          className={`w-4 h-4 ${
                            isDispatched ? "text-emerald-400" : "text-slate-500"
                          }`}
                        />
                        {s.squadName}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          isDispatched
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {isDispatched ? "AKTIF BERTUGAS" : "STANDBY DI POSKO"}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-300 text-[11px]">
                      <div>
                        Wilayah: <strong className="text-slate-100">{s.regionName}</strong>
                      </div>
                      <div>
                        Rute Teroptimasi: <strong>{s.estimatedTotalDistanceKm ?? 0} km</strong> ({s.estimatedDurationHours ?? 0} Jam Operasi)
                      </div>
                      <div>
                        Target Sel H3: {s.waypoints.map((w) => w.h3Index.substring(0, 8)).join(", ")}
                      </div>
                    </div>

                    {isDispatched && rec && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] space-y-1 text-emerald-200">
                        <div className="flex items-center justify-between font-mono">
                          <span>Kode Disposisi: <strong>{rec.dispatchId}</strong></span>
                          <span>{rec.operationalStatus}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Disahkan oleh: {rec.approvedBy}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Footer (Hidden during print) */}
        <div className="p-4 border-t border-sentinel-border bg-obsidian/60 flex items-center justify-between print:hidden">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Audit Trail Tersimpan Otomatis di PostgreSQL PostGIS
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
