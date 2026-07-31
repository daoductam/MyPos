package com.tamdao.service;

import com.tamdao.modal.ShiftReport;

import java.time.LocalDateTime;
import java.util.List;

public interface ShiftReportService {
    ShiftReport startShift(Long cashierId, Long branchId, LocalDateTime shiftStart);
    ShiftReport endShift(Long shiftReportId, LocalDateTime shiftEnd);
    ShiftReport getShiftReportById(Long id);
    List<ShiftReport> getAllShiftReports();
    List<ShiftReport> getShiftReportsByCashier(Long cashierId);
    ShiftReport getCurrentShiftProgress(Long cashierId);
    List<ShiftReport> getShiftReportsByBranch(Long branchId);
    ShiftReport getShiftReportByCashierAndDate(Long cashierId, LocalDateTime date);
    void deleteShiftReport(Long id);
}
