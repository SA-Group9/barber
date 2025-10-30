package com.barber.repository;

import com.barber.entity.AccountEntity;
import com.barber.entity.BarberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BarberRepository extends JpaRepository<BarberEntity, Integer> {
    Optional<BarberEntity> findByAccountId(Integer accountId);

    boolean existsByAccountId(Integer accountId);

    BarberEntity findByBarberId(Integer barberId);

    @Query("SELECT b FROM BarberEntity b WHERE b.barberStatus = 'available'")
    List<BarberEntity> findAllAvailableBarbers();

    @Query("SELECT a FROM AccountEntity a JOIN BarberEntity b ON a.accountId = b.accountId WHERE b.accountId = :accountId")
    AccountEntity getInfoFromAccountId(Integer accountId);

    void deleteByAccountId(Long accountId);
}
