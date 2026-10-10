package com.tamdao.service.impl;

import com.tamdao.domain.OrderStatus;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.modal.Branch;
import com.tamdao.modal.Order;
import com.tamdao.modal.Refund;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.RefundDTO;
import com.tamdao.repository.InventoryRepository;
import com.tamdao.repository.OrderRepository;
import com.tamdao.repository.RefundRepository;
import com.tamdao.service.RefundService;
import com.tamdao.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional
    public Refund createRefund(RefundDTO refundDTO) {
        if (refundDTO == null || refundDTO.getOrderId() == null
                || refundDTO.getRefundMethod() == null
                || refundDTO.getReason() == null || refundDTO.getReason().isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST,
                    "Order, refund reason, and refund method are required");
        }

        User currentCashier = userService.getCurrentUser();

        Order order = orderRepository.findById(refundDTO.getOrderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Order not found"));

        Branch branch = currentCashier.getBranch();
        if (branch == null || order.getBranch() == null
                || !branch.getId().equals(order.getBranch().getId())) {
            throw new BusinessException(ErrorCode.SCOPE_VIOLATION,
                    "The order does not belong to the current branch");
        }

        if (order.getStatus() == OrderStatus.REFUNDED) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Order has already been refunded");
        }

        List<Long> productIds = order.getItems().stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .toList();
        var inventories = inventoryRepository
                .findByBranchIdAndProductIdInWithLock(branch.getId(), productIds);
        var inventoryByProduct = inventories.stream()
                .collect(java.util.stream.Collectors.toMap(
                        inventory -> inventory.getProduct().getId(),
                        java.util.function.Function.identity()));
        for (var item : order.getItems()) {
            if (!inventoryByProduct.containsKey(item.getProduct().getId())) {
                throw new BusinessException(ErrorCode.OUT_OF_STOCK,
                        "Product inventory is not assigned to this branch");
            }
        }

        Refund refund = new Refund();
        refund.setOrder(order);
        refund.setCashier(currentCashier);
        refund.setReason(refundDTO.getReason());
        refund.setAmount(order.getTotalAmount());
        refund.setCreatedAt(LocalDateTime.now());
        refund.setBranch(branch);
        refund.setPaymentType(refundDTO.getRefundMethod());

        order.getItems().forEach(item -> {
            var inventory = inventoryByProduct.get(item.getProduct().getId());
            inventory.setQuantity(inventory.getQuantity() + item.getQuantity());
            inventoryRepository.save(inventory);
        });

        Refund savedRefund = refundRepository.save(refund);
        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);
        return savedRefund;
    }

    @Override
    public List<Refund> getAllRefunds() {
        return refundRepository.findAll();
    }

    @Override
    public List<Refund> getRefundsByCashier(Long cashierId) {
        return refundRepository.findByCashierId(cashierId);
    }

    @Override
    public List<Refund> getRefundsByShiftReport(Long shiftReportId) {
        return refundRepository.findByShiftReportId(shiftReportId);
    }

    @Override
    public List<Refund> getRefundsByCashierAndDateRange(Long cashierId, LocalDateTime from, LocalDateTime to) {
        return refundRepository.findByCashierIdAndCreatedAtBetween(cashierId, from, to);
    }

    @Override
    public List<Refund> getRefundsByBranch(Long branchId) {
        return refundRepository.findByBranchId(branchId);
    }

    @Override
    public Refund getRefundById(Long id) {
        return refundRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Refund not found"));
    }

    @Override
    public void deleteRefund(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Refund not found"));
        User currentUser = userService.getCurrentUser();
        refund.setDeletedBy(currentUser.getId());
        refundRepository.delete(refund);
    }
}
