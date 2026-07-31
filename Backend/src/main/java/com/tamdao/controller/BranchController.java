package com.tamdao.controller;

import com.tamdao.modal.User;
import com.tamdao.payload.dto.BranchDTO;
import com.tamdao.service.BranchService;
import com.tamdao.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<BranchDTO> createBranch(@Valid @RequestBody BranchDTO dto) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(branchService.createBranch(dto, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchDTO> getBranch(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.getBranchById(id));
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<BranchDTO>> getAllBranches(@PathVariable Long storeId) {
        return ResponseEntity.ok(branchService.getAllBranchesByStoreId(storeId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<BranchDTO> updateBranch(
            @PathVariable Long id,
            @RequestBody BranchDTO dto) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(branchService.updateBranch(id, dto, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/store/{storeId}/trash")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<List<BranchDTO>> getDeletedBranches(@PathVariable Long storeId) {
        return ResponseEntity.ok(branchService.getDeletedBranches(storeId));
    }

    @PatchMapping("/restore/{id}")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<Void> restoreBranch(@PathVariable Long id) {
        branchService.restoreBranch(id);
        return ResponseEntity.ok().build();
    }
}
