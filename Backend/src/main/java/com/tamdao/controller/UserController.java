package com.tamdao.controller;

import com.tamdao.configurations.JwtProvider;
import com.tamdao.domain.UserRole;
import com.tamdao.mapper.UserMapper;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.UserDTO;
import com.tamdao.repository.UserRepository;
import com.tamdao.service.UserService;
import com.tamdao.service.impl.CustomUserImplementation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtProvider jwtProvider;
	private final CustomUserImplementation customUserImplementation;
	private final UserService userService;

	@GetMapping("/profile")
	public ResponseEntity<UserDTO> getUserProfileFromJwtHandler(
			@RequestHeader("Authorization") String jwt) {
		User user = userService.getUserFromJwtToken(jwt);
		UserDTO userDTO = UserMapper.toDTO(user);
		return new ResponseEntity<>(userDTO, HttpStatus.OK);
	}

	@GetMapping("/customer")
	public ResponseEntity<Set<UserDTO>> getCustomerList(
			@RequestHeader("Authorization") String jwt) {
		Set<User> users = userService.getUserByRole(UserRole.ROLE_CUSTOMER);
		Set<UserDTO> userDTO = UserMapper.toDTOSet(users);
		return new ResponseEntity<>(userDTO, HttpStatus.OK);
	}

	@GetMapping("/cashier")
	public ResponseEntity<Set<UserDTO>> getCashierList(
			@RequestHeader("Authorization") String jwt) {
		Set<User> users = userService.getUserByRole(UserRole.ROLE_BRANCH_CASHIER);
		Set<UserDTO> userDTO = UserMapper.toDTOSet(users);
		return new ResponseEntity<>(userDTO, HttpStatus.OK);
	}

	@GetMapping("/list")
	public ResponseEntity<List<User>> getUsersListHandler(
			@RequestHeader("Authorization") String jwt) {
		List<User> users = userService.getUsers();
		return new ResponseEntity<>(users, HttpStatus.OK);
	}

	@GetMapping("/{userId}")
	public ResponseEntity<UserDTO> getUserByIdHandler(
			@PathVariable Long userId
	) {
		User user = userService.getUserById(userId);
		UserDTO userDTO = UserMapper.toDTO(user);
		return new ResponseEntity<>(userDTO, HttpStatus.OK);
	}
}
