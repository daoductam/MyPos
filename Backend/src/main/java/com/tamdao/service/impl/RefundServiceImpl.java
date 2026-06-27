package com.tamdao.service.impl;

import com.tamdao.domain.OrderStatus;
import com.tamdao.exception.ResourceNotFoundException;
import com.tamdao.exception.UserException;
import com.tamdao.modal.Branch;
import com.tamdao.modal.Order;
import com.tamdao.modal.Refund;
import com.tamdao.modal.User;
import com.tamdao.payload.dto.RefundDTO;
import com.tamdao.repository.BranchRepository;
import com.tamdao.repository.OrderRepository;
import com.tamdao.repository.RefundRepository;
import com.tamdao.service.RefundService;
import com.tamdao.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final UserService userService;
    private final BranchRepository branchRepository;

    @Override
    @Transactional
    public Refund createRefund(RefundDTO refundDTO) throws UserException, ResourceNotFoundException {
        User currentCashier = userService.getCurrentUser();

        Order order = orderRepository.findById(refundDTO.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Branch branch=branchRepository.findById(refundDTO.getBranchId()).orElseThrow(
                ()-> new EntityNotFoundException("branch not found")
        );

        Refund refund = new Refund();
        refund.setOrder(order);
        refund.setCashier(currentCashier);
        refund.setReason(refundDTO.getReason());
        refund.setAmount(order.getTotalAmount());
        refund.setCreatedAt(LocalDateTime.now());
        refund.setBranch(branch);


        Refund savedRefund=refundRepository.save(refund);
        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);
        return savedRefund;
    }

    @Override
    public List<Refund> getAllRefunds() {
        return refundRepository.findAll();
    }

    @Override
    public List<Refund> getRefundsByCashier(Long cashierId) {
        return refundRepository.findByCashierId(cashierId);
    }

    @Override
    public List<Refund> getRefundsByShiftReport(Long shiftReportId) {
        return refundRepository.findByShiftReportId(shiftReportId);
    }

    @Override
    public List<Refund> getRefundsByCashierAndDateRange(Long cashierId, LocalDateTime from, LocalDateTime to) {
        return refundRepository.findByCashierIdAndCreatedAtBetween(cashierId, from, to);
    }

    @Override
    public List<Refund> getRefundsByBranch(Long branchId) {
        List<Refund> refunds= refundRepository.findByBranchId(branchId);
        return refunds;
    }

    @Override
    public Refund getRefundById(Long id) throws ResourceNotFoundException {
        return refundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
    }

    @Override
    public void deleteRefund(Long refundId) throws ResourceNotFoundException {
        if (!refundRepository.existsById(refundId)) {
            throw new ResourceNotFoundException("Refund not found");
        }
        refundRepository.deleteById(refundId);
    }


}
