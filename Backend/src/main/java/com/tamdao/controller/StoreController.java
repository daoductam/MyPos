package com.tamdao.controller;

import com.tamdao.domain.StoreStatus;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.mapper.StoreMapper;
import com.tamdao.modal.Store;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.StoreDTO;
import com.tamdao.payload.dto.UserDTO;
import com.tamdao.payload.request.CommissionRateRequest;
import com.tamdao.service.StoreService;
import com.tamdao.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<StoreDTO> createStore(@Valid @RequestBody StoreDTO storeDto,
                                                @RequestHeader("Authorization") String jwt) {
        User user = userService.getUserFromJwtToken(jwt);
        return ResponseEntity.ok(storeService.createStore(storeDto, user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'store.read', #id) or @authorizationGuard.hasPlatformPermission(authentication, 'platform.store.read')")
    public ResponseEntity<StoreDTO> getStoreById(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'store.update', #id)")
    public ResponseEntity<StoreDTO> updateStore(
            @PathVariable Long id,
            @RequestBody StoreDTO storeDto) {
        return ResponseEntity.ok(storeService.updateStore(id, storeDto));
    }

    @DeleteMapping()
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'store.delete')")
    public ResponseEntity<String> deleteStore() {
        storeService.deleteStore();
        return ResponseEntity.ok("Store deleted successfully");
    }

    @GetMapping("/admin")
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'store.read')")
    public ResponseEntity<StoreDTO> getStoresByAdminId() {
        Store store = storeService.getStoreByAdminId();
        if (store == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "No store found for the logged-in admin. Please onboard and create a store.");
        }
        return ResponseEntity.ok(StoreMapper.toDto(store));
    }

    @GetMapping("/employee")
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'store.read')")
    public ResponseEntity<StoreDTO> getStoresByEmployee() {
        StoreDTO store = storeService.getStoreByEmployee();
        return ResponseEntity.ok(store);
    }

    @GetMapping("/{storeId}/employee/list")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'employee.read', #storeId)")
    public ResponseEntity<List<UserDTO>> getStoreEmployeeList(
            @PathVariable Long storeId) {
        List<UserDTO> users = storeService.getEmployeesByStore(storeId);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/add/employee")
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'employee.create')")
    public ResponseEntity<UserDTO> addEmployee(
            @RequestBody UserDTO userDTO) {
        UserDTO user = storeService.addEmployee(null, userDTO);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    @PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.store.read')")
    public ResponseEntity<List<StoreDTO>> getAllStores(
            @RequestParam(required = false) StoreStatus status
    ) {
        return ResponseEntity.ok(storeService.getAllStores(status));
    }

    @PutMapping("/{storeId}/moderate")
    @PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.store.moderate')")
    public StoreDTO moderateStore(
            @PathVariable Long storeId,
            @RequestParam StoreStatus action
    ) {
        return storeService.moderateStore(storeId, action);
    }

    @PatchMapping("/{storeId}/commission-rate")
    @PreAuthorize("@authorizationGuard.hasPlatformPermission(authentication, 'platform.store.moderate')")
    public StoreDTO updateCommissionRate(
            @PathVariable Long storeId,
            @Valid @RequestBody CommissionRateRequest request) {
        return storeService.updateCommissionRate(storeId, request.rate());
    }
}
