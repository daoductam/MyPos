package com.tamdao.mapper;

import com.tamdao.modal.Category;
import com.tamdao.modal.Product;
import com.tamdao.modal.Store;
import com.tamdao.payload.dto.ProductDTO;

public class ProductMapper {

    public static ProductDTO toDto(Product product) {
        if (product == null) return null;
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .description(product.getDescription())
                .mrp(product.getMrp())
                .sellingPrice(product.getSellingPrice())
                .brand(product.getBrand())
                .category(product.getCategory() != null ? product.getCategory().getName() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .storeId(product.getStore() != null ? product.getStore().getId() : null)
                .image(product.getImage())
                .deleted(product.getDeleted())
                .deletedAt(product.getDeletedAt())
                .deletedBy(product.getDeletedBy())
                .createdAt(product.getCreatedAt())
                .createdBy(product.getCreatedBy())
                .updatedAt(product.getUpdatedAt())
                .updatedBy(product.getUpdatedBy())
                .build();
    }

    public static Product toEntity(ProductDTO dto,
                                   Store store,
                                   Category category) {
        return Product.builder()
                .id(dto.getId())
                .name(dto.getName())
                .sku(dto.getSku())
                .description(dto.getDescription())
                .mrp(dto.getMrp())
                .sellingPrice(dto.getSellingPrice())
                .brand(dto.getBrand())
                .category(category)
                .store(store)
                .image(dto.getImage())
                .build();
    }
}
