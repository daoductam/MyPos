package com.tamdao.service.impl;

import com.tamdao.domain.PaymentStatus;
import com.tamdao.domain.SubscriptionStatus;
import com.tamdao.modal.*;
import com.tamdao.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/** Local demo fixtures only. Called after the explicit demo-seed opt-in. */
@Component
@RequiredArgsConstructor
public class DemoCatalogSeeder {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;

    @Transactional
    public void seed(Store store, Branch branch) {
        Category category = categoryRepository.findByStoreId(store.getId()).stream()
                .filter(item -> "Demo essentials".equals(item.getName()))
                .findFirst().orElseGet(() -> categoryRepository.save(
                        Category.builder().name("Demo essentials").store(store).build()));

        seedProduct(store, branch, category, "DMART-DEMO-WATER", "Nước suối demo 500ml", 10000.0);
        seedProduct(store, branch, category, "DMART-DEMO-MILK", "Sữa tươi demo 180ml", 15000.0);
        seedProduct(store, branch, category, "DMART-DEMO-COFFEE", "Cà phê demo", 30000.0);

        if (customerRepository.findByStoreId(store.getId()).stream()
                .noneMatch(item -> "demo.customer@example.com".equals(item.getEmail()))) {
            Customer customer = new Customer();
            customer.setFullName("Khách hàng demo");
            customer.setEmail("demo.customer@example.com");
            customer.setPhone("0900000001");
            customer.setStore(store);
            customer.setBranch(branch);
            customerRepository.save(customer);
        }

        // Never renew, overwrite or simulate a paid subscription on restart.
        if (subscriptionRepository.findByStore(store).isEmpty()) {
            planRepository.findAll().stream().filter(plan -> "Professional".equals(plan.getName()))
                    .findFirst().ifPresent(plan -> subscriptionRepository.save(Subscription.builder()
                            .store(store).plan(plan).startDate(LocalDate.now())
                            .endDate(LocalDate.now().plusDays(30)).status(SubscriptionStatus.TRIAL)
                            .paymentStatus(PaymentStatus.PENDING).paymentGateway("DEMO")
                            .build()));
        }
    }

    private void seedProduct(Store store, Branch branch, Category category,
                             String sku, String name, double price) {
        Product product = productRepository.findByStoreId(store.getId()).stream()
                .filter(item -> sku.equals(item.getSku())).findFirst().orElse(null);
        if (product == null) {
            product = productRepository.save(Product.builder().store(store).category(category)
                    .sku(sku).name(name).brand("DMart Demo").mrp(price).sellingPrice(price)
                    .description("Dữ liệu mẫu để kiểm tra bán hàng local").build());
        }
        if (inventoryRepository.findByBranchIdAndProductId(branch.getId(), product.getId()) == null) {
            inventoryRepository.save(Inventory.builder().branch(branch).product(product).quantity(100).build());
        }
    }
}
