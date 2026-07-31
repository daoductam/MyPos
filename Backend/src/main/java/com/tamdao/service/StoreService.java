package com.tamdao.service;

import com.tamdao.domain.StoreStatus;
import com.tamdao.modal.Store;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.StoreDTO;
import com.tamdao.payload.dto.UserDTO;

import java.util.List;

public interface StoreService {
    StoreDTO createStore(StoreDTO storeDto, User user);
    StoreDTO getStoreById(Long id);
    List<StoreDTO> getAllStores(StoreStatus status);
    Store getStoreByAdminId();
    StoreDTO getStoreByEmployee();
    StoreDTO updateStore(Long id, StoreDTO storeDto);
    void deleteStore();
    UserDTO addEmployee(Long id, UserDTO userDto);
    List<UserDTO> getEmployeesByStore(Long storeId);

    StoreDTO moderateStore(Long storeId, StoreStatus action);
}
