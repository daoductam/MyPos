package com.tamdao.controller;

import com.tamdao.modal.SubscriptionPlan;
import com.tamdao.mapper.SubscriptionPlanMapper;
import com.tamdao.payload.dto.SubscriptionPlanDTO;
import com.tamdao.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/super-admin/subscription-plans")
@PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.subscription_plan.manage')")
@RequiredArgsConstructor
public class SubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    @PostMapping
    public SubscriptionPlanDTO createPlan(@RequestBody SubscriptionPlanDTO plan) {
        return SubscriptionPlanMapper.toDto(subscriptionPlanService.createPlan(SubscriptionPlanMapper.toEntity(plan)));
    }

    @PutMapping("/{id}")
    public SubscriptionPlanDTO updatePlan(
            @PathVariable Long id,
            @RequestBody SubscriptionPlanDTO plan
    ) {
        return SubscriptionPlanMapper.toDto(subscriptionPlanService.updatePlan(id, SubscriptionPlanMapper.toEntity(plan)));
    }

    @GetMapping
    public List<SubscriptionPlanDTO> getAllPlans() {
        return subscriptionPlanService.getAllPlans().stream().map(SubscriptionPlanMapper::toDto).toList();
    }

    @GetMapping("/{id}")
    public SubscriptionPlanDTO getPlanById(@PathVariable Long id) {
        return SubscriptionPlanMapper.toDto(subscriptionPlanService.getPlanById(id));
    }

    @DeleteMapping("/{id}")
    public void deletePlan(@PathVariable Long id) {
        subscriptionPlanService.deletePlan(id);
    }
}
