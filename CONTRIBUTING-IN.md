# Panduan Kontribusi — Nusantara Fire Sentinel (Control Plane)

Terima kasih atas ketertarikan Anda pada proyek **Nusantara Fire Sentinel** Control Plane!

[🇬🇧 Read Contribution Guidelines in English](CONTRIBUTING.md)

---

## 📜 Hak Open Source & Bebas Fork (Lisensi MIT)

Repositori ini dilisensikan di bawah **[MIT License](LICENSE)** yang sangat terbuka dan permisif:

* **Sangat Bebas untuk Melakukan Fork**: Siapa pun—baik pengembang individu, peneliti, akademisi, instansi pemerintah, maupun komunitas peduli lingkungan—berhak sepenuhnya untuk melakukan *Fork* repositori ini, mempelajari kode, memodifikasi, dan mendeploy instalasi mandiri sesuai kebutuhan Anda di bawah lisensi MIT.
* **Penggunaan Komersial maupun Non-Komersial**: Anda diperbolehkan menggunakan, mengembangkan, dan mendistribusikan kode ini pada fork Anda sendiri tanpa kewajiban royalti, selama menyertakan atribusi hak cipta dan teks lisensi asli.

---

## 🛡️ Kebijakan Repositori Upstream: Model Kontribusi Selektif (Terkurasi)

Meskipun repositori ini terbuka bagi siapa saja untuk di-fork dan dimodifikasi secara mandiri, **repositori upstream resmi** (`ayusuf29/karhutla-control-plane`) dikelola menggunakan **Model Kontribusi Terkurasi / Terpilih (Curated & Invitation-Only)**:

### Mengapa kontribusi langsung di repositori upstream dibatasi?
1. **Sistem Misi Kritis Penanggulangan Bencana**: Nusantara Fire Sentinel dirancang sebagai platform peringatan dini dan komando operasional pencegahan kebakaran hutan dan lahan gambut (Karhutla) nasional. Keandalan sistem (*reliability*), batas latensi (*latency SLAs*), dan kepatuhan standar geospasial sangat krusial.
2. **Integritas Arsitektur**: Control Plane mengorkestrasikan partisi heksagonal Uber H3 (Resolusi 8), query spatiotemporal PostGIS, in-memory cache Redis, infrastruktur Google Cloud Run, dan integrasi inferensi gRPC ke akselerator AMD Cloud. Perubahan kode tanpa penyelarasan arsitektur mendalam berisiko mengganggu kestabilan pipeline simulasi dan optimasi rute patroli.
3. **Penyaringan PR, Issue, dan Merge**: Untuk menjaga kualitas kode dan stabilitas operasional, **pembuatan Pull Request, Issue, dan hak Merge di repositori upstream resmi dibatasi secara selektif hanya untuk maintainer utama dan kolaborator resmi yang telah disetujui**.

---

## 🤝 Cara Mengajukan Kontribusi atau Kolaborasi

Jika Anda telah mengembangkan perbaikan bug, optimasi performa, atau fitur inovatif pada fork Anda dan ingin mengajukannya ke repositori utama:

1. **Kembangkan di Fork Pribadi**: Buat fork dari repositori ini dan lakukan pengembangan serta pengujian fitur secara menyeluruh di repositori Anda.
2. **Uji Coba Lokal**: Pastikan seluruh unit test lolos, build Docker berjalan mulus, dan integrasi backend Spring Boot serta frontend Next.js berjalan tanpa error/regresi.
3. **Hubungi Maintainer**: Sebelum membuka Pull Request di repositori utama, silakan hubungi maintainer terlebih dahulu untuk memaparkan usulan Anda:
   * **Maintainer**: Achmad Yusuf Ramadhan
   * **LinkedIn**: [https://linkedin.com/in/cupu2903](https://linkedin.com/in/cupu2903)
   * **GitHub**: [@ayusuf29](https://github.com/ayusuf29)
4. **Proses Kolaborasi / Review**: Setelah proposal diselaraskan dan disetujui, maintainer akan mengundang Anda sebagai kolaborator resmi atau memberikan izin pembukaan PR terarah untuk proses review dan merge.

> **Catatan**: Pull Request atau Issue publik yang dibuka tanpa konfirmasi atau keselarasan arsitektur sebelumnya dapat ditinjau secara selektif atau ditutup secara berkala.

---

## 💻 Standar Kode & Panduan Teknis

Bagi kolaborator resmi yang mengerjakan branch atau PR, harap mematuhi ketentuan berikut:

* **Backend (Java 21 / Spring Boot 3.3)**: Struktur berlapis bersih (Controller &rarr; Service &rarr; Repository), penggunaan Bean Validation, dan penanganan exception yang aman.
* **Geospasial Uber H3**: Wajib mematuhi indeks heksagonal Resolusi 8 dan proyeksi koordinat WGS84 (EPSG:4326).
* **Frontend (Next.js 14)**: Mengikuti konvensi Next.js 14 App Router, TypeScript tanpa tipe `any`, optimasi render layer Deck.gl, dan tata letak responsif.
* **Keamanan Kredensial**: Dilarang keras melakukan commit kunci API, GCP Service Account JSON, atau password database ke dalam git. Gunakan mekanisme file `.env` berbasis `.env.example`.

Terima kasih atas pengertian, apresiasi, dan dedikasi Anda dalam mendukung teknologi pencegahan Karhutla di Indonesia!
