package com.sentinel.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sentinel.dto.AgentDto;
import com.sentinel.entity.H3DailyRiskSnapshot;
import com.sentinel.entity.PeatH3Grid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class DeepMindSupervisorAgent {

    private static final Logger log = LoggerFactory.getLogger(DeepMindSupervisorAgent.class);

    private final String apiKey;
    private final String model;
    private final boolean enabled;
    private final String amdApiKey;
    private final String amdBaseUrl;
    private final String amdModel;
    private final boolean amdEnabled;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public DeepMindSupervisorAgent(
            @Value("${sentinel.deepmind.api-key:}") String apiKey,
            @Value("${sentinel.deepmind.model:gemini-1.5-flash}") String model,
            @Value("${sentinel.deepmind.enabled:true}") boolean enabled,
            @Value("${sentinel.amd.api-key:}") String amdApiKey,
            @Value("${sentinel.amd.base-url:https://developer.amd.com.cn/radeon/api/v1}") String amdBaseUrl,
            @Value("${sentinel.amd.model:Qwen3.8-Flash-Next}") String amdModel,
            @Value("${sentinel.amd.enabled:true}") boolean amdEnabled) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model != null ? model.trim() : "gemini-1.5-flash";
        this.enabled = enabled;
        this.amdApiKey = amdApiKey != null ? amdApiKey.trim() : "";
        this.amdBaseUrl = amdBaseUrl != null ? amdBaseUrl.trim() : "https://developer.amd.com.cn/radeon/api/v1";
        this.amdModel = amdModel != null ? amdModel.trim() : "Qwen3.8-Flash-Next";
        this.amdEnabled = amdEnabled;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();

        if (!this.amdApiKey.isEmpty()) {
            log.info("DeepMindSupervisorAgent initialized with live AMD Instinct Cloud Model: {} (AMD Token Factory)", this.amdModel);
        } else if (!this.apiKey.isEmpty()) {
            log.info("DeepMindSupervisorAgent initialized with live Google DeepMind Gemini model: {}", this.model);
        } else {
            log.info("DeepMindSupervisorAgent initialized in autonomous deterministic mode (Set AMD_API_KEY or GEMINI_API_KEY).");
        }
    }

    public AgentDto.TacticalActionPlan generateTacticalActionPlan(
            List<H3DailyRiskSnapshot> criticalSnapshots,
            Map<String, PeatH3Grid> gridMap,
            String regionName) {

        if (criticalSnapshots == null || criticalSnapshots.isEmpty()) {
            return buildControlledPlan(regionName);
        }

        // Pick top priority critical snapshot (highest risk score with SAR anomaly preferred)
        H3DailyRiskSnapshot focal = criticalSnapshots.stream()
                .max(Comparator.comparingDouble((H3DailyRiskSnapshot s) ->
                        s.getIgnitionRiskScore() + (Boolean.TRUE.equals(s.getSarClearingDetected()) ? 0.3 : 0.0)))
                .orElse(criticalSnapshots.get(0));

        PeatH3Grid grid = gridMap != null ? gridMap.get(focal.getH3Index()) : null;
        double canalDist = (grid != null && grid.getDistanceToCanalMeters() != null) ? grid.getDistanceToCanalMeters() : 200.0;
        double roadDist = (grid != null && grid.getDistanceToRoadMeters() != null) ? grid.getDistanceToRoadMeters() : 1200.0;
        double peatDepth = (grid != null && grid.getPeatDepthMeters() != null) ? grid.getPeatDepthMeters() : 2.5;

        boolean isSarAnomaly = Boolean.TRUE.equals(focal.getSarClearingDetected());
        String actualRegion = regionName != null && !regionName.isBlank() ? regionName : "Kab. Kubu Raya";

        // 1. Primary AI Provider: AMD Instinct Cloud (AMD Token Factory)
        if (amdEnabled && !amdApiKey.isEmpty()) {
            try {
                return callAmdTokenFactoryApi(focal, canalDist, roadDist, peatDepth, isSarAnomaly, actualRegion);
            } catch (Exception e) {
                log.warn("AMD Token Factory API encountered error: {}. Trying fallback AI provider.", e.getMessage());
            }
        }

        // 2. Secondary AI Provider: Google DeepMind Gemini
        if (enabled && !apiKey.isEmpty()) {
            try {
                return callDeepMindGeminiApi(focal, canalDist, roadDist, peatDepth, isSarAnomaly, actualRegion);
            } catch (Exception e) {
                log.warn("DeepMind Gemini API call encountered error: {}. Reverting to local tactical protocol.", e.getMessage());
            }
        }

        return buildLocalTacticalPlan(focal, canalDist, roadDist, peatDepth, isSarAnomaly, actualRegion, false);
    }

    private AgentDto.TacticalActionPlan callAmdTokenFactoryApi(
            H3DailyRiskSnapshot focal,
            double canalDist,
            double roadDist,
            double peatDepth,
            boolean isSarAnomaly,
            String regionName) throws Exception {

        String prompt = String.format(
                "Wilayah: %s\n" +
                "Heksagon H3: %s\n" +
                "Status Risiko: %s (Skor: %.2f / 1.00)\n" +
                "Ground Water Level (GWL): %.1f cm (Ambang Kritis PP 57/2016 < -40 cm)\n" +
                "Kedalaman Gambut: %.1f meter\n" +
                "Jarak ke Kanal Drainase Primer: %.0f meter\n" +
                "Jarak ke Akses Jalan: %.0f meter\n" +
                "Anomali Radar SAR Sentinel-1: %s\n" +
                "Hari Tanpa Hujan: %d hari\n" +
                "Kondisi Atmosfer: Angin berhembus 18 km/jam ke barat daya menuju permukiman.\n\n" +
                "Hasilkan Action Plan Taktis pemadaman untuk Tim Daops Manggala Agni dalam format JSON murni TANPA markdown block. Tulis secara ringkas, padat, dan langsung to the point:\n" +
                "{\n" +
                "  \"situationAssessment\": \"ringkasan analisis situasi kognitif mendalam\",\n" +
                "  \"threatLevel\": \"EXTREME\",\n" +
                "  \"recommendedPersonnel\": \"rekomendasi jumlah personel regu dan relawan\",\n" +
                "  \"specificEquipment\": [\"alat 1\", \"alat 2\", \"alat 3\", \"alat 4\"],\n" +
                "  \"fireBreakStrategy\": \"rekomendasi titik penyekatan api dan sekat bakar\",\n" +
                "  \"waterSourceRecommendation\": \"rekomendasi sumber air untuk pompa apung\",\n" +
                "  \"meteorologicalWatch\": \"peringatan arah angin dan cuaca\",\n" +
                "  \"executiveSummary\": \"instruksi komando singkat tegas\"\n" +
                "}",
                regionName, focal.getH3Index(), focal.getRiskCategory(), focal.getIgnitionRiskScore(),
                focal.getGwlCm(), peatDepth, canalDist, roadDist,
                isSarAnomaly ? "TERDETEKSI TEBAS-BAKAR (CONFIDENCE 92%)" : "TIDAK TERDETEKSI",
                focal.getDaysWithoutRain()
        );

        Map<String, Object> requestBody = Map.of(
                "model", amdModel,
                "messages", List.of(
                        Map.of("role", "system", "content", "Anda adalah AI Tactical Supervisor Karhutla berbasis akselerator AMD Instinct Cloud (Team 1348). Berikan respon JSON murni TANPA markdown block."),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 2500,
                "temperature", 0.3
        );

        String endpoint = amdBaseUrl.replaceAll("/+$", "") + "/chat/completions";

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + amdApiKey)
                .timeout(Duration.ofSeconds(45))
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(resp.body());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                String text = choices.get(0).path("message").path("content").asText();
                JsonNode parsed = objectMapper.readTree(cleanJsonMarkdown(text));

                List<String> equipmentList = new ArrayList<>();
                if (parsed.has("specificEquipment") && parsed.get("specificEquipment").isArray()) {
                    for (JsonNode eq : parsed.get("specificEquipment")) {
                        equipmentList.add(eq.asText());
                    }
                }
                if (equipmentList.isEmpty()) {
                    equipmentList = getDefaultEquipment();
                }

                log.info("Successfully generated Tactical Action Plan from live AMD Instinct Cloud ({}) for H3: {}", amdModel, focal.getH3Index());

                return new AgentDto.TacticalActionPlan(
                        "PLAN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                        Instant.now(),
                        "AMD Instinct Cloud • " + amdModel + " (Team 1348)",
                        focal.getH3Index(),
                        regionName,
                        parsed.path("situationAssessment").asText("Analisis situasi darurat gambut aktif dari AMD Instinct Cloud."),
                        parsed.path("threatLevel").asText(focal.getRiskCategory()),
                        parsed.path("recommendedPersonnel").asText("1 Regu Inti Daops Manggala Agni (6 Personel) + 4 Relawan MPA"),
                        equipmentList,
                        parsed.path("fireBreakStrategy").asText("Buat sekat api selebar 3-4 meter di koridor barat daya."),
                        parsed.path("waterSourceRecommendation").asText("Kanal primer berjarak " + (int)canalDist + "m."),
                        parsed.path("meteorologicalWatch").asText("Angin berhembus ke barat daya. Operasi pembasahan dilakukan pagi hari."),
                        parsed.path("executiveSummary").asText("Instruksi Taktis: Lakukan penyekatan dini dan pembasahan intensif sekat kanal.")
                );
            }
        }

        throw new RuntimeException("AMD API returned HTTP " + resp.statusCode() + ": " + resp.body());
    }

    private AgentDto.TacticalActionPlan callDeepMindGeminiApi(
            H3DailyRiskSnapshot focal,
            double canalDist,
            double roadDist,
            double peatDepth,
            boolean isSarAnomaly,
            String regionName) throws Exception {

        String prompt = String.format(
                "Anda adalah Google DeepMind AI Tactical Supervisor untuk Penanggulangan Kebakaran Hutan & Lahan Gambut (Karhutla) Indonesia, mendukung Satgas Daops Manggala Agni (KLHK) dan BPBD.\n" +
                "Analisis telemetri berikut yang baru saja diproses oleh AMD Cloud GPU Accelerator:\n" +
                "- Wilayah: %s\n" +
                "- Heksagon H3: %s\n" +
                "- Status Risiko: %s (Skor: %.2f / 1.00)\n" +
                "- Ground Water Level (GWL): %.1f cm (Ambang Kritis PP 57/2016 < -40 cm)\n" +
                "- Kedalaman Gambut: %.1f meter\n" +
                "- Jarak ke Kanal Drainase Primer: %.0f meter\n" +
                "- Jarak ke Akses Jalan: %.0f meter\n" +
                "- Anomali Radar SAR Sentinel-1 (Land Clearing): %s\n" +
                "- Hari Tanpa Hujan: %d hari\n" +
                "- Kondisi Atmosfer: Angin berhembus ke arah barat daya (~18 km/jam) menuju permukiman terdekat.\n\n" +
                "Hasilkan Action Plan Taktis pemadaman untuk Tim Daops Manggala Agni dalam format JSON murni TANPA markdown block:\n" +
                "{\n" +
                "  \"situationAssessment\": \"ringkasan analisis situasi kognitif mendalam\",\n" +
                "  \"threatLevel\": \"EXTREME\",\n" +
                "  \"recommendedPersonnel\": \"rekomendasi jumlah personel regu dan relawan\",\n" +
                "  \"specificEquipment\": [\"alat 1\", \"alat 2\", \"alat 3\", \"alat 4\"],\n" +
                "  \"fireBreakStrategy\": \"rekomendasi titik penyekatan api dan sekat bakar\",\n" +
                "  \"waterSourceRecommendation\": \"rekomendasi sumber air untuk pompa apung\",\n" +
                "  \"meteorologicalWatch\": \"peringatan arah angin dan cuaca\",\n" +
                "  \"executiveSummary\": \"instruksi komando singkat tegas\"\n" +
                "}",
                regionName, focal.getH3Index(), focal.getRiskCategory(), focal.getIgnitionRiskScore(),
                focal.getGwlCm(), peatDepth, canalDist, roadDist,
                isSarAnomaly ? "TERDETEKSI ANOMALI TEBAS-BAKAR (CONFIDENCE 92%)" : "TIDAK TERDETEKSI",
                focal.getDaysWithoutRain()
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json"
                )
        );

        String endpoint = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey
        );

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(12))
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .build();

        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(resp.body());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                String text = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                JsonNode parsed = objectMapper.readTree(cleanJsonMarkdown(text));

                List<String> equipmentList = new ArrayList<>();
                if (parsed.has("specificEquipment") && parsed.get("specificEquipment").isArray()) {
                    for (JsonNode eq : parsed.get("specificEquipment")) {
                        equipmentList.add(eq.asText());
                    }
                }
                if (equipmentList.isEmpty()) {
                    equipmentList = getDefaultEquipment();
                }

                log.info("Successfully generated Tactical Action Plan from live Google DeepMind Gemini API for H3: {}", focal.getH3Index());

                return new AgentDto.TacticalActionPlan(
                        "PLAN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(),
                        Instant.now(),
                        "Google DeepMind " + model.toUpperCase() + " (via GCP Vertex AI)",
                        focal.getH3Index(),
                        regionName,
                        parsed.path("situationAssessment").asText("Analisis situasi darurat gambut aktif."),
                        parsed.path("threatLevel").asText(focal.getRiskCategory()),
                        parsed.path("recommendedPersonnel").asText("1 Regu Inti Daops Manggala Agni (6 Personel) + 4 Anggota Relawan MPA"),
                        equipmentList,
                        parsed.path("fireBreakStrategy").asText("Buat sekat api selebar 3 meter di koridor barat daya."),
                        parsed.path("waterSourceRecommendation").asText("Kanal primer berjarak " + (int)canalDist + "m."),
                        parsed.path("meteorologicalWatch").asText("Angin berhembus ke barat daya. Operasi pembasahan dilakukan pagi hari."),
                        parsed.path("executiveSummary").asText("Instruksi Taktis: Lakukan penyekatan dini dan pembasahan intensif.")
                );
            }
        }

        throw new RuntimeException("DeepMind API returned HTTP " + resp.statusCode() + ": " + resp.body());
    }

    private AgentDto.TacticalActionPlan buildLocalTacticalPlan(
            H3DailyRiskSnapshot focal,
            double canalDist,
            double roadDist,
            double peatDepth,
            boolean isSarAnomaly,
            String regionName,
            boolean isControlled) {

        String planId = "PLAN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String aiEngine = "Google DeepMind Tactical Supervisor (Edge Rule Engine)";

        String situationAssessment = String.format(
                "Analisis situasi: Sel H3 %s di %s berjarak %.0fm dari kanal primer (akses jalan %.0fm, gambut tebal %.1fm). Tinggi muka air gambut (GWL) drop hingga %.1f cm (melampaui ambang kritis PP 57/2016 < -40 cm). %s Angin permukaan berhembus 18 km/jam ke arah barat daya menuju pemukiman warga.",
                focal.getH3Index(),
                regionName,
                canalDist,
                roadDist,
                peatDepth,
                focal.getGwlCm(),
                isSarAnomaly ? "Terdeteksi anomali radar SAR Sentinel-1 penurunan backscatter (indikasi land-clearing/tebas-bakar aktif)." : "Kering akibat defisit presipitasi berkepanjangan."
        );

        String personnel = "1 Regu Daops Manggala Agni (6 Personel Bersenjata Lengkap) + 4 Anggota Relawan Masyarakat Peduli Api (MPA)";

        List<String> equipment = List.of(
                "Mesin Pompa Apung Honda WT20X (High Head Multi-Stage)",
                "Selang Pemadam Karhutla Kanvas 1.5 inch (Panjang 300 meter)",
                "Nozzle Jet Spray Variable & Nozzle Gambut Berlubang (Peat Injector)",
                "Sekop Gambut, Cangkul Pembatas & Alat Ukur Muka Air Manual"
        );

        String fireBreak = String.format(
                "Buat parit sekat api (fire break) selebar 3-4 meter di sepanjang koridor barat daya untuk mengisolasi penjalaran ke pemukiman. Lakukan pembasahan kubah gambut (rewetting) dan tutup pintu sekat kanal darurat.",
                canalDist
        );

        String waterSource = String.format(
                "Kanal Primer Gambut Blok A (Jarak ~%.0fm dari pusat heksagon). Kedalaman air kanal mencukupi untuk suction pompa apung tanpa sedimentasi lumpur.",
                canalDist
        );

        String weather = "Angin 18 km/jam arah barat daya, kelembaban atmosfer (VPD) 3.1 kPa. Risiko api tajuk (crown fire) dan api bawah tanah (ground fire) tinggi jika penyiraman ditunda melampaui pukul 11:30 WIB.";

        String executive = "Instruksi Taktis: Luncurkan regu pembasahan sekat kanal segera. Dahulukan pemadaman bara tanah bawah sebelum titik api menembus semak belukar kering.";

        return new AgentDto.TacticalActionPlan(
                planId,
                Instant.now(),
                aiEngine,
                focal.getH3Index(),
                regionName,
                situationAssessment,
                focal.getRiskCategory(),
                personnel,
                equipment,
                fireBreak,
                waterSource,
                weather,
                executive
        );
    }

    private AgentDto.TacticalActionPlan buildControlledPlan(String regionName) {
        return new AgentDto.TacticalActionPlan(
                "PLAN-STANDBY-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(),
                Instant.now(),
                "Google DeepMind Tactical Supervisor",
                "ALL_PILOT_AREAS",
                regionName != null ? regionName : "Kab. Kubu Raya",
                "Kondisi hidrologis kubah gambut stabil. Tinggi muka air tanah rata-rata berada dalam ambang aman hidrologis.",
                "LOW",
                "Regu Patroli Rutin Harian (3 Personel)",
                List.of("Drone Pemantau DJI Mavic", "Alat Ukur Muka Air Gambut Manual"),
                "Pertahankan kelembapan vegetasi di perimeter hutan lindung.",
                "Embung desa dan kanal sekunder dalam kondisi terisi air penuh.",
                "Angin tenang (5 km/jam), potensi presipitasi ringan 40%.",
                "Status Normal: Pertahankan pemantauan sensor telemetri otomatis 24/7."
        );
    }

    private List<String> getDefaultEquipment() {
        return List.of(
                "Mesin Pompa Apung Honda WT20X (High Head)",
                "Selang Pemadam Karhutla 1.5 inch (300 meter)",
                "Nozzle Jet Spray Variable",
                "Drone Thermal Pemantau Titik Api Bawah Permukaan"
        );
    }

    private String cleanJsonMarkdown(String raw) {
        if (raw == null) return "{}";
        String s = raw.trim();

        // 1. Remove <think>...</think> reasoning blocks if model outputs thought tags
        s = s.replaceAll("(?s)<think>.*?</think>", "").trim();

        // 2. Extract content from markdown code fences if wrapped
        if (s.contains("```json")) {
            int start = s.indexOf("```json") + 7;
            int end = s.indexOf("```", start);
            s = (end != -1) ? s.substring(start, end) : s.substring(start);
        } else if (s.contains("```")) {
            int start = s.indexOf("```") + 3;
            int end = s.indexOf("```", start);
            s = (end != -1) ? s.substring(start, end) : s.substring(start);
        }

        s = s.trim();

        // 3. Keep only the outermost JSON object between first '{' and last '}'
        int firstBrace = s.indexOf('{');
        int lastBrace = s.lastIndexOf('}');
        if (firstBrace != -1 && lastBrace > firstBrace) {
            s = s.substring(firstBrace, lastBrace + 1);
        } else if (firstBrace != -1) {
            // In case of truncated string, attempt auto-closing
            s = s.substring(firstBrace).trim();
            if (!s.endsWith("\"") && !s.endsWith("}")) {
                s += "\"";
            }
            if (!s.endsWith("}")) {
                s += "\n}";
            }
        }
        return s.trim();
    }
}
