package com.tamdao.modal;

import com.tamdao.domain.BillingCycle;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subscription_plans")
@SQLDelete(sql = "UPDATE subscription_plans SET deleted = true, deleted_at = NOW() WHERE id = ?")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., Starter, Pro

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private BillingCycle billingCycle;

    // 🚀 Feature Flags (Plan Limits + Toggles)

    @Column(nullable = false)
    private Integer maxBranches;
    @Column(nullable = false)
    private Integer maxUsers; // Max cashier/staff accounts
    @Column(nullable = false)
    private Integer maxProducts;             // Max products allowed

    private Boolean enableAdvancedReports;   // Access to detailed reports
    private Boolean enableInventory;         // Enable inventory system
    private Boolean enableIntegrations;      // Integrate with other apps
    private Boolean enableEcommerce;         // Connect to online stores
    private Boolean enableInvoiceBranding;   // Customize invoice template
    private Boolean prioritySupport;         // Priority support access

    @ElementCollection
    private List<String> extraFeatures=new ArrayList<>();

    // Optional extra
    private Boolean enableMultiLocation;     // Existing field

    @Column(nullable = false)
    private Boolean active = true;
}
