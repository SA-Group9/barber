package com.barber.controllers;

import com.barber.dto.PaymentDto;
import com.barber.entity.AccountEntity;
import com.barber.entity.PaymentEntity;
import com.barber.services.AccountService;
import com.barber.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final AccountService accountService;

    @PostMapping("/create/income")
    public ResponseEntity<PaymentEntity> createIncome(@RequestBody PaymentDto paymentDto) {
        PaymentEntity savedPayment = paymentService.createIncomePayment(paymentDto);
        return ResponseEntity.ok(savedPayment);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PaymentEntity>> searchPayment(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String transactionType,
            @RequestParam(defaultValue = "") String status,
            @RequestParam(required = false) Integer accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Pageable pageable = PageRequest.of(page, size);

        String searchTransactionType = transactionType.isEmpty() ? null : transactionType;
        String searchStatus = status.isEmpty() ? null : status;

        Page<PaymentEntity> paymentPage = paymentService.searchByKeyword(
                searchTransactionType,
                searchStatus,
                accountId,
                startDate,
                endDate,
                pageable
        );

        return ResponseEntity.ok(paymentPage);
    }

    @GetMapping("/summary")
    public Map<String, Object> getPaymentSummary(
            @RequestParam(required = false) String transactionType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long inChargeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate endDate
    ) {
        return paymentService.getPaymentSummary(transactionType, status, inChargeId, startDate, endDate);
    }



    @GetMapping("/get/inCharge")
    public ResponseEntity<List<AccountEntity>> getInCharge() {
        List<Integer> accountIds = paymentService.findDistinctAccountIds();

        if (accountIds.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        List<AccountEntity> accounts = accountService.findAccountByIdIn(accountIds);
        return ResponseEntity.ok(accounts);
    }

    @PutMapping("/paid/{id}")
    public ResponseEntity<PaymentEntity> markAsPaid(@PathVariable Integer id) {
        PaymentEntity payment = paymentService.markAsPaid(id);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/get-info/{id}")
    public ResponseEntity<PaymentEntity> getInfoById(@PathVariable Integer id) {
        PaymentEntity payment = paymentService.getInfoById(id);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/create/outcome")
    public ResponseEntity<PaymentEntity> createOutcome(@RequestBody PaymentDto paymentDto) {
        PaymentEntity outcomePayment = paymentService.createOutcomePayment(paymentDto);
        return ResponseEntity.ok(outcomePayment);
    }

    @PostMapping("/create/outcome/custom")
    public ResponseEntity<PaymentEntity> createOutcomeCustom(@RequestBody PaymentDto paymentDto) {
        PaymentEntity outcomePayment = paymentService.createOutcomePaymentCustom(paymentDto);
        return ResponseEntity.ok(outcomePayment);
    }

}
