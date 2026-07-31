package com.tamdao.controller;

import com.razorpay.RazorpayException;
import com.stripe.exception.StripeException;
import com.tamdao.domain.PaymentMethod;
import com.tamdao.modal.PaymentOrder;
import com.tamdao.modal.User;
import com.tamdao.payload.response.PaymentLinkResponse;
import com.tamdao.service.PaymentService;
import com.tamdao.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserService userService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<PaymentLinkResponse> createPaymentLink(
            @RequestHeader("Authorization") String jwt,
            @RequestParam Long planId,
            @RequestParam PaymentMethod paymentMethod) throws RazorpayException, StripeException {
        User user = userService.getUserFromJwtToken(jwt);
        PaymentLinkResponse paymentLinkResponse =
                paymentService.createOrder(user, planId, paymentMethod);
        return ResponseEntity.ok(paymentLinkResponse);
    }

    @PatchMapping("/proceed")
    public ResponseEntity<Boolean> proceedPayment(
            @RequestParam String paymentId,
            @RequestParam String paymentLinkId) throws RazorpayException {
        PaymentOrder paymentOrder = paymentService.getPaymentOrderByPaymentId(paymentLinkId);
        Boolean success = paymentService.ProceedPaymentOrder(
                paymentOrder,
                paymentId, paymentLinkId);
        return ResponseEntity.ok(success);
    }
}
