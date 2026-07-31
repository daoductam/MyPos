package com.tamdao.service;

import com.tamdao.modal.SubscriptionPlan;

import java.util.List;

public interface SubscriptionPlanService {
    SubscriptionPlan createPlan(SubscriptionPlan plan);
    SubscriptionPlan updatePlan(Long id, SubscriptionPlan updatedPlan);
    SubscriptionPlan getPlanById(Long id);
    List<SubscriptionPlan> getAllPlans();
    void deletePlan(Long id);
}
