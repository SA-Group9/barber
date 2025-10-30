package com.barber.controllers;

import com.barber.dto.BarberDto;
import com.barber.entity.BarberEntity;
import org.springframework.data.domain.Page;
import com.barber.dto.AccountDto;
import com.barber.entity.AccountEntity;
import com.barber.services.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    // Register for Customer
    @PostMapping("/register")
    public ResponseEntity<AccountEntity> register(@RequestBody AccountDto accountDto) {
        AccountEntity newAccount = accountService.register(accountDto);
        return ResponseEntity.ok(newAccount);
    }

//     Create from owner/admin
    @PostMapping("/create")
    public ResponseEntity<AccountEntity> createAccountByAdmin(@RequestBody AccountDto accountDto) {
        AccountEntity created = accountService.createAccountByAdmin(accountDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Check if Password Match for Login
    @PostMapping("/authenticate")
    public ResponseEntity<Boolean> authenticateAccount(@RequestBody AccountDto accountDto) {
        boolean match = accountService.authenticateAccount(accountDto);
        return ResponseEntity.ok(match);
    }

    // Get Account after Login (Authenticate)
    @GetMapping("/getAccount")
    public ResponseEntity<AccountEntity> getUserByTelNumber(@RequestParam String telNumber) {
        AccountEntity account = accountService.getAccountByTelNumber(telNumber);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<AccountEntity> getUserById(@PathVariable int id) {
        AccountEntity account = accountService.getAccountById(id);
        return ResponseEntity.ok(account);
    }

    // Search by Owner (Manage Account)
    @GetMapping("/search")
    public ResponseEntity<Page<AccountEntity>> searchAccount(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "") String role) {

        Pageable pageable = PageRequest.of(page, size);

        String searchKeyword = keyword.isEmpty() ? null : keyword;
        String searchRole = role.isEmpty() ? null : role;

        Page<AccountEntity> accountPage = accountService.searchByKeyword(searchKeyword, searchRole, pageable);

        return ResponseEntity.ok(accountPage);
    }

    // Put: เปลื่ยนข้อมูลหน้าโปรไฟล์(For Customer)
    @PutMapping("/edit")
    public ResponseEntity<AccountEntity> editAccount(@RequestBody AccountDto body) {
        AccountEntity account = accountService.editAccount(body);
        return ResponseEntity.ok(account);
    }

    @PutMapping("/editByAdmin")
    public ResponseEntity<AccountEntity> editAccountByAdmin(@RequestBody AccountDto body) {
        AccountEntity account = accountService.editAccountByAdmin(body);
        return ResponseEntity.ok(account);
    }

    // Put: เปลื่ยนรหัสผ่าน(For Customer)
    @PutMapping("/changePassword")
    public ResponseEntity<AccountEntity> changePassword(@RequestBody AccountDto passwordDto) {
        AccountEntity account = accountService.changePassword(passwordDto);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/check-tel")
    public ResponseEntity<Boolean> checkTelNumber(@RequestParam String telNumber) {
        boolean exists = accountService.existsByTelNumber(telNumber.trim());
        return ResponseEntity.ok(exists);
    }

    @PutMapping("/toggleIsQueuing")
    public ResponseEntity<AccountEntity> toggleIsQueuing(@RequestBody AccountDto accountDto) {
        return ResponseEntity.ok(accountService.toggleIsQueuing(accountDto));
    }

    @PutMapping("/reset-queueing")
    public ResponseEntity<AccountEntity> resetQueueing(@RequestBody AccountDto accountDto) {
        return ResponseEntity.ok(accountService.resetQueuing(accountDto));
    }
}
