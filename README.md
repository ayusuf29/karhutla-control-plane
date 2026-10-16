# Nusantara Fire Sentinel — GCP Control Plane & Web Application

Stateful Control Plane, Geospatial Orchestration Engine, and Mission Command Dashboard untuk sistem pencegahan kebakaran hutan dan lahan gambut (Karhutla) Indonesia.

## 🏛️ Arsitektur & Peran Komponen
Repositori ini dirancang khusus untuk dideploy pada infrastruktur **Google Cloud Platform (GCP)**:
* **Frontend Dashboard (`/frontend`):** Next.js 14 App Router, WebGL 3D Hexagonal Visualization (Deck.gl), dan kartu briefing operasional taktis (Dihosting di **Google Cloud Run**).
* **Backend Gateway & Spatial Engine (`/backend`):** Java 21 / Spring Boot 3.3, partisi heksagonal Uber H3 (Resolusi 8), Vehicle Routing Problem (VRP) Patrol Optimizer, dan **Google DeepMind Supervisor Agent** (Dihosting di **Google Cloud Run**).
* **Database & Cache:** Cloud SQL (PostgreSQL 16 + PostGIS 3.4) dan Google Cloud Memorystore for Redis 7.0 yang terhubung secara privat melalui **Serverless VPC Access Connector**.
* **Interkoneksi ke AMD Cloud:** Backend Spring Boot memanggil service inferensi berat di **AMD Cloud** via secure gRPC (Port 50051 / 443 TLS).

## 🚀 Menjalankan Secara Lokal (Docker Compose)
Pastikan Docker Desktop aktif di komputer Anda:
```bash
# 1. Jalankan PostgreSQL, Redis, Backend, dan Frontend
docker compose up -d

# 2. Akses Aplikasi
# Frontend Dashboard: http://localhost:3000
# Backend REST API  : http://localhost:8080/actuator/health
```

## 🛠️ Menjalankan Modul Secara Manual

### Backend (Java 21 Spring Boot)
```bash
cd backend
mvn clean spring-boot:run
```

### Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```

## 🧠 Google DeepMind Supervisor Agent
Backend secara otomatis mengintegrasikan **Google DeepMind Gemini API**:
* Menganalisis sel heksagon berisiko `EXTREME` dari hasil inferensi AMD Cloud.
* Menghasilkan *Tactical Action Plan* komando resmi untuk Satgas Daops Manggala Agni dan BPBD (jumlah personel, peralatan pompa apung spesifik, strategi sekat bakar *fire-break*, dan sumber air kanal terdekat).
* Konfigurasi API Key dapat diisi pada `.env` (`GEMINI_API_KEY=AIzaSy...`). Jika tidak diset, sistem berjalan dalam mode *autonomous deterministic fallback*.

## 📖 Panduan Lengkap Hosting Google Cloud Platform (GCP)
Lihat [GCP_SETUP.md](./GCP_SETUP.md) untuk panduan provisioning VPC, Cloud SQL PostGIS, Memorystore Redis, Artifact Registry, dan auto-deploy via GitHub Actions.
