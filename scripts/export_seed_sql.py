"""
export_seed_sql.py
Generates a gzipped SQL seed file (seed_nationwide_124k.sql.gz) from latest_risk_snapshot_2026.parquet.
This file can be directly piped into PostGIS on GCP:
  zcat seed_nationwide_124k.sql.gz | docker exec -i sentinel-postgres-local psql -U postgres -d fire_sentinel_db
"""

import gzip
import os
import pandas as pd

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
PARQUET_PATH = os.path.join(BASE_DIR, "data", "processed", "latest_risk_snapshot_2026.parquet")
OUT_GZ = os.path.join(os.path.dirname(__file__), "seed_nationwide_124k.sql.gz")

def main():
    if not os.path.exists(PARQUET_PATH):
        print(f"Error: Snapshot parquet not found at {PARQUET_PATH}")
        return

    print(f"Reading snapshot: {PARQUET_PATH}")
    df = pd.read_parquet(PARQUET_PATH)
    print(f"Loaded {len(df)} records.")

    snapshot_date = "2026-10-30"

    print(f"Writing compressed SQL to {OUT_GZ}...")
    with gzip.open(OUT_GZ, "wt", encoding="utf-8") as f:
        f.write("BEGIN;\n\n")
        f.write("-- 1. Insert/Update peat_h3_grid\n")
        
        chunk_size = 2000
        for i in range(0, len(df), chunk_size):
            chunk = df.iloc[i : i + chunk_size]
            vals = []
            for _, r in chunk.iterrows():
                h3_idx = str(r["h3_index"])
                geom_wkt = str(r["geom_wkt"])
                cent_wkt = str(r["centroid_wkt"])
                p_depth = float(r["peat_depth_meters"])
                d_canal = float(r["distance_to_canal_meters"])
                d_road = float(r["distance_to_road_meters"])
                conc = str(r.get("concession_id", "COMMUNITY")).replace("'", "''")
                prov = str(r.get("province_name", "UNKNOWN")).replace("'", "''")
                reg = str(r.get("regency_name", "UNKNOWN")).replace("'", "''")
                dist = str(r.get("district_name", "UNKNOWN")).replace("'", "''")

                row_str = f"('{h3_idx}', 8, ST_GeomFromText('{geom_wkt}', 4326), ST_GeomFromText('{cent_wkt}', 4326), {p_depth}, {d_canal}, {d_road}, '{conc}', '{prov}', '{reg}', '{dist}')"
                vals.append(row_str)

            sql_chunk = (
                "INSERT INTO peat_h3_grid (h3_index, resolution, geom, centroid, peat_depth_meters, distance_to_canal_meters, distance_to_road_meters, concession_id, province_name, regency_name, district_name) VALUES\n"
                + ",\n".join(vals)
                + "\nON CONFLICT (h3_index) DO UPDATE SET "
                "peat_depth_meters = EXCLUDED.peat_depth_meters, "
                "distance_to_canal_meters = EXCLUDED.distance_to_canal_meters, "
                "distance_to_road_meters = EXCLUDED.distance_to_road_meters, "
                "province_name = EXCLUDED.province_name, "
                "regency_name = EXCLUDED.regency_name, "
                "district_name = EXCLUDED.district_name;\n\n"
            )
            f.write(sql_chunk)

        f.write("-- 2. Insert/Update h3_daily_risk_snapshot\n")
        for i in range(0, len(df), chunk_size):
            chunk = df.iloc[i : i + chunk_size]
            vals = []
            for _, r in chunk.iterrows():
                h3_idx = str(r["h3_index"])
                gwl = float(r["gwl_cm"])
                dwr = int(r["days_without_rain"])
                vpd = float(r["vpd_kpa"])
                sar = "TRUE" if bool(r["sar_clearing_detected"]) else "FALSE"
                risk = float(r["ignition_risk_score"])
                cat = str(r["risk_category"])
                act = str(r["recommended_action"])

                row_str = f"('{h3_idx}', '{snapshot_date}', {gwl}, {dwr}, {vpd}, {sar}, {risk}, '{cat}', '{act}')"
                vals.append(row_str)

            sql_chunk = (
                "INSERT INTO h3_daily_risk_snapshot (h3_index, snapshot_date, gwl_cm, days_without_rain, vpd_kpa, sar_clearing_detected, ignition_risk_score, risk_category, recommended_action) VALUES\n"
                + ",\n".join(vals)
                + "\nON CONFLICT (h3_index, snapshot_date) DO UPDATE SET "
                "gwl_cm = EXCLUDED.gwl_cm, "
                "days_without_rain = EXCLUDED.days_without_rain, "
                "vpd_kpa = EXCLUDED.vpd_kpa, "
                "sar_clearing_detected = EXCLUDED.sar_clearing_detected, "
                "ignition_risk_score = EXCLUDED.ignition_risk_score, "
                "risk_category = EXCLUDED.risk_category, "
                "recommended_action = EXCLUDED.recommended_action;\n\n"
            )
            f.write(sql_chunk)

        f.write("COMMIT;\n")

    size_mb = os.path.getsize(OUT_GZ) / (1024 * 1024)
    print(f"Successfully generated {OUT_GZ} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    main()
