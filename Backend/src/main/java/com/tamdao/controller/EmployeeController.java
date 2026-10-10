package com.tamdao.controller;

import com.tamdao.domain.UserRole;
import com.tamdao.mapper.UserMapper;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.UserDTO;
import com.tamdao.payload.request.EmployeeAccessRequest;
import com.tamdao.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping("/store/{storeId}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'employee.create', #storeId)")
    public ResponseEntity<UserDTO> createStoreEmployee(
            @RequestBody UserDTO employee, @PathVariable Long storeId) throws Exception {
        UserDTO createdEmployee = employeeService.createStoreEmployee(employee, storeId);
        return new ResponseEntity<>(createdEmployee, HttpStatus.CREATED);
    }

    @PostMapping("/branch/{branchId}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'employee.create', #branchId)")
    public ResponseEntity<UserDTO> createBranchEmployee(@RequestBody UserDTO employeeDto, @PathVariable Long branchId) throws Exception {
        User employee = UserMapper.toEntity(employeeDto);
        User createdEmployee = employeeService.createBranchEmployee(employee, branchId);
        return new ResponseEntity<>(UserMapper.toDTO(createdEmployee), HttpStatus.CREATED);
    }

    @PutMapping("/{employeeId}")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'employee.update', #employeeId)")
    public ResponseEntity<UserDTO> updateEmployee(@PathVariable Long employeeId, @RequestBody UserDTO employeeDto) throws Exception {
        User employeeDetails = UserMapper.toEntity(employeeDto);
        User updatedEmployee = employeeService.updateEmployee(employeeId, employeeDetails);
        return new ResponseEntity<>(UserMapper.toDTO(updatedEmployee), HttpStatus.OK);
    }

    @PatchMapping("/{employeeId}/access")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'employee.update', #employeeId)")
    public ResponseEntity<UserDTO> setAccessEnabled(
            @PathVariable Long employeeId,
            @Valid @RequestBody EmployeeAccessRequest request) {
        User updatedEmployee = employeeService.setAccessEnabled(employeeId, request.enabled());
        return ResponseEntity.ok(UserMapper.toDTO(updatedEmployee));
    }

    @PostMapping("/{employeeId}/password-reset")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'employee.update', #employeeId)")
    public ResponseEntity<Void> requestPasswordReset(@PathVariable Long employeeId) {
        employeeService.requestPasswordReset(employeeId);
        return ResponseEntity.accepted().build();
    }

    @DeleteMapping("/{employeeId}")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'employee.delete', #employeeId)")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long employeeId) throws Exception {
        employeeService.deleteEmployee(employeeId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{employeeId}")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'employee.read', #employeeId)")
    public ResponseEntity<UserDTO> findEmployeeById(@PathVariable Long employeeId) throws Exception {
        User employee = employeeService.findEmployeeById(employeeId);
        return new ResponseEntity<>(UserMapper.toDTO(employee), HttpStatus.OK);
    }

    @GetMapping("/store/{storeId}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'employee.read', #storeId)")
    public ResponseEntity<List<UserDTO>> findStoreEmployees(@PathVariable Long storeId) throws Exception {
        List<User> employees = employeeService.findStoreEmployees(storeId, null);
        return new ResponseEntity<>(UserMapper.toDTOList(employees), HttpStatus.OK);
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'employee.read', #branchId)")
    public ResponseEntity<List<UserDTO>> findBranchEmployees(
            @PathVariable Long branchId,
            @RequestParam(required = false) UserRole role
    ) throws Exception {
        List<User> employees = employeeService.findBranchEmployees(branchId,role);
        return new ResponseEntity<>(UserMapper.toDTOList(employees), HttpStatus.OK);
    }

    @GetMapping("/store/{storeId}/trash")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'employee.read', #storeId)")
    public ResponseEntity<List<UserDTO>> getDeletedEmployees(@PathVariable Long storeId) {
        return new ResponseEntity<>(employeeService.getDeletedEmployees(storeId), HttpStatus.OK);
    }

    @PatchMapping("/restore/{id}")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'employee.restore', #id)")
    public ResponseEntity<Void> restoreEmployee(@PathVariable Long id) {
        employeeService.restoreEmployee(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
