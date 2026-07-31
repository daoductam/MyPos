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
}
