import React from "react";
import { Search, Bell, User, Settings, LogOut } from "lucide-react";
import { Input } from "../../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

const SuperAdminTopbar = () => {
  const { t } = useTranslation();
  const user = {
    name: t('superAdminModule.topbar.admin'),
    role: t('superAdminModule.topbar.role')
  };

  return (
    <header className="h-20 px-6 md:px-8 lg:px-10 flex-shrink-0 z-20">
      <div className="h-full flex items-center justify-between bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl px-6">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={t('superAdminModule.topbar.searchPlaceholder')}
            className="pl-10 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-gray-500"
          />
        </div>

        {/* Right side icons and user profile */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />

          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:ring-2 group-hover:ring-emerald-500/50 transition-all">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white">{user.name}</div>
                  <div className="text-sm text-gray-400">{user.role}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800/80 border-white/10 text-white backdrop-blur-lg">
              <DropdownMenuLabel>{t('superAdminModule.topbar.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{t('superAdminModule.topbar.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('superAdminModule.topbar.settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/20">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('superAdminModule.topbar.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminTopbar;