package com.tamdao.payload.dto;


import com.tamdao.domain.OrderStatus;
import com.tamdao.domain.PaymentType;
import com.tamdao.modal.Customer;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private Double totalAmount;
    private Long branchId;
    private Long cashierId;
    private Customer customer;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private PaymentType paymentType;
    private OrderStatus status;
}
