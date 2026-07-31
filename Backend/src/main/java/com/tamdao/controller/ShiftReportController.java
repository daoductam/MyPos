package com.tamdao.controller;

import com.tamdao.mapper.ShiftReportMapper;
import com.tamdao.modal.ShiftReport;
import com.tamdao.payload.dto.ShiftReportDTO;
import com.tamdao.service.ShiftReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/shift-reports")
@RequiredArgsConstructor
public class ShiftReportController {

    private final ShiftReportService shiftReportService;
    private final ShiftReportMapper shiftReportMapper;

    @PostMapping("/start")
    @PreAuthorize("hasAuthority('ROLE_BRANCH_CASHIER')")
    public ResponseEntity<ShiftReport> startShift(
            @RequestParam Long branchId
    ) {
        ShiftReport shift = shiftReportService.startShift(
                null,
                branchId,
                LocalDateTime.now());
        return ResponseEntity.ok(shift);
    }

    @PatchMapping("/end")
    @PreAuthorize("hasAuthority('ROLE_BRANCH_CASHIER')")
    public ResponseEntity<ShiftReportDTO> endShift() {
        ShiftReport ended = shiftReportService.endShift(
                null,
                LocalDateTime.now()
        );
        return ResponseEntity.ok(ShiftReportMapper.toDTO(ended));
    }

    @GetMapping("/current")
    @PreAuthorize("hasAuthority('ROLE_BRANCH_CASHIER')")
    public ResponseEntity<ShiftReportDTO> getCurrentShiftProgress() {
        ShiftReport shift = shiftReportService.getCurrentShiftProgress(null);
        return ResponseEntity.ok(ShiftReportMapper.toDTO(shift));
    }

    @GetMapping("/cashier/{cashierId}/by-date")
    @PreAuthorize("hasAnyAuthority('ROLE_BRANCH_CASHIER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN')")
    public ResponseEntity<ShiftReportDTO> getShiftReportByDate(
            @PathVariable Long cashierId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date
    ) {
        ShiftReport shift = shiftReportService.getShiftReportByCashierAndDate(
                cashierId, date);
        return ResponseEntity.ok(ShiftReportMapper.toDTO(shift));
    }

    @GetMapping("/cashier/{cashierId}")
    @PreAuthorize("hasAnyAuthority('ROLE_BRANCH_CASHIER', 'ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN')")
    public ResponseEntity<List<ShiftReportDTO>> getShiftsByCashier(
            @PathVariable Long cashierId
    ) {
        List<ShiftReport> shift = shiftReportService.getShiftReportsByCashier(cashierId);
        List<ShiftReportDTO> dto = shift.stream()
                .map(ShiftReportMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyAuthority('ROLE_BRANCH_MANAGER', 'ROLE_BRANCH_ADMIN')")
    public ResponseEntity<List<ShiftReportDTO>> getShiftsByBranch(
            @PathVariable Long branchId
    ) {
        List<ShiftReport> shifts = shiftReportService.getShiftReportsByBranch(branchId);
        List<ShiftReportDTO> dto = shifts.stream()
                .map(ShiftReportMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_STORE_ADMIN', 'ROLE_STORE_MANAGER')")
    public ResponseEntity<List<ShiftReportDTO>> getAllShifts() {
        List<ShiftReport> shifts = shiftReportService.getAllShiftReports();
        List<ShiftReportDTO> dto = shifts.stream()
                .map(ShiftReportMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShiftReportDTO> getShiftById(@PathVariable Long id) {
        ShiftReport shifts = shiftReportService.getShiftReportById(id);
        return ResponseEntity.ok(ShiftReportMapper.toDTO(shifts));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_BRANCH_ADMIN', 'ROLE_STORE_ADMIN')")
    public ResponseEntity<?> deleteShift(@PathVariable Long id) {
        shiftReportService.deleteShiftReport(id);
        return ResponseEntity.ok().build();
    }
}
