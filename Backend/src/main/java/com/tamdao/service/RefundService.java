package com.tamdao.service;

import com.tamdao.modal.Refund;
import com.tamdao.payload.dto.RefundDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface RefundService {
    Refund createRefund(RefundDTO refundDTO);
    List<Refund> getAllRefunds();
    List<Refund> getRefundsByCashier(Long cashierId);
    List<Refund> getRefundsByShiftReport(Long shiftReportId);
    List<Refund> getRefundsByCashierAndDateRange(Long cashierId,
                                                 LocalDateTime from,
                                                 LocalDateTime to);
    List<Refund> getRefundsByBranch(Long branchId);
    Refund getRefundById(Long id);
    void deleteRefund(Long refundId);
}
