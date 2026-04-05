import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { createOrder } from "../../../Redux Toolkit/features/order/orderThunks";
import { paymentMethods } from "./data";
import { useTranslation } from "react-i18next";
import { formatVND } from "@/utils/formatCurrency";

import { useToast } from "@/components/ui/use-toast";
import { 
  selectPaymentMethod, 
  selectCartItems, 
  selectSelectedCustomer, 
  selectTotal, 
  selectNote,
  setPaymentMethod,
  setCurrentOrder
} from "../../../Redux Toolkit/features/cart/cartSlice";

const PaymentDialog = ({
  showPaymentDialog,
  setShowPaymentDialog,
  setShowReceiptDialog,
}) => {
  const { t } = useTranslation();
  const paymentMethod = useSelector(selectPaymentMethod);
  const {toast} = useToast();
  const cart = useSelector(selectCartItems);
  const branch = useSelector((state) => state.branch);
  const { userProfile } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const selectedCustomer = useSelector(selectSelectedCustomer);

  const total = useSelector(selectTotal);

  const note = useSelector(selectNote);

  

  const processPayment = async () => {
    console.log("processPayment triggered. Cart length:", cart.length);
    if (cart.length === 0) {
      toast({
        title: t('dashboard.cashier.paymentSection.toast.emptyCart'),
        description: t('dashboard.cashier.paymentSection.toast.emptyCartDesc'),
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare order data according to OrderDTO structure
      const orderData = {
        totalAmount: total,
        branchId: branch?.branch?.id || userProfile?.branchId,
        cashierId: userProfile?.id,
        customer: selectedCustomer || null,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          total: (item.price || item.sellingPrice) * item.quantity,
        })),
        paymentType: paymentMethod,
        note: note || "",
      };

      console.log("Final Order Data to send:", orderData);

      // Create order
      const createdOrder = await dispatch(createOrder(orderData)).unwrap();
      dispatch(setCurrentOrder(createdOrder));

      setShowPaymentDialog(false);
      setShowReceiptDialog(true);

      toast({
        title: t('dashboard.cashier.paymentDialog.toast.success'),
        description: t('dashboard.cashier.paymentDialog.toast.successDesc', { id: createdOrder.id }),
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      toast({
        title: t('dashboard.cashier.paymentDialog.toast.failed'),
        description: error || t('dashboard.cashier.paymentDialog.toast.failed'),
        variant: "destructive",
      });
    }
  };

  const handlePaymentMethod = (method) => dispatch(setPaymentMethod(method));

  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dashboard.cashier.paymentDialog.title')}</DialogTitle>
          <DialogDescription className="sr-only">
            Complete the payment for the current order by selecting a payment method.
          </DialogDescription>
        </DialogHeader>


        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              VNĐ {formatVND(total)}
            </div>
            <p className="text-sm text-gray-600">{t('dashboard.cashier.paymentDialog.amountToPay')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400 mb-2">Chọn phương thức:</p>
              {paymentMethods.map((method) => (
                <Button
                  key={method.key}
                  variant={paymentMethod === method.key ? "default" : "outline"}
                  className={`w-full justify-start ${paymentMethod === method.key ? "ring-2 ring-emerald-500/50" : ""}`}
                  onClick={() => handlePaymentMethod(method.key)}
                >
                  {t(`dashboard.cashier.paymentDialog.methods.${method.key}`)}
                </Button>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-200">
              {paymentMethod === 'UPI' ? (
                <>
                  <img 
                    src={`https://img.vietqr.io/image/TPB-00000191348-compact.png?amount=${total}&addInfo=Don%20hang%20POS&accountName=DAO%20DUC%20TAM`} 
                    alt="VietQR Payment"
                    className="w-40 h-40 object-contain"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 text-center">Quét mã để chuyển khoản</p>
                  <div className="flex items-center gap-1 mt-1">
                     <p className="text-[9px] font-bold text-emerald-600">VIETQR</p>
                     <p className="text-[9px] font-bold text-blue-600">NAPAS247</p>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-10">
                  <div className="mb-2">💵 / 💳</div>
                  <p className="text-xs">Vui lòng thu tiền khách và ấn hoàn tất</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
            {t('dashboard.cashier.paymentDialog.cancel')}
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={processPayment}
          >
            {t('dashboard.cashier.paymentDialog.complete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
