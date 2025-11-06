package com.barber.services;

import com.barber.dto.PaymentDto;
import com.barber.entity.PaymentEntity;
import com.barber.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentEntity createIncomePayment(PaymentDto paymentDto) {
        PaymentEntity payment = new PaymentEntity();
        payment.setTransactionType("income");

        if (paymentDto.getServiceId() == 1) {
            payment.setAmount(250.0);
        } else if (paymentDto.getServiceId() == 2) {
            payment.setAmount(350.0);
        }

        payment.setServiceId(paymentDto.getServiceId());
        payment.setDateTime(LocalDateTime.now());
        payment.setAccountId(paymentDto.getAccountId());
        payment.setQueueListId(paymentDto.getQueueListId());
        payment.setStatus("unpaid");
        payment.setEditedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public PaymentEntity createOutcomePayment(PaymentDto paymentDto) {
        PaymentEntity payment = new PaymentEntity();
        payment.setTransactionType("outcome");

        if (paymentDto.getServiceId() == 1) {
            payment.setAmount(125.0);
        } else if (paymentDto.getServiceId() == 2) {
            payment.setAmount(175.0);
        }

        payment.setServiceId(paymentDto.getServiceId());
        payment.setDateTime(LocalDateTime.now());
        payment.setAccountId(paymentDto.getAccountId());
        payment.setQueueListId(paymentDto.getQueueListId());
        payment.setStatus("-");
        payment.setEditedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public PaymentEntity createOutcomePaymentCustom(PaymentDto paymentDto) {
        PaymentEntity payment = new PaymentEntity();
        payment.setTransactionType("outcome");
        payment.setAmount(paymentDto.getAmount());
        payment.setServiceId(0);
        payment.setDateTime(LocalDateTime.now());
        payment.setAccountId(paymentDto.getAccountId());
        payment.setQueueListId(0);
        payment.setStatus("-");
        payment.setEditedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public Page<PaymentEntity> searchByKeyword(
            String transactionType,
            String status,
            Integer accountId,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.plusDays(1).atStartOfDay() : null;

        if (startDateTime == null) {
            startDateTime = LocalDateTime.of(1970, 1, 1, 0, 0); // หรือ LocalDateTime.MIN ก็ได้
        }

        if (endDateTime == null) {
            endDateTime = LocalDateTime.now().plusYears(100);
        }

        return paymentRepository.findByKeyword(transactionType, status, accountId, startDateTime, endDateTime, pageable);
    }

    public List<Integer> findDistinctAccountIds() {
        return paymentRepository.findDistinctAccountIds();
    }

    public PaymentEntity markAsPaid(int id) {
        PaymentEntity payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));

        payment.setStatus("paid");
        payment.setEditedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public PaymentEntity getInfoById(int id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    public Map<String, Object> getPaymentSummary(
            String transactionType,
            String status,
            Long inChargeId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.plusDays(1).atStartOfDay() : null;
        if (startDateTime == null) {
            startDateTime = LocalDateTime.of(1970, 1, 1, 0, 0); // หรือ LocalDateTime.MIN ก็ได้
        }

        if (endDateTime == null) {
            endDateTime = LocalDateTime.now().plusYears(100);
        }
        List<PaymentEntity> payments = paymentRepository.findByFilterForCalculate(transactionType, status, inChargeId, startDateTime, endDateTime);

        double incomeTotal = payments.stream()
                .filter(p -> p.getTransactionType().equals("income"))
                .mapToDouble(PaymentEntity::getAmount)
                .sum();

        double expenseTotal = payments.stream()
                .filter(p -> p.getTransactionType().equals("outcome"))
                .mapToDouble(PaymentEntity::getAmount)
                .sum();

        double profit = incomeTotal - expenseTotal;
        double pendingAmount = payments.stream()
                .filter(p -> p.getStatus().equals("unpaid"))
                .mapToDouble(PaymentEntity::getAmount)
                .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("incomeTotal", incomeTotal);
        summary.put("expenseTotal", expenseTotal);
        summary.put("profit", profit);
        summary.put("pendingAmount", pendingAmount/2);

        return summary;
    }

}