package com.tamdao.payload.dto;



import lombok.*;
import lombok.experimental.SuperBuilder;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
public class ProductDTO extends BaseDTO {
    private Long id;
    private String name;
    private String sku;
    private String description;
    private Double mrp;
    private Double sellingPrice;
    private String brand;
    private Long categoryId;
    private String category;
    private Long storeId;
    private String image;

    /**
     * JPQL constructor used by ProductRepository.findLowStockProducts()
     */
    public ProductDTO(Long id, String name, String sku, String description,
                      Double mrp, Double sellingPrice, String brand,
                      Long categoryId, String category, Long storeId,
                      String image, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.description = description;
        this.mrp = mrp;
        this.sellingPrice = sellingPrice;
        this.brand = brand;
        this.categoryId = categoryId;
        this.category = category;
        this.storeId = storeId;
        this.image = image;
        this.setCreatedAt(createdAt);
        this.setUpdatedAt(updatedAt);
    }
}
