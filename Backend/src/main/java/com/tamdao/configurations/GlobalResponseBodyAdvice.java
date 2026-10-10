package com.tamdao.configurations;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tamdao.payload.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    private final ObjectMapper objectMapper;

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        Class<?> containingClass = returnType.getContainingClass();
        String className = containingClass.getName();
        if (className.contains("springdoc") || className.contains("swagger") || className.contains("org.springframework")) {
            return false;
        }
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request, ServerHttpResponse response) {
        if (body instanceof ApiResponse) {
            ((ApiResponse<?>) body).setRequestId(resolveRequestId(request));
            return body;
        }

        ApiResponse<Object> apiResponse = ApiResponse.success(body);
        apiResponse.setRequestId(resolveRequestId(request));

        if (body instanceof String) {
            try {
                response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                return objectMapper.writeValueAsString(apiResponse);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Error serializing ApiResponse to JSON String", e);
            }
        }

        return apiResponse;
    }

    private String resolveRequestId(ServerHttpRequest request) {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            return (String) servletRequest.getServletRequest().getAttribute("X-Request-Id");
        }
        return request.getHeaders().getFirst("X-Request-Id");
    }
}
