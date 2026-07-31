package com.tamdao.payload.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tamdao.domain.UserRole;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class UserDTO extends BaseDTO {
    private Long id;
    private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String phone;
    private String fullName;
    private UserRole role;
    private String username;
    private Long storeId;
    private Long branchId;
    private BranchDTO branch;
    private String branchName;
    private LocalDateTime lastLogin;



    public UserDTO(Long id, String email, String fullName,
                   UserRole role, String branchName,
                   LocalDateTime lastLogin) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.password = null;
        this.phone = null;
        this.username = null;
        this.storeId = null;
        this.branchId = null;
        this.branch = null;
        this.branchName=branchName;
        this.lastLogin=lastLogin;

    }
}
