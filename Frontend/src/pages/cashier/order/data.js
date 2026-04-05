  export const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

      // Get status color
       export const getStatusColor = (status) => {
          switch (status) {
            case 'COMPLETED':
              return 'text-green-400';
            case 'PENDING':
              return 'text-yellow-400';
            case 'CANCELLED':
              return 'text-red-400';
            default:
              return 'text-gray-400';
          }
        };

   export const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

    export const getPaymentModeLabel = (mode) => {
      switch (mode) {
        case 'CASH':
          return 'Tiền mặt';
        case 'CARD':
          return 'Thẻ';
        case 'UPI':
          return 'Chuyển khoản/UPI';
        default:
          return mode;
      }
    };

    export const formatCurrency = (amount) => {
      if (amount === undefined || amount === null || isNaN(amount)) return "0";
      return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
    };