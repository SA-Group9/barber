package com.barber.repository;

import com.barber.entity.PaymentEntity;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Integer> {

    @Query("SELECT p FROM PaymentEntity p " +
            "WHERE (:transactionType IS NULL OR p.transactionType = :transactionType) " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:accountId IS NULL OR p.accountId = :accountId) " +
            "AND (:startDate IS NULL OR p.editedAt >= :startDate) " +
            "AND (:endDate IS NULL OR p.editedAt < :endDate) " +
            "ORDER BY p.editedAt DESC")
    Page<PaymentEntity> findByKeyword(
            @Param("transactionType") String transactionType,
            @Param("status") String status,
            @Param("accountId") Integer accountId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT DISTINCT p.accountId FROM PaymentEntity p WHERE p.accountId IS NOT NULL")
    List<Integer> findDistinctAccountIds();

    @Query("SELECT p FROM PaymentEntity p WHERE "
            + "(:transactionType IS NULL OR p.transactionType = :transactionType) AND "
            + "(:status IS NULL OR p.status = :status) AND "
            + "(:inChargeId IS NULL OR p.accountId = :inChargeId) AND "
            + "(:startDate IS NULL OR p.editedAt >= :startDate) AND "
            + "(:endDate IS NULL OR p.editedAt < :endDate)")
    List<PaymentEntity> findByFilterForCalculate(
            @Param("transactionType") String transactionType,
            @Param("status") String status,
            @Param("inChargeId") Long inChargeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}