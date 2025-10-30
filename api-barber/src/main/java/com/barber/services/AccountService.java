package com.barber.services;

import com.barber.entity.BarberEntity;
import org.springframework.transaction.annotation.Transactional;
import com.barber.dto.AccountDto;
import com.barber.entity.AccountEntity;
import com.barber.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder; // ตัวเข้ารหัส
import org.springframework.stereotype.Service;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final BarberService barberService;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordService passwordService;

    public AccountEntity getAccountByTelNumber(String telNumber) {
        return accountRepository.findByTelNumber(telNumber);
    }

    public boolean authenticateAccount(AccountDto accountDto) {
        AccountEntity account = getAccountByTelNumber(accountDto.getTelNumber());
        if (Objects.equals(account, null)) {
            return false;
        }
        return passwordService.passwordMatch(accountDto.getPassword(), account.getPassword());
    }

    // Register
    @Transactional
    public AccountEntity register(AccountDto account) {
        String tel = account.getTelNumber().trim();

        // ถ้าเบอร์โทรมีอยู่แล้ว ห้ามสมัครซ้ำ
        if (accountRepository.existsByTelNumber(tel)) {
            throw new IllegalStateException("Phone number is already taken");
        }

        AccountEntity accountObject = new AccountEntity();
        accountObject.setFirstName(account.getFirstName());
        accountObject.setLastName(account.getLastName());
        accountObject.setTelNumber(tel);
        accountObject.setPassword(passwordEncoder.encode(account.getPassword()));
        accountObject.setQueuing(false);
        accountObject.setRole("customer");

        return accountRepository.save(accountObject);
    }

    public Page<AccountEntity> searchByKeyword(String keyword, String role, Pageable pageable) {
        return accountRepository.findByKeyword(keyword, role, pageable);
    }

    public AccountEntity getAccountById(int userId) {
        return accountRepository.findById(userId).orElse(null);
    }

    public AccountEntity editAccount(AccountDto accountDto) {
        AccountEntity account = getAccountById(accountDto.getAccountId());

        boolean isFirstNameChanged = !account.getFirstName().equals(accountDto.getFirstName());
        boolean isLastNameChanged = !account.getLastName().equals(accountDto.getLastName());
        boolean isTelNumberChanged = !account.getTelNumber().equals(accountDto.getTelNumber());

        if (!isFirstNameChanged && !isLastNameChanged && !isTelNumberChanged) {
            return null;
        }

        account.setFirstName(accountDto.getFirstName());
        account.setLastName(accountDto.getLastName());
        account.setTelNumber(accountDto.getTelNumber());
        account.setRole(accountDto.getRole());

        return accountRepository.save(account);
    }

    public AccountEntity editAccountByAdmin(AccountDto accountDto) {
        AccountEntity account = getAccountById(accountDto.getAccountId());

        // Normalize roles (trim + lowercase)
        String oldRole = account.getRole() != null ? account.getRole().trim().toLowerCase() : "";
        String newRole = accountDto.getRole() != null ? accountDto.getRole().trim().toLowerCase() : "";

        boolean isRoleChanged = !oldRole.equals(newRole);

        // Update account fields
        account.setFirstName(accountDto.getFirstName());
        account.setLastName(accountDto.getLastName());
        account.setTelNumber(accountDto.getTelNumber());
        account.setQueuing(accountDto.getQueuing());
        account.setRole(newRole);

        if (accountDto.getPassword() != null && !accountDto.getPassword().isBlank()) {
            account.setPassword(passwordEncoder.encode(accountDto.getPassword()));
        }

        AccountEntity saved = accountRepository.save(account);

        if (isRoleChanged) {
            if ("barber".equals(newRole)) {
                if (!barberService.existsByAccountId(Long.valueOf(saved.getAccountId()))) {
                    BarberEntity barber = new BarberEntity();
                    barber.setAccountId(saved.getAccountId());
                    barber.setBarberStatus("not-available");
                    barberService.addBarber(barber);
                }
            } else if ("barber".equals(oldRole)) {
                // If old role was barber but changed to something else, delete
                barberService.deleteByAccountId(Long.valueOf(saved.getAccountId()));
            }
        }

        return saved;
    }

    // 🔹 สร้างบัญชีใหม่
    @Transactional
    public AccountEntity createAccountByAdmin(AccountDto accountDto) {
        String tel = accountDto.getTelNumber().trim();

        if (accountRepository.existsByTelNumber(tel)) {
            return null;
        }

        AccountEntity account = new AccountEntity();
        account.setFirstName(accountDto.getFirstName().trim());
        account.setLastName(accountDto.getLastName().trim());
        account.setTelNumber(tel);
        account.setPassword(passwordEncoder.encode(accountDto.getPassword()));
        account.setQueuing(false);

        String role = (accountDto.getRole() == null || accountDto.getRole().isBlank())
                ? "customer"
                : accountDto.getRole().trim().toLowerCase();

        account.setRole(role);

        AccountEntity saved = accountRepository.save(account);

        // ✅ ถ้าเป็น barber → เพิ่ม barber record
        if ("barber".equalsIgnoreCase(saved.getRole())) {
            BarberEntity barber = new BarberEntity();
            barber.setAccountId(saved.getAccountId());
            barber.setBarberStatus("not-available");
            barberService.addBarber(barber);
        }

        return saved;
    }

    public AccountEntity changePassword(AccountDto accountDto) {
        AccountEntity account = getAccountById(accountDto.getAccountId());
        if (passwordService.passwordMatch(accountDto.getOldPassword(), account.getPassword()) &&
                accountDto.getNewPassword().equals(accountDto.getConfirmNewPassword())) {

            account.setPassword(passwordService.hashPassword(accountDto.getNewPassword()));
            return accountRepository.save(account);
        } else {
            return null;
        }
    }

    public boolean existsByTelNumber(String telNumber) {
        return accountRepository.existsByTelNumber(telNumber);
    }

    public AccountEntity toggleIsQueuing(AccountDto accountDto) {

        AccountEntity account = accountRepository.findById(accountDto.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setQueuing(!accountDto.getQueuing());

        return accountRepository.save(account);
    }

    public AccountEntity resetQueuing(AccountDto accountDto) {
        AccountEntity account = accountRepository.findById(accountDto.getAccountId()).orElseThrow(() -> new RuntimeException("Account not found"));
        account.setQueuing(false);
        return accountRepository.save(account);
    }

    public List<AccountEntity> findAccountByIdIn(List<Integer> accountIds) {
        return accountRepository.findByAccountIdIn(accountIds);
    }
}
