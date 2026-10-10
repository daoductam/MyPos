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
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'shift.start', #branchId)")
    public ResponseEntity<ShiftReportDTO> startShift(
            @RequestParam Long branchId
    ) {
        ShiftReport shift = shiftReportService.startShift(
                null,
                branchId,
                LocalDateTime.now());
        return ResponseEntity.ok(ShiftReportMapper.toDTO(shift));
    }

    @PatchMapping("/end")
    @PreAuthorize("@authorizationGuard.hasCurrentUserSelfPermission(authentication, 'shift.end')")
    public ResponseEntity<ShiftReportDTO> endShift() {
        ShiftReport ended = shiftReportService.endShift(
                null,
                LocalDateTime.now()
        );
        return ResponseEntity.ok(ShiftReportMapper.toDTO(ended));
    }

    @GetMapping("/current")
    @PreAuthorize("@authorizationGuard.hasCurrentUserSelfPermission(authentication, 'shift.read_own')")
    public ResponseEntity<ShiftReportDTO> getCurrentShiftProgress() {
        ShiftReport shift = shiftReportService.getCurrentShiftProgress(null);
        return ResponseEntity.ok(ShiftReportMapper.toDTO(shift));
    }

    @GetMapping("/cashier/{cashierId}/by-date")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'shift.read', #cashierId) or @authorizationGuard.hasSelfPermission(authentication, 'shift.read_own', #cashierId)")
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
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'shift.read', #cashierId) or @authorizationGuard.hasSelfPermission(authentication, 'shift.read_own', #cashierId)")
    public ResponseEntity<List<ShiftReportDTO>> getShiftsByCashier(
            @PathVariable Long cashierId
    ) {
        List<ShiftReport> shift = shiftReportService.getShiftReportsByCashier(cashierId);
        List<ShiftReportDTO> dto = shift.stream()
                .map(ShiftReportMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'shift.read', #branchId)")
    public ResponseEntity<List<ShiftReportDTO>> getShiftsByBranch(
            @PathVariable Long branchId
    ) {
        List<ShiftReport> shifts = shiftReportService.getShiftReportsByBranch(branchId);
        List<ShiftReportDTO> dto = shifts.stream()
                .map(ShiftReportMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'shift.read')")
    public ResponseEntity<List<ShiftReportDTO>> getAllShifts() {
        List<ShiftReport> shifts = shiftReportService.getAllShiftReports();
        List<ShiftReportDTO> dto = shifts.stream()
                .map(ShiftReportMapper::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'shift.read', @resourceScopeResolver.shiftStoreId(#id)) or @authorizationGuard.hasSelfPermission(authentication, 'shift.read_own', @resourceScopeResolver.shiftCashierId(#id))")
    public ResponseEntity<ShiftReportDTO> getShiftById(@PathVariable Long id) {
        ShiftReport shifts = shiftReportService.getShiftReportById(id);
        return ResponseEntity.ok(ShiftReportMapper.toDTO(shifts));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'shift.delete', @resourceScopeResolver.shiftStoreId(#id))")
    public ResponseEntity<?> deleteShift(@PathVariable Long id) {
        shiftReportService.deleteShiftReport(id);
        return ResponseEntity.ok().build();
    }
}
