package com.barber.controllers;

import com.barber.dto.AccountDto;
import com.barber.dto.BarberDto;
import com.barber.dto.QueueListDto;
import com.barber.entity.AccountEntity;
import com.barber.entity.QueueListEntity;
import com.barber.repository.QueueListRepository;
import com.barber.services.QueueListService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueListController {

    private final QueueListService queueListService;
    private final QueueListRepository queueListRepository;

    @PostMapping("/create")
    public ResponseEntity<QueueListEntity> createQueue(@RequestBody QueueListDto queueListDto) {
        QueueListEntity queue = queueListService.createQueue(queueListDto);
        return ResponseEntity.ok(queue);
    }

    @PostMapping("/myQueue")  // ใช้ POST เพราะเราจะส่ง body
    public ResponseEntity<QueueListEntity> getMyQueue(@RequestBody AccountDto accountDto) {
        QueueListEntity queue = queueListService.getMyQueue(accountDto);
        return ResponseEntity.ok(queue);
    }

    @PostMapping("/waiting-queues")
    public ResponseEntity<Long> countPreviousQueues(@RequestBody QueueListDto queueListDto) {
        long count = queueListService.countPreviousQueues(queueListDto);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/queue-later/{queueId}")
    public ResponseEntity<Long> getQueueLater(@PathVariable long queueId) {
        long count = queueListService.countLaterQueues(queueId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/barber/waiting-queues")
    public ResponseEntity<Long> getWaitingQueues(@RequestBody BarberDto barberDto) {
        long count = queueListService.countPreviousQueuesFromBarber(barberDto);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/cancel")
    public ResponseEntity<QueueListEntity> cancelQueue(@RequestBody QueueListDto queueListDto) {
        QueueListEntity canceledQueue = queueListService.cancelQueue(queueListDto);
        return ResponseEntity.ok(canceledQueue);
    }

    @PostMapping("/barber/myQueues")
    public List<QueueListEntity> getTodayQueuesForOwner(@RequestBody AccountDto accountDto) {
        return queueListService.getMyQueues(accountDto);
    }

    @GetMapping("/barber/queue-details/{id}")
    public ResponseEntity<QueueListEntity> getQueueDetails(@PathVariable Long id) {
        QueueListEntity queue = queueListService.getQueueById(id);
        return ResponseEntity.ok(queue);
    }

    @GetMapping("/barber/queue-info/{id}")
    public ResponseEntity<AccountEntity> getQueueInfo(@PathVariable Long id) {
        AccountEntity account = queueListService.getQueueInfoById(id);
        return ResponseEntity.ok(account);
    }

    @PutMapping("/barber/cancel/{queueId}")
    public ResponseEntity<QueueListEntity> cancelQueueByBarber(@RequestBody AccountDto accountDto, @PathVariable Long queueId) {
        QueueListEntity queue = queueListService.cancelQueueByBarber(accountDto, queueId);
        return ResponseEntity.ok(queue);
    }

    @PutMapping("/barber/done/{queueId}")
    public ResponseEntity<QueueListEntity> doneQueueByBarber(@RequestBody AccountDto accountDto, @PathVariable Long queueId) {
        QueueListEntity queue = queueListService.doneQueueByBarber(accountDto, queueId);
        return ResponseEntity.ok(queue);
    }

    @GetMapping("/get/queue-log")
    public ResponseEntity<Page<QueueListEntity>> getQueuesLog(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer barberId,
            @RequestParam(required = false) Integer serviceId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);

        Page<QueueListEntity> result = queueListService.getQueuesLog(startDate, endDate, barberId, serviceId, status, pageable);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/get/customerNameList")
    public ResponseEntity<List<Map<String, Object>>> getCustomerNameList() {
        List<Map<String, Object>> customers = queueListService.getCustomerNameList();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/get/editedByList")
    public ResponseEntity<List<Map<String, Object>>> getEditedByList() {
        List<Map<String, Object>> editors = queueListService.getEditedByList();
        return ResponseEntity.ok(editors);
    }


}
