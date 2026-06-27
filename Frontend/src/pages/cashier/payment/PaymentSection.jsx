import React from "react";
import { useSelector } from "react-redux";
import { useToast } from "../../../components/ui/use-toast";
import { useDispatch } from "react-redux";
import {
  holdOrder,
  selectCartItems,
  selectSelectedCustomer,
  selectTotal,
} from "../../../Redux Toolkit/features/cart/cartSlice";
import { Button } from "../../../components/ui/button";
import { CreditCard } from "lucide-react";
import { Pause } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatVND } from "@/utils/formatCurrency";


const PaymentSection = ({ setShowPaymentDialog }) => {
  const { t } = useTranslation();
  const cartItems = useSelector(selectCartItems);
  const selectedCustomer = useSelector(selectSelectedCustomer);

  const total = useSelector(selectTotal);

  const {toast} = useToast();
  const dispatch = useDispatch();

  const handlePayment = () => {
    console.log("handlePayment triggered. Cart items:", cartItems.length);
    if (cartItems.length === 0) {
      toast({
        title: t('dashboard.cashier.paymentSection.toast.emptyCart'),
        description: t('dashboard.cashier.paymentSection.toast.emptyCartDesc'),
        variant: "destructive",
      });
      return;
    }

    setShowPaymentDialog(true);
  };

  const handleHoldOrder = () => {
    if (cartItems.length === 0) {
      toast({
        title: t('dashboard.cashier.paymentSection.toast.emptyCart'),
        description: t('dashboard.cashier.paymentSection.toast.emptyCartDesc'),
        variant: "destructive",
      });
      return;
    }

    dispatch(holdOrder());

    toast({
      title: t('dashboard.cashier.paymentSection.toast.orderOnHold'),
      description: t('dashboard.cashier.paymentSection.toast.orderOnHoldDesc'),
    });
  };
  return (
    <div className="flex-1 p-4 flex flex-col justify-end">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            VNĐ {formatVND(total)}
          </div>
          <p className="text-sm text-gray-400">{t('dashboard.cashier.paymentSection.totalAmount')}</p>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            onClick={handlePayment}
            disabled={cartItems.length === 0}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {t('dashboard.cashier.paymentSection.processPayment')}
          </Button>

          <Button
            variant="outline"
            className="w-full bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
            onClick={handleHoldOrder}
            disabled={cartItems.length === 0}
          >
            <Pause className="w-4 h-4 mr-2" />
            {t('dashboard.cashier.paymentSection.holdOrder')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
