package com.tamdao.mapper;

import com.tamdao.modal.Store;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.StoreDTO;

public class StoreMapper {





        public static StoreDTO toDto(Store store) {
            if (store == null) {
                return null;
            }
            return StoreDTO.builder()
                    .id(store.getId())
                    .brand(store.getBrand())
                    .storeAdminId(store.getStoreAdmin() != null ? store.getStoreAdmin().getId() : null)
                    .storeAdmin(UserMapper.toDTO(store.getStoreAdmin()))
                    .storeType(store.getStoreType())
                    .description(store.getDescription())
                    .contact(store.getContact())
                    .status(store.getStatus())
                    .deleted(store.getDeleted())
                    .deletedAt(store.getDeletedAt())
                    .deletedBy(store.getDeletedBy())
                    .createdAt(store.getCreatedAt())
                    .createdBy(store.getCreatedBy())
                    .updatedAt(store.getUpdatedAt())
                    .updatedBy(store.getUpdatedBy())
                    .build();
        }

        public static Store toEntity(StoreDTO dto, User storeAdmin) {
            return Store.builder()
                    .id(dto.getId())
                    .brand(dto.getBrand())
                    .storeAdmin(storeAdmin)
                    .storeType(dto.getStoreType())
                    .description(dto.getDescription())
                    .build();
        }
    }


