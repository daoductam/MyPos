package com.tamdao.payload.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.tamdao.payload.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
	private String accessToken;
	@com.fasterxml.jackson.annotation.JsonIgnore
	private String refreshToken;
	private String message;
	private String title;
	private UserDTO user;
}
