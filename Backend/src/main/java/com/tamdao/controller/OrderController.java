package com.tamdao.controller;

import com.tamdao.domain.OrderStatus;
import com.tamdao.domain.PaymentType;
import com.tamdao.payload.dto.OrderDTO;
import com.tamdao.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("@authorizationGuard.hasCurrentUserBranchPermission(authentication, 'order.create')")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderDTO dto) {
        return ResponseEntity.ok(orderService.createOrder(dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'order.read', @resourceScopeResolver.orderStoreId(#id)) or @authorizationGuard.hasSelfPermission(authentication, 'order.read_own', @resourceScopeResolver.orderCashierId(#id))")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'order.read', #branchId)")
    public ResponseEntity<List<OrderDTO>> getOrdersByBranch(
            @PathVariable Long branchId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long cashierId,
            @RequestParam(required = false) PaymentType paymentType,
            @RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByBranch(
                    branchId,
                    customerId,
                    cashierId,
                    paymentType,
                    status
                )
        );
    }

    @GetMapping("/cashier/{cashierId}")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'order.read', #cashierId) or @authorizationGuard.hasSelfPermission(authentication, 'order.read_own', #cashierId)")
    public ResponseEntity<List<OrderDTO>> getOrdersByCashier(@PathVariable Long cashierId) {
        return ResponseEntity.ok(orderService.getOrdersByCashier(cashierId));
    }

    @GetMapping("/today/branch/{branchId}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'order.read', #branchId)")
    public ResponseEntity<List<OrderDTO>> getTodayOrders(@PathVariable Long branchId) {
        return ResponseEntity.ok(orderService.getTodayOrdersByBranch(branchId));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("@authorizationGuard.hasCustomerPermission(authentication, 'order.read', #customerId) or @authorizationGuard.hasCustomerPermission(authentication, 'customer.read', #customerId)")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomerId(customerId));
    }

    @GetMapping("/recent/{branchId}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'order.read', #branchId)")
    public ResponseEntity<List<OrderDTO>> getRecentOrders(@PathVariable Long branchId) {
        List<OrderDTO> recentOrders = orderService.getTop5RecentOrdersByBranchId(branchId);
        return ResponseEntity.ok(recentOrders);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'order.delete', @resourceScopeResolver.orderStoreId(#id))")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
