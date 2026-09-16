package com.tamdao.mapper;

import com.tamdao.modal.SubscriptionPlan;
import com.tamdao.payload.dto.SubscriptionPlanDTO;

public final class SubscriptionPlanMapper {

    private SubscriptionPlanMapper() {
    }

    public static SubscriptionPlanDTO toDto(SubscriptionPlan plan) {
        if (plan == null) {
            return null;
        }
        SubscriptionPlanDTO dto = new SubscriptionPlanDTO();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        dto.setPrice(plan.getPrice());
        dto.setBillingCycle(plan.getBillingCycle());
        dto.setMaxBranches(plan.getMaxBranches());
        dto.setMaxUsers(plan.getMaxUsers());
        dto.setMaxProducts(plan.getMaxProducts());
        dto.setEnableAdvancedReports(plan.getEnableAdvancedReports());
        dto.setEnableInventory(plan.getEnableInventory());
        dto.setEnableIntegrations(plan.getEnableIntegrations());
        dto.setEnableEcommerce(plan.getEnableEcommerce());
        dto.setEnableInvoiceBranding(plan.getEnableInvoiceBranding());
        dto.setPrioritySupport(plan.getPrioritySupport());
        dto.setEnableMultiLocation(plan.getEnableMultiLocation());
        dto.setExtraFeatures(plan.getExtraFeatures());
        dto.setActive(plan.getActive());
        dto.setDeleted(plan.getDeleted());
        dto.setDeletedAt(plan.getDeletedAt());
        dto.setDeletedBy(plan.getDeletedBy());
        dto.setCreatedAt(plan.getCreatedAt());
        dto.setCreatedBy(plan.getCreatedBy());
        dto.setUpdatedAt(plan.getUpdatedAt());
        dto.setUpdatedBy(plan.getUpdatedBy());
        return dto;
    }

    public static SubscriptionPlan toEntity(SubscriptionPlanDTO dto) {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName(dto.getName());
        plan.setDescription(dto.getDescription());
        plan.setPrice(dto.getPrice());
        plan.setBillingCycle(dto.getBillingCycle());
        plan.setMaxBranches(dto.getMaxBranches());
        plan.setMaxUsers(dto.getMaxUsers());
        plan.setMaxProducts(dto.getMaxProducts());
        plan.setEnableAdvancedReports(dto.getEnableAdvancedReports());
        plan.setEnableInventory(dto.getEnableInventory());
        plan.setEnableIntegrations(dto.getEnableIntegrations());
        plan.setEnableEcommerce(dto.getEnableEcommerce());
        plan.setEnableInvoiceBranding(dto.getEnableInvoiceBranding());
        plan.setPrioritySupport(dto.getPrioritySupport());
        plan.setEnableMultiLocation(dto.getEnableMultiLocation());
        plan.setExtraFeatures(dto.getExtraFeatures());
        plan.setActive(dto.getActive());
        return plan;
    }
}
