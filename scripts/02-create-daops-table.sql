-- =====================================================================
-- Migration: Create and Seed Manggala Agni Daops Stations
-- Target Database: PostgreSQL 16 + PostGIS 3.4
-- =====================================================================

CREATE TABLE IF NOT EXISTS manggala_agni_daops (
    daops_id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    short_code VARCHAR(32) NOT NULL,
    province_name VARCHAR(64) NOT NULL,
    regency_name VARCHAR(64) NOT NULL,
    district_name VARCHAR(64),
    geom geometry(Point, 4326) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    commander_name VARCHAR(128),
    radio_frequency VARCHAR(32),
    personnel_count INTEGER DEFAULT 30,
    operational_status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manggala_agni_daops_geom ON manggala_agni_daops USING GIST (geom);

INSERT INTO manggala_agni_daops (daops_id, name, short_code, province_name, regency_name, district_name, geom, latitude, longitude, commander_name, radio_frequency, personnel_count, operational_status)
VALUES
('DAOPS-KBR-01', 'Daops Manggala Agni Kalimantan IX / Pontianak - Kubu Raya', 'KUBU_RAYA', 'Kalimantan Barat', 'Kabupaten Kubu Raya', 'Kecamatan Sungai Raya', ST_SetSRID(ST_MakePoint(109.34000, -0.25000), 4326), -0.25000, 109.34000, 'Kapt. Aris Santoso', '146.500 MHz VHF', 30, 'ACTIVE'),
('DAOPS-PLP-02', 'Daops Manggala Agni Kalimantan I / Pulang Pisau', 'PULANG_PISAU', 'Kalimantan Tengah', 'Kabupaten Pulang Pisau', 'Kecamatan Kahayan Hilir', ST_SetSRID(ST_MakePoint(114.24000, -2.74000), 4326), -2.74000, 114.24000, 'Kapt. Bambang Wijaya', '148.225 MHz VHF', 35, 'ACTIVE'),
('DAOPS-PKY-03', 'Daops Manggala Agni Kalimantan II / Palangka Raya', 'PALANGKA_RAYA', 'Kalimantan Tengah', 'Kota Palangka Raya', 'Kecamatan Jekan Raya', ST_SetSRID(ST_MakePoint(113.91000, -2.21000), 4326), -2.21000, 113.91000, 'Lettu Eko Prasetyo', '147.850 MHz VHF', 30, 'ACTIVE'),
('DAOPS-KTP-04', 'Daops Manggala Agni Kalimantan X / Ketapang', 'KETAPANG', 'Kalimantan Barat', 'Kabupaten Ketapang', 'Kecamatan Delta Pawan', ST_SetSRID(ST_MakePoint(109.97000, -1.84000), 4326), -1.84000, 109.97000, 'Kapt. Haryono', '146.800 MHz VHF', 25, 'ACTIVE'),
('DAOPS-STG-05', 'Daops Manggala Agni Kalimantan XI / Sintang', 'SINTANG', 'Kalimantan Barat', 'Kabupaten Sintang', 'Kecamatan Sintang', ST_SetSRID(ST_MakePoint(111.49000, 0.06000), 4326), 0.06000, 111.49000, 'Lettu Didik Kurniawan', '147.200 MHz VHF', 25, 'ACTIVE'),
('DAOPS-SIAK-06', 'Daops Manggala Agni Sumatera VI / Siak Sri Indrapura', 'SIAK', 'Riau', 'Kabupaten Siak', 'Kecamatan Siak', ST_SetSRID(ST_MakePoint(102.05000, 0.79000), 4326), 0.79000, 102.05000, 'Kapt. Rahmat Hidayat', '145.650 MHz VHF', 30, 'ACTIVE'),
('DAOPS-DMI-07', 'Daops Manggala Agni Sumatera V / Dumai', 'DUMAI', 'Riau', 'Kota Dumai', 'Kecamatan Dumai Timur', ST_SetSRID(ST_MakePoint(101.44000, 1.68000), 4326), 1.68000, 101.44000, 'Lettu Hendra Siregar', '146.125 MHz VHF', 30, 'ACTIVE'),
('DAOPS-PKU-08', 'Daops Manggala Agni Sumatera VII / Pekanbaru', 'PEKANBARU', 'Riau', 'Kota Pekanbaru', 'Kecamatan Rumbai', ST_SetSRID(ST_MakePoint(101.45000, 0.55000), 4326), 0.55000, 101.45000, 'Mayor Taufik Lubis', '146.900 MHz VHF', 40, 'ACTIVE'),
('DAOPS-JMB-09', 'Daops Manggala Agni Sumatera IX / Kota Jambi & Muaro Jambi', 'JAMBI', 'Jambi', 'Kabupaten Muaro Jambi', 'Kecamatan Kumpeh Ilir', ST_SetSRID(ST_MakePoint(103.61000, -1.59000), 4326), -1.59000, 103.61000, 'Kapt. Surya Pratama', '147.450 MHz VHF', 30, 'ACTIVE'),
('DAOPS-OKI-10', 'Daops Manggala Agni Sumatera XI / Ogan Komering Ilir (OKI)', 'OKI', 'Sumatera Selatan', 'Kabupaten Ogan Komering Ilir', 'Kecamatan Kayu Agung', ST_SetSRID(ST_MakePoint(104.85000, -3.39000), 4326), -3.39000, 104.85000, 'Kapt. Agus Salim', '146.350 MHz VHF', 35, 'ACTIVE'),
('DAOPS-BNK-11', 'Daops Manggala Agni Sumatera IV / Bengkalis', 'BENGKALIS', 'Riau', 'Kabupaten Bengkalis', 'Kecamatan Mandau - Duri', ST_SetSRID(ST_MakePoint(101.21000, 1.28000), 4326), 1.28000, 101.21000, 'Lettu Ilham Fauzi', '145.900 MHz VHF', 30, 'ACTIVE'),
('DAOPS-RPD-00', 'Daops Satuan Tugas Cepat Reaksi (Rapid-Response Saturation)', 'RAPID_RESPONSE', 'Lintas Wilayah', 'Markas Mobile Reaksi Cepat', 'Posko Multi-Koridor', ST_SetSRID(ST_MakePoint(109.36000, -0.28000), 4326), -0.28000, 109.36000, 'Mayor Arman Daryanto', '149.000 MHz Tactical', 50, 'STANDBY')
ON CONFLICT (daops_id) DO UPDATE SET
    name = EXCLUDED.name,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    geom = EXCLUDED.geom,
    personnel_count = EXCLUDED.personnel_count,
    operational_status = EXCLUDED.operational_status;
