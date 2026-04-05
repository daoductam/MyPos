import { SearchIcon, PlusIcon } from 'lucide-react';
import { useTranslation } from "react-i18next";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CustomerSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onAddCustomer 
}) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 border-b border-white/10">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t('dashboard.cashier.customerDialog.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/10 text-white placeholder-gray-400 border-white/20 hover:border-white/40"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onAddCustomer} className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <PlusIcon className="h-4 w-4 mr-2" />
          {t('dashboard.cashier.customer.addCustomer')}
        </Button>
      </div>
    </div>
  );
};

export default CustomerSearch; 