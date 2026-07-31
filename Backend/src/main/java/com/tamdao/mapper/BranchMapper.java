package com.tamdao.mapper;


import com.tamdao.modal.Branch;
import com.tamdao.modal.Store;
import com.tamdao.payload.dto.BranchDTO;

public class BranchMapper {

    public static BranchDTO toDto(Branch branch) {
        if (branch == null) return null;
        return BranchDTO.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .phone(branch.getPhone())
                .email(branch.getEmail())
                .closeTime(branch.getCloseTime())
                .openTime(branch.getOpenTime())
                .workingDays(branch.getWorkingDays())
                .storeId(branch.getStore() != null ? branch.getStore().getId() : null)
                .store(StoreMapper.toDto(branch.getStore()))
                .manager(branch.getManager() != null ? branch.getManager().getFullName() : null)
                .deleted(branch.getDeleted())
                .deletedAt(branch.getDeletedAt())
                .deletedBy(branch.getDeletedBy())
                .createdAt(branch.getCreatedAt())
                .createdBy(branch.getCreatedBy())
                .updatedAt(branch.getUpdatedAt())
                .updatedBy(branch.getUpdatedBy())
                .build();
    }

    public static Branch toEntity(BranchDTO dto, Store store) {
        return Branch.builder()
                .id(dto.getId())
                .name(dto.getName())
                .address(dto.getAddress())
                .store(store)
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .closeTime(dto.getCloseTime())
                .openTime(dto.getOpenTime())
                .workingDays(dto.getWorkingDays())
                .build();
    }
}
