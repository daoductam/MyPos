package com.tamdao.service.impl;


import com.tamdao.domain.UserRole;
import com.tamdao.exception.AccessDeniedException;
import com.tamdao.mapper.ProductMapper;
import com.tamdao.modal.Category;
import com.tamdao.modal.Product;
import com.tamdao.modal.Store;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.ProductDTO;
import com.tamdao.repository.CategoryRepository;
import com.tamdao.repository.ProductRepository;
import com.tamdao.repository.StoreRepository;
import com.tamdao.service.ProductService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductDTO createProduct(ProductDTO dto, User user) throws AccessDeniedException {
        Store store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new EntityNotFoundException("Store not found"));

        checkAuthority(store, user);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        Product product = ProductMapper.toEntity(dto, store, category);
        return ProductMapper.toDto(productRepository.save(product));
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
        return ProductMapper.toDto(product);
    }



    @Override
    public ProductDTO updateProduct(Long id, ProductDTO dto, User user) throws AccessDeniedException {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        Category category=categoryRepository.findById(dto.getCategoryId()).orElseThrow(
                () -> new EntityNotFoundException("Category not found")
        );

        checkAuthority(existing.getStore(),user);

        existing.setName(dto.getName());
        existing.setSku(dto.getSku());
        existing.setDescription(dto.getDescription());
        existing.setMrp(dto.getMrp());
        existing.setSellingPrice(dto.getSellingPrice());
        existing.setBrand(dto.getBrand());
        existing.setImage(dto.getImage());
        existing.setCategory(category);


        if (dto.getStoreId() != null) {
            Store store = storeRepository.findById(dto.getStoreId())
                    .orElseThrow(() -> new EntityNotFoundException("Store not found"));
            existing.setStore(store);
        }

        return ProductMapper.toDto(productRepository.save(existing));
    }

    @Override
    public void deleteProduct(Long id, User user) throws AccessDeniedException {
        Product product=productRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Product not found")
        );
       checkAuthority(product.getStore(),user);
        productRepository.deleteById(id);
    }

    @Override
    public List<ProductDTO> getProductsByStoreId(Long storeId) {
        return productRepository.findByStoreId(storeId)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> searchByKeyword(Long storeId , String query ) {
        return productRepository.searchByKeyword(storeId, query)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    public void checkAuthority(Store store, User user) throws AccessDeniedException {

        if(user.getRole()==UserRole.ROLE_STORE_MANAGER
                && user.getStore().getId().equals(store.getId())){
            return;
        }

        if (user.getRole() == UserRole.ROLE_STORE_ADMIN
                && store.getStoreAdmin().getId().equals(user.getId())) {
            return;
        }

        throw new AccessDeniedException("You are not authorized to manage this store.");

    }



}

