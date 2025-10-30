package com.barber.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "service") // ชื่อตารางใน DB ถ้าไม่ตรงให้แก้ให้เหมือน
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ให้ auto-increment
    @Column(name = "serviceId", nullable = false)
    private Integer serviceId;

    @Column(name = "serviceName", nullable = false)
    private String serviceName;

    @Column(name = "servicePrice", nullable = false)
    private double servicePrice;
}
