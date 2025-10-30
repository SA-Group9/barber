package com.barber.repository;

import com.barber.entity.AccountEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<AccountEntity, Integer> {

    boolean existsByTelNumber(String telNumber);

    AccountEntity findByTelNumber(String telNumber);

    @Query("SELECT a FROM AccountEntity a " +
            "WHERE (:role IS NULL OR a.role = :role) " +
            "AND (:keyword IS NULL OR " +
            "LOWER(a.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(a.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR a.telNumber LIKE CONCAT('%', :keyword, '%'))")
    Page<AccountEntity> findByKeyword(@Param("keyword") String keyword,
                                      @Param("role") String role,
                                      Pageable pageable);

    List<AccountEntity> findByAccountIdIn(List<Integer> accountIds);
}