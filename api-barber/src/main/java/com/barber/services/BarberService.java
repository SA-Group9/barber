package com.barber.services;

import com.barber.dto.BarberDto;
import com.barber.entity.AccountEntity;
import com.barber.repository.AccountRepository;
import com.barber.entity.BarberEntity;
import com.barber.repository.BarberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BarberService {

    private final BarberRepository barberRepository;
    private final AccountRepository accountRepository;

    public BarberEntity getByBarberId(Integer barberId) {
        return barberRepository.findByBarberId(barberId);
    }

    public List<BarberEntity> getAllBarbers() {
        return barberRepository.findAll();
    }

    public List<BarberEntity> getAllAvailableBarbers() {
        return barberRepository.findAllAvailableBarbers();
    }

    public AccountEntity getBarberInfoFromAccountId(Integer accountId) {
        return barberRepository.getInfoFromAccountId(accountId);
    }

    public BarberEntity addBarber(BarberEntity barber) {
        return barberRepository.save(barber);
    }

    public boolean existsByAccountId(Long accountId) {
        return barberRepository.existsByAccountId(Math.toIntExact(accountId));
    }

    @Transactional
    public void deleteByAccountId(Long accountId) {
        barberRepository.deleteByAccountId(accountId);
    }

    public BarberEntity toggleStatus(BarberDto barberDto) {
        BarberEntity barber = barberRepository.findByAccountId(barberDto.getAccountId())
                .orElseThrow(() -> new RuntimeException("ไม่พบบาร์เบอร์ที่มี accountId นี้"));

        barber.setBarberStatus(barberDto.getBarberStatus());
        return barberRepository.save(barber);
    }

    public BarberEntity getBarberStatusByAccountId(Long accountId) {
        Integer accountIdInt = accountId.intValue();
        return barberRepository.findByAccountId(accountIdInt)
                .orElse(null);
    }

}
