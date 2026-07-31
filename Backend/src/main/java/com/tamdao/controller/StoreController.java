package com.tamdao.controller;

import com.tamdao.domain.StoreStatus;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.mapper.StoreMapper;
import com.tamdao.modal.Store;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.StoreDTO;
import com.tamdao.payload.dto.UserDTO;
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
    public ResponseEntity<StoreDTO> getStoreById(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoreDTO> updateStore(
            @PathVariable Long id,
            @RequestBody StoreDTO storeDto) {
        return ResponseEntity.ok(storeService.updateStore(id, storeDto));
    }

    @DeleteMapping()
    public ResponseEntity<String> deleteStore() {
        storeService.deleteStore();
        return ResponseEntity.ok("Store deleted successfully");
    }

    @GetMapping("/admin")
    public ResponseEntity<StoreDTO> getStoresByAdminId() {
        Store store = storeService.getStoreByAdminId();
        if (store == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "No store found for the logged-in admin. Please onboard and create a store.");
        }
        return ResponseEntity.ok(StoreMapper.toDto(store));
    }

    @GetMapping("/employee")
    public ResponseEntity<StoreDTO> getStoresByEmployee() {
        StoreDTO store = storeService.getStoreByEmployee();
        return ResponseEntity.ok(store);
    }

    @GetMapping("/{storeId}/employee/list")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_MANAGER', 'ROLE_STORE_ADMIN')")
    public ResponseEntity<List<UserDTO>> getStoreEmployeeList(
            @PathVariable Long storeId) {
        List<UserDTO> users = storeService.getEmployeesByStore(storeId);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/add/employee")
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_MANAGER', 'ROLE_STORE_ADMIN')")
    public ResponseEntity<UserDTO> addEmployee(
            @RequestBody UserDTO userDTO) {
        UserDTO user = storeService.addEmployee(null, userDTO);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<StoreDTO>> getAllStores(
            @RequestParam(required = false) StoreStatus status
    ) {
        return ResponseEntity.ok(storeService.getAllStores(status));
    }

    @PutMapping("/{storeId}/moderate")
    public StoreDTO moderateStore(
            @PathVariable Long storeId,
            @RequestParam StoreStatus action
    ) {
        return storeService.moderateStore(storeId, action);
    }
}
