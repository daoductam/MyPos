package com.tamdao.payload.dto;

import com.tamdao.domain.StoreStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommissionSummaryDTO {
    private Long storeId;
    private String storeName;
    private StoreStatus status;
    private Double commissionRate;
    private Double grossSales;
    private Double commissionEarnings;
    private Long completedOrders;
}
