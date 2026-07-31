package com.tamdao.service.impl;

import com.tamdao.domain.StoreStatus;
import com.tamdao.domain.UserRole;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.mapper.StoreMapper;
import com.tamdao.mapper.UserMapper;
import com.tamdao.modal.Branch;
import com.tamdao.modal.Store;
import com.tamdao.modal.StoreContact;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.StoreDTO;
import com.tamdao.payload.dto.UserDTO;
import com.tamdao.repository.BranchRepository;
import com.tamdao.repository.StoreRepository;
import com.tamdao.repository.UserRepository;
import com.tamdao.service.StoreService;
import com.tamdao.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final UserService userService;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public StoreDTO createStore(StoreDTO storeDto, User user) {
        Store store = StoreMapper.toEntity(storeDto, user);
        return StoreMapper.toDto(storeRepository.save(store));
    }

    @Override
    public StoreDTO getStoreById(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found"));
        return StoreMapper.toDto(store);
    }

    @Override
    public List<StoreDTO> getAllStores(StoreStatus status) {
        List<Store> stores;
        if (status != null) {
            stores = storeRepository.findByStatus(status);
        } else {
            stores = storeRepository.findAll();
        }

        return stores.stream()
                .map(StoreMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Store getStoreByAdminId() {
        User currentUser = userService.getCurrentUser();
        return storeRepository.findByStoreAdminId(currentUser.getId());
    }

    @Override
    public StoreDTO getStoreByEmployee() {
        User currentUser = userService.getCurrentUser();
        if (currentUser.getStore() == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "User does not have enough permissions to access this store");
        }
        return StoreMapper.toDto(currentUser.getStore());
    }

    @Override
    public StoreDTO updateStore(Long id, StoreDTO storeDto) {
        User currentUser = userService.getCurrentUser();
        Store existing = storeRepository.findByStoreAdminId(currentUser.getId());

        if (existing == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found");
        }

        existing.setBrand(storeDto.getBrand());
        existing.setDescription(storeDto.getDescription());

        if (storeDto.getStoreType() != null) {
            existing.setStoreType(storeDto.getStoreType());
        }

        if (storeDto.getContact() != null) {
            StoreContact contact = StoreContact.builder()
                    .address(storeDto.getContact().getAddress())
                    .phone(storeDto.getContact().getPhone())
                    .email(storeDto.getContact().getEmail())
                    .build();
            existing.setContact(contact);
        }

        return StoreMapper.toDto(storeRepository.save(existing));
    }

    @Override
    public void deleteStore() {
        Store store = getStoreByAdminId();
        if (store == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found");
        }
        User currentUser = userService.getCurrentUser();
        store.setDeletedBy(currentUser.getId());
        storeRepository.delete(store);
    }

    @Override
    public UserDTO addEmployee(Long id, UserDTO userDto) {
        Store store = getStoreByAdminId();

        User employee = UserMapper.toEntity(userDto);
        if (userDto.getRole() == UserRole.ROLE_STORE_MANAGER) {
            employee.setStore(store);
        } else if (userDto.getRole() == UserRole.ROLE_BRANCH_MANAGER) {
            Branch branch = branchRepository.findById(userDto.getBranchId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Branch not found"));
            employee.setBranch(branch);
            employee.setStore(store);
        }

        employee.setPassword(passwordEncoder.encode(userDto.getPassword()));
        User addedEmployee = userRepository.save(employee);

        return UserMapper.toDTO(addedEmployee);
    }

    @Override
    public List<UserDTO> getEmployeesByStore(Long storeId) {
        User currentUser = userService.getCurrentUser();

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found"));
        if (store.getStoreAdmin().getId().equals(currentUser.getId())
                || (currentUser.getStore() != null && currentUser.getStore().getId().equals(store.getId()))) {
            List<User> employees = userRepository.findByStoreId(storeId);
            return UserMapper.toDTOList(employees);
        }

        throw new BusinessException(ErrorCode.UNAUTHORIZED, "User does not have enough permissions to access this store");
    }

    @Override
    public StoreDTO moderateStore(Long storeId, StoreStatus action) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found with id: " + storeId));

        store.setStatus(action);
        Store updatedStore = storeRepository.save(store);
        return StoreMapper.toDto(updatedStore);
    }
}
