package com.tamdao.mapper;

import com.tamdao.modal.User;
import com.tamdao.payload.dto.UserDTO;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserMapper {

    public static UserDTO toDTO(User user) {
        if (user == null) return null;
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setFullName(user.getFullName());
        userDTO.setBranchId(user.getBranch() == null ? null : user.getBranch().getId());
        userDTO.setBranch(user.getBranch() == null ? null : BranchMapper.toDto(user.getBranch()));
        userDTO.setRole(user.getRole());
        userDTO.setStoreId(user.getStore() == null ? null : user.getStore().getId());
        userDTO.setPhone(user.getPhone());
        userDTO.setDeleted(user.getDeleted());
        userDTO.setDeletedAt(user.getDeletedAt());
        userDTO.setDeletedBy(user.getDeletedBy());
        userDTO.setCreatedAt(user.getCreatedAt());
        userDTO.setCreatedBy(user.getCreatedBy());
        userDTO.setUpdatedAt(user.getUpdatedAt());
        userDTO.setUpdatedBy(user.getUpdatedBy());

        return userDTO;
    }

    public static List<UserDTO> toDTOList(List<User> users) {
        return users.stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    public static Set<UserDTO> toDTOSet(Set<User> users) {
        return users.stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toSet());
    }

    public static User toEntity(UserDTO userDTO) {
        User createdUser = new User();
        createdUser.setEmail(userDTO.getEmail());
        createdUser.setPassword(userDTO.getPassword());
        createdUser.setPhone(userDTO.getPhone());
        createdUser.setFullName(userDTO.getFullName());
        createdUser.setRole(userDTO.getRole());

        return createdUser;
    }
}
