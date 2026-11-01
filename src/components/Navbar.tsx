import React from 'react';
import { 
  Scissors, 
  LogIn, 
  LogOut, 
  Search 
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
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setCurrentTab(isAdmin ? 'admin' : 'customer')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Scissors className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  {settings.shopName}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                  Tailor Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Digital Khata & Order Records</p>
            </div>
          </div>

          {/* Right Navigation & Admin controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher Button */}
            {isAdmin ? (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentTab('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'admin' || currentTab === 'customers_dir' || currentTab === 'udhar'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin Portal
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('customer')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    currentTab === 'customer'
                      ? 'bg-white text-rose-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Customer View
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentTab('customer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'customer'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Customer Lookup</span>
              </button>
            )}

            {/* Admin Login / Logout button */}
            {isAdmin ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <span className="hidden lg:inline text-xs font-medium text-slate-600 truncate max-w-[120px]">
                  {adminEmail || 'Admin'}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
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
