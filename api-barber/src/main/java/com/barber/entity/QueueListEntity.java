package com.barber.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(
        name = "queue_list"
)

public class QueueListEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long queueId;

    @Column(nullable = false)
    private Integer queueNumber;

    @Column(nullable = false)
    private LocalDateTime dateTime;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false)
    private int accountId;

    @Column(nullable = false)
    private int barberId;

    @Column(nullable = false)
    private int serviceId;

    @Column(nullable = false)
    private LocalDateTime latestEdit;

    @Column(nullable = true)
    private int editedBy;



}
