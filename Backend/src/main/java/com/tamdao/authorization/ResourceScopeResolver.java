package com.tamdao.authorization;

import lombok.RequiredArgsConstructor;
import com.tamdao.repository.authorization.AuthorizationScopeRepository;
import org.springframework.stereotype.Component;

/** Resolves tenant scope from persisted resource relationships for SpEL guards. */
@Component
@RequiredArgsConstructor
public class ResourceScopeResolver {

    private final AuthorizationScopeRepository scopeRepository;

    public Long productStoreId(Long productId) {
        return scopeRepository.productStoreId(productId);
    }

    public Long categoryStoreId(Long categoryId) {
        return scopeRepository.categoryStoreId(categoryId);
    }

    public Long inventoryStoreId(Long inventoryId) {
        return scopeRepository.inventoryStoreId(inventoryId);
    }

    public Long orderStoreId(Long orderId) {
        return scopeRepository.orderStoreId(orderId);
    }

    public Long orderBranchId(Long orderId) {
        return scopeRepository.orderBranchId(orderId);
    }

    public Long orderCashierId(Long orderId) {
        return scopeRepository.orderCashierId(orderId);
    }

    public Long storeIdByAdminId(Long adminUserId) {
        return scopeRepository.storeIdByAdminId(adminUserId);
    }

    public Long refundStoreId(Long refundId) {
        return scopeRepository.refundStoreId(refundId);
    }

    public Long refundBranchId(Long refundId) {
        return scopeRepository.refundBranchId(refundId);
    }

    public Long refundCashierId(Long refundId) {
        return scopeRepository.refundCashierId(refundId);
    }

    public Long shiftStoreId(Long shiftId) {
        return scopeRepository.shiftStoreId(shiftId);
    }

    public Long shiftBranchId(Long shiftId) {
        return scopeRepository.shiftBranchId(shiftId);
    }

    public Long shiftCashierId(Long shiftId) {
        return scopeRepository.shiftCashierId(shiftId);
    }

    public Long customerStoreId(Long customerId) {
        return scopeRepository.customerStoreId(customerId);
    }

    public Long customerBranchId(Long customerId) {
        return scopeRepository.customerBranchId(customerId);
    }

    public Long subscriptionStoreId(Long subscriptionId) {
        return scopeRepository.subscriptionStoreId(subscriptionId);
    }
}
