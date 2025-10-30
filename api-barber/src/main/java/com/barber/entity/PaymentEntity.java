package com.barber.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "payment")
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "paymentId")
    private Integer paymentId;

    @Column(name = "transactionType", nullable = false, length = 10)
    private String transactionType; // IN / OUT

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "serviceId")
    private Integer serviceId;

    @Column(name = "dateTime", nullable = false)
    private LocalDateTime dateTime;

    @Column(name = "accountId")
    private Integer accountId;

    @Column(name = "queueListId")
    private Integer queueListId;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "editedAt")
    private LocalDateTime editedAt;

}