package com.tamdao.controller;

import com.tamdao.mapper.CustomerMapper;
import com.tamdao.modal.Customer;
import com.tamdao.payload.dto.CustomerDTO;
import jakarta.validation.Valid;
import com.tamdao.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'customer.write') or @authorizationGuard.hasCurrentUserBranchPermission(authentication, 'customer.write')")
    public ResponseEntity<CustomerDTO> create(
            @Valid @RequestBody CustomerDTO customer) {
        Customer entity = new Customer();
        entity.setFullName(customer.getFullName());
        entity.setEmail(customer.getEmail());
        entity.setPhone(customer.getPhone());
        entity.setLoyaltyPoints(customer.getLoyaltyPoints());
        return ResponseEntity.ok(CustomerMapper.toDto(customerService.createCustomer(entity)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasCustomerPermission(authentication, 'customer.write', #id)")
    public ResponseEntity<CustomerDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDTO customer
    ) {
        Customer entity = new Customer();
        entity.setFullName(customer.getFullName());
        entity.setEmail(customer.getEmail());
        entity.setPhone(customer.getPhone());
        entity.setLoyaltyPoints(customer.getLoyaltyPoints());
        return ResponseEntity.ok(CustomerMapper.toDto(customerService.updateCustomer(id, entity)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasCustomerPermission(authentication, 'customer.delete', #id)")
    public ResponseEntity<String> delete(
            @PathVariable Long id
    ) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok("Customer deleted successfully");
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasCustomerPermission(authentication, 'customer.read', #id)")
    public ResponseEntity<CustomerDTO> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(CustomerMapper.toDto(customerService.getCustomerById(id)));
    }

    @GetMapping
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'customer.read') or @authorizationGuard.hasCurrentUserBranchPermission(authentication, 'customer.read')")
    public ResponseEntity<List<CustomerDTO>> getAll() {
        return ResponseEntity.ok(CustomerMapper.toDtoList(customerService.getAllCustomers()));
    }

    @GetMapping("/trash")
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'customer.read') or @authorizationGuard.hasCurrentUserBranchPermission(authentication, 'customer.read')")
    public ResponseEntity<List<CustomerDTO>> getDeletedCustomers() {
        return ResponseEntity.ok(CustomerMapper.toDtoList(customerService.getDeletedCustomers()));
    }

    @PatchMapping("/restore/{id}")
    @PreAuthorize("@authorizationGuard.hasCustomerPermission(authentication, 'customer.restore', #id)")
    public ResponseEntity<Void> restoreCustomer(@PathVariable Long id) {
        customerService.restoreCustomer(id);
        return ResponseEntity.ok().build();
    }
}
