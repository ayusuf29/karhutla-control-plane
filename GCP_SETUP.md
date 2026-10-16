# Panduan Lengkap Setup & Hosting di Google Cloud Platform (GCP)
## Nusantara Fire Sentinel — Stateful Control Plane & Web Application
**Versi Dokumen:** 1.0.0  
**Target Komponen:** Frontend Next.js, Backend Java Spring Boot, Cloud SQL PostGIS, Memorystore Redis, Serverless VPC Access  
**Lingkungan:** Google Cloud Platform (Region Rekomendasi: `asia-southeast2` - Jakarta)  

---

## 1. Arsitektur Control Plane di GCP

Dalam arsitektur hybrid multi-cloud ini, seluruh komponen sistem **selain dari ML Inference Worker** dijalankan di **Google Cloud Platform (GCP)**:

```
+-----------------------------------------------------------------------------------------+
| GOOGLE CLOUD PLATFORM (Region: asia-southeast2 / Jakarta)                              |
|                                                                                         |
|  +-------------------------------------+     +---------------------------------------+  |
|  | Google Cloud Run (Frontend)         |     | Google Cloud Run (Backend)            |  |
|  | - Next.js 14 App Router             |---->| - Java 21 / Spring Boot 3.3           |  |
|  | - Deck.gl WebGL 3D Visualization    |     | - Uber H3 Spatial Partitioning Engine |  |
|  | - Port: 3000                        |     | - Patrol VRP Optimizer & Agents       |  |
|  +-------------------------------------+     | - Port: 8080                          |  |
|                                              +-------------------+-------------------+  |
|                                                                  |                      |
|                                        Serverless VPC Connector  |                      |
|                     +--------------------------------------------+                      |
|                     |                                            |                      |
|                     v                                            v                      |
|  +------------------------------------+    +-----------------------------------------+  |
|  | Cloud SQL for PostgreSQL 16        |    | Memorystore for Redis 7                 |  |
|  | - Extension: PostGIS 3.4           |    | - Spatial In-Memory Hexagonal Cache     |  |
|  | - H3 Peat Depth, GWL, Patrol Logs  |    | - Real-time Alerting State Store        |  |
|  +------------------------------------+    +-----------------------------------------+  |
|                                                                  |                      |
+------------------------------------------------------------------|----------------------+
                                                                   |
                                  mTLS / TLS gRPC (Port 443/50051) |
                                                                   v
                                             +-----------------------------------------+
                                             | AMD CLOUD (GPU ML Worker Island)        |
                                             | sentinel-ml-worker-amd                  |
                                             +-----------------------------------------+
```

---

## 2. Prasyarat & Persiapan Awal di GCP

### A. Kebutuhan Akun & Project
1. Akun Google Cloud dengan **Billing aktif**.
2. Project GCP baru atau eksisting (misal ID Project: `karhutla-sentinel-prod`).
3. Google Cloud SDK (`gcloud` CLI) terpasang di komputer lokal Anda:
   ```bash
   gcloud auth login
   gcloud config set project <PROJECT_ID_ANDA>
   ```

### B. Aktifkan Layanan Google Cloud API yang Diperlukan
Jalankan perintah ini sekali untuk mengaktifkan seluruh API yang dibutuhkan:
```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  redis.googleapis.com \
  vpcaccess.googleapis.com \
  compute.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com
```

---

## 3. Provisioning Infrastruktur GCP (Step-by-Step)

### Langkah 1: Buat Jaringan VPC & Serverless VPC Connector
Serverless VPC Connector diperlukan agar Cloud Run dapat mengakses Cloud SQL dan Memorystore Redis melalui IP Privat tanpa eksposur ke internet publik.

```bash
# 1. Buat VPC Network kustom (atau gunakan default)
gcloud compute networks create sentinel-vpc \
  --subnet-mode=custom \
  --bgp-routing-mode=regional

# 2. Buat Subnet di region Jakarta
gcloud compute networks subnets create sentinel-subnet-jkt \
  --network=sentinel-vpc \
  --region=asia-southeast2 \
  --range=10.10.0.0/24

# 3. Buat Serverless VPC Access Connector (range IP tidak boleh overlap)
gcloud compute networks vpc-access connectors create sentinel-vpc-conn \
  --region=asia-southeast2 \
  --network=sentinel-vpc \
  --range=10.10.8.0/28 \
  --min-instances=2 \
  --max-instances=5 \
  --machine-type=e2-micro
```

### Langkah 2: Buat Cloud SQL PostgreSQL 16 + PostGIS
```bash
# 1. Buat alokasi IP privat VPC untuk peering database
gcloud compute addresses create google-managed-services-sentinel-vpc \
  --global \
  --purpose=VPC_PEERING \
  --prefix-length=16 \
  --network=sentinel-vpc

gcloud services vpc-peerings connect \
  --service=servicenetworking.googleapis.com \
  --ranges=google-managed-services-sentinel-vpc \
  --network=sentinel-vpc

# 2. Buat Cloud SQL Instance (PostgreSQL 16)
gcloud sql instances create sentinel-postgres-db \
  --database-version=POSTGRES_16 \
  --tier=db-custom-2-7680 \
  --region=asia-southeast2 \
  --network=sentinel-vpc \
  --no-assign-ip \
  --root-password="GANTI_DENGAN_PASSWORD_DB_KUAT"

# 3. Buat Database aplikasi
gcloud sql databases create fire_sentinel_db \
  --instance=sentinel-postgres-db

# 4. Buat Database User
gcloud sql users create sentinel_app_user \
  --instance=sentinel-postgres-db \
  --password="GANTI_DENGAN_PASSWORD_USER_KUAT"
```

**Aktifkan Ekstensi PostGIS di Cloud SQL:**
Hubungkan ke database (misal via Cloud Shell atau Cloud SQL Proxy) dan jalankan:
```sql
\c fire_sentinel_db;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
```
*(Catatan: Anda juga dapat menjalankan file skrip inisialisasi tabel dari `scripts/init-db.sql`)*

### Langkah 3: Buat Cloud Memorystore for Redis
```bash
gcloud redis instances create sentinel-redis \
  --size=1 \
  --region=asia-southeast2 \
  --zone=asia-southeast2-a \
  --redis-version=redis_7_0 \
  --network=sentinel-vpc \
  --connect-mode=PRIVATE_SERVICE_ACCESS
```
Catat IP privat Redis yang dihasilkan dengan perintah:
```bash
gcloud redis instances describe sentinel-redis --region=asia-southeast2 --format='value(host)'
```

### Langkah 4: Buat Google Artifact Registry Repository
Tempat penyimpanan image Docker backend dan frontend:
```bash
gcloud artifacts repositories create karhutla-sentinel \
  --repository-format=docker \
  --location=asia-southeast2 \
  --description="Docker repository for Nusantara Fire Sentinel services"
```

---

## 4. Konfigurasi Service Account untuk GitHub Actions

Buat Service Account GCP khusus dengan izin terukur (Least Privilege) agar GitHub Actions dapat melakukan build dan deployment otomatis ke Cloud Run:

```bash
# 1. Buat Service Account
gcloud iam service-accounts create github-deployer \
  --display-name="GitHub Actions Deployer"

SA_EMAIL="github-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# 2. Beri hak akses (Roles)
# Akses ke Artifact Registry (Push image)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"

# Akses ke Cloud Run (Deploy services)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

# Akses Service Account User (Diperlukan Cloud Run untuk bertindak sebagai default compute SA)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# 3. Buat dan unduh JSON Key untuk GitHub Secrets
gcloud iam service-accounts keys create gcp-sa-key.json \
  --iam-account="${SA_EMAIL}"
```

> [!WARNING]
> Simpan file `gcp-sa-key.json` dengan aman. Isi seluruh teks JSON ini akan dimasukkan ke Secret `GCP_SA_KEY` di GitHub Repository Anda, setelah itu hapus file lokal tersebut.

---

## 5. Konfigurasi GitHub Actions: Auto-Deploy on Main Branch

File workflow untuk GCP telah disiapkan di [.github/workflows/deploy-gcp.yml](file:///c:/project/karhutla-prevention-system/.github/workflows/deploy-gcp.yml).

### A. Alur Kerja Deployment
1. Ketika commit di-push atau merge ke branch `main`:
2. **Job Backend:**
   * Membangun image Docker Java Spring Boot (`backend/Dockerfile`).
   * Melakukan push ke Artifact Registry (`asia-southeast2-docker.pkg.dev/...`).
   * Men-deploy container ke **Cloud Run Backend** dengan koneksi ke Serverless VPC Connector, Cloud SQL, Redis, dan mengarah ke endpoint AMD Cloud.
   * Mengeluarkan URL publik backend.
3. **Job Frontend:**
   * Membangun image Docker Next.js (`frontend/Dockerfile`).
   * Menginject URL Backend Cloud Run ke variabel `INTERNAL_BACKEND_URL`.
   * Men-deploy container ke **Cloud Run Frontend**.
   * Dashboard dapat langsung diakses publik dengan enkripsi HTTPS otomatis dari Google.

### B. Daftar GitHub Secrets yang Wajib Didaftarkan
Masuk ke repository GitHub -> **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**:

| Nama Secret | Deskripsi | Contoh Nilai |
|---|---|---|
| `GCP_PROJECT_ID` | ID Google Cloud Project Anda | `karhutla-sentinel-prod` |
| `GCP_SA_KEY` | Isi lengkap file JSON dari Service Account Key | `{"type": "service_account", ...}` |
| `GCP_VPC_CONNECTOR` | Nama lengkap Serverless VPC Connector | `projects/<PROJECT_ID>/locations/asia-southeast2/connectors/sentinel-vpc-conn` |
| `POSTGRES_HOST` | IP Privat dari Cloud SQL PostgreSQL | `10.10.0.5` |
| `POSTGRES_USER` | Username database PostgreSQL | `sentinel_app_user` |
| `POSTGRES_PASSWORD` | Password database PostgreSQL | `KataSandiKuat123!` |
| `POSTGRES_DB` | Nama database | `fire_sentinel_db` |
| `REDIS_HOST` | IP Privat dari Google Cloud Memorystore Redis | `10.10.0.12` |
| `AMD_ML_SERVICE_URL` | Endpoint ML Worker di AMD Cloud | `ml.sentinel.domain.id:443` atau `IP_AMD:50051` |
| `AMD_ML_USE_TLS` | Flag enkripsi gRPC TLS ke AMD Cloud | `true` (jika port 443) atau `false` (jika port 50051 plaintext) |
| `GEMINI_API_KEY` | API Key Google DeepMind Gemini (Vertex AI / Google AI Studio) | `AIzaSy...` (Opsional, fallback lokal aktif jika kosong) |

---

## 6. Pengaturan Koneksi GCP ke AMD Cloud

Agar Cloud Run di GCP dapat menghubungi endpoint gRPC di AMD Cloud dengan lancar:

### A. Jika Menggunakan Domain Publik + TLS (Rekomendasi Utama)
* Atur `AMD_ML_SERVICE_URL` ke: `ml.sentinel.domain.id:443`.
* Atur `AMD_ML_USE_TLS` ke: `true`.
* Java Spring Boot (`PythonInferenceClient`) akan secara otomatis membuat channel gRPC terenkripsi TLS over HTTP/2.

### B. Jika Menggunakan Direct IP & Port 50051
* Atur `AMD_ML_SERVICE_URL` ke: `<IP_PUBLIK_AMD>:50051`.
* Atur `AMD_ML_USE_TLS` ke: `false`.
* Pastikan firewall server AMD Cloud telah mengizinkan port `50051` dibuka ke internet atau restricted ke IP Cloud NAT GCP.

### C. (Opsional) Mengaktifkan Cloud NAT untuk Static Egress IP
Jika Anda ingin firewall di AMD Cloud hanya mengizinkan request dari IP GCP Anda (IP Whitelisting):
```bash
# 1. Buat Cloud Router
gcloud compute routers create sentinel-router \
  --network=sentinel-vpc \
  --region=asia-southeast2

# 2. Buat Alamat IP Statis Egress
gcloud compute addresses create sentinel-nat-ip \
  --region=asia-southeast2

# 3. Buat Cloud NAT Gateway
gcloud compute routers nats create sentinel-nat-gw \
  --router=sentinel-router \
  --region=asia-southeast2 \
  --nat-external-ip-pool=sentinel-nat-ip \
  --nat-all-subnet-ip-ranges
```
*Catatan: Masukkan IP dari `sentinel-nat-ip` ke whitelist UFW di server AMD Cloud Anda.*

---

## 7. Verifikasi & Pengujian Operasional

Setelah pipeline GitHub Actions selesai:

### 1. Periksa Healthcheck Backend Cloud Run
Akses endpoint health Spring Boot:
```bash
curl -I https://sentinel-backend-<random-hash>.a.run.app/actuator/health
```
*Output yang diharapkan:* `HTTP/2 200 OK`

### 2. Uji Integrasi gRPC ke AMD Cloud dari Backend
Coba panggil endpoint evaluasi risiko dari backend:
```bash
curl -X POST https://sentinel-backend-<random-hash>.a.run.app/api/risk/evaluate \
  -H "Content-Type: application/json" \
  -d '{"region_id": "kubu-raya", "features": []}'
```
Periksa log Cloud Run backend:
```bash
gcloud beta run services logs tail sentinel-backend --region=asia-southeast2
```
*Log sukses akan menampilkan:*  
`Initialized PythonInferenceClient targeting gRPC endpoint: ml.sentinel.domain.id:443`  
`Received response from AMD ML accelerator: AMD Instinct MI300X in 12ms`

### 3. Akses Dashboard Frontend Next.js
Buka URL Cloud Run frontend di browser Anda:
```
https://sentinel-frontend-<random-hash>.a.run.app
```
Verifikasi bahwa:
* 3D Deck.gl Hexagon peta gambut Kalimantan Barat & Tengah ter-render mulus.
* Status bar menampilkan telemetri koneksi backend dan latency inferensi ML.
* Telemetri menunjukkan backend terhubung ke PostgreSQL, Redis, dan AMD Worker.

---

## 8. Ringkasan Checklist Sebelum Go-Live

- [ ] Project GCP aktif dengan billing di region `asia-southeast2`.
- [ ] VPC, Subnet, dan Serverless VPC Connector (`sentinel-vpc-conn`) status READY.
- [ ] Cloud SQL PostgreSQL 16 terinstall ekstensi PostGIS (`CREATE EXTENSION postgis;`).
- [ ] Memorystore Redis 7 aktif dan IP dicatat.
- [ ] Artifact Registry repository `karhutla-sentinel` siap menampung image.
- [ ] Service Account `github-deployer` dibuat dan key JSON dimasukkan ke GitHub Secrets.
- [ ] AMD Cloud ML Worker telah berjalan dan dapat diakses dari luar.
- [ ] Seluruh GitHub Secrets terisi di repository GitHub.
- [ ] Push commit ke branch `main` berhasil men-trigger deployment otomatis.
