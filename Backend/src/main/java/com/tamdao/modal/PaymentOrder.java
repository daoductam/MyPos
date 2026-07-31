package com.tamdao.modal;

import com.tamdao.domain.PaymentMethod;
import com.tamdao.domain.PaymentOrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;

@Entity
@SQLDelete(sql = "UPDATE payment_order SET deleted = true, deleted_at = NOW() WHERE id = ?")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class PaymentOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Double amount;

    private PaymentOrderStatus status = PaymentOrderStatus.PENDING;

    private PaymentMethod paymentMethod;

    private String paymentLinkId;

    @ManyToOne
    private User user;

    @Column(nullable = false)
    private Long planId;


}
