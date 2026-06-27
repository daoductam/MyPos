import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { createRefund } from "../../../../Redux Toolkit/features/refund/refundThunks";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const returnReasonsKeys = [
  "damaged",
  "wrong",
  "changedMind",
  "quality",
  "pricing",
  "other",
];

const ReturnItemsSection = ({ selectedOrder, setShowReceiptDialog }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userProfile } = useSelector((state) => state.user);
  const { branch } = useSelector((state) => state.branch);
  const dispatch = useDispatch();

  const [returnReason, setReturnReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("");

  const processRefund = async () => {
    // setShowRefundDialog(false);
    setShowReceiptDialog(true);

    // Prepare refundDTO for API
    const refundDTO = {
      orderId: selectedOrder.id,
      branchId: branch?.id,
      cashierId: userProfile?.id,

      reason: returnReason === "other" ? otherReason : t(`dashboard.cashier.return.reasons.${returnReason}`),
      refundMethod:
        refundMethod === "original" ? selectedOrder.paymentType : refundMethod,
    };
    try {
      await dispatch(createRefund(refundDTO)).unwrap();
      toast({
        title: t('dashboard.cashier.return.toast.processed'),
        description: t('dashboard.cashier.return.toast.processedDesc', { amount: selectedOrder.totalAmount, method: refundDTO.refundMethod }),
      });
    } catch (error) {
      toast({
        title: t('dashboard.cashier.return.toast.failed'),
        description: error || t('dashboard.cashier.return.toast.failedDesc'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-1/2 p-4 flex flex-col">
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="return-reason" className="mb-2 block">
                {t('dashboard.cashier.return.reasonLabel')}
              </Label>
              <Select
                value={returnReason}
                onValueChange={(value) => setReturnReason(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('dashboard.cashier.return.reasonPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {returnReasonsKeys.map((key) => (
                    <SelectItem key={key} value={key}>
                      {t(`dashboard.cashier.return.reasons.${key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {returnReason === "other" && (
              <div>
                <Label htmlFor="other-reason" className="mb-2 block">
                  {t('dashboard.cashier.return.specifyReasonLabel')}
                </Label>
                <Textarea
                  id="other-reason"
                  placeholder={t('dashboard.cashier.return.specifyReasonPlaceholder')}
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="refund-method" className="mb-2 block">
                {t('dashboard.cashier.return.refundMethodLabel')}
              </Label>
              <Select value={refundMethod} onValueChange={setRefundMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('dashboard.cashier.return.refundMethodPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">
                    {t('dashboard.cashier.return.originalMethod', { method: selectedOrder.paymentType })}
                  </SelectItem>
                  <SelectItem value="cash">{t('dashboard.cashier.paymentDialog.methods.CASH')}</SelectItem>
                  {selectedOrder.paymentType !== "CARD" && (
                    <SelectItem value="card">{t('dashboard.cashier.paymentDialog.methods.CARD')}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between text-lg font-semibold">
                <span>{t('dashboard.cashier.return.totalRefund')}:</span>
                <span>VNĐ {selectedOrder.totalAmount}</span>
              </div>
            </div>
            <Button className="w-full" onClick={processRefund}>
              {t('dashboard.cashier.return.processButton')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnItemsSection;
