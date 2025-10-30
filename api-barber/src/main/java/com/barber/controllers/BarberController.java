package com.barber.controllers;

import com.barber.dto.AccountDto;
import com.barber.dto.BarberDto;
import com.barber.entity.AccountEntity;
import com.barber.entity.BarberEntity;
import com.barber.services.BarberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/barber")
@RequiredArgsConstructor
public class BarberController {

    private final BarberService barberService;

//    @GetMapping("/{barberId}")
//    public ResponseEntity<BarberEntity> getBarber(@PathVariable("barberId") Integer barberId) {
//        return ResponseEntity.ok(barberService.getByBarberId(barberId));
//    }

    @GetMapping("/all")
    public ResponseEntity<List<BarberEntity>> getAllBarbers() {
        List<BarberEntity> services = barberService.getAllBarbers();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/allAvailable")
    public ResponseEntity<List<BarberEntity>> getAllAvailableBarbers() {
        List<BarberEntity> services = barberService.getAllAvailableBarbers();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/id/{accountId}")
    public AccountEntity getBarberInfoFromAccountId(@PathVariable Integer accountId) {
        return barberService.getBarberInfoFromAccountId(accountId);
    }

    @PostMapping("/addBarber")
    public ResponseEntity<BarberEntity> addBarber(@RequestBody BarberEntity barber) {
        return ResponseEntity.ok(barberService.addBarber(barber));
    }

    //     อัปเดตสถานะ barber (AVAILABLE/NON_AVAILABLE)
    @PutMapping("/toggleStatus")
    public ResponseEntity<BarberEntity> toggleStatus(@RequestBody BarberDto barberDto) {
        return ResponseEntity.ok(barberService.toggleStatus(barberDto));
    }

    @PostMapping("/getBarberStatus")
    public ResponseEntity<BarberEntity> getBarberStatus(@RequestBody AccountDto accountDto) {
        Long accountId = Long.valueOf(accountDto.getAccountId());
        BarberEntity barber = barberService.getBarberStatusByAccountId(accountId);
        return ResponseEntity.ok(barber);
    }

}
