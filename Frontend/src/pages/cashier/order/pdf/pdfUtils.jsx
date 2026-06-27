import { pdf } from "@react-pdf/renderer";

import { OrderPDF } from "./OrderPDF";
import { formatDate } from "@/pages/cashier/order/data";

export const handleDownloadOrderPDF = async (order, toast) => {
  try {
    if (toast) {
      toast({
        title: "Đang tạo PDF",
        description: "Vui lòng đợi trong giây lát...",
      });
    }

    const pdfDoc = pdf(<OrderPDF order={order} />);
    const blob = await pdfDoc.toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `order-${order.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (toast) {
      toast({
        title: "Tải xuống thành công",
        description: `Đơn hàng #${order.id} đã được lưu dưới dạng PDF`,
      });
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (toast) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo PDF. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }
};
