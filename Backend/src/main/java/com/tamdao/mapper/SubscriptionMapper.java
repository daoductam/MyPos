package com.tamdao.mapper;

import com.tamdao.modal.Subscription;
import com.tamdao.payload.dto.SubscriptionDTO;

public class SubscriptionMapper {

    public static SubscriptionDTO toDto(Subscription sub) {
        if (sub == null) return null;
        return SubscriptionDTO.builder()
                .id(sub.getId())
                .storeId(sub.getStore() != null ? sub.getStore().getId() : null)
                .storeName(sub.getStore() != null ? sub.getStore().getBrand() : null)
                .planName(sub.getPlan() != null ? sub.getPlan().getName() : null)
                .startDate(sub.getStartDate())
                .endDate(sub.getEndDate())
                .status(sub.getStatus())
                .paymentStatus(sub.getPaymentStatus())
                .paymentGateway(sub.getPaymentGateway())
                .transactionId(sub.getTransactionId())
                .deleted(sub.getDeleted())
                .deletedAt(sub.getDeletedAt())
                .deletedBy(sub.getDeletedBy())
                .createdAt(sub.getCreatedAt())
                .createdBy(sub.getCreatedBy())
                .updatedAt(sub.getUpdatedAt())
                .updatedBy(sub.getUpdatedBy())
                .build();
    }
}
