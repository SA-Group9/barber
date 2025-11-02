package com.barber.services;

import com.barber.dto.AccountDto;
import com.barber.dto.BarberDto;
import com.barber.dto.QueueListDto;
import com.barber.entity.AccountEntity;
import com.barber.entity.QueueListEntity;
import com.barber.repository.AccountRepository;
import com.barber.repository.QueueListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QueueListService {

    private final QueueListRepository queueRepo;
    private final AccountRepository accountRepository;

    @Transactional
    public QueueListEntity createQueue(QueueListDto dto) {
        QueueListEntity newQueue;

        LocalTime now = LocalTime.now();
        LocalTime cutoff = LocalTime.of(19, 30);

        if (now.isAfter(cutoff)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "หมดเวลารับคิวแล้ว (หลัง 19:30)");
        }

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay().minusNanos(1);
        int barberId = dto.getBarberId();

        int maxNumber = queueRepo.findMaxQueueNumberByBarberAndDateRange(barberId, startOfDay, endOfDay);
        int nextNumber = maxNumber + 1;

        newQueue = new QueueListEntity();
        newQueue.setQueueNumber(nextNumber);
        newQueue.setDateTime(LocalDateTime.now());
        newQueue.setStatus("queuing");
        newQueue.setAccountId(dto.getAccountId());
        newQueue.setBarberId(dto.getBarberId());
        newQueue.setServiceId(dto.getServiceId());
        newQueue.setLatestEdit(LocalDateTime.now());
        newQueue.setEditedBy(0);

        queueRepo.save(newQueue);

        return newQueue;
    }

    public QueueListEntity getMyQueue(AccountDto accountDto) {
        int accountId = accountDto.getAccountId();

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return queueRepo
                .findTopByAccountIdAndStatusQueuingToday(accountId, startOfDay, endOfDay)
                .orElse(null);
    }

    @Transactional
    public long countPreviousQueues(QueueListDto queueListDto) {
        int queueNumber = queueListDto.getQueueNumber();
        int barberId = queueListDto.getBarberId();
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return queueRepo.countPreviousQueues(queueNumber, barberId, startOfDay, endOfDay);
    }

    public long countPreviousQueuesFromBarber(BarberDto barberDto) {
        int barberId = barberDto.getBarberId();
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return queueRepo.countWaitingQueuesByBarber(barberId,startOfDay,endOfDay);
    }

    public QueueListEntity cancelQueue(QueueListDto queueListDto) {
        int accountId = queueListDto.getAccountId();
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        Optional<QueueListEntity> optionalQueue = queueRepo.findTopByAccountIdAndStatusQueuingToday(accountId, startOfDay, endOfDay);

        if (optionalQueue.isEmpty()) {
            return null;
        }

        QueueListEntity latestQueue = optionalQueue.get();
        latestQueue.setStatus("canceled");
        latestQueue.setEditedBy(queueListDto.getAccountId());
        latestQueue.setLatestEdit(LocalDateTime.now());
        return queueRepo.save(latestQueue);
    }

    public List<QueueListEntity> getMyQueues(AccountDto accountDto) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return queueRepo.findTodayAllQueuesForBarber(accountDto.getAccountId(), startOfDay, endOfDay);
    }

    public QueueListEntity getQueueById(Long queueId) {
        return queueRepo.findById(queueId).orElse(null);
    }

    public Long countLaterQueues(Long queueId) {
        QueueListEntity queue = queueRepo.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Queue not found"));

        int barberId = queue.getBarberId();
        LocalDateTime startSearch = queue.getDateTime();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return queueRepo.countLaterQueues(barberId, startSearch, endOfDay);
    }

    public AccountEntity getQueueInfoById(Long queueId) {
        QueueListEntity queue = queueRepo.findById(queueId)
                .orElseThrow(() -> new RuntimeException("Queue not found"));

        Integer accountId = queue.getAccountId();
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    public QueueListEntity cancelQueueByBarber(AccountDto accountDto, Long queueId) {
        QueueListEntity queue = getQueueById(queueId);
        queue.setStatus("canceled");
        queue.setEditedBy(accountDto.getAccountId());
        queue.setLatestEdit(LocalDateTime.now());
        return queueRepo.save(queue);
    }

    public QueueListEntity doneQueueByBarber(AccountDto accountDto, Long queueId) {
        QueueListEntity queue = getQueueById(queueId);
        queue.setStatus("done");
        queue.setEditedBy(accountDto.getAccountId());
        queue.setLatestEdit(LocalDateTime.now());
        return queueRepo.save(queue);
    }

    public Page<QueueListEntity> getQueuesLog(
            LocalDate startDate,
            LocalDate endDate,
            Integer barberId,
            Integer serviceId,
            String status,
            Pageable pageable
    ) {
        LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = (endDate != null) ? endDate.plusDays(1).atStartOfDay() : null;

        return queueRepo.findByFilters(startDateTime, endDateTime, barberId, serviceId, status, pageable);
    }

    public List<Map<String, Object>> getCustomerNameList() {
        return queueRepo.findAllCustomers().stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("accountId", a.getAccountId());
                    map.put("firstName", a.getFirstName());
                    map.put("lastName", a.getLastName());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getEditedByList() {
        List<Integer> editedByIds = queueRepo.findDistinctEditedBy();
        List<AccountEntity> accounts = accountRepository.findAllById(editedByIds);

        return accounts.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("accountId", a.getAccountId());
            map.put("firstName", a.getFirstName());
            map.put("lastName", a.getLastName());
            return map;
        }).collect(Collectors.toList());
    }

}