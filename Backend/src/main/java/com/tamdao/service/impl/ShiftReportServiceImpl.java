package com.tamdao.service.impl;

import com.tamdao.domain.PaymentType;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.modal.*;
import com.tamdao.repository.*;
import com.tamdao.service.ShiftReportService;
import com.tamdao.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftReportServiceImpl implements ShiftReportService {

    private final ShiftReportRepository shiftReportRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final OrderRepository orderRepository;
    private final RefundRepository refundRepository;
    private final UserService userService;

    @Override
    public ShiftReport startShift(Long cashierId,
                                  Long branchId,
                                  LocalDateTime shiftStart
    ) {
        User currentUser = userService.getCurrentUser();
        shiftStart = LocalDateTime.now();

        Branch branch = branchRepository.findById(branchId).orElseThrow(() ->
                new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found with ID: " + branchId));

        LocalDateTime startOfDay = shiftStart.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = shiftStart.withHour(23).withMinute(59).withSecond(59);

        Optional<ShiftReport> existing = shiftReportRepository
                .findByCashierAndShiftStartBetween(currentUser, startOfDay, endOfDay);

        if (existing.isPresent()) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Shift already started today.");
        }

        ShiftReport shift = new ShiftReport();
        shift.setCashier(currentUser);
        shift.setBranch(branch);
        shift.setShiftStart(shiftStart);

        return shiftReportRepository.save(shift);
    }

    @Override
    @Transactional
    public ShiftReport endShift(Long shiftReportId, LocalDateTime shiftEnd) {
        User currentUser = userService.getCurrentUser();

        ShiftReport shift = shiftReportRepository
                .findTopByCashierAndShiftEndIsNullOrderByShiftStartDesc(currentUser)
                .orElseThrow(
                        () -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "No active shift report found")
                );

        shift.setShiftEnd(shiftEnd);

        List<Order> orders = orderRepository.findByCashierAndCreatedAtBetween(
                shift.getCashier(), shift.getShiftStart(), shiftEnd
        );

        List<Refund> refunds = refundRepository.findByCashierAndCreatedAtBetween(
                shift.getCashier(), shift.getShiftStart(), shiftEnd
        );

        double totalRefunds = refunds.stream()
                .mapToDouble(refund -> refund.getAmount() != null ? refund.getAmount() : 0.0)
                .sum();

        double totalSales = orders.stream().mapToDouble(Order::getTotalAmount).sum();
        int totalOrders = orders.size();
        double netSales = totalSales - totalRefunds;

        shift.setTotalSales(totalSales);
        shift.setTotalOrders(totalOrders);
        shift.setTotalRefunds(totalRefunds);
        shift.setNetSales(netSales);
        shift.setRecentOrders(getRecentOrders(orders));
        shift.setTopSellingProducts(getTopSellingProducts(orders));
        shift.setPaymentSummaries(getPaymentSummaries(orders, totalSales));
        shift.setRefunds(refunds);

        return shiftReportRepository.save(shift);
    }

    @Override
    public ShiftReport getShiftReportById(Long id) {
        return shiftReportRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Shift report not found"));
    }

    @Override
    public List<ShiftReport> getAllShiftReports() {
        return shiftReportRepository.findAll();
    }

    @Override
    public List<ShiftReport> getShiftReportsByCashier(Long cashierId) {
        User cashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Cashier not found"));
        return shiftReportRepository.findByCashier(cashier);
    }

    @Override
    public List<ShiftReport> getShiftReportsByBranch(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found"));
        return shiftReportRepository.findByBranch(branch);
    }

    @Override
    public ShiftReport getCurrentShiftProgress(Long cashierId) {
        User cashier = userService.getCurrentUser();

        ShiftReport shift = shiftReportRepository
                .findTopByCashierAndShiftEndIsNullOrderByShiftStartDesc(cashier)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "No active shift found for this cashier"));

        LocalDateTime now = LocalDateTime.now();

        List<Order> orders = orderRepository.findByCashierAndCreatedAtBetween(
                cashier, shift.getShiftStart(), now
        );

        List<Refund> refunds = refundRepository.findByCashierAndCreatedAtBetween(
                cashier, shift.getShiftStart(), now
        );

        double totalSales = orders.stream().mapToDouble(Order::getTotalAmount).sum();
        int totalOrders = orders.size();
        double totalRefunds = refunds.stream()
                .mapToDouble(refund -> refund.getAmount() != null ? refund.getAmount() : 0.0)
                .sum();

        double netSales = totalSales - totalRefunds;

        shift.setTotalSales(totalSales);
        shift.setTotalOrders(totalOrders);
        shift.setTotalRefunds(totalRefunds);
        shift.setNetSales(netSales);
        shift.setRecentOrders(getRecentOrders(orders));
        shift.setTopSellingProducts(getTopSellingProducts(orders));

        shift.setPaymentSummaries(getPaymentSummaries(orders, totalSales));
        shift.setRefunds(refunds);

        return shift;
    }

    @Override
    public ShiftReport getShiftReportByCashierAndDate(Long cashierId, LocalDateTime date) {
        User cashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Cashier not found"));

        LocalDateTime start = date.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime end = date.withHour(23).withMinute(59).withSecond(59);

        return shiftReportRepository.findByCashierAndShiftStartBetween(cashier, start, end)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "No shift report found on this date"));
    }

    @Override
    public void deleteShiftReport(Long id) {
        ShiftReport shiftReport = shiftReportRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Shift report not found"));
        User currentUser = userService.getCurrentUser();
        shiftReport.setDeletedBy(currentUser.getId());
        shiftReportRepository.delete(shiftReport);
    }

    // ----------------- HELPER METHODS -----------------

    private List<Order> getRecentOrders(List<Order> orders) {
        return orders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<Product> getTopSellingProducts(List<Order> orders) {
        Map<Product, Integer> productSalesMap = new HashMap<>();

        for (Order order : orders) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                productSalesMap.put(product, productSalesMap.getOrDefault(product, 0) + item.getQuantity());
            }
        }

        return productSalesMap.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private List<PaymentSummary> getPaymentSummaries(List<Order> orders,
                                                     double totalSales) {
        Map<PaymentType, List<Order>> grouped = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getPaymentType() != null ?
                                order.getPaymentType() : PaymentType.CASH
                ));

        List<PaymentSummary> summaries = new ArrayList<>();

        for (Map.Entry<PaymentType, List<Order>> entry : grouped.entrySet()) {
            double amount = entry.getValue()
                    .stream()
                    .mapToDouble(Order::getTotalAmount)
                    .sum();
            int transactions = entry.getValue().size();
            double percent = totalSales > 0 ? (amount / totalSales) * 100 : 0;

            PaymentSummary ps = new PaymentSummary();
            ps.setType(entry.getKey());
            ps.setTotalAmount(amount);
            ps.setTransactionCount(transactions);
            ps.setPercentage(percent);
            summaries.add(ps);
        }

        return summaries;
    }
}
