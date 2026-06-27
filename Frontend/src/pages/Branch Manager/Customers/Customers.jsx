import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, ShoppingBag, Phone, Mail, User } from "lucide-react";
import { getStatusColor } from "../../../utils/getStatusColor";
import { calculateCustomerStats } from "../../cashier/customer/utils/customerUtils";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getAllCustomers } from "../../../Redux Toolkit/features/customer/customerThunks";
import { clearCustomerOrders } from "../../../Redux Toolkit/features/order/orderSlice";
import { getOrdersByCustomer } from "../../../Redux Toolkit/features/order/orderThunks";

// Removed fake data

const Customers = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { customers: reduxCustomers } = useSelector((state) => state.customer);
  const { customerOrders: reduxOrders } = useSelector((state) => state.order);
  
  // Use Redux data
  const customers = reduxCustomers || [];
  const customerOrders = reduxOrders || [];
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustomerDetailsOpen, setIsCustomerDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const getLoyaltyStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "gold":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "silver":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
      case "bronze":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100/80";
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20";
    }
  };

  useEffect(() => {
    dispatch(getAllCustomers());
  }, [dispatch]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerDetailsOpen(true);
    dispatch(clearCustomerOrders());
    if (customer.id) {
      dispatch(getOrdersByCustomer(customer.id));
    }
  };

  const customerStats = selectedCustomer
    ? calculateCustomerStats(customerOrders)
    : null;

  const displayCustomer = selectedCustomer
    ? {
        ...selectedCustomer,
        ...customerStats,
      }
    : null;

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.branchManager.customers.title')}</h1>
          <p className="text-gray-400 mt-1">{t('dashboard.branchManager.customers.subtitle')}</p>
        </div>
        <div className="relative w-full max-sm:max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder={t('dashboard.branchManager.customers.search')}
            className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-black/20 backdrop-blur-lg border border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-gray-400">{t('dashboard.branchManager.customers.stats.total')}</p>
            <h3 className="text-3xl font-bold mt-2 text-emerald-400">{customers.length}</h3>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-gray-400">{t('dashboard.branchManager.customers.stats.gold')}</p>
            <h3 className="text-3xl font-bold mt-2 text-yellow-400">
              {customers.filter((c) => c.loyaltyStatus === "Gold").length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-lg border border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-gray-400">{t('dashboard.branchManager.customers.stats.avgOrders')}</p>
            <h3 className="text-3xl font-bold mt-2 text-blue-400">
              {customers.length > 0
                ? Math.round(customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0) / customers.length)
                : 0}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">{t('dashboard.branchManager.customers.table.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">{t('dashboard.branchManager.employees.table.name')}</TableHead>
                <TableHead className="text-gray-400">{t('dashboard.branchManager.employees.table.contact')}</TableHead>
                <TableHead className="text-gray-400">{t('dashboard.branchManager.customers.table.loyalty')}</TableHead>
                <TableHead className="text-right text-gray-400">{t('dashboard.branchManager.orders.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-white/10">
                    <TableCell className="font-medium text-white">{customer.fullName}</TableCell>
                    <TableCell className="text-gray-300">
                      <div className="flex flex-col text-sm">
                        <span>{customer.phone}</span>
                        <span className="text-xs text-gray-400">{customer.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getLoyaltyStatusColor(customer.loyaltyStatus)} border-none shadow-sm`} variant="secondary">
                        {customer.loyaltyStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                        onClick={() => openCustomerDetails(customer)}
                      >
                        {t('dashboard.branchManager.orders.table.viewDetails')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-16 text-gray-400">
                    <h3 className="text-xl font-semibold">{t('dashboard.branchManager.customers.table.noCustomers')}</h3>
                    <p className="mt-2">{t('dashboard.branchManager.customers.table.noCustomersDesc')}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={isCustomerDetailsOpen} onOpenChange={setIsCustomerDetailsOpen}>
        <DialogContent className="max-w-2xl h-[93vh] overflow-y-auto bg-gray-900/80 border-white/20 text-white backdrop-blur-lg p-10">
          <DialogHeader className="text-center">
            <DialogTitle className="text-3xl font-bold">{t('dashboard.branchManager.customers.dialog.title')}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="py-4 space-y-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">{t('dashboard.branchManager.customers.dialog.profile')}</h4>
                <div className="p-6 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl">
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-400">{t('dashboard.branchManager.employees.table.name')}</p>
                        <p className="text-gray-200">{selectedCustomer.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-400">{t('dashboard.branchManager.employees.table.email')}</p>
                        <p className="text-gray-200">{selectedCustomer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-400">{t('dashboard.branchManager.employees.table.phone')}</p>
                        <p className="text-gray-200">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-400">{t('dashboard.branchManager.customers.stats.totalOrders')}</p>
                        <p className="text-gray-200">{displayCustomer?.totalOrders || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getLoyaltyStatusColor(selectedCustomer.loyaltyStatus)} border-none shadow-sm`} variant="secondary">
                        {selectedCustomer.loyaltyStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">{t('dashboard.branchManager.customers.dialog.history')}</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.id')}</TableHead>
                        <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.amount')}</TableHead>
                        <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.dialog.items')}</TableHead>
                        <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.paymentMode')}</TableHead>
                        <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOrders && customerOrders.length > 0 ? customerOrders.map((order) => (
                        <TableRow key={order.id} className="border-white/10">
                          <TableCell className="font-medium text-white">#{order.id}</TableCell>
                          <TableCell className="text-emerald-400 font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}</TableCell>
                          <TableCell className="text-gray-300 text-xs">
                            {order.items?.map((item, idx) => (
                              <p key={idx}>{item.product?.name?.slice(0, 15)}...</p>
                            ))}
                          </TableCell>
                          <TableCell className="text-gray-300">{order.paymentType}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(order.status)} bg-opacity-20 border border-opacity-30`} variant="secondary">
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-gray-400">
                            {t('dashboard.branchManager.orders.table.noOrders', 'Chưa có lịch sử đơn hàng')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsCustomerDetailsOpen(false)} className="w-full bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
