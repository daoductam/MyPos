package com.tamdao.controller;

import com.tamdao.modal.User;
import com.tamdao.authorization.AuthorizationGuard;
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
    private final AuthorizationGuard authorizationGuard;

    @PostMapping
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'branch.create')")
    public ResponseEntity<BranchDTO> createBranch(@Valid @RequestBody BranchDTO dto) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(branchService.createBranch(dto, user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'branch.read', #id)")
    public ResponseEntity<BranchDTO> getBranch(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.getBranchById(id));
    }

    @GetMapping("/store/{storeId}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'branch.read', #storeId)")
    public ResponseEntity<List<BranchDTO>> getAllBranches(@PathVariable Long storeId) {
        return ResponseEntity.ok(branchService.getAllBranchesByStoreId(storeId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'branch.update', #id)")
    public ResponseEntity<BranchDTO> updateBranch(
            @PathVariable Long id,
            @RequestBody BranchDTO dto) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(branchService.updateBranch(id, dto, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'branch.delete', #id)")
    public ResponseEntity<Void> deleteBranch(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/store/{storeId}/trash")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'branch.read', #storeId)")
    public ResponseEntity<List<BranchDTO>> getDeletedBranches(@PathVariable Long storeId) {
        return ResponseEntity.ok(branchService.getDeletedBranches(storeId));
    }

    @PatchMapping("/restore/{id}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'branch.restore', #id)")
    public ResponseEntity<Void> restoreBranch(@PathVariable Long id) {
        branchService.restoreBranch(id);
        return ResponseEntity.ok().build();
    }
}
