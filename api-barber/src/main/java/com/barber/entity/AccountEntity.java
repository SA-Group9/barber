package com.barber.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@Entity
@Table(name = "account")
public class AccountEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "accountId", nullable = false) // <-- อัปเดต
    private Integer accountId;

    @Column(name = "firstname", nullable = false) // <-- อัปเดต
    private String firstName;

    @Column(name = "lastname", nullable = false) // <-- อัปเดต
    private String lastName;

    @Column(name = "telNumber", nullable = false, unique = true, length = 10)
    private String telNumber;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "Queuing", nullable = false) // <-- อัปเดต
    private boolean queuing;

    @Column(name = "role", nullable = false)
    private String role;

}