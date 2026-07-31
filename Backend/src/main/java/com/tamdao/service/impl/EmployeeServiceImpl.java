package com.tamdao.service.impl;

import com.tamdao.domain.UserRole;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.mapper.UserMapper;
import com.tamdao.modal.Branch;
import com.tamdao.modal.Store;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.UserDTO;
import com.tamdao.repository.BranchRepository;
import com.tamdao.repository.StoreRepository;
import com.tamdao.repository.UserRepository;
import com.tamdao.service.EmployeeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.tamdao.service.UserService userService;

    @Override
    @Transactional
    public UserDTO createStoreEmployee(UserDTO dto, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found with ID: " + storeId));

        Branch branch = null;

        if (dto.getRole() == UserRole.ROLE_BRANCH_MANAGER || dto.getRole() == UserRole.ROLE_BRANCH_CASHIER || dto.getRole() == UserRole.ROLE_BRANCH_ADMIN) {
            if (dto.getBranchId() == null) {
                throw new BusinessException(ErrorCode.INVALID_REQUEST, "Branch ID is required for Branch roles.");
            }

            branch = branchRepository.findById(dto.getBranchId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found with ID: " + dto.getBranchId()));
        }

        User employee = UserMapper.toEntity(dto);
        employee.setStore(store);
        employee.setBranch(branch);
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));

        User isExist = userRepository.findByEmail(dto.getEmail());
        if (isExist != null) {
            employee.setId(isExist.getId());
        }

        User savedEmployee = userRepository.save(employee);

        if (dto.getRole() == UserRole.ROLE_BRANCH_MANAGER && branch != null) {
            branch.setManager(savedEmployee);
            branchRepository.save(branch);
        }

        return UserMapper.toDTO(savedEmployee);
    }

    @Override
    public User createBranchEmployee(User employee, Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found with ID: " + branchId));

        if (!(employee.getRole().equals(UserRole.ROLE_BRANCH_CASHIER) || employee.getRole().equals(UserRole.ROLE_BRANCH_MANAGER))) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Invalid role for branch employee. Must be ROLE_BRANCH_ADMIN or ROLE_BRANCH_MANAGER");
        }

        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        employee.setBranch(branch);

        User isExist = userRepository.findByEmail(employee.getEmail());
        if (isExist != null) {
            employee.setId(isExist.getId());
        }

        return userRepository.save(employee);
    }

    @Override
    public User updateEmployee(Long employeeId, User employeeDetails) {
        User existingEmployee = findEmployeeById(employeeId);

        if (employeeDetails.getFullName() != null) {
            existingEmployee.setFullName(employeeDetails.getFullName());
        }
        if (employeeDetails.getEmail() != null) {
            existingEmployee.setEmail(employeeDetails.getEmail());
        }
        if (employeeDetails.getPhone() != null) {
            existingEmployee.setPhone(employeeDetails.getPhone());
        }
        if (employeeDetails.getRole() != null) {
            existingEmployee.setRole(employeeDetails.getRole());
        }

        return userRepository.save(existingEmployee);
    }

    @Override
    public void deleteEmployee(Long employeeId) {
        User employee = findEmployeeById(employeeId);
        userRepository.delete(employee);
    }

    @Override
    public User findEmployeeById(Long employeeId) {
        Optional<User> opt = userRepository.findById(employeeId);
        if (opt.isPresent()) {
            return opt.get();
        }
        throw new BusinessException(ErrorCode.USER_NOT_FOUND, "Employee not found with ID: " + employeeId);
    }

    @Override
    public List<User> findStoreEmployees(Long storeId, UserRole role) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found with ID: " + storeId));
        User currentUser = userService.getCurrentUser();
        List<User> allEmployees = userRepository.findByStoreId(storeId);
        return allEmployees.stream()
                .filter(u -> u.getRole() != UserRole.ROLE_ADMIN)
                .filter(u -> u.getRole() != UserRole.ROLE_STORE_ADMIN)
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public List<User> findBranchEmployees(Long branchId, UserRole role) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found with ID: " + branchId));
        return userRepository.findByBranchId(branch.getId()).stream()
                .filter(user -> role == null || user.getRole() == role)
                .collect(Collectors.toList());
    }
}
