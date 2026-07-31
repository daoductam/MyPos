package com.tamdao.service;

import com.tamdao.domain.UserRole;
import com.tamdao.modal.User;

import java.util.List;
import java.util.Set;

public interface UserService {
	User getUserByEmail(String email);
	User getUserFromJwtToken(String jwt);
	User getUserById(Long id);
	Set<User> getUserByRole(UserRole role);
	List<User> getUsers();
	User getCurrentUser();
}
