import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Printer,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
} from "lucide-react";
import TransactionTable from "./TransactionTable";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getOrdersByBranch } from "../../../Redux Toolkit/features/order/orderThunks";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Transactions() {
  const { t } = useTranslation();
  const { orders } = useSelector((state) => state.order);
  const { branch } = useSelector((state) => state.branch);
  const dispatch = useDispatch();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const receiptRef = useRef();

  useEffect(() => {
    if (branch) {
      dispatch(getOrdersByBranch({ branchId: branch?.id }));
    }
  }, [branch, dispatch]);

  // Calculate totals
  const totalIncome = orders
    .filter((t) => t.totalAmount > 0)
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalExpenses = orders
    .filter((t) => t.totalAmount < 0)
    .reduce((sum, t) => sum + Math.abs(t.totalAmount), 0);

  const netAmount = totalIncome - totalExpenses || 0;

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  const handlePrintReceipt = () => {
    const input = receiptRef.current;
    if (!input) {
      console.error("Receipt element not found!");
      return;
    }

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#111827",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-ORD-${selectedTransaction?.id}.pdf`);
    });
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.branchManager.transactions.title')}</h1>
          <p className="text-gray-400 mt-1">{t('dashboard.branchManager.transactions.subtitle')}</p>
        </div>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Download className="mr-2 h-4 w-4" /> {t('dashboard.branchManager.transactions.export')}
        </Button>
      </div>

      {/* Transaction Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/20 backdrop-blur-lg border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  {t('dashboard.branchManager.transactions.overview.income')}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalIncome)}
                </h3>
              </div>
              <div className="p-3 bg-green-500/20 rounded-full">
                <ArrowUpRight className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  {t('dashboard.branchManager.transactions.overview.expenses')}
                </p>
                <h3 className="text-2xl font-bold mt-1 text-red-400">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalExpenses)}
                </h3>
              </div>
              <div className="p-3 bg-red-500/20 rounded-full">
                <ArrowDownLeft className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{t('dashboard.branchManager.transactions.overview.net')}</p>
                <h3 className="text-2xl font-bold mt-1 text-blue-400">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(netAmount)}
                </h3>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl">
        <CardContent className="p-6">
          <TransactionTable
            filteredTransactions={orders}
            handleViewTransaction={handleViewTransaction}
          />
        </CardContent>
      </Card>

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-10">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold">
              {t('dashboard.branchManager.transactions.dialog.title')} - #ORD-{selectedTransaction?.id}
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <>
              <div ref={receiptRef} className="space-y-6 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t('dashboard.branchManager.transactions.dialog.cashier')}</p>
                    <p className="text-gray-200">{selectedTransaction.cashierId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      {t('dashboard.branchManager.transactions.dialog.dateTime')}
                    </p>
                    <p className="text-gray-200">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t('dashboard.branchManager.transactions.dialog.type')}</p>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedTransaction.status === "Sale"
                            ? "bg-green-500/20 text-green-300"
                            : selectedTransaction.type === "Refund"
                            ? "bg-amber-500/20 text-amber-300"
                            : selectedTransaction.type === "Purchase" ||
                              selectedTransaction.type === "Expense"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {selectedTransaction.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t('dashboard.branchManager.transactions.dialog.status')}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                        {selectedTransaction.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      {t('dashboard.branchManager.transactions.dialog.payment')}
                    </p>
                    <p className="text-gray-200">{selectedTransaction.paymentType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t('dashboard.branchManager.transactions.dialog.amount')}</p>
                    <p
                      className={`font-bold ${
                        selectedTransaction.totalAmount > 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {selectedTransaction.totalAmount > 0
                        ? `+${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedTransaction.totalAmount)}`
                        : `-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(selectedTransaction.totalAmount))}`}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-400">{t('dashboard.branchManager.transactions.dialog.customerName')}</p>
                  <p className="text-gray-200">{selectedTransaction.customer?.fullName}</p>
                </div>

                {/* Additional details based on transaction type */}
                {(selectedTransaction.status === "COMPLETED" || selectedTransaction.status === null) && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-medium mb-2 text-gray-200">{t('dashboard.branchManager.transactions.dialog.saleDetails')}</h4>
                    <p className="text-sm text-gray-400">
                      {t('dashboard.branchManager.transactions.dialog.invoice')}:{" "}
                      {selectedTransaction.reference?.replace("TRX", "INV")}
                    </p>
                    <p className="text-sm text-gray-400">{t('dashboard.branchManager.orders.table.customer')}: {selectedTransaction.customer?.fullName}</p>
                    <p className="text-sm text-gray-400">{t('dashboard.branchManager.transactions.dialog.items')}: {selectedTransaction.items?.length || 0}</p>
                  </div>
                )}

                {selectedTransaction.type === "Refund" && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-medium mb-2 text-gray-200">{t('dashboard.branchManager.transactions.dialog.refundDetails')}</h4>
                    <p className="text-sm text-gray-400">
                      {t('dashboard.branchManager.transactions.dialog.originalInvoice')}: INV-001
                    </p>
                    <p className="text-sm text-gray-400">
                      {t('dashboard.branchManager.transactions.dialog.reason')}: Customer request
                    </p>
                    <p className="text-sm text-gray-400">
                      {t('dashboard.branchManager.transactions.dialog.approvedBy')}: Jane Smith
                    </p>
                  </div>
                )}

                {selectedTransaction.type === "Purchase" && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-medium mb-2 text-gray-200">{t('dashboard.branchManager.transactions.dialog.purchaseDetails')}</h4>
                    <p className="text-sm text-gray-400">
                      {t('dashboard.branchManager.transactions.dialog.purchaseOrder')}: PO-001
                    </p>
                    <p className="text-sm text-gray-400">
                      {t('dashboard.branchManager.transactions.dialog.supplier')}: ABC Supplies Inc.
                    </p>
                    <p className="text-sm text-gray-400">{t('dashboard.branchManager.transactions.dialog.items')}: 15</p>
                  </div>
                )}

                {selectedTransaction.type === "Expense" && (
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-medium mb-2 text-gray-200">{t('dashboard.branchManager.transactions.dialog.expenseDetails')}</h4>
                    <p className="text-sm text-gray-400">{t('dashboard.branchManager.transactions.dialog.category')}: Utilities</p>
                    <p className="text-sm text-gray-400">
                      {t('dashboard.branchManager.transactions.dialog.approvedBy')}: Store Manager
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                  <Button variant="outline" onClick={handlePrintReceipt} className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
                    <Printer className="h-4 w-4 mr-1" /> {t('dashboard.branchManager.transactions.dialog.print')}
                  </Button>
                </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
