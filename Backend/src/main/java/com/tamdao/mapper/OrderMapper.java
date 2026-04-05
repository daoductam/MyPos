package com.tamdao.mapper;


import com.tamdao.modal.Order;
import com.tamdao.payload.dto.OrderDTO;

import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderDTO toDto(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .branchId(order.getBranch().getId())
                .cashierId(order.getCashier().getId())
                .customer(order.getCustomer())
                .createdAt(order.getCreatedAt())
                .paymentType(order.getPaymentType())
                .status(order.getStatus())
                .items(order.getItems().stream()
                        .map(OrderItemMapper::toDto)
                        .collect(Collectors.toList()))
                .build();
    }
}

