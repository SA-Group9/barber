package com.barber.dto;

import lombok.Data;

@Data
public class BarberDto {
    private Integer barberId;
    private String barberStatus;
    private Integer accountId;

    private String firstName;
    private String lastName;
    private String telNumber;
}
