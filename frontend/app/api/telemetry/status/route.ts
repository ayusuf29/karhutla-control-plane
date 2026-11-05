import { NextResponse } from "next/server";

// Fallback in-memory or persisted date state
let inMemoryLastFetchedDate = "2026-10-14";

const BACKEND_BASE_URL = process.env.INTERNAL_BACKEND_URL || "http://localhost:7080";

export async function GET() {
  const todayDate = new Date().toISOString().split("T")[0]; // "2026-10-30"

  // 1. Try to query backend
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/telemetry/status`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      inMemoryLastFetchedDate = data.lastFetchedDate;
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline or unreachable, proceed with in-memory state
  }

  const isUpToDate = todayDate === inMemoryLastFetchedDate;

  return NextResponse.json({
    lastFetchedDate: inMemoryLastFetchedDate,
    todayDate: todayDate,
    isUpToDate: isUpToDate,
    totalHexagons: 35216,
  });
}
