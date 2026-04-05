import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";


import {
  SearchIcon,
  PrinterIcon,
  EyeIcon,
  RotateCcwIcon,
  CalendarIcon,
  Loader2,
  RefreshCw,
  Download,
} from "lucide-react";
import { getOrdersByCashier } from "@/Redux Toolkit/features/order/orderThunks";
import OrderDetails from "./OrderDetails/OrderDetails";
import OrderTable from "./OrderTable";

import { handleDownloadOrderPDF } from "./pdf/pdfUtils";
import { useTranslation } from "react-i18next";

const OrderHistoryPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { userProfile } = useSelector((state) => state.user);
  const { orders, loading, error } = useSelector((state) => state.order);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [showOrderDetailsDialog, setShowOrderDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch orders when component mounts
  useEffect(() => {
    if (userProfile?.id) {
      dispatch(getOrdersByCashier(userProfile.id));
    }
  }, [dispatch, userProfile]);

  // Show error toast if orders fail to load
  useEffect(() => {
    if (error) {
      toast({
        title: t('common.error'),
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Get current date for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      // Date filtering
      let dateMatch = false;
      if (dateFilter === "today") {
        dateMatch = orderDate.toDateString() === today.toDateString();
      } else if (dateFilter === "week") {
        dateMatch = orderDate >= weekStart;
      } else if (dateFilter === "month") {
        dateMatch =
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear();
      } else if (dateFilter === "custom") {
        const startDate = customDateRange.start
          ? new Date(customDateRange.start)
          : null;
        const endDate = customDateRange.end
          ? new Date(customDateRange.end)
          : null;
        if (startDate && endDate) {
          dateMatch = orderDate >= startDate && orderDate <= endDate;
        } else {
          dateMatch = true; // No custom range set, so don't filter by date
        }
      } else {
        dateMatch = true; // 'all' or no filter
      }

      // Search term filtering
      const searchMatch =
        order.id.toString().includes(searchTerm) ||
        order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

      return dateMatch && searchMatch;
    });
  }, [orders, searchTerm, dateFilter, customDateRange, today, weekStart]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsDialog(true);
  };

  const handlePrintInvoice = (order) => {
    toast({
      title: t('dashboard.cashier.orderHistory.toast.printing'),
      description: t('dashboard.cashier.orderHistory.toast.printingDesc', { id: order.id }),
    });
  };

  const handleInitiateReturn = (order) => {
    // In a real app, this would navigate to the return page with the order pre-selected
    toast({
      title: t('dashboard.cashier.orderHistory.toast.initiatingReturn'),
      description: t('dashboard.cashier.orderHistory.toast.initiatingReturnDesc', { id: order.id }),
    });
  };

  
  const handleDownloadPDF = async () => {
    await handleDownloadOrderPDF(selectedOrder, toast);
  };

  const handleRefreshOrders = () => {
    if (userProfile?.id) {
      dispatch(getOrdersByCashier(userProfile.id));
      toast({
        title: t('dashboard.cashier.orderHistory.toast.refreshing'),
        description: t('dashboard.cashier.orderHistory.toast.refreshingDesc'),
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.cashier.nav.orders')}</h1>
          <p className="text-gray-400 mt-1">{t('dashboard.cashier.orderHistoryDesc')}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefreshOrders}
          disabled={loading}
          className="ml-auto bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {t('common.refresh')}
        </Button>
      </div>

      <Card className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('dashboard.cashier.orderSearchPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
               <Button
                variant={dateFilter === "today" ? "default" : "outline"}
                onClick={() => setDateFilter("today")}
                className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                {t('dashboard.branchManager.reports.today')}
              </Button>
              <Button
                variant={dateFilter === "week" ? "default" : "outline"}
                onClick={() => setDateFilter("week")}
                className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                {t('dashboard.branchManager.reports.week')}
              </Button>
              <Button
                variant={dateFilter === "month" ? "default" : "outline"}
                onClick={() => setDateFilter("month")}
                className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                {t('dashboard.branchManager.reports.month')}
              </Button>
              <Button
                variant={dateFilter === "custom" ? "default" : "outline"}
                onClick={() => setDateFilter("custom")}
                className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {t('dashboard.branchManager.reports.custom')}
              </Button>
            </div>
          </div>

          {dateFilter === "custom" && (
            <div className="mt-4 flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="start-date" className="text-gray-300">{t('dashboard.branchManager.reports.startDate')}</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange({ ...customDateRange, start: e.target.value })
                  }
                  className="w-full mt-1 pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="end-date" className="text-gray-300">{t('dashboard.branchManager.reports.endDate')}</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange({ ...customDateRange, end: e.target.value })
                  }
                  className="w-full mt-1 pl-4 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setCustomDateRange({ start: "", end: "" })}
                className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                {t('dashboard.cashier.pos.clearSearch')}
              </Button>
            </div>
          )}

          <div className="mt-6">
            <OrderTable
              orders={filteredOrders}
              loading={loading}
              handleInitiateReturn={handleInitiateReturn}
              handlePrintInvoice={handlePrintInvoice}
              handleViewOrder={handleViewOrder}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog
        open={showOrderDetailsDialog}
        onOpenChange={setShowOrderDetailsDialog}
      >
        {selectedOrder && (
          <DialogContent className="max-w-3xl bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-10">
            <DialogHeader className="text-center">
              <DialogTitle className="text-3xl font-bold">{t('dashboard.cashier.invoiceDialog.title')}</DialogTitle>
              <DialogDescription className="sr-only">
                Invoice details show products, quantity, price and total for the selected order.
              </DialogDescription>
            </DialogHeader>
            <OrderDetails selectedOrder={selectedOrder} />


            <DialogFooter className="gap-2 sm:gap-0 space-x-3">
              <Button variant="outline" onClick={handleDownloadPDF} className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
                <Download className="h-4 w-4 mr-2" />
                {t('dashboard.cashier.invoiceDialog.download')}
              </Button>
               <Button
                variant="outline" className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                onClick={() => handlePrintInvoice(selectedOrder)}
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                {t('dashboard.cashier.invoiceDialog.print')}
              </Button>
             
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default OrderHistoryPage;
