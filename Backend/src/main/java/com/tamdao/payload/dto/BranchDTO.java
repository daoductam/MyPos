package com.tamdao.payload.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class BranchDTO extends BaseDTO {
    private Long id;
    private String name;
    private String address;
    private String email;
    private String phone;
    private List<String> workingDays;
    private LocalTime openTime;
    private LocalTime closeTime;
    private Long storeId;
    private StoreDTO store;
    private String manager;

    public BranchDTO(Long id, String name, String address) {
        this.id = id;
        this.name = name;
        this.address = address;
    }
}

