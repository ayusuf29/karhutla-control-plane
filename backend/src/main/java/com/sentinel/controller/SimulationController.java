package com.sentinel.controller;

import com.sentinel.dto.SimulationDto;
import com.sentinel.service.SimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/simulation")
public class SimulationController {

    private final SimulationService simulationService;

    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/run")
    public ResponseEntity<SimulationDto.RunResult> runSimulation(@RequestBody SimulationDto.RunRequest request) {
        SimulationDto.RunResult result = simulationService.runSimulation(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset")
    public ResponseEntity<SimulationDto.SimulationStats> resetToBaseline() {
        SimulationDto.SimulationStats stats = simulationService.resetToBaseline();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/history")
    public ResponseEntity<List<SimulationDto.HistoryItem>> getHistory() {
        List<SimulationDto.HistoryItem> history = simulationService.getHistory();
        return ResponseEntity.ok(history);
    }

    @PostMapping("/apply/{id}")
    public ResponseEntity<SimulationDto.RunResult> applyHistory(@PathVariable("id") Long simulationId) {
        SimulationDto.RunResult result = simulationService.applyHistory(simulationId);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable("id") Long simulationId) {
        simulationService.deleteHistory(simulationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    public ResponseEntity<SimulationDto.HistoryItem> getActive() {
        return simulationService.getActiveSimulation()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
