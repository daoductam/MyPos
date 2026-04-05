package com.tamdao.service;

import com.tamdao.domain.PaymentStatus;
import com.tamdao.domain.SubscriptionStatus;
import com.tamdao.modal.Subscription;

import java.util.List;

public interface SubscriptionService {

    // 🆕 Create a new subscription for a store
    Subscription createSubscription(Long storeId,
                                    Long planId,
                                    String gateway,
                                    String transactionId
    );

    // 🔄 Upgrade the current active subscription
    Subscription upgradeSubscription(Long storeId,
                                     Long planId,
                                     String gateway, String transactionId);

    // ✅ Activate subscription (after payment success)
    Subscription activateSubscription(Long subscriptionId);

    // 🚫 Cancel a subscription manually
    Subscription cancelSubscription(Long subscriptionId);

    // ⏳ Expire subscriptions that passed end date
    void expirePastSubscriptions();

    // 🧾 Update payment status (after webhook or manual)
    Subscription updatePaymentStatus(Long subscriptionId, PaymentStatus status);

    // 📋 🔍 Get all or filtered subscriptions of a store (if status provided)
    List<Subscription> getSubscriptionsByStore(Long storeId, SubscriptionStatus status); // combine active + history

    // 📦 📍 Get all or filtered subscriptions (for admin)
    List<Subscription> getAllSubscriptions(SubscriptionStatus status); // null status = all

    // 📅 Get subscriptions expiring in next X days
    List<Subscription> getExpiringSubscriptionsWithin(int days);

    // 📈 Count subscriptions by status
    Long countByStatus(SubscriptionStatus status);
}
