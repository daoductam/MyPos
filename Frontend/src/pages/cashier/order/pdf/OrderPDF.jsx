import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { pdfStyles } from "./pdfStyles";
import { formatCurrency, getPaymentModeLabel } from "../data";


// Create PDF document
export const OrderPDF = ({ order }) => {
  const subtotal = order.totalAmount || 0;
  const tax = subtotal * 0.1; // Default 10% VAT for Vietnam
  const grandTotal = subtotal + tax;

  return (
    <Document title={`Hóa đơn - #${order.id}`}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.storeName}>{order.branch?.name || 'POS Pro'}</Text>
            <Text style={pdfStyles.storeAddress}>
              {order.branch?.address || "Việt Nam"}
            </Text>
            {order.branch?.phone && (
               <Text style={pdfStyles.storeAddress}>SĐT: {order.branch.phone}</Text>
            )}
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={pdfStyles.invoiceTitle}>HÓA ĐƠN BÁN HÀNG</Text>
            <Text style={pdfStyles.invoiceNumber}>Mã đơn: #{order.id}</Text>
          </View>
        </View>

        <View style={pdfStyles.customerInfo}>
          <View>
            <Text style={pdfStyles.label}>Khách hàng:</Text>
            <Text style={pdfStyles.customerName}>
              {order.customer?.fullName || "Khách lẻ"}
            </Text>
            {order.customer?.phone && <Text style={pdfStyles.text}>SĐT: {order.customer.phone}</Text>}
            {order.customer?.email && <Text style={pdfStyles.text}>Email: {order.customer.email}</Text>}
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={pdfStyles.label}>Ngày lập:</Text>
            <Text style={pdfStyles.text}>
              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
            </Text>
            <Text style={pdfStyles.label}>Thanh toán:</Text>
            <Text style={pdfStyles.text}>{getPaymentModeLabel(order.paymentType)}</Text>
          </View>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 4 }]}>Sản phẩm</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>SL</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Giá</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Tổng</Text>
          </View>
          {order.items?.map((item, index) => (
            <View key={index} style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableCell, { flex: 4 }]}>
                {item.product?.name || item.productName}
              </Text>
              <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
                {formatCurrency(item.price)}
              </Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totals}>
          <View style={pdfStyles.totalsRow}>
            <Text style={pdfStyles.totalsLabel}>Tạm tính (VNĐ)</Text>
            <Text style={pdfStyles.totalsValue}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
          <View style={pdfStyles.totalsRow}>
            <Text style={pdfStyles.totalsLabel}>Thuế (VAT 10%)</Text>
            <Text style={pdfStyles.totalsValue}>
              {formatCurrency(tax)}
            </Text>
          </View>
          <View style={[pdfStyles.totalsRow, pdfStyles.grandTotal]}>
            <Text style={pdfStyles.grandTotalLabel}>Tổng cộng</Text>
            <Text style={pdfStyles.grandTotalValue}>
              {formatCurrency(grandTotal)} VNĐ
            </Text>
          </View>
        </View>

        <View style={pdfStyles.footer}>
          <Text>Cảm ơn quý khách đã mua hàng! Hẹn gặp lại.</Text>
        </View>
      </Page>
    </Document>
  );
};
