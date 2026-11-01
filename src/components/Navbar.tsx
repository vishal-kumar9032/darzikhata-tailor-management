import React from 'react';
import { 
  Scissors, 
  LogIn, 
  LogOut, 
  Search,
  User
} from 'lucide-react';
import { ShopSettings } from '../types';

interface NavbarProps {
  currentTab: 'customer' | 'admin' | 'customers_dir' | 'udhar';
  setCurrentTab: (tab: 'customer' | 'admin' | 'customers_dir' | 'udhar') => void;
  isAdmin: boolean;
  adminEmail: string | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  settings: ShopSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isAdmin,
  adminEmail,
  onOpenLogin,
  onLogout,
  settings,
}) => {
  const getInitials = (email: string | null) => {
    if (!email) return 'AD';
    if (email.startsWith('ashadevi')) return 'AD';
    if (email.startsWith('anjalikumari')) return 'AK';
    if (email.startsWith('vishalkumar')) return 'VK';
    return email.slice(0, 2).toUpperCase();
  };

  const getAdminDisplayName = (email: string | null) => {
    if (!email) return 'Admin';
    if (email.startsWith('ashadevi')) return 'Asha Devi';
    if (email.startsWith('anjalikumari')) return 'Anjali Kumari';
    if (email.startsWith('vishalkumar')) return 'Vishal Kumar';
    return email.split('@')[0];
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/70 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setCurrentTab(isAdmin ? 'admin' : 'customer')}
          >
            <div className="w-9 h-9 rounded-xl bg-stone-900 group-hover:bg-rose-600 transition-colors flex items-center justify-center text-white shadow-xs">
              <Scissors className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900">
                  {settings.shopName}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                  Tailor Pro
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium tracking-tight">Order & Dues Management</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* View Mode Switcher Button */}
            {isAdmin ? (
              <div className="flex items-center bg-stone-100/80 p-0.5 rounded-xl border border-stone-200/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCurrentTab('admin')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currentTab === 'admin' || currentTab === 'customers_dir' || currentTab === 'udhar'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('customer')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    currentTab === 'customer'
                      ? 'bg-white text-rose-600 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Customer View
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentTab('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === 'customer'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200/70'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Customer Portal</span>
              </button>
            )}

            {/* Admin Login / Logout button */}
            {isAdmin ? (
              <div className="flex items-center gap-2 pl-1 border-l border-stone-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center border border-rose-200">
                    {getInitials(adminEmail)}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-stone-700 max-w-[110px] truncate">
                    {getAdminDisplayName(adminEmail)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
