package com.tamdao.service.impl;

import com.tamdao.domain.BillingCycle;
import com.tamdao.domain.StoreStatus;
import com.tamdao.domain.UserRole;
import com.tamdao.modal.Branch;
import com.tamdao.modal.Store;
import com.tamdao.modal.SubscriptionPlan;
import com.tamdao.modal.User;
import com.tamdao.repository.BranchRepository;
import com.tamdao.repository.StoreRepository;
import com.tamdao.repository.SubscriptionPlanRepository;
import com.tamdao.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializationComponent implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 0. Seed Subscription Plans
        initializeSubscriptionPlansIfNotExist();

        // 1. Super Admin: Quản trị viên tối cao của toàn hệ thống SaaS POS
        initializeUserIfNotExist("tam@gmail.com", "tam123456", "Tam Super Admin", UserRole.ROLE_ADMIN, null, null);

        // 2. Store Admin: Quản trị viên cấp chuỗi cửa hàng, quản lý cấu hình và nhân sự cấp cao của chuỗi
        User storeAdmin = initializeUserIfNotExist("store.admin@dmart.com", "StoreAdmin@123", "Store Admin", UserRole.ROLE_STORE_ADMIN, null, null);
        Store store = null;
        if (storeAdmin != null) {
            store = initializeStoreIfNotExist(storeAdmin, "D Mart HN", "Hệ thống siêu thị tiện ích D Mart Hà Nội", "Supermarket");
            if (storeAdmin.getStore() == null) {
                storeAdmin.setStore(store);
                userRepository.save(storeAdmin);
            }
        }

        // Initialize a default branch for demo
        Branch branch = null;
        if (store != null) {
            branch = initializeBranchIfNotExist(store, "D Mart Cầu Giấy", "Số 1 Cầu Giấy, Hà Nội", "0987654321");
        }

        // 3. Store Manager: Quản lý cấp chuỗi cửa hàng, điều phối hoạt động kinh doanh tổng thể của chuỗi
        initializeUserIfNotExist("store.manager@dmart.com", "StoreManager@123", "Store Manager", UserRole.ROLE_STORE_MANAGER, store, null);

        // 4. Branch Manager: Quản lý chi nhánh, phụ trách doanh thu, nhân sự và hàng hóa tại một chi nhánh cụ thể
        initializeUserIfNotExist("branch.manager@dmart.com", "BranchManager@123", "Branch Manager", UserRole.ROLE_BRANCH_MANAGER, store, branch);

        // 5. Branch Admin: Quản trị viên chi nhánh, quản lý kỹ thuật, cấu hình thiết bị/quầy và phân quyền tại chi nhánh
        initializeUserIfNotExist("branch.admin@dmart.com", "BranchAdmin@123", "Branch Admin", UserRole.ROLE_BRANCH_ADMIN, store, branch);

        // 6. Branch Cashier: Thu ngân chi nhánh, thực hiện các giao dịch bán hàng, thanh toán và in hóa đơn cho khách
        initializeUserIfNotExist("cashier@dmart.com", "Cashier@123", "Branch Cashier", UserRole.ROLE_BRANCH_CASHIER, store, branch);

        // 7. Customer: Khách hàng thành viên, tích điểm, nhận ưu đãi và tra cứu lịch sử mua hàng cá nhân
        initializeUserIfNotExist("customer@gmail.com", "Customer@123", "Customer Guest", UserRole.ROLE_CUSTOMER, null, null);
    }

    private User initializeUserIfNotExist(String email, String rawPassword, String fullName, UserRole role, Store store, Branch branch) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setFullName(fullName);
            user.setRole(role);
            user.setStore(store);
            user.setBranch(branch);
            user = userRepository.save(user);
        } else {
            boolean updated = false;
            if (store != null && user.getStore() == null) {
                user.setStore(store);
                updated = true;
            }
            if (branch != null && user.getBranch() == null) {
                user.setBranch(branch);
                updated = true;
            }
            if (updated) {
                user = userRepository.save(user);
            }
        }
        return user;
    }

    private Store initializeStoreIfNotExist(User storeAdmin, String brand, String description, String storeType) {
        Store store = storeRepository.findByStoreAdminId(storeAdmin.getId());
        if (store == null) {
            store = Store.builder()
                    .brand(brand)
                    .storeAdmin(storeAdmin)
                    .description(description)
                    .storeType(storeType)
                    .status(StoreStatus.ACTIVE)
                    .build();
            store = storeRepository.save(store);
        } else if (store.getStatus() != StoreStatus.ACTIVE) {
            store.setStatus(StoreStatus.ACTIVE);
            store = storeRepository.save(store);
        }
        return store;
    }

    private Branch initializeBranchIfNotExist(Store store, String name, String address, String phone) {
        List<Branch> branches = branchRepository.findByStoreId(store.getId());
        if (branches.isEmpty()) {
            Branch branch = Branch.builder()
                    .name(name)
                    .address(address)
                    .phone(phone)
                    .email("caugiay@dmart.com")
                    .openTime(LocalTime.of(8, 0))
                    .closeTime(LocalTime.of(22, 0))
                    .store(store)
                    .build();
            return branchRepository.save(branch);
        }
        return branches.get(0);
    }

    private void initializeSubscriptionPlansIfNotExist() {
        if (subscriptionPlanRepository.count() == 0) {
            SubscriptionPlan starter = SubscriptionPlan.builder()
                    .name("Starter")
                    .description("Phù hợp cho hộ kinh doanh nhỏ và cửa hàng đơn lẻ.")
                    .price(300000.0)
                    .billingCycle(BillingCycle.MONTHLY)
                    .maxBranches(1)
                    .maxUsers(3)
                    .maxProducts(100)
                    .enableAdvancedReports(false)
                    .enableInventory(true)
                    .enableIntegrations(false)
                    .enableEcommerce(false)
                    .enableInvoiceBranding(false)
                    .prioritySupport(false)
                    .active(true)
                    .extraFeatures(Arrays.asList("1 Chi nhánh", "Tối đa 3 nhân viên", "Tối đa 100 sản phẩm", "Hỗ trợ qua email"))
                    .build();

            SubscriptionPlan professional = SubscriptionPlan.builder()
                    .name("Professional")
                    .description("Gói phổ biến nhất cho các cửa hàng đang phát triển nhanh.")
                    .price(900000.0)
                    .billingCycle(BillingCycle.MONTHLY)
                    .maxBranches(5)
                    .maxUsers(15)
                    .maxProducts(2000)
                    .enableAdvancedReports(true)
                    .enableInventory(true)
                    .enableIntegrations(true)
                    .enableEcommerce(true)
                    .enableInvoiceBranding(true)
                    .prioritySupport(false)
                    .active(true)
                    .extraFeatures(Arrays.asList("Tối đa 5 chi nhánh", "Tối đa 15 nhân viên", "Tối đa 2,000 sản phẩm", "Báo cáo nâng cao", "Đồng bộ E-commerce", "Hỗ trợ 24/7"))
                    .build();

            SubscriptionPlan enterprise = SubscriptionPlan.builder()
                    .name("Enterprise")
                    .description("Giải pháp toàn diện cho chuỗi cửa hàng và doanh nghiệp bán lẻ lớn.")
                    .price(2500000.0)
                    .billingCycle(BillingCycle.MONTHLY)
                    .maxBranches(100)
                    .maxUsers(1000)
                    .maxProducts(100000)
                    .enableAdvancedReports(true)
                    .enableInventory(true)
                    .enableIntegrations(true)
                    .enableEcommerce(true)
                    .enableInvoiceBranding(true)
                    .prioritySupport(true)
                    .active(true)
                    .extraFeatures(Arrays.asList("Không giới hạn chi nhánh", "Không giới hạn nhân viên", "Hỗ trợ kỹ thuật ưu tiên", "Báo cáo phân tích chuyên sâu", "Tùy biến hóa đơn thương hiệu"))
                    .build();

            subscriptionPlanRepository.saveAll(Arrays.asList(starter, professional, enterprise));
        }
    }
}
