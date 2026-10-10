package com.tamdao.payload.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class CustomerDTO extends BaseDTO {
    private Long id;

    @NotBlank(message = "fullName is mandatory")
    private String fullName;

    private String email;
    private String phone;
    private Integer loyaltyPoints;
    private Long storeId;
    private Long branchId;
}
