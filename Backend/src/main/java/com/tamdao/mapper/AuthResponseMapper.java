package com.tamdao.mapper;

import com.tamdao.modal.User;
import com.tamdao.payload.response.AuthResponse;

public class AuthResponseMapper {

    public static AuthResponse toDto(User user, String jwt) {
        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(jwt);
        authResponse.setUser(UserMapper.toDTO(user));

        return authResponse;
    }
}
