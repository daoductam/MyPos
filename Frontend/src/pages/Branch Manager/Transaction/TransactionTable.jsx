import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from '../../../components/ui/button';
import { Eye } from 'lucide-react';
import { useTranslation } from "react-i18next";

const TransactionTable = ({ filteredTransactions, handleViewTransaction }) => {
  const { t } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10">
          <TableHead className="text-gray-400">{t('dashboard.branchManager.transactions.dialog.dateTime')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.transactions.dialog.cashier')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.customer')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.amount')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.transactions.dialog.payment')}</TableHead>
          <TableHead className="text-gray-400">{t('dashboard.branchManager.orders.table.status')}</TableHead>
          <TableHead className="text-right text-gray-400">{t('dashboard.branchManager.orders.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTransactions.map((transaction) => (
          <TableRow key={transaction.id} className="border-white/10">
            <TableCell className="text-gray-300">{new Date(transaction.createdAt).toLocaleString()}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'Sale' ? 'bg-green-500/20 text-green-300' : transaction.type === 'Refund' ? 'bg-amber-500/20 text-amber-300' : transaction.type === 'Purchase' || transaction.type === 'Expense' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>
                #{transaction.cashierId}
              </span>
            </TableCell>
            <TableCell className="text-gray-300">{transaction.customer?.fullName}</TableCell>
            <TableCell className={transaction.totalAmount > 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
              {transaction.totalAmount > 0 
                ? `+${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.totalAmount)}` 
                : `-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(transaction.totalAmount))}`}
            </TableCell>
            <TableCell className="text-gray-300">{transaction.paymentType}</TableCell>
            <TableCell>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                {transaction.status}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewTransaction(transaction)}
                title={t('dashboard.branchManager.orders.table.viewDetails')}
                className="bg-transparent border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TransactionTable;