package com.tamdao.controller;


import com.tamdao.configrations.JwtProvider;
import com.tamdao.exception.UserException;
import com.tamdao.payload.dto.UserDTO;
import com.tamdao.payload.request.ForgotPasswordRequest;
import com.tamdao.payload.request.LoginDto;
import com.tamdao.payload.request.ResetPasswordRequest;
import com.tamdao.payload.response.ApiResponse;
import com.tamdao.payload.response.ApiResponseBody;

import com.tamdao.payload.response.AuthResponse;
import com.tamdao.repository.UserRepository;

import com.tamdao.service.AuthService;
import com.tamdao.service.UserService;
import com.tamdao.service.impl.CustomUserImplementation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final CustomUserImplementation customUserImplementation;
    private final UserService userService;
    private final AuthService authService;



    @PostMapping("/signup")
    public ResponseEntity<ApiResponseBody<AuthResponse>> signupHandler(
            @RequestBody @Valid UserDTO req) throws UserException {


        AuthResponse response=authService.signup(req);


        return ResponseEntity.ok(new ApiResponseBody<>(true,
                "User created successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseBody<AuthResponse>> loginHandler(
            @RequestBody LoginDto req) throws UserException {

        AuthResponse response=authService.login(req.getEmail(), req.getPassword());

        return ResponseEntity.ok(new ApiResponseBody<>(
                true,
                "User logged in successfully",
                response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) throws UserException {

        authService.createPasswordResetToken(request.getEmail());

        ApiResponse res= new ApiResponse(
                "A Reset link was sent to your email."
        );
        return ResponseEntity.ok(res);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestBody ResetPasswordRequest request) {
         authService.resetPassword(request.getToken(), request.getPassword());
        ApiResponse res= new ApiResponse(
                "Password reset successful"
        );
        return ResponseEntity.ok(res);
    }


}
