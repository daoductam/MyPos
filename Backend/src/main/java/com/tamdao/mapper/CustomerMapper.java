package com.tamdao.mapper;

import com.tamdao.modal.Customer;
import com.tamdao.payload.dto.CustomerDTO;

import java.util.List;

public final class CustomerMapper {

    private CustomerMapper() {
    }

    public static CustomerDTO toDto(Customer customer) {
        if (customer == null) {
            return null;
        }
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setFullName(customer.getFullName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setLoyaltyPoints(customer.getLoyaltyPoints());
        dto.setStoreId(customer.getStore() == null ? null : customer.getStore().getId());
        dto.setBranchId(customer.getBranch() == null ? null : customer.getBranch().getId());
        dto.setDeleted(customer.getDeleted());
        dto.setDeletedAt(customer.getDeletedAt());
        dto.setDeletedBy(customer.getDeletedBy());
        dto.setCreatedAt(customer.getCreatedAt());
        dto.setCreatedBy(customer.getCreatedBy());
        dto.setUpdatedAt(customer.getUpdatedAt());
        dto.setUpdatedBy(customer.getUpdatedBy());
        return dto;
    }

    public static List<CustomerDTO> toDtoList(List<Customer> customers) {
        return customers.stream().map(CustomerMapper::toDto).toList();
    }
}
