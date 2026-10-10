package com.tamdao.service.impl;

import com.tamdao.modal.Order;
import com.tamdao.exception.BusinessException;
import com.tamdao.payload.StoreAnalysis.TimeSeriesDataDTO;
import com.tamdao.repository.BranchRepository;
import com.tamdao.repository.CustomerRepository;
import com.tamdao.repository.OrderRepository;
import com.tamdao.repository.ProductRepository;
import com.tamdao.repository.RefundRepository;
import com.tamdao.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StoreAnalyticsServiceImplTest {

    @Mock
    private BranchRepository branchRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RefundRepository refundRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Test
    void salesTrendsUsesCompletedOrdersAndReturnsDailyBuckets() {
        LocalDate today = LocalDate.now();
        Order completed = order(today.minusDays(1), 11000d, com.tamdao.domain.OrderStatus.COMPLETED);
        Order refunded = order(today.minusDays(1), 37100d, com.tamdao.domain.OrderStatus.REFUNDED);
        when(orderRepository.findAllByStoreAdminAndCreatedAtBetween(eq(1L), any(), any()))
                .thenReturn(List.of(completed, refunded));

        StoreAnalyticsServiceImpl service = service();

        TimeSeriesDataDTO result = service.getSalesTrends(1L, "daily");

        assertEquals("DAILY", result.getPeriod());
        assertEquals(30, result.getPoints().size());
        assertEquals(11000d, result.getPoints().stream()
                .filter(point -> point.getDate().toLocalDate().equals(today.minusDays(1)))
                .findFirst()
                .orElseThrow()
                .getTotalAmount());
    }

    @Test
    void salesTrendsRejectsUnknownPeriod() {
        StoreAnalyticsServiceImpl service = service();

        assertThrows(BusinessException.class,
                () -> service.getSalesTrends(1L, "yearly"));
    }

    private StoreAnalyticsServiceImpl service() {
        return new StoreAnalyticsServiceImpl(
                branchRepository,
                orderRepository,
                productRepository,
                refundRepository,
                userRepository,
                customerRepository);
    }

    private Order order(LocalDate date, double total, com.tamdao.domain.OrderStatus status) {
        Order order = new Order();
        order.setCreatedAt(date.atTime(12, 0));
        order.setTotalAmount(total);
        order.setStatus(status);
        return order;
    }
}
