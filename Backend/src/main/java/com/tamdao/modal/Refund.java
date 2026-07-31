package com.tamdao.modal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tamdao.domain.PaymentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDateTime;

@Entity
@SQLDelete(sql = "UPDATE refund SET deleted = true, deleted_at = NOW() WHERE id = ?")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Refund extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Order order;

    private String reason;

    private Double amount;

    @ManyToOne
    @JsonIgnore
    private ShiftReport shiftReport;

    @ManyToOne
    private User cashier;

    @ManyToOne
    private Branch branch;

    private PaymentType paymentType;

//    @ManyToOne
//    private OrderItem orderItem;
}
