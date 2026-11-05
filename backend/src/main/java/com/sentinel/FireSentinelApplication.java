package com.sentinel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@EnableScheduling
public class FireSentinelApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(FireSentinelApplication.class, args);
    }

    /**
     * Automatically loads .env files when running locally via Maven / Terminal
     * without needing external plugins or manual export commands.
     */
    private static void loadDotEnv() {
        Path[] searchPaths = new Path[]{
                Paths.get(".env"),
                Paths.get("..", ".env"),
                Paths.get("..", "..", ".env"),
                Paths.get("karhutla-control-plane-gcp", ".env")
        };

        for (Path p : searchPaths) {
            if (Files.exists(p)) {
                try {
                    List<String> lines = Files.readAllLines(p);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                            continue;
                        }
                        int eq = line.indexOf('=');
                        String key = line.substring(0, eq).trim();
                        String val = line.substring(eq + 1).trim();
                        if ((val.startsWith("\"") && val.endsWith("\"")) ||
                            (val.startsWith("'") && val.endsWith("'"))) {
                            val = val.substring(1, val.length() - 1);
                        }
                        if (!val.isEmpty() && System.getenv(key) == null && System.getProperty(key) == null) {
                            System.setProperty(key, val);
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }
    }
}
