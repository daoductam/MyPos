package com.tamdao.service;

import com.tamdao.exception.UserException;
import com.tamdao.payload.dto.UserDTO;
import com.tamdao.payload.response.AuthResponse;

public interface AuthService {
    AuthResponse login(String username, String password) throws UserException;
    AuthResponse signup(UserDTO req) throws UserException;

    void createPasswordResetToken(String email) throws UserException;
    void resetPassword(String token, String newPassword);
}
