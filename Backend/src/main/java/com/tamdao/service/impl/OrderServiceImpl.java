package com.tamdao.service.impl;

import com.tamdao.domain.OrderStatus;
import com.tamdao.domain.PaymentType;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.mapper.OrderMapper;
import com.tamdao.modal.*;
import com.tamdao.payload.dto.OrderDTO;
import com.tamdao.repository.*;
import com.tamdao.service.OrderService;
import com.tamdao.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.tamdao.util.SecurityUtil;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final double VAT_RATE = 0.10d;

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final InventoryRepository inventoryRepository;
    private final UserService userService;
    private final SecurityUtil securityUtil;

    @Override
    public OrderDTO createOrder(OrderDTO dto) {
        User cashier = userService.getCurrentUser();
        Branch branch = cashier.getBranch();

        if (branch == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Cashier's branch is null");
        }

        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Order items cannot be empty");
        }

        if (dto.getPaymentType() == null) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Payment type is required");
        }

        List<Long> productIds = dto.getItems().stream()
                .map(com.tamdao.payload.dto.OrderItemDTO::getProductId)
                .collect(Collectors.toList());

        // Batch load products
        Map<Long, Product> productMap = productRepository.findAllById(productIds).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        // Batch load inventory with pessimistic write lock for concurrency safety
        Map<Long, Inventory> inventoryMap = inventoryRepository
                .findByBranchIdAndProductIdInWithLock(branch.getId(), productIds).stream()
                .collect(Collectors.toMap(inv -> inv.getProduct().getId(), Function.identity()));

        Order order = Order.builder()
                .branch(branch)
                .cashier(cashier)
                .customer(dto.getCustomer())
                .paymentType(dto.getPaymentType())
                .status(OrderStatus.COMPLETED)
                .build();

        List<OrderItem> orderItems = new java.util.ArrayList<>();
        for (com.tamdao.payload.dto.OrderItemDTO itemDto : dto.getItems()) {
            if (itemDto.getQuantity() == null || itemDto.getQuantity() <= 0) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST, "Order item quantity must be greater than zero");
            }

            Product product = productMap.get(itemDto.getProductId());
            if (product == null) {
                throw new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found with ID: " + itemDto.getProductId());
            }

            Inventory inventory = inventoryMap.get(product.getId());
            if (inventory == null) {
                throw new BusinessException(ErrorCode.OUT_OF_STOCK, "Product '" + product.getName() + "' is not assigned to this branch inventory.");
            }

            if (inventory.getQuantity() < itemDto.getQuantity()) {
                throw new BusinessException(ErrorCode.OUT_OF_STOCK, "Insufficient stock for product: " + product.getName()
                        + ". Available: " + inventory.getQuantity() + ", Requested: " + itemDto.getQuantity());
            }

            inventory.setQuantity(inventory.getQuantity() - itemDto.getQuantity());
            inventoryRepository.save(inventory);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .price(product.getSellingPrice())
                    .order(order)
                    .build();
            orderItems.add(orderItem);
        }

        double subtotal = orderItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        double tax = subtotal * VAT_RATE;
        double discount = dto.getDiscountAmount() == null ? 0d : dto.getDiscountAmount();
        if (!Double.isFinite(discount) || discount < 0d || discount > subtotal + tax) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Discount amount is invalid");
        }

        double total = subtotal + tax - discount;
        if (dto.getTotalAmount() != null
                && (!Double.isFinite(dto.getTotalAmount())
                || Math.abs(dto.getTotalAmount() - total) > 0.01d)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Order total does not match the item prices");
        }

        order.setTotalAmount(total);
        order.setTaxAmount(tax);
        order.setDiscountAmount(discount);
        order.setItems(orderItems);

        return OrderMapper.toDto(orderRepository.save(order));
    }

    @Override
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Order not found"));
        securityUtil.checkAuthority(order);
        return OrderMapper.toDto(order);
    }

    @Override
    public List<OrderDTO> getOrdersByBranch(Long branchId,
                                            Long customerId,
                                            Long cashierId,
                                            PaymentType paymentType,
                                            OrderStatus status) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found"));
        securityUtil.checkBranchAccess(branch);

        return orderRepository.findOrdersFiltered(branchId, customerId, cashierId, paymentType, status).stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByCashier(Long cashierId) {
        return orderRepository.findByCashierId(cashierId).stream()
                .filter(order -> {
                    try {
                        securityUtil.checkAuthority(order);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                })
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Order not found"));
        securityUtil.checkAuthority(order);
        order.setDeletedBy(userService.getCurrentUser().getId());
        orderRepository.delete(order);
    }

    @Override
    public List<OrderDTO> getTodayOrdersByBranch(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found"));
        securityUtil.checkBranchAccess(branch);

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        return orderRepository.findByBranchIdAndCreatedAtBetween(branchId, start, end)
                .stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getOrdersByCustomerId(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerId(customerId);

        return orders.stream()
                .filter(order -> {
                    try {
                        securityUtil.checkAuthority(order);
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                })
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDTO> getTop5RecentOrdersByBranchId(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found with ID: " + branchId));
        securityUtil.checkBranchAccess(branch);

        List<Order> orders = orderRepository.findTop5ByBranchIdOrderByCreatedAtDesc(branchId);
        return orders.stream()
                .map(OrderMapper::toDto)
                .collect(Collectors.toList());
    }
}
