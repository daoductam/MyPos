package com.tamdao.payload.dto;

import com.tamdao.domain.BillingCycle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class SubscriptionPlanDTO extends BaseDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private BillingCycle billingCycle;
    private Integer maxBranches;
    private Integer maxUsers;
    private Integer maxProducts;
    private Boolean enableAdvancedReports;
    private Boolean enableInventory;
    private Boolean enableIntegrations;
    private Boolean enableEcommerce;
    private Boolean enableInvoiceBranding;
    private Boolean prioritySupport;
    private Boolean enableMultiLocation;
    private List<String> extraFeatures;
    private Boolean active;
}
