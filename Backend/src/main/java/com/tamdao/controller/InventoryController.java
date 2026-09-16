package com.tamdao.controller;

import com.tamdao.payload.dto.InventoryDTO;
import com.tamdao.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'inventory.write', #dto.branchId)")
    public ResponseEntity<InventoryDTO> create(@RequestBody InventoryDTO dto) {
        return ResponseEntity.ok(inventoryService.createInventory(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'inventory.write', @resourceScopeResolver.inventoryStoreId(#id))")
    public ResponseEntity<InventoryDTO> update(@PathVariable Long id,
                                               @RequestBody InventoryDTO dto) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'inventory.delete', @resourceScopeResolver.inventoryStoreId(#id))")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'inventory.read', @resourceScopeResolver.inventoryStoreId(#id))")
    public ResponseEntity<InventoryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'inventory.read', @resourceScopeResolver.productStoreId(#productId))")
    public ResponseEntity<InventoryDTO> getInventoryByProduct(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                inventoryService.getInventoryByProductId(productId)
        );
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'inventory.read', #branchId)")
    public ResponseEntity<List<InventoryDTO>> getByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(inventoryService.getInventoryByBranch(branchId));
    }
}
