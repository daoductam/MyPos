package com.tamdao.authorization;

import org.springframework.security.access.AccessDeniedException;

public class AuthorizationUnavailableException extends AccessDeniedException {
    public AuthorizationUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
