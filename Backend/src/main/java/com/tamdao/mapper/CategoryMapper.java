package com.tamdao.mapper;

import com.tamdao.modal.Category;
import com.tamdao.payload.dto.CategoryDTO;

public class CategoryMapper {

    public static CategoryDTO toDto(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .storeId(category.getStore().getId())
                .build();
    }
}
