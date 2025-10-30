package com.barber.controllers;

import com.barber.entity.ServiceEntity;
import com.barber.services.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    // ดึงข้อมูลบริการจาก id
    @GetMapping("/{id}")
    public ResponseEntity<ServiceEntity> getServiceById(@PathVariable("id") Integer id) {
        ServiceEntity entity = serviceService.getServiceById(id);
        return ResponseEntity.ok(entity);
    }

    // ดึงทั้งหมด
    @GetMapping("/all")
    public ResponseEntity<List<ServiceEntity>> getAllServices() {
        List<ServiceEntity> services = serviceService.getAllServices();
        return ResponseEntity.ok(services);
    }
}
