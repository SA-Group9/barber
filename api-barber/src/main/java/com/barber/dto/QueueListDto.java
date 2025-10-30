// src/main/java/com/barber/dto/QueueListDto.java
package com.barber.dto;

import lombok.Data;

@Data
public class QueueListDto {
    private Integer accountId;
    private Integer queueId;
    private Integer queueNumber;
    private Integer barberId;
    private Integer serviceId;
    private String operation;
    private String keyword;
}
