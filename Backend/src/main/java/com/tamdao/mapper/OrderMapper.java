package com.tamdao.mapper;


import com.tamdao.modal.Order;
import com.tamdao.payload.dto.OrderDTO;

import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderDTO toDto(Order order) {
        if (order == null) {
            return null;
        }

        return OrderDTO.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .branchId(order.getBranch() != null ? order.getBranch().getId() : null)
                .cashierId(order.getCashier() != null ? order.getCashier().getId() : null)
                .customer(order.getCustomer())
                .deleted(order.getDeleted())
                .deletedAt(order.getDeletedAt())
                .deletedBy(order.getDeletedBy())
                .createdAt(order.getCreatedAt())
                .createdBy(order.getCreatedBy())
                .updatedAt(order.getUpdatedAt())
                .updatedBy(order.getUpdatedBy())
                .paymentType(order.getPaymentType())
                .status(order.getStatus())
                .items(order.getItems() != null ? order.getItems().stream()
                        .map(OrderItemMapper::toDto)
                        .collect(Collectors.toList()) : java.util.Collections.emptyList())
                .build();
    }
}

