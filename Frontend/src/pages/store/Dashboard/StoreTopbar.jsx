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
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const StoreTopbar = () => {
  const { t, i18n } = useTranslation();
  const { userProfile } = useSelector((state) => state.user);

  return (
    <header className="h-20 px-6 md:px-8 lg:px-10 flex-shrink-0 z-20">
      <div className="h-full flex items-center justify-between bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl px-6">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={t('dashboard.store.topbar.searchPlaceholder')}
            className="pl-10 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder-gray-500"
          />
        </div>

        {/* Right side icons and user profile */}
        <div className="flex items-center space-x-6">
          <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </Button>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <span className="text-xs font-bold uppercase">{localStorage.getItem("i18nextLng")?.slice(0, 2) || "VI"}</span>
                </div>
                <span className="hidden md:inline">{t('common.language')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-gray-800/80 border-white/10 text-white backdrop-blur-lg">
              <DropdownMenuItem onClick={() => i18n.changeLanguage('vi')} className="flex items-center justify-between">
                <span>Tiếng Việt</span>
                {i18n.language === 'vi' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className="flex items-center justify-between">
                <span>English</span>
                {i18n.language === 'en' && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:ring-2 group-hover:ring-emerald-500/50 transition-all">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white">{userProfile?.fullName || t('dashboard.store.topbar.storeAdmin')}</div>
                  <div className="text-sm text-gray-400">{userProfile?.role?.replace('ROLE_', '')?.replace('_', ' ') || 'Admin'}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800/80 border-white/10 text-white backdrop-blur-lg">
              <DropdownMenuLabel>{t('dashboard.store.topbar.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>{t('dashboard.store.topbar.profile')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('dashboard.store.topbar.settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/20" onClick={() => {
                localStorage.removeItem("jwt");
                window.location.reload();
              }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('dashboard.store.topbar.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default StoreTopbar;
