# Nusantara Fire Sentinel — Control Plane GCP & Aplikasi Web

[🇬🇧 Read in English](README.md) • [📜 Lisensi MIT](LICENSE) • [🛡️ Panduan Kontribusi](CONTRIBUTING-IN.md)

Stateful Control Plane, Geospatial Orchestration Engine, dan Mission Command Dashboard untuk Sistem Pencegahan dan Peringatan Dini Kebakaran Hutan & Lahan Gambut (Karhutla) Indonesia.

---

## 🏛️ Arsitektur & Peran Komponen

Repositori ini memuat fondasi operasional utama dari platform Nusantara Fire Sentinel, yang dirancang khusus untuk deployment skala enterprise pada infrastruktur **Google Cloud Platform (GCP)** serta lingkungan *hybrid cloud*:

* **Mission Command Dashboard (`/frontend`)**: Dibangun menggunakan **Next.js 14 App Router**, TypeScript, dan visualisasi heksagonal 3D WebGL berbasis **Deck.gl**. Dilengkapi dengan pemantau telemetri real-time, visualisasi 3D kedalaman gambut, modal peringatan anomali radar SAR, peta rute patroli taktis, serta kartu briefing otomatis Daops Manggala Agni.
* **Geospatial Orchestration Engine (`/backend`)**: Dirancang dengan **Java 21 / Spring Boot 3.3**, memanfaatkan partisi heksagonal spasial **Uber H3 (Resolusi 8)** untuk pemetaan lahan gambut, pengoptimal rute patroli **Vehicle Routing Problem (VRP)**, serta **Google DeepMind Supervisor Agent**.
* **Database Spasial & Cache**: **PostgreSQL 16 + PostGIS 3.4** untuk penyimpanan fitur geospasial presisi tinggi dan snapshot risiko harian, dipadukan dengan **Redis 7.0** untuk *spatial caching* berkecepatan tinggi bagi sel heksagon aktif dan status agent.
* **Interkoneksi gRPC ML Worker**: Klien gRPC berlatensi rendah untuk menghubungkan Control Plane dengan Heavy-Compute ML Worker (baik yang dihosting di AMD Cloud maupun runtime lokal CPU/GPU).

---

## 📋 Prasyarat Sistem

Sebelum menjalankan aplikasi secara lokal, pastikan perangkat Anda telah terinstal:

* **Docker & Docker Compose** (Disarankan: Docker Desktop 4.20+ dengan Docker Compose v2)
* **Java Development Kit (JDK)**: Versi 21 (Eclipse Temurin, OpenJDK, atau GraalVM)
* **Apache Maven**: Versi 3.9+ (atau gunakan Maven wrapper bawaan)
* **Node.js & npm**: Node.js 18.x atau 20.x LTS, npm 9.x+

---

## 🚀 Menjalankan Secara Lokal

Anda dapat menjalankan Control Plane secara lokal menggunakan **Docker Compose (All-in-One)** atau melalui **Mode Pengembangan Manual**.

### Opsi A: Menjalankan Cepat via Docker Compose (Disarankan)

Docker Compose akan otomatis mengorkestrasi PostgreSQL + PostGIS, Redis cache, backend Spring Boot, dan frontend Next.js di dalam satu jaringan *bridge* terisolasi.

```bash
# 1. Buka folder control plane
cd karhutla-control-plane-gcp

# 2. Salin template konfigurasi environment
cp .env.example .env

# 3. Build dan jalankan seluruh container di background
docker compose up -d --build

# 4. Pantau status kesehatan dan log container
docker compose ps
docker compose logs -f
```

Setelah semua container aktif dan berstatus sehat (*healthy*):
* 🌐 **Dashboard Frontend**: [http://localhost:3000](http://localhost:3000)
* ⚙️ **Backend REST API**: [http://localhost:8080](http://localhost:8080)
* 🩺 **Backend Health Actuator**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

### Opsi B: Mode Pengembangan Manual

Gunakan metode ini jika Anda ingin melakukan kustomisasi kode atau debugging intensif:

#### Langkah 1: Jalankan Database & Cache
Jalankan hanya container PostgreSQL dan Redis:
```bash
docker compose up -d sentinel-postgres sentinel-redis
```
*(Script inisialisasi `./scripts/init-db.sql` akan dieksekusi otomatis pada startup pertama untuk memasang ekstensi PostGIS dan skema tabel).*

#### Langkah 2: Konfigurasi Environment Variables
Salin file `.env.example` ke `.env` dan periksa port serta kredensial:
```bash
cp .env.example .env
```

Daftar variabel lingkungan penting dalam `.env`:
| Variabel | Nilai Default | Penjelasan |
| :--- | :--- | :--- |
| `POSTGRES_HOST` | `localhost` | Host database PostgreSQL PostGIS |
| `POSTGRES_PORT` | `5432` | Port database PostgreSQL |
| `POSTGRES_DB` | `fire_sentinel_db` | Nama database |
| `POSTGRES_USER` | `postgres` | Username database |
| `POSTGRES_PASSWORD` | `postgres` | Password database |
| `REDIS_HOST` | `localhost` | Host cache Redis |
| `REDIS_PORT` | `6379` | Port cache Redis |
| `ML_SERVICE_URL` | `localhost:50051` | Endpoint gRPC service ML Worker |
| `GEMINI_API_KEY` | *(Opsional)* | Kunci API Google AI Studio / Vertex AI Gemini |
| `AMD_API_KEY` | *(Tersedia)* | Kredensial endpoint AMD Cloud Token Factory |

#### Langkah 3: Jalankan Backend Spring Boot
Masuk ke direktori backend dan jalankan via Maven:
```bash
cd backend
mvn clean spring-boot:run
```
Atau via terminal Windows PowerShell:
```powershell
cd backend
mvn clean spring-boot:run
```
Backend akan aktif di port `8080`. Verifikasi status melalui:
```bash
curl http://localhost:8080/actuator/health
```

#### Langkah 4: Jalankan Frontend Next.js
Buka jendela terminal baru:
```bash
cd frontend
npm install
npm run dev
```
Buka browser Anda dan akses [http://localhost:3000](http://localhost:3000).

---

## 🧠 Google DeepMind Supervisor Agent

Backend mengintegrasikan agen penyelia kognitif otomatis yang didukung oleh **Google DeepMind Gemini**:

* **Penyusunan Rencana Taktis Otomatis**: Menganalisis sel heksagon yang mencapai level risiko `EXTREME` berdasarkan fitur spatiotemporal dan inferensi ML.
* **Perumusan Perintah Operasional Lapangan**: Secara otomatis merumuskan *Standard Operating Procedure* (SOP) siap pakai untuk personel **Satgas Daops Manggala Agni** dan BPBD daerah (jumlah personel yang dibutuhkan, tipe pompa apung spesifik, strategi pembuatan sekat bakar *fire-break*, dan koordinat kanal sumber air terdekat).
* **Mode Fallback Otonom**: Jika `GEMINI_API_KEY` tidak diisi di `.env`, sistem secara otomatis beralih ke mode *deterministic fallback* berbasis aturan algoritma untuk menjamin operasi darurat tetap berjalan tanpa henti.

---

## ☁️ Panduan Hosting Produksi Google Cloud Platform (GCP)

Untuk panduan lengkap deployment ke lingkungan produksi Google Cloud:
* **Cloud SQL (PostgreSQL 16 + PostGIS 3.4)**
* **Google Cloud Memorystore (Redis 7.0)**
* **Google Cloud Run (Serverless Backend & Frontend)**
* **Serverless VPC Access Connector**
* **CI/CD Otomatis via GitHub Actions & Google Artifact Registry**

Silakan baca dokumen panduan di [GCP_SETUP.md](./GCP_SETUP.md).

---

## 📜 Lisensi & Hak Penggunaan Open Source

Repositori ini dilisensikan di bawah **[MIT License](LICENSE)**.

```
Copyright (c) 2026 Achmad Yusuf Ramadhan (https://linkedin.com/in/cupu2903)
```

Siapa pun sangat dipersilakan untuk me-**Fork** repositori ini, mengembangkan fitur kustom, dan menggunakannya untuk riset, instansi, maupun deployment mandiri sesuai dengan ketentuan Lisensi MIT.

---

## 🛡️ Kebijakan Kontribusi

Repositori resmi upstream dikelola menggunakan **Model Kontribusi Terkurasi / Terpilih (Curated Contribution Model)**.
Pembuatan Pull Request langsung, pembukaan Issue, dan hak Merge di repositori upstream dibatasi hanya untuk maintainer dan kolaborator resmi demi menjaga keandalan infrastruktur kritis dan kepatuhan arsitektur geospasial.

Jika Anda telah mengembangkan inovasi atau perbaikan pada fork Anda dan ingin mengajukannya ke repositori resmi, silakan baca **[Panduan Kontribusi](CONTRIBUTING-IN.md)** dan hubungi:
* **Maintainer**: Achmad Yusuf Ramadhan
* **LinkedIn**: [https://linkedin.com/in/cupu2903](https://linkedin.com/in/cupu2903)
* **GitHub**: [@ayusuf29](https://github.com/ayusuf29)
