package com.tamdao.modal;


import com.tamdao.domain.PaymentStatus;
import com.tamdao.domain.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
@SQLDelete(sql = "UPDATE subscriptions SET deleted = true, deleted_at = NOW() WHERE id = ?")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Store store;

    @ManyToOne(optional = false)
    private SubscriptionPlan plan;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status; // TRIAL, ACTIVE, EXPIRED, CANCELLED

    private String paymentGateway; // RAZORPAY, STRIPE, etc.
    private String transactionId;

    @Column(nullable = false)
    private PaymentStatus paymentStatus;
}
