package com.tamdao.service.impl;

import com.tamdao.domain.UserRole;
import com.tamdao.exception.BusinessException;
import com.tamdao.exception.ErrorCode;
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
    public ProductDTO createProduct(ProductDTO dto, User user) {
        Store store = storeRepository.findById(dto.getStoreId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found with id: " + dto.getStoreId()));

        checkAuthority(store, user);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Category not found with id: " + dto.getCategoryId()));

        Product product = ProductMapper.toEntity(dto, store, category);
        product.setCreatedBy(user.getId());
        product.setUpdatedBy(user.getId());

        return ProductMapper.toDto(productRepository.save(product));
    }

    @Override
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));
        return ProductMapper.toDto(product);
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO dto, User user) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Product not found with id: " + id));

        checkAuthority(existing.getStore(), user);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Category not found with id: " + dto.getCategoryId()));

        existing.setName(dto.getName());
        existing.setSku(dto.getSku());
        existing.setDescription(dto.getDescription());
        existing.setMrp(dto.getMrp());
        existing.setSellingPrice(dto.getSellingPrice());
        existing.setBrand(dto.getBrand());
        existing.setCategory(category);
        existing.setImage(dto.getImage());
        existing.setUpdatedBy(user.getId());

        if (dto.getStoreId() != null) {
            Store store = storeRepository.findById(dto.getStoreId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Store not found"));
            existing.setStore(store);
        }

        return ProductMapper.toDto(productRepository.save(existing));
    }

    @Override
    public void deleteProduct(Long id, User user) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found"));
        checkAuthority(product.getStore(), user);
        product.setDeletedBy(user.getId());
        productRepository.delete(product);
    }

    @Override
    public List<ProductDTO> getProductsByStoreId(Long storeId) {
        return productRepository.findByStoreId(storeId)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> searchByKeyword(Long storeId, String query) {
        return productRepository.searchByKeyword(storeId, query)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    public void checkAuthority(Store store, User user) {
        if (user.getRole() == UserRole.ROLE_STORE_MANAGER
                && user.getStore() != null && user.getStore().getId().equals(store.getId())) {
            return;
        }

        if (user.getRole() == UserRole.ROLE_STORE_ADMIN
                && store.getStoreAdmin() != null && store.getStoreAdmin().getId().equals(user.getId())) {
            return;
        }

        throw new BusinessException(ErrorCode.UNAUTHORIZED, "You are not authorized to manage this store.");
    }

    @Override
    public List<ProductDTO> getDeletedProducts(Long storeId) {
        return productRepository.findDeletedByStoreId(storeId).stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void restoreProduct(Long id) {
        int updated = productRepository.restoreById(id);
        if (updated == 0) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Product not found in trash");
        }
    }
}
