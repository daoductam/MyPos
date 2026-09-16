package com.tamdao.controller;

import com.tamdao.payload.dto.CategoryDTO;
import com.tamdao.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'category.write', #dto.storeId)")
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO dto) {
        return ResponseEntity.ok(categoryService.createCategory(dto));
    }

    @GetMapping("/store/{storeId}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'category.read', #storeId)")
    public ResponseEntity<List<CategoryDTO>> getCategories(@PathVariable Long storeId) {
        return ResponseEntity.ok(categoryService.getCategoriesByStore(storeId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'category.write', @resourceScopeResolver.categoryStoreId(#id))")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id,
                                                      @RequestBody CategoryDTO dto) {
        return ResponseEntity.ok(categoryService.updateCategory(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'category.delete', @resourceScopeResolver.categoryStoreId(#id))")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
