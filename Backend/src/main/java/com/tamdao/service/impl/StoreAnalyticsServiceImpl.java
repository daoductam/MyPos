package com.tamdao.service.impl;

import com.tamdao.domain.UserRole;
import com.tamdao.domain.OrderStatus;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.payload.StoreAnalysis.*;
import com.tamdao.repository.*;
import com.tamdao.service.StoreAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StoreAnalyticsServiceImpl implements StoreAnalyticsService {

    private final BranchRepository branchRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final RefundRepository refundRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @Override
    public StoreOverviewDTO getStoreOverview(Long storeAdminId) {
        List<UserRole> roles = new ArrayList<>();
        roles.add(UserRole.ROLE_STORE_MANAGER);
        roles.add(UserRole.ROLE_CUSTOMER);
        roles.add(UserRole.ROLE_BRANCH_CASHIER);
        roles.add(UserRole.ROLE_CASHIER);
        roles.add(UserRole.ROLE_BRANCH_MANAGER);

        return StoreOverviewDTO.builder()
                .totalBranches(branchRepository.countByStoreAdminId(storeAdminId))
                .totalSales(orderRepository.sumTotalSalesByStoreAdmin(storeAdminId).orElse(Double.valueOf(0)))
                .totalOrders(orderRepository.countByStoreAdminId(storeAdminId))
                .totalEmployees(userRepository.countByStoreAdminIdAndRoles(storeAdminId,roles))
                .totalCustomers(customerRepository.countByStoreAdminId(storeAdminId))
                .totalRefunds(refundRepository.countByStoreAdminId(storeAdminId))
                .totalProducts(productRepository.countByStoreAdminId(storeAdminId))
//                .topBranchName(branchRepository.findTopBranchBySales(storeAdminId))
                .build();
    }

    @Override
    public TimeSeriesDataDTO getSalesTrends(Long storeAdminId, String period) {
        String normalizedPeriod = period == null ? "DAILY" : period.trim().toUpperCase(Locale.ROOT);
        if (!List.of("DAILY", "WEEKLY", "MONTHLY").contains(normalizedPeriod)) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST,
                    "period must be DAILY, WEEKLY, or MONTHLY");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);
        Map<LocalDate, Double> buckets = new LinkedHashMap<>();
        LocalDate startDate;

        switch (normalizedPeriod) {
            case "WEEKLY" -> {
                startDate = today.with(DayOfWeek.MONDAY).minusWeeks(11);
                for (int i = 0; i < 12; i++) {
                    buckets.put(startDate.plusWeeks(i), 0d);
                }
            }
            case "MONTHLY" -> {
                YearMonth firstMonth = YearMonth.from(today).minusMonths(11);
                startDate = firstMonth.atDay(1);
                for (int i = 0; i < 12; i++) {
                    buckets.put(firstMonth.plusMonths(i).atDay(1), 0d);
                }
            }
            default -> {
                startDate = today.minusDays(29);
                for (int i = 0; i < 30; i++) {
                    buckets.put(startDate.plusDays(i), 0d);
                }
            }
        }

        LocalDateTime start = startDate.atStartOfDay();
        orderRepository.findAllByStoreAdminAndCreatedAtBetween(storeAdminId, start, end).stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .filter(order -> order.getCreatedAt() != null && order.getTotalAmount() != null)
                .forEach(order -> {
                    LocalDate bucket = switch (normalizedPeriod) {
                        case "WEEKLY" -> order.getCreatedAt().toLocalDate().with(DayOfWeek.MONDAY);
                        case "MONTHLY" -> order.getCreatedAt().toLocalDate().withDayOfMonth(1);
                        default -> order.getCreatedAt().toLocalDate();
                    };
                    if (buckets.containsKey(bucket)) {
                        buckets.compute(bucket, (ignored, value) -> value + order.getTotalAmount());
                    }
                });

        List<TimeSeriesPointDTO> points = buckets.entrySet().stream()
                .map(entry -> new TimeSeriesPointDTO(entry.getKey().atStartOfDay(), entry.getValue()))
                .toList();

        return TimeSeriesDataDTO.builder()
                .period(normalizedPeriod)
                .points(points)
                .build();
    }

    @Override
    public List<TimeSeriesPointDTO> getMonthlySalesGraph(Long storeAdminId) {
        return getSalesTrends(storeAdminId, "MONTHLY").getPoints();
    }

    @Override
    public List<TimeSeriesPointDTO> getDailySalesGraph(Long storeAdminId) {
        List<TimeSeriesPointDTO> points = getSalesTrends(storeAdminId, "DAILY").getPoints();
        return points.subList(Math.max(0, points.size() - 7), points.size());
    }

    @Override
    public List<CategorySalesDTO> getSalesByCategory(Long storeAdminId) {
        return productRepository.getSalesGroupedByCategory(storeAdminId);
    }

    @Override
    public List<PaymentInsightDTO> getSalesByPaymentMethod(Long storeAdminId) {
        return orderRepository.getSalesByPaymentMethod(storeAdminId);
    }

    @Override
    public List<BranchSalesDTO> getSalesByBranch(Long storeAdminId) {
        return orderRepository.getSalesByBranch(storeAdminId);
    }

    @Override
    public List<PaymentInsightDTO> getPaymentBreakdown(Long storeAdminId) {
        return orderRepository.getSalesByPaymentMethod(storeAdminId);
    }

    @Override
    public BranchPerformanceDTO getBranchPerformance(Long storeAdminId) {
        return BranchPerformanceDTO.builder()
                .branchSales(orderRepository.getSalesByBranch(storeAdminId))
                .newBranchesThisMonth(branchRepository.countNewBranchesThisMonth(storeAdminId))
//                .topBranch(branchRepository.findTopBranchBySales(storeAdminId))
                .build();
    }

    @Override
    public StoreAlertDTO getStoreAlerts(Long storeAdminId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        userRepository.findInactiveCashiers(storeAdminId, sevenDaysAgo);

        return StoreAlertDTO.builder()
                .lowStockAlerts(productRepository.findLowStockProducts(storeAdminId))
                .noSalesToday(branchRepository.findBranchesWithNoSalesToday(storeAdminId))
                .refundSpikeAlerts(refundRepository.findRefundSpikes(storeAdminId))
                .inactiveCashiers(userRepository.findInactiveCashiers(storeAdminId, sevenDaysAgo))
                .build();
    }
}
