import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useTranslation } from "react-i18next";

const ReturnReceiptDialog = ({
  showReceiptDialog,
  setShowReceiptDialog,
  selectedOrder,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t('dashboard.cashier.return.receipt.title')}</DialogTitle>
      </DialogHeader>
      <div className="bg-white p-6 max-h-96 overflow-y-auto">
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg">{t('dashboard.cashier.posTitle').toUpperCase()}</h3>
          <p className="text-sm">123 Main Street, City</p>
          <p className="text-sm">Tel: 123-456-7890</p>
        </div>
        <div className="text-center mb-4">
          <h4 className="font-bold">{t('dashboard.cashier.return.receipt.title').toUpperCase()}</h4>
        </div>
        <div className="mb-4">
          <p className="text-sm">
            <span className="font-medium">{t('dashboard.cashier.return.receipt.returnNumber')}:</span> RTN-
            {Date.now().toString().substring(8)}
          </p>
          <p className="text-sm">
            <span className="font-medium">{t('dashboard.cashier.return.receipt.originalOrder')}:</span>{" "}
            {selectedOrder?.id}
          </p>
          <p className="text-sm">
            <span className="font-medium">{t('dashboard.branchManager.orders.table.date')}:</span>{" "}
            {new Date().toLocaleString()}
          </p>
          <p className="text-sm">
            <span className="font-medium">{t('dashboard.branchManager.orders.table.customer')}:</span>{" "}
            {selectedOrder?.customer?.fullName || t('dashboard.cashier.paymentDialog.walkInCustomer')}
          </p>
        </div>
        <Table className="w-full text-sm mb-4">
          <TableHeader>
            <TableRow>
              <TableHead className="text-left py-2">{t('dashboard.cashier.return.item')}</TableHead>
              <TableHead className="text-center py-2">{t('dashboard.cashier.return.qty')}</TableHead>
              <TableHead className="text-right py-2">{t('dashboard.cashier.return.price')}</TableHead>
              <TableHead className="text-right py-2">{t('dashboard.cashier.return.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedOrder.items
              
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="py-2">{item.product?.name.slice(0, 20)+"..."}</TableCell>
                  <TableCell className="text-center py-2">{item.returnQuantity}</TableCell>
                  <TableCell className="text-right py-2">VNĐ {item.product?.sellingPrice?.toFixed(2)}</TableCell>
                  <TableCell className="text-right py-2">
                    VNĐ {(item.product.sellingPrice * item.returnQuantity)?.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <div className="space-y-1 text-sm mb-4">
          <div className="flex justify-between font-bold border-t pt-1">
            <span>{t('dashboard.cashier.return.totalRefund')}</span>
            <span>VNĐ {selectedOrder.totalAmount}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span>{t('dashboard.cashier.return.refundMethodLabel')}</span>
            <span>
              {selectedOrder.paymentType ? t(`dashboard.cashier.paymentDialog.methods.${selectedOrder.paymentType}`) : t('common.unknown')}
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span>{t('dashboard.cashier.return.reasonLabel')}</span>
          </div>
        </div>
        <div className="text-center text-sm mt-6">
          <p>{t('dashboard.cashier.return.receipt.thankYou')}</p>
          <p>
            {t('dashboard.cashier.return.receipt.policy')}
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" className="gap-2" >
          <PrinterIcon className="h-4 w-4" />
          {t('dashboard.cashier.return.receipt.printComplete')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};

export default ReturnReceiptDialog;
