import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Mail, Phone, MapPin, User, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
  const { t } = useTranslation();
  if (!employees || employees.length === 0) {
    return <div className="text-center py-16 text-gray-400">
      <h3 className="text-xl font-semibold">{t('storeModule.employees.table.noEmployees')}</h3>
      <p className="mt-2">{t('storeModule.employees.table.noEmployeesDesc')}</p>
    </div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10">
            <TableHead className="text-gray-400">{t('storeModule.employees.table.name')}</TableHead>
            <TableHead className="text-gray-400">{t('storeModule.employees.table.contact')}</TableHead>
            <TableHead className="text-gray-400">{t('storeModule.employees.table.role')}</TableHead>
            <TableHead className="text-gray-400">{t('storeModule.employees.table.branch')}</TableHead>
            <TableHead className="text-right text-gray-400">{t('storeModule.employees.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="border-white/10">
              <TableCell className="font-medium text-white">{employee.fullName}</TableCell>
              <TableCell className="text-gray-300">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{employee.phone}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-300">
                {t(`common.roles.${employee.role}`)}
              </TableCell>
              <TableCell className="text-gray-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{employee.branch?.name || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(employee)} className="bg-transparent border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDelete(employee.id);
                      toast.success(t('storeModule.employees.toast.deleteSuccess'));
                    }}
                    className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTable;