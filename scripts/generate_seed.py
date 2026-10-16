import os
import random
import h3

os.makedirs('scripts', exist_ok=True)
random.seed(2026)

# Kubu Raya, Kalimantan Barat (Rasau Jaya / Sungai Kakap peat zone)
kubu_center = (-0.28, 109.35)
# Pulang Pisau, Kalimantan Tengah (Kubah Gambut Kahayan / Sebangau / Ex-PLG)
pulang_center = (-2.75, 114.25)

kubu_root = h3.latlng_to_cell(kubu_center[0], kubu_center[1], 8)
pulang_root = h3.latlng_to_cell(pulang_center[0], pulang_center[1], 8)

kubu_cells = sorted(list(h3.grid_disk(kubu_root, 3)))   # 37 cells
pulang_cells = sorted(list(h3.grid_disk(pulang_root, 3))) # 37 cells

# Distribute risk categories across 74 cells
categories_pool = ['LOW'] * 24 + ['MEDIUM'] * 24 + ['HIGH'] * 14 + ['EXTREME'] * 12
random.shuffle(categories_pool)

lines = []
lines.append('-- =====================================================================')
lines.append('-- Nusantara Fire Sentinel (Karhutla Prevention System)')
lines.append('-- Local Development Database Initialization & PostGIS Seeding Script')
lines.append('-- Target Database: PostgreSQL 16 + PostGIS 3.4')
lines.append('-- Pilot Areas: Kab. Kubu Raya (Kalbar) & Kab. Pulang Pisau (Kalteng)')
lines.append('-- =====================================================================\n')
lines.append('-- 1. Enable PostGIS Extension')
lines.append('CREATE EXTENSION IF NOT EXISTS postgis;\n')
lines.append('-- 2. Drop existing tables if needed for clean re-runs')
lines.append('DROP TABLE IF EXISTS h3_daily_risk_snapshot CASCADE;')
lines.append('DROP TABLE IF EXISTS peat_h3_grid CASCADE;\n')
lines.append('-- 3. Master Geometri Heksagonal H3 (SYSTEM_DESIGN.md Specification)')
lines.append('''CREATE TABLE peat_h3_grid (
    h3_index VARCHAR(15) PRIMARY KEY,
    resolution SMALLINT NOT NULL DEFAULT 8,
    geom GEOMETRY(Polygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    peat_depth_meters NUMERIC(4, 2) DEFAULT 0.0,
    distance_to_canal_meters NUMERIC(8, 2),
    distance_to_road_meters NUMERIC(8, 2),
    concession_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_peat_h3_grid_geom ON peat_h3_grid USING GIST(geom);
CREATE INDEX idx_peat_h3_grid_centroid ON peat_h3_grid USING GIST(centroid);
''')
lines.append('-- 4. Snapshot Risiko Harian (SYSTEM_DESIGN.md Specification)')
lines.append('''CREATE TABLE h3_daily_risk_snapshot (
    snapshot_id BIGSERIAL PRIMARY KEY,
    h3_index VARCHAR(15) REFERENCES peat_h3_grid(h3_index),
    snapshot_date DATE NOT NULL,
    gwl_cm NUMERIC(5, 2) NOT NULL,
    days_without_rain INT NOT NULL,
    vpd_kpa NUMERIC(4, 2) NOT NULL,
    sar_clearing_detected BOOLEAN DEFAULT FALSE,
    ignition_risk_score NUMERIC(4, 3) NOT NULL,
    risk_category VARCHAR(16) NOT NULL,
    recommended_action VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_h3_date UNIQUE(h3_index, snapshot_date)
);

CREATE INDEX idx_daily_risk_category ON h3_daily_risk_snapshot(snapshot_date, risk_category);
''')

lines.append('-- =====================================================================')
lines.append('-- 5. Seed Data: Master Grid H3 (74 Sel di Kubu Raya & Pulang Pisau)')
lines.append('-- =====================================================================')

all_grid_rows = []
all_snapshot_rows = []

idx = 0
regions = [
    ('Kubu Raya (Kalbar)', kubu_cells, (1.1, 3.4), 'HGU-KBR'),
    ('Pulang Pisau (Kalteng)', pulang_cells, (2.2, 5.2), 'HGU-PLP')
]

for region_name, cells, depth_range, conc_prefix in regions:
    for cell in cells:
        cat = categories_pool[idx]
        idx += 1
        
        boundary = h3.cell_to_boundary(cell)
        ring_pts = ', '.join(f"{round(lng, 7)} {round(lat, 7)}" for lat, lng in boundary + (boundary[0],))
        wkt_poly = f"POLYGON(({ring_pts}))"
        
        lat_c, lng_c = h3.cell_to_latlng(cell)
        wkt_point = f"POINT({round(lng_c, 7)} {round(lat_c, 7)})"
        
        depth = round(random.uniform(*depth_range), 2)
        dist_canal = round(random.uniform(80.0, 1850.0), 2)
        dist_road = round(random.uniform(120.0, 3600.0), 2)
        concession = f"{conc_prefix}-{random.choice(['01-SAWIT', '02-HTI', '03-RESTORASI', 'COMMUNITY'])}"
        
        all_grid_rows.append(
            f"('{cell}', 8, ST_GeomFromText('{wkt_poly}', 4326), ST_GeomFromText('{wkt_point}', 4326), "
            f"{depth}, {dist_canal}, {dist_road}, '{concession}')"
        )
        
        # Risk snapshot attributes based on category
        if cat == 'LOW':
            gwl = round(random.uniform(-15.0, -24.5), 2)
            dwr = random.randint(1, 4)
            vpd = round(random.uniform(1.10, 1.75), 2)
            sar = 'FALSE'
            score = round(random.uniform(0.080, 0.280), 3)
            action = 'ROUTINE_MONITORING'
        elif cat == 'MEDIUM':
            gwl = round(random.uniform(-25.5, -34.5), 2)
            dwr = random.randint(5, 9)
            vpd = round(random.uniform(1.80, 2.45), 2)
            sar = 'FALSE'
            score = round(random.uniform(0.320, 0.580), 3)
            action = 'CANAL_BLOCK_CHECK'
        elif cat == 'HIGH':
            gwl = round(random.uniform(-35.5, -44.0), 2)
            dwr = random.randint(10, 16)
            vpd = round(random.uniform(2.50, 3.20), 2)
            sar = 'TRUE' if random.random() < 0.25 else 'FALSE'
            score = round(random.uniform(0.610, 0.830), 3)
            action = 'WATER_SATURATION'
        else: # EXTREME
            gwl = round(random.uniform(-45.0, -62.0), 2)
            dwr = random.randint(17, 26)
            vpd = round(random.uniform(3.30, 4.20), 2)
            sar = 'TRUE' if random.random() < 0.50 else 'FALSE'
            score = round(random.uniform(0.860, 0.985), 3)
            action = random.choice(['IMMEDIATE_PATROL_DISPATCH', 'CLOUD_SEEDING_TARGET'])
            
        all_snapshot_rows.append(
            f"('{cell}', CURRENT_DATE, {gwl}, {dwr}, {vpd}, {sar}, {score}, '{cat}', '{action}')"
        )

grid_insert_sql = (
    "INSERT INTO peat_h3_grid (h3_index, resolution, geom, centroid, peat_depth_meters, distance_to_canal_meters, distance_to_road_meters, concession_id)\nVALUES\n"
    + ",\n".join(all_grid_rows)
    + ";\n"
)
lines.append(grid_insert_sql)

lines.append('-- =====================================================================')
lines.append('-- 6. Seed Data: Snapshot Risiko Harian (CURRENT_DATE)')
lines.append('-- =====================================================================')

snapshot_insert_sql = (
    "INSERT INTO h3_daily_risk_snapshot (h3_index, snapshot_date, gwl_cm, days_without_rain, vpd_kpa, sar_clearing_detected, ignition_risk_score, risk_category, recommended_action)\nVALUES\n"
    + ",\n".join(all_snapshot_rows)
    + ";\n"
)
lines.append(snapshot_insert_sql)

lines.append('''-- =====================================================================
-- 7. Verification Query (Summary Statistic)
-- =====================================================================
SELECT 
    risk_category,
    COUNT(*) as total_hexagons,
    ROUND(AVG(gwl_cm), 2) as avg_gwl_cm,
    ROUND(AVG(days_without_rain)::numeric, 1) as avg_days_without_rain,
    ROUND(AVG(ignition_risk_score)::numeric, 3) as avg_risk_score,
    COUNT(*) FILTER (WHERE sar_clearing_detected = TRUE) as sar_alerts
FROM h3_daily_risk_snapshot
GROUP BY risk_category
ORDER BY avg_risk_score DESC;
''')

with open('scripts/init-db.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"Successfully generated scripts/init-db.sql: {len(all_grid_rows)} grid rows and {len(all_snapshot_rows)} snapshots.")
