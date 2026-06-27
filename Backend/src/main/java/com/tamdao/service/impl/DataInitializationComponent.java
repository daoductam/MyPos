package com.tamdao.service.impl;

import com.tamdao.domain.UserRole;
import com.tamdao.modal.User;
import com.tamdao.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializationComponent implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Super Admin: Quản trị viên tối cao của toàn hệ thống SaaS POS
        initializeUserIfNotExist("tam@gmail.com", "tam123456", "Tam Super Admin", UserRole.ROLE_ADMIN);

        // 2. Store Admin: Quản trị viên cấp chuỗi cửa hàng, quản lý cấu hình và nhân sự
        // cấp cao của chuỗi
        initializeUserIfNotExist("store.admin@dmart.com", "StoreAdmin@123", "Store Admin", UserRole.ROLE_STORE_ADMIN);

        // 3. Store Manager: Quản lý cấp chuỗi cửa hàng, điều phối hoạt động kinh doanh
        // tổng thể của chuỗi
        initializeUserIfNotExist("store.manager@dmart.com", "StoreManager@123", "Store Manager",
                UserRole.ROLE_STORE_MANAGER);

        // 4. Branch Manager: Quản lý chi nhánh, phụ trách doanh thu, nhân sự và hàng
        // hóa tại một chi nhánh cụ thể
        initializeUserIfNotExist("branch.manager@dmart.com", "BranchManager@123", "Branch Manager",
                UserRole.ROLE_BRANCH_MANAGER);

        // 5. Branch Admin: Quản trị viên chi nhánh, quản lý kỹ thuật, cấu hình thiết
        // bị/quầy và phân quyền tại chi nhánh
        initializeUserIfNotExist("branch.admin@dmart.com", "BranchAdmin@123", "Branch Admin",
                UserRole.ROLE_BRANCH_ADMIN);

        // 6. Branch Cashier: Thu ngân chi nhánh, thực hiện các giao dịch bán hàng,
        // thanh toán và in hóa đơn cho khách
        initializeUserIfNotExist("cashier@dmart.com", "Cashier@123", "Branch Cashier", UserRole.ROLE_BRANCH_CASHIER);

        // 7. Customer: Khách hàng thành viên, tích điểm, nhận ưu đãi và tra cứu lịch sử
        // mua hàng cá nhân
        initializeUserIfNotExist("customer@gmail.com", "Customer@123", "Customer Guest", UserRole.ROLE_CUSTOMER);
    }

    private void initializeUserIfNotExist(String email, String rawPassword, String fullName, UserRole role) {
        if (userRepository.findByEmail(email) == null) {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setFullName(fullName);
            user.setRole(role);
            userRepository.save(user);
        }
    }
}
