package com.tamdao.service;

import com.tamdao.payload.dto.UserDTO;
import com.tamdao.payload.response.AuthResponse;

public interface AuthService {
    AuthResponse login(String username, String password);
    AuthResponse signup(UserDTO req);

    void createPasswordResetToken(String email);
    void resetPassword(String token, String newPassword);
}
