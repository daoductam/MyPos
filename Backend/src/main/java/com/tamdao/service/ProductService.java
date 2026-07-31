package com.tamdao.service;

import com.tamdao.modal.User;
import com.tamdao.payload.dto.ProductDTO;

import java.util.List;

public interface ProductService {
    ProductDTO createProduct(ProductDTO productDto, User user);
    ProductDTO getProductById(Long id);
    ProductDTO updateProduct(Long id, ProductDTO productDto, User user);
    void deleteProduct(Long id, User user);
    List<ProductDTO> getProductsByStoreId(Long storeId);
    List<ProductDTO> searchByKeyword(Long storeId, String query);
}
