package com.tamdao.payload.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class RefundDTO extends BaseDTO {
    private Long id;
    private Long orderId;
    private String reason;
    private Double amount;
    private String cashierName;
    private Long shiftReportId;
    private Long branchId;

    /**
     * JPQL constructor used by RefundRepository.findRefundSpikes()
     */
    public RefundDTO(Long id, Long orderId, String reason, Double amount,
                     String cashierName, Long shiftReportId, Long branchId,
                     LocalDateTime createdAt) {
        this.id = id;
        this.orderId = orderId;
        this.reason = reason;
        this.amount = amount;
        this.cashierName = cashierName;
        this.shiftReportId = shiftReportId;
        this.branchId = branchId;
        this.setCreatedAt(createdAt);
    }
}
