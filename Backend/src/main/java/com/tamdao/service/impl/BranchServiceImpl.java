package com.tamdao.service.impl;

import com.tamdao.domain.UserRole;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
import com.tamdao.mapper.BranchMapper;
import com.tamdao.modal.Branch;
import com.tamdao.modal.Store;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.BranchDTO;
import com.tamdao.repository.BranchRepository;
import com.tamdao.repository.StoreRepository;
import com.tamdao.repository.UserRepository;
import com.tamdao.service.BranchService;
import com.tamdao.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @Override
    public BranchDTO createBranch(BranchDTO branchDto, User user) {
        Store store = storeRepository.findByStoreAdminId(user.getId());
        if (store == null) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found for user");
        }

        Branch branch = BranchMapper.toEntity(branchDto, store);
        return BranchMapper.toDto(branchRepository.save(branch));
    }

    @Override
    public BranchDTO getBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found"));
        return BranchMapper.toDto(branch);
    }

    @Override
    public List<BranchDTO> getAllBranchesByStoreId(Long storeId) {
        User currentUser = userService.getCurrentUser();
        Store store = storeRepository.findById(storeId).orElseThrow(
                () -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found")
        );

        boolean isStoreManager = currentUser.getRole() == UserRole.ROLE_STORE_MANAGER &&
                currentUser.getStore() != null &&
                currentUser.getStore().getId().equals(storeId);

        boolean isStoreAdmin = currentUser.getRole() == UserRole.ROLE_STORE_ADMIN &&
                store.getStoreAdmin() != null &&
                store.getStoreAdmin().getId().equals(currentUser.getId());

        if (!isStoreManager && !isStoreAdmin) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "You are not authorized to access this store's branches");
        }

        return branchRepository.findByStoreId(store.getId()).stream()
                .map(BranchMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public BranchDTO updateBranch(Long id, BranchDTO branchDto, User user) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found"));

        if (user.getRole() == UserRole.ROLE_STORE_ADMIN) {
            if (existing.getStore() == null || existing.getStore().getStoreAdmin() == null ||
                    !existing.getStore().getStoreAdmin().getId().equals(user.getId())) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, "You are not authorized to update this branch.");
            }
        } else if (user.getRole() != UserRole.ROLE_ADMIN) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "You are not authorized to update branch.");
        }

        existing.setName(branchDto.getName());
        existing.setAddress(branchDto.getAddress());
        existing.setPhone(branchDto.getPhone());
        existing.setEmail(branchDto.getEmail());
        existing.setCloseTime(branchDto.getCloseTime());
        existing.setOpenTime(branchDto.getOpenTime());
        existing.setWorkingDays(branchDto.getWorkingDays());
        existing.setUpdatedBy(user.getId());

        return BranchMapper.toDto(branchRepository.save(existing));
    }

    @Override
    public void deleteBranch(Long id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found"));
        User currentUser = userService.getCurrentUser();
        branch.setDeletedBy(currentUser.getId());
        branchRepository.delete(branch);
    }

    @Override
    public List<BranchDTO> getDeletedBranches(Long storeId) {
        return branchRepository.findDeletedByStoreId(storeId).stream()
                .map(BranchMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void restoreBranch(Long id) {
        int updated = branchRepository.restoreById(id);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "Branch not found in trash");
        }
    }
}
