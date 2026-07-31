package com.tamdao.service.impl;

import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.modal.Customer;
import com.tamdao.repository.CustomerRepository;
import com.tamdao.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final com.tamdao.service.UserService userService;

    @Override
    public Customer createCustomer(Customer customer) {
        Long currentUserId = userService.getCurrentUser().getId();
        customer.setCreatedBy(currentUserId);
        customer.setUpdatedBy(currentUserId);
        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Long id, Customer customerData) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Customer not found with id " + id));

        customer.setFullName(customerData.getFullName());
        customer.setEmail(customerData.getEmail());
        customer.setPhone(customerData.getPhone());
        if (customerData.getLoyaltyPoints() != null) {
            customer.setLoyaltyPoints(customerData.getLoyaltyPoints());
        }
        customer.setUpdatedBy(userService.getCurrentUser().getId());

        return customerRepository.save(customer);
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Customer not found with id " + id));
        customer.setDeletedBy(userService.getCurrentUser().getId());
        customerRepository.delete(customer);
    }

    @Override
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Customer not found with id " + id));
    }

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public List<Customer> searchCustomer(String keyword) {
        return customerRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword, keyword);
    }

    @Override
    public List<Customer> getDeletedCustomers() {
        return customerRepository.findDeleted();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void restoreCustomer(Long id) {
        int updated = customerRepository.restoreById(id);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Customer not found in trash");
        }
    }
}
