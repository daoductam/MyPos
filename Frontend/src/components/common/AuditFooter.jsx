import React from 'react';
import { formatDateTime } from '@/utils/formateDate';

export const AuditFooter = ({ createdAt, createdBy, updatedAt, updatedBy, deletedAt, deletedBy, isDeleted }) => {
  return (
    <div className="text-xs text-muted-foreground border-t border-border pt-2 mt-2 space-y-1">
      {createdAt && (
        <div className="flex justify-between items-center">
          <span>Ngày tạo:</span>
          <span className="font-medium text-foreground">{formatDateTime(createdAt)} {createdBy ? `(ID: ${createdBy})` : ''}</span>
        </div>
      )}
      {updatedAt && (
        <div className="flex justify-between items-center">
          <span>Cập nhật cuối:</span>
          <span className="font-medium text-foreground">{formatDateTime(updatedAt)} {updatedBy ? `(ID: ${updatedBy})` : ''}</span>
        </div>
      )}
      {isDeleted && deletedAt && (
        <div className="flex justify-between items-center text-destructive">
          <span>Đã xóa vào:</span>
          <span className="font-medium">{formatDateTime(deletedAt)} {deletedBy ? `(ID: ${deletedBy})` : ''}</span>
        </div>
      )}
    </div>
  );
};

export default AuditFooter;
