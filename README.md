# Nusantara Fire Sentinel — GCP Control Plane & Web Application

[🇮🇩 Baca dalam Bahasa Indonesia](README-IN.md) • [📜 MIT License](LICENSE) • [🛡️ Contribution Guidelines](CONTRIBUTING.md)

Stateful Control Plane, Geospatial Orchestration Engine, and Mission Command Dashboard for Indonesia's Peatland Wildfire (*Karhutla*) Prevention and Early Warning System.

---

## 🏛️ Architecture & Component Overview

This repository houses the core operational backbone of the Nusantara Fire Sentinel platform, designed for enterprise deployment on **Google Cloud Platform (GCP)** and hybrid cloud environments:

* **Mission Command Dashboard (`/frontend`)**: Built with **Next.js 14 App Router**, TypeScript, and **Deck.gl WebGL 3D Hexagonal Visualization**. Features live telemetry headers, 3D peat depth visualizer, SAR anomaly alerts modal, tactical patrol dispatch map, and an automated Daops Manggala Agni briefing card.
* **Geospatial Orchestration Engine (`/backend`)**: Engineered on **Java 21 / Spring Boot 3.3**, utilizing **Uber H3 Spatial Indexing (Resolution 8)** for hexagonal peat partition mapping, **Vehicle Routing Problem (VRP)** patrol optimizer, and the **Google DeepMind Supervisor Agent**.
* **Spatial Storage & Cache**: **PostgreSQL 16 + PostGIS 3.4** for high-precision geospatial feature storage and daily risk snapshots, paired with **Redis 7.0** for high-throughput spatial caching of active hexagonal alerts and agent states.
* **ML Worker gRPC Bridge**: High-speed, low-latency gRPC client connecting the Control Plane to the Heavy-Compute ML Worker (hosted on AMD Cloud or local CPU/GPU runtime).

---

## 📋 Prerequisites

Before running the application locally, ensure you have installed:

* **Docker & Docker Compose** (Recommended: Docker Desktop 4.20+ with Docker Compose v2)
* **Java Development Kit (JDK)**: Version 21 (Eclipse Temurin, OpenJDK, or GraalVM)
* **Apache Maven**: Version 3.9+ (or use the included Maven wrapper)
* **Node.js & npm**: Node.js 18.x or 20.x LTS, npm 9.x+

---

## 🚀 Running Locally

You can run the Control Plane locally using either **Docker Compose (All-in-One)** or in **Manual Development Mode**.

### Option A: Quickstart via Docker Compose (Recommended)

Docker Compose automatically orchestrates PostgreSQL with PostGIS extensions, Redis cache, the Spring Boot backend, and the Next.js frontend within an isolated bridge network.

```bash
# 1. Clone the repository and navigate into the control plane directory
cd karhutla-control-plane-gcp

# 2. Copy the environment variables template
cp .env.example .env

# 3. Build and launch all services in detached mode
docker compose up -d --build

# 4. Inspect container health and startup logs
docker compose ps
docker compose logs -f
```

Once all containers are running and healthy:
* 🌐 **Mission Command Frontend**: [http://localhost:3000](http://localhost:3000)
* ⚙️ **Backend REST API**: [http://localhost:8080](http://localhost:8080)
* 🩺 **Backend Health Actuator**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

### Option B: Manual Development Mode

For rapid iteration and code debugging:

#### Step 1: Start Database & Cache Containers
Run only PostgreSQL and Redis using Docker:
```bash
docker compose up -d sentinel-postgres sentinel-redis
```
*(The initialization script `./scripts/init-db.sql` automatically runs on the first startup to initialize PostGIS extensions and schemas).*

#### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and verify database and port bindings:
```bash
cp .env.example .env
```

Key environment configurations in `.env`:
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `POSTGRES_HOST` | `localhost` | PostgreSQL PostGIS host |
| `POSTGRES_PORT` | `5432` | PostgreSQL database port |
| `POSTGRES_DB` | `fire_sentinel_db` | Main database name |
| `POSTGRES_USER` | `postgres` | Database username |
| `POSTGRES_PASSWORD` | `postgres` | Database password |
| `REDIS_HOST` | `localhost` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `ML_SERVICE_URL` | `localhost:50051` | gRPC endpoint of the ML Worker |
| `GEMINI_API_KEY` | *(Optional)* | Google AI Studio / Vertex AI Gemini API key |
| `AMD_API_KEY` | *(Configured)* | AMD Cloud Token Factory endpoint credentials |

#### Step 3: Run Spring Boot Backend
Navigate into the backend directory and launch via Maven:
```bash
cd backend
mvn clean spring-boot:run
```
Or on Windows PowerShell:
```powershell
cd backend
mvn clean spring-boot:run
```
The backend will boot on port `8080`. Verify with:
```bash
curl http://localhost:8080/actuator/health
```

#### Step 4: Run Next.js Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 Google DeepMind Supervisor Agent

The backend natively integrates an automated cognitive supervisor powered by **Google DeepMind Gemini**:

* **Automated Tactical Action Plans**: Analyzes hexagonal cells that reach `EXTREME` risk thresholds based on spatio-temporal features and ML inference results.
* **Standard Operating Procedure (SOP) Formulation**: Automatically generates field-ready commands for **Satgas Daops Manggala Agni** and local BPBD units (exact personnel count, specialized floating pumps, fire-break excavation strategies, and nearest canal water source coordinates).
* **Autonomous Fallback**: If `GEMINI_API_KEY` is not provided in `.env`, the system automatically defaults to a deterministic, rule-based algorithmic fallback to ensure uninterrupted emergency operations.

---

## ☁️ Production Deployment on Google Cloud Platform (GCP)

For comprehensive instructions on deploying to production on Google Cloud:
* **Cloud SQL (PostgreSQL 16 + PostGIS 3.4)**
* **Google Cloud Memorystore (Redis 7.0)**
* **Google Cloud Run (Serverless Backend & Frontend)**
* **Serverless VPC Access Connector**
* **Continuous Integration via GitHub Actions & Artifact Registry**

Refer to the detailed guide in [GCP_SETUP.md](./GCP_SETUP.md).

---

## 📜 License & Open Source Rights

This project is licensed under the **[MIT License](LICENSE)**.

```
Copyright (c) 2026 Achmad Yusuf Ramadhan (https://linkedin.com/in/cupu2903)
```

You are welcome to **Fork** this repository, customize the algorithms, and deploy private or commercial instances in accordance with the MIT License terms.

---

## 🛡️ Contribution Policy

The upstream repository operates under a **Curated and Selective Contribution Model**. 
Direct Pull Requests, Issue creation, and Merge permissions on the official upstream repository are restricted to approved maintainers and collaborators to ensure critical infrastructure reliability and architectural consistency.

If you have developed improvements on your fork and wish to collaborate upstream, please read our **[Contribution Guidelines](CONTRIBUTING.md)** and contact:
* **Maintainer**: Achmad Yusuf Ramadhan
* **LinkedIn**: [https://linkedin.com/in/cupu2903](https://linkedin.com/in/cupu2903)
* **GitHub**: [@ayusuf29](https://github.com/ayusuf29)
