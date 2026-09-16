package com.tamdao.controller;

import com.tamdao.mapper.RefundMapper;
import com.tamdao.modal.Refund;
import com.tamdao.payload.dto.RefundDTO;
import com.tamdao.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'refund.create', #refundDTO.branchId)")
    public ResponseEntity<RefundDTO> createRefund(@RequestBody RefundDTO refundDTO) {
        Refund refund = refundService.createRefund(refundDTO);
        return ResponseEntity.ok(RefundMapper.toDTO(refund));
    }

    @GetMapping
    @PreAuthorize("@authorizationGuard.hasCurrentUserStorePermission(authentication, 'refund.read')")
    public ResponseEntity<List<RefundDTO>> getAllRefunds() {
        List<RefundDTO> refunds = refundService.getAllRefunds().stream()
                .map(RefundMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(refunds);
    }

    @GetMapping("/cashier/{cashierId}")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'refund.read', #cashierId) or @authorizationGuard.hasSelfPermission(authentication, 'refund.read_own', #cashierId)")
    public ResponseEntity<List<RefundDTO>> getRefundsByCashier(
            @PathVariable Long cashierId) {
        List<RefundDTO> refunds = refundService.getRefundsByCashier(cashierId).stream()
                .map(RefundMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(refunds);
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'refund.read', #branchId)")
    public ResponseEntity<List<RefundDTO>> getRefundsByBranch(@PathVariable Long branchId) {
        List<RefundDTO> refunds = refundService.getRefundsByBranch(branchId).stream()
                .map(RefundMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(refunds);
    }

    @GetMapping("/shift/{shiftReportId}")
    @PreAuthorize("@authorizationGuard.hasBranchPermission(authentication, 'refund.read', @resourceScopeResolver.shiftBranchId(#shiftReportId))")
    public ResponseEntity<List<RefundDTO>> getRefundsByShift(@PathVariable Long shiftReportId) {
        List<RefundDTO> refunds = refundService.getRefundsByShiftReport(shiftReportId).stream()
                .map(RefundMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(refunds);
    }

    @GetMapping("/cashier/{cashierId}/range")
    @PreAuthorize("@authorizationGuard.hasUserScopePermission(authentication, 'refund.read', #cashierId) or @authorizationGuard.hasSelfPermission(authentication, 'refund.read_own', #cashierId)")
    public ResponseEntity<List<RefundDTO>> getRefundsByCashierAndDateRange(
            @PathVariable Long cashierId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        List<RefundDTO> refunds = refundService
                .getRefundsByCashierAndDateRange(cashierId, from, to).stream()
                .map(RefundMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(refunds);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'refund.read', @resourceScopeResolver.refundStoreId(#id)) or @authorizationGuard.hasSelfPermission(authentication, 'refund.read_own', @resourceScopeResolver.refundCashierId(#id))")
    public ResponseEntity<RefundDTO> getRefundById(@PathVariable Long id) {
        Refund refund = refundService.getRefundById(id);
        return ResponseEntity.ok(RefundMapper.toDTO(refund));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@authorizationGuard.hasStorePermission(authentication, 'refund.delete', @resourceScopeResolver.refundStoreId(#id))")
    public ResponseEntity<?> deleteRefund(@PathVariable Long id) {
        refundService.deleteRefund(id);
        return ResponseEntity.ok("Refund deleted successfully.");
    }
}
