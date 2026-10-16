package com.sentinel.controller;

import com.sentinel.dto.AgentDto;
import com.sentinel.grpc.BatchRiskResponse;
import com.sentinel.service.PatrolOptimizerAgent;
import com.sentinel.service.RiskAssessorAgent;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/agents")
public class AgentController {

    private final PatrolOptimizerAgent patrolOptimizerAgent;
    private final RiskAssessorAgent riskAssessorAgent;
    private final com.sentinel.service.DeepMindSupervisorAgent deepMindSupervisorAgent;

    public AgentController(
            PatrolOptimizerAgent patrolOptimizerAgent,
            RiskAssessorAgent riskAssessorAgent,
            com.sentinel.service.DeepMindSupervisorAgent deepMindSupervisorAgent) {
        this.patrolOptimizerAgent = patrolOptimizerAgent;
        this.riskAssessorAgent = riskAssessorAgent;
        this.deepMindSupervisorAgent = deepMindSupervisorAgent;
    }

    @GetMapping("/recommendations")
    public ResponseEntity<AgentDto.RecommendationOverview> getRecommendations() {
        AgentDto.RecommendationOverview overview = patrolOptimizerAgent.generateFullRecommendations();
        return ResponseEntity.ok(overview);
    }

    @GetMapping("/tactical-plan")
    public ResponseEntity<AgentDto.TacticalActionPlan> getTacticalPlan() {
        AgentDto.RecommendationOverview overview = patrolOptimizerAgent.generateFullRecommendations();
        return ResponseEntity.ok(overview.getTacticalActionPlan());
    }

    @GetMapping("/summary")
    public ResponseEntity<AgentDto.AssessorSummary> getSummary() {
        AgentDto.AssessorSummary summary = riskAssessorAgent.evaluateCurrentRiskSummary();
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/reassess")
    public ResponseEntity<BatchRiskResponse> triggerReassessment(
            @RequestParam(value = "regionId", defaultValue = "ALL_PILOT_AREAS") String regionId) {
        BatchRiskResponse response = riskAssessorAgent.triggerBatchReassessment(regionId);
        return ResponseEntity.ok(response);
    }
}
