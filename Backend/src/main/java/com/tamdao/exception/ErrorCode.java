package com.tamdao.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    SUCCESS("SUCCESS", "Thành công", HttpStatus.OK),
    INVALID_REQUEST("INVALID_REQUEST", "Dữ liệu Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED("UNAUTHENTICATED", "Chưa xác thực hoặc Token không hợp lệ", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("UNAUTHORIZED", "Bạn không có quyền thực hiện thao tác này", HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "Tài nguyên không tồn tại", HttpStatus.NOT_FOUND),
    DATA_INTEGRITY_VIOLATION("DATA_CONFLICT", "Dữ liệu bị trùng lặp hoặc vi phạm ràng buộc hệ thống", HttpStatus.CONFLICT),

    USER_NOT_FOUND("USER_NOT_FOUND", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    USER_EXISTED("USER_EXISTED", "Tài khoản hoặc Email đã tồn tại", HttpStatus.BAD_REQUEST),
    BRANCH_NOT_FOUND("BRANCH_NOT_FOUND", "Chi nhánh không tồn tại", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND("PRODUCT_NOT_FOUND", "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    OUT_OF_STOCK("OUT_OF_STOCK", "Sản phẩm trong kho không đủ số lượng", HttpStatus.BAD_REQUEST),

    UNCATEGORIZED_EXCEPTION("INTERNAL_SERVER_ERROR", "Lỗi hệ thống chưa được phân loại", HttpStatus.INTERNAL_SERVER_ERROR),
    ALREADY_DELETED("ALREADY_DELETED", "Tài nguyên đã bị xóa", HttpStatus.GONE);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
