package com.tamdao.util;

import com.tamdao.domain.UserRole;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.modal.*;
import com.tamdao.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserService userService;

    public void checkAuthority(Store store) {
        User user = userService.getCurrentUser();
        if (user.getRole() != UserRole.ROLE_STORE_MANAGER && user.getRole() != UserRole.ROLE_STORE_ADMIN) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Only store manager or store admin can perform this action.");
        }
        if (user.getRole() == UserRole.ROLE_STORE_ADMIN) {
            if (store.getStoreAdmin() == null || !store.getStoreAdmin().getId().equals(user.getId())) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "You are not authorized to manage this store.");
            }
        } else {
            if (user.getStore() == null || !user.getStore().getId().equals(store.getId())) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "You are not authorized to manage this store.");
            }
        }
    }

    public void checkAuthority(Product product) {
        checkAuthority(product.getStore());
    }

    public void checkAuthority(Branch branch) {
        checkAuthority(branch.getStore());
    }

    public void checkAuthority(Inventory inventory) {
        checkAuthority(inventory.getBranch());
    }

    public void checkBranchAccess(Branch branch) {
        if (branch == null) return;
        User user = userService.getCurrentUser();
        if (user.getRole() == UserRole.ROLE_ADMIN) return;
        if (user.getRole() == UserRole.ROLE_STORE_ADMIN || user.getRole() == UserRole.ROLE_STORE_MANAGER) {
            if (user.getStore() != null && branch.getStore() != null && user.getStore().getId().equals(branch.getStore().getId())) {
                return;
            }
        }
        if (user.getBranch() != null && user.getBranch().getId().equals(branch.getId())) {
            return;
        }
        throw new BusinessException(ErrorCode.UNAUTHORIZED, "You are not authorized to access data of this branch.");
    }

    public void checkAuthority(Order order) {
        if (order != null) {
            checkBranchAccess(order.getBranch());
        }
    }
}
