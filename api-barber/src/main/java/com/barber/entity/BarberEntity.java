package com.barber.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "barber") // ชื่อตารางใน DB ถ้าไม่ตรงให้แก้ให้เหมือน
public class BarberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "barberId")
    private Integer barberId;

    private Integer accountId;

    @Column(name = "barberStatus", nullable = false, length = 20)
    private String barberStatus;

}

