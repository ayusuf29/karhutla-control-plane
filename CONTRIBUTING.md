# Contributing to Nusantara Fire Sentinel — Control Plane

Thank you for your interest in the **Nusantara Fire Sentinel** Control Plane project!

[🇮🇩 Baca Panduan Kontribusi dalam Bahasa Indonesia](CONTRIBUTING-IN.md)

---

## 📜 Open Source & Forking Rights (MIT License)

This project is licensed under the permissive **[MIT License](LICENSE)**. 

* **Feel free to Fork & Build**: Any developer, researcher, government agency, or community organization is completely free to fork this repository, adapt it, experiment with it, and deploy private or public versions under the terms of the MIT License.
* **Commercial and Non-Commercial Use**: You can use, modify, study, and distribute this codebase in your own forks and downstream systems without paying royalties or requiring formal approval, provided the original copyright notice and license are retained.

---

## 🛡️ Upstream Contribution Policy: Curated / Invitation-Only Model

While the software is fully open source to fork and modify, the **official upstream repository** (`ayusuf29/karhutla-control-plane`) operates under a **Curated and Selective Contribution Model**:

### Why is direct contribution restricted on the upstream repo?
1. **Critical Infrastructure & Disaster Management**: Nusantara Fire Sentinel is architected as a mission-critical early warning and emergency response system for peatland wildfire prevention in Indonesia. System reliability, latency bounds, and geospatial consistency are strictly regulated.
2. **Architectural Integrity**: The Control Plane tightly orchestrates Uber H3 geospatial partitioning (Resolution 8), PostGIS spatiotemporal queries, Redis caching, Google Cloud Run serverless deployment, and gRPC communication with AMD Cloud ML accelerators. Ad-hoc changes can introduce regression in live simulation or patrol routing pipelines.
3. **Selective PR & Issue Processing**: To maintain high operational standards and protect the maintainers' bandwidth, **direct Pull Requests, Issue creation, and Merge permissions are restricted to the core maintainer and approved collaborators**.

---

## 🤝 How to Propose Changes or Collaborate

If you have developed an improvement, bug fix, or feature that you believe should be included in the official upstream codebase:

1. **Fork the Repository**: Clone and develop your proposed feature or fix on your own GitHub fork.
2. **Validate Thoroughly Locally**: Ensure all unit tests pass, Docker builds succeed, and the frontend/backend integration operates without regression.
3. **Contact the Maintainer**: Reach out directly to the core maintainer before opening a Pull Request:
   * **Maintainer**: Achmad Yusuf Ramadhan
   * **LinkedIn**: [https://linkedin.com/in/cupu2903](https://linkedin.com/in/cupu2903)
   * **GitHub**: [@ayusuf29](https://github.com/ayusuf29)
4. **Invitation / Review Process**: Once discussed and aligned on architectural fit, the maintainer will either grant collaborator status or invite you to submit a designated PR for code review and merge.

> **Note**: Unsolicited PRs or automated bot PRs opened on the upstream repository without prior coordination may be reviewed selectively or closed without review.

---

## 💻 Local Development & Quality Guidelines

For approved collaborators working on upstream branches or PRs, please adhere to:

* **Java / Spring Boot**: Java 21, Spring Boot 3.3 standards, proper Bean validation, and clean layered architecture (Controller &rarr; Service &rarr; Repository).
* **Geospatial Processing**: Always adhere to Uber H3 Resolution 8 index representations and PostGIS EPSG:4326 / SRID specifications.
* **Frontend Dashboard**: Next.js 14 App Router conventions, TypeScript typing without `any`, Deck.gl layer performance optimization, and responsive Tailwind layouts.
* **Security**: Never commit sensitive secrets, Google Cloud service account keys, or raw API keys into source control. Always use environment variable substitution via `.env.example`.

Thank you for respecting these guidelines and supporting Indonesia's peatland wildfire prevention technology!
