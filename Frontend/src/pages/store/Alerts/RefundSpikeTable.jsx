import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { AlertTriangle } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { useTranslation } from "react-i18next";

const RefundSpikeTable = ({ spikes }) => {
  const { t } = useTranslation();
  return (
    <Card className="bg-black/20 backdrop-blur-lg border border-white/10 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <AlertTriangle />
          {t('storeModule.alerts.refundSpikes.title')}
        </CardTitle>
        <CardDescription className="text-gray-400">
          Cảnh báo các giao dịch hoàn tiền có giá trị cao hoặc dấu hiệu bất thường.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-black/30 hover:bg-black/40 border-b-white/10">
                <TableHead className="text-white">Lý do</TableHead>
                <TableHead className="text-center text-white">Số tiền</TableHead>
                <TableHead className="text-center text-white">Thu ngân</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {spikes.length > 0 ? (
                spikes.map((spike, index) => (
                  <TableRow key={spike.id || index} className="hover:bg-white/5 border-b-white/10">
                    <TableCell className="font-medium text-white">{spike.reason}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive" className="bg-red-500/10 text-red-300 border-red-500/20 text-base">
                        {spike.amount?.toLocaleString()} VNĐ
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-gray-400">{spike.cashierName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500 italic">
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RefundSpikeTable;
