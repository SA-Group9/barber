package com.barber.repository;

import com.barber.entity.AccountEntity;
import com.barber.entity.QueueListEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface QueueListRepository extends JpaRepository<QueueListEntity, Long> {

    @Query("SELECT q FROM QueueListEntity q " +
            "WHERE q.accountId = :accountId " +
            "AND q.status = 'queuing' " +
            "AND q.dateTime >= :startOfDay " +
            "AND q.dateTime < :endOfDay " +
            "ORDER BY q.dateTime DESC")
    Optional<QueueListEntity> findTopByAccountIdAndStatusQueuingToday(
            @Param("accountId") int accountId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("""
    SELECT COUNT(q)
    FROM QueueListEntity q
    WHERE q.queueNumber < :currentQueueNumber
      AND q.dateTime BETWEEN :start AND :end
      AND q.status = 'queuing'
      AND q.barberId = :barberId
    """)
    long countPreviousQueues(
            @Param("currentQueueNumber") int currentQueueNumber,
            @Param("barberId") int barberId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
        SELECT COUNT(q)
        FROM QueueListEntity q
        WHERE q.dateTime BETWEEN :start AND :end
          AND q.status = 'queuing'
          AND q.barberId = :barberId
    """)
    long countWaitingQueuesByBarber(
            @Param("barberId") int barberId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT q FROM QueueListEntity q " +
            "WHERE q.barberId IN (SELECT b.barberId FROM BarberEntity b WHERE b.accountId = :accountId) " +
            "AND q.status = 'queuing' " +
            "AND q.dateTime >= :startOfDay " +
            "AND q.dateTime < :endOfDay " +
            "ORDER BY q.queueNumber ASC")
    List<QueueListEntity> findTodayAllQueuesForBarber(
            @Param("accountId") int accountId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("""
    SELECT COUNT(q)
    FROM QueueListEntity q
    WHERE q.barberId = :barberId
      AND q.status = 'queuing'
      AND q.dateTime > :afterTime
      AND q.dateTime <= :endOfDay
""")
    long countLaterQueues(
            @Param("barberId") int barberId,
            @Param("afterTime") LocalDateTime afterTime,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("""
    SELECT COALESCE(MAX(q.queueNumber), 0)
    FROM QueueListEntity q
    WHERE q.dateTime BETWEEN :start AND :end
    """)
    int findMaxQueueNumberByDateRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("""
    SELECT COALESCE(MAX(q.queueNumber), 0)
    FROM QueueListEntity q
    WHERE q.barberId = :barberId
      AND q.dateTime BETWEEN :start AND :end
    """)
    int findMaxQueueNumberByBarberAndDateRange(
            @Param("barberId") int barberId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT q FROM QueueListEntity q " +
            "WHERE (:status IS NULL OR q.status = :status) " +
            "AND (:barberId IS NULL OR q.barberId = :barberId) " +
            "AND (:serviceId IS NULL OR q.serviceId = :serviceId) " +
            "AND (:startDate IS NULL OR q.dateTime >= :startDate) " +
            "AND (:endDate IS NULL OR q.dateTime < :endDate) " +
            "ORDER BY q.dateTime DESC")
    Page<QueueListEntity> findByFilters(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("barberId") Integer barberId,
            @Param("serviceId") Integer serviceId,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT a FROM AccountEntity a WHERE a.role = 'customer'")
    List<AccountEntity> findAllCustomers();

    @Query("SELECT DISTINCT q.editedBy FROM QueueListEntity q WHERE q.editedBy IS NOT NULL AND q.editedBy <> 0")
    List<Integer> findDistinctEditedBy();


}


