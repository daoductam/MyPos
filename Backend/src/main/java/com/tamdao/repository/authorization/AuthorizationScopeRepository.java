package com.tamdao.repository.authorization;

public interface AuthorizationScopeRepository {

    boolean storeExists(Long storeId);

    Long branchStoreId(Long branchId);

    UserScope userScope(Long userId);

    Long userIdByEmail(String email);

    Long userStoreId(Long userId);

    CustomerScope customerScope(Long customerId);

    Long productStoreId(Long productId);

    Long categoryStoreId(Long categoryId);

    Long inventoryStoreId(Long inventoryId);

    Long orderStoreId(Long orderId);

    Long orderBranchId(Long orderId);

    Long orderCashierId(Long orderId);

    Long storeIdByAdminId(Long adminUserId);

    Long refundStoreId(Long refundId);

    Long refundBranchId(Long refundId);

    Long refundCashierId(Long refundId);

    Long shiftStoreId(Long shiftId);

    Long shiftBranchId(Long shiftId);

    Long shiftCashierId(Long shiftId);

    Long customerStoreId(Long customerId);

    Long customerBranchId(Long customerId);

    Long subscriptionStoreId(Long subscriptionId);

    record UserScope(Long storeId, Long branchId) {
    }

    record CustomerScope(Long storeId, Long branchId) {
    }
}
