package com.tamdao.payload.dto;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDTO {
    private Long id;
    private Long branchId;
    private Long productId;
    private String productName;
    private Integer quantity;
    private java.time.LocalDateTime lastUpdated;
}

