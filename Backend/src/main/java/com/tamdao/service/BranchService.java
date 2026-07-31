package com.tamdao.service;

import com.tamdao.modal.User;
import com.tamdao.payload.dto.BranchDTO;

import java.util.List;

public interface BranchService {
    BranchDTO createBranch(BranchDTO branchDto, User user);
    BranchDTO getBranchById(Long id);
    List<BranchDTO> getAllBranchesByStoreId(Long storeId);
    BranchDTO updateBranch(Long id, BranchDTO branchDto, User user);
    void deleteBranch(Long id);
}
