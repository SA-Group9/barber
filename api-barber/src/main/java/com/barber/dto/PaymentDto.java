package com.barber.dto;

import lombok.Data;

@Data
public class PaymentDto {
    private Integer paymentId;
    private String transactionType; // read-only on response
//    private String paymentMethod;
    private Double amount;
    private Integer serviceId;
    private String dateTime;
    private Integer accountId; // income: ต้องมี, expense: จะมีหรือไม่ก็ได้
    private Integer queueListId; // ใช้แนบคิวเมื่อเป็น IN
    private String status;     // UNPAID / PAID
    private String note;       // optional
}