package com.tamdao.controller;

import com.tamdao.domain.PaymentStatus;
import com.tamdao.domain.SubscriptionStatus;
import com.tamdao.modal.Subscription;
import com.tamdao.mapper.SubscriptionMapper;
import com.tamdao.payload.dto.SubscriptionDTO;
import com.tamdao.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;


    // 🆕 Store subscribes to a plan (TRIAL or NEW)
    @PostMapping("/subscribe")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'subscription.manage', #storeId)")
    public SubscriptionDTO createSubscription(
            @RequestParam Long storeId,
            @RequestParam Long planId,
            @RequestParam(defaultValue = "RAZORPAY") String gateway,
            @RequestParam(required = false) String transactionId
    ) {


        return SubscriptionMapper.toDto(subscriptionService.createSubscription(storeId, planId, gateway, transactionId));
    }

    // 🔁 Store upgrades to a new plan (ACTIVE)
    @PostMapping("/upgrade")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'subscription.manage', #storeId)")
    public SubscriptionDTO upgradePlan(
            @RequestParam Long storeId,
            @RequestParam Long planId,
            @RequestParam(defaultValue = "RAZORPAY") String gateway,
            @RequestParam(required = false) String transactionId
    ) {

        return SubscriptionMapper.toDto(subscriptionService.upgradeSubscription(storeId, planId, gateway, transactionId));
    }

    // ✅ Admin activates a subscription
    @PutMapping("/{subscriptionId}/activate")
    @PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.subscription.read')")
    public SubscriptionDTO activateSubscription(@PathVariable Long subscriptionId) {
        return SubscriptionMapper.toDto(subscriptionService.activateSubscription(subscriptionId));
    }

    // ❌ Admin cancels a subscription
    @PutMapping("/{subscriptionId}/cancel")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'subscription.manage', @resourceScopeResolver.subscriptionStoreId(#subscriptionId)) or @authorizationGuard.hasPlatformPermission(authentication, 'platform.subscription.read')")
    public SubscriptionDTO cancelSubscription(@PathVariable Long subscriptionId) {
        return SubscriptionMapper.toDto(subscriptionService.cancelSubscription(subscriptionId));
    }

    // 💳 Update payment status manually (if needed)
    @PutMapping("/{subscriptionId}/payment-status")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'payment.manage', @resourceScopeResolver.subscriptionStoreId(#subscriptionId)) or @authorizationGuard.hasPlatformPermission(authentication, 'platform.subscription.read')")
    public SubscriptionDTO updatePaymentStatus(
            @PathVariable Long subscriptionId,
            @RequestParam PaymentStatus status
    ) {
        return SubscriptionMapper.toDto(subscriptionService.updatePaymentStatus(subscriptionId, status));
    }

    // 📦 Store: Get all subscriptions (or by status)
    @GetMapping("/store/{storeId}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'subscription.read', #storeId)")
    public List<SubscriptionDTO> getStoreSubscriptions(
            @PathVariable Long storeId,
            @RequestParam(required = false) SubscriptionStatus status
    ) {
        return subscriptionService.getSubscriptionsByStore(storeId, status).stream().map(SubscriptionMapper::toDto).toList();
    }

    // 🗂️ Admin: Get all subscriptions (optionally filter by status)
    @GetMapping("/admin")
    @PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.subscription.read')")
    public List<SubscriptionDTO> getAllSubscriptions(
            @RequestParam(required = false) SubscriptionStatus status
    ) {
        return subscriptionService.getAllSubscriptions(status).stream().map(SubscriptionMapper::toDto).toList();
    }

    // ⌛ Admin: Get subscriptions expiring within X days
    @GetMapping("/admin/expiring")
    @PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.subscription.read')")
    public List<SubscriptionDTO> getExpiringSubscriptions(
            @RequestParam(defaultValue = "7") int days
    ) {
        return subscriptionService.getExpiringSubscriptionsWithin(days).stream().map(SubscriptionMapper::toDto).toList();
    }

    // 📊 Count total subscriptions by status
    @GetMapping("/admin/count")
    @PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.subscription.read')")
    public Long countByStatus(
            @RequestParam SubscriptionStatus status
    ) {
        return subscriptionService.countByStatus(status);
    }
}
