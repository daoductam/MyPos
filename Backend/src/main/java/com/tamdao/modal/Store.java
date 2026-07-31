package com.tamdao.modal;


import com.tamdao.domain.StoreStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDateTime;

@Entity
@Table(name = "stores")
@SQLDelete(sql = "UPDATE stores SET deleted = true, deleted_at = NOW() WHERE id = ?")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "brand name is required")
    private String brand;

    @OneToOne
    private User storeAdmin;

    private String description;

    private String storeType;

    private StoreStatus status;

    // Contact Information
    @Embedded
    private StoreContact contact=new StoreContact();

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = StoreStatus.PENDING;
        }
    }
}
