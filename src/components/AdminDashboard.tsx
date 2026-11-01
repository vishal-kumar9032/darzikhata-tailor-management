import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  UserCheck, 
  BookOpen, 
  Receipt,
  Users
} from 'lucide-react';
import { OrderRecord, OrderStatus, ShopSettings } from '../types';
import { OrderCard } from './OrderCard';

interface AdminDashboardProps {
  orders: OrderRecord[];
  settings: ShopSettings;
  onNewOrder: () => void;
  onEditOrder: (order: OrderRecord) => void;
  onDeleteOrder: (id: string) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onCollectPayment: (order: OrderRecord) => void;
  currentSubTab: 'orders' | 'udhar' | 'customers';
  setCurrentSubTab: (tab: 'orders' | 'udhar' | 'customers') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  settings,
  onNewOrder,
  onEditOrder,
  onDeleteOrder,
  onStatusChange,
  onCollectPayment,
  currentSubTab,
  setCurrentSubTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Metrics
  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const readyForPickupCount = orders.filter(o => o.status === 'ready_for_pickup').length;
  const totalUdhar = orders.reduce((sum, o) => sum + (o.balanceDue > 0 ? o.balanceDue : 0), 0);
  const totalRevenueCollected = orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    // Search match
    const cleanSearch = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      order.customerName.toLowerCase().includes(cleanSearch) ||
      order.customerPhone.includes(cleanSearch) ||
      order.orderNumber.toLowerCase().includes(cleanSearch) ||
      order.items.some(i => i.description.toLowerCase().includes(cleanSearch));

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'all') return true;
    if (statusFilter === 'udhar') return order.balanceDue > 0;
    return order.status === statusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: In Progress */}
        <div 
          onClick={() => { setStatusFilter('in_progress'); setCurrentSubTab('orders'); }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'in_progress'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
              : 'bg-white hover:border-amber-300 text-slate-800 border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'in_progress' ? 'text-amber-100' : 'text-slate-500'}`}>
              In Stitching
            </span>
            <div className={`p-2 rounded-xl ${statusFilter === 'in_progress' ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}>
              <Scissors className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black">
            {inProgressCount}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${statusFilter === 'in_progress' ? 'text-amber-100' : 'text-slate-400'}`}>
            Cutting & tailoring right now
          </span>
        </div>

        {/* Metric 2: Ready for Pickup */}
        <div 
          onClick={() => { setStatusFilter('ready_for_pickup'); setCurrentSubTab('orders'); }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'ready_for_pickup'
              ? 'bg-teal-600 text-white border-teal-700 shadow-md shadow-teal-600/20'
              : 'bg-white hover:border-teal-300 text-slate-800 border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'ready_for_pickup' ? 'text-teal-100' : 'text-slate-500'}`}>
              Ready for Pickup
            </span>
            <div className={`p-2 rounded-xl ${statusFilter === 'ready_for_pickup' ? 'bg-white/20' : 'bg-teal-100 text-teal-800'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black">
            {readyForPickupCount}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${statusFilter === 'ready_for_pickup' ? 'text-teal-100' : 'text-slate-400'}`}>
            Customers can collect now
          </span>
        </div>

        {/* Metric 3: Pending Balance (Udhar) */}
        <div 
          onClick={() => { setStatusFilter('udhar'); setCurrentSubTab('orders'); }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'udhar'
              ? 'bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-600/20'
              : 'bg-white hover:border-rose-300 text-slate-800 border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'udhar' ? 'text-rose-100' : 'text-slate-500'}`}>
              Total Pending Dues
            </span>
            <div className={`p-2 rounded-xl ${statusFilter === 'udhar' ? 'bg-white/20' : 'bg-rose-100 text-rose-800'}`}>
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black">
            ₹{totalUdhar}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${statusFilter === 'udhar' ? 'text-rose-100' : 'text-rose-500'}`}>
            Baqaya / Udhar to collect
          </span>
        </div>

        {/* Metric 4: Total Collected */}
        <div 
          onClick={() => { setStatusFilter('all'); setCurrentSubTab('orders'); }}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            statusFilter === 'all' && currentSubTab === 'orders'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white hover:border-slate-300 text-slate-800 border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'all' && currentSubTab === 'orders' ? 'text-slate-300' : 'text-slate-500'}`}>
              Total Orders
            </span>
            <div className={`p-2 rounded-xl ${statusFilter === 'all' && currentSubTab === 'orders' ? 'bg-white/20' : 'bg-slate-100 text-slate-700'}`}>
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black">
            {orders.length}
          </div>
          <span className={`text-[11px] font-medium block mt-1 ${statusFilter === 'all' && currentSubTab === 'orders' ? 'text-emerald-300' : 'text-slate-400'}`}>
            Collected: ₹{totalRevenueCollected}
          </span>
        </div>
      </div>

      {/* Main Admin Navigation Bar & New Order Button */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setCurrentSubTab('orders')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentSubTab === 'orders'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setCurrentSubTab('customers')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentSubTab === 'customers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Measurement Book</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentSubTab('udhar')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentSubTab === 'udhar'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Udhar Khata (₹{totalUdhar})</span>
            </button>
          </div>

          {/* New Order Button */}
          <button
            type="button"
            onClick={onNewOrder}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ New Order & Bill</span>
          </button>
        </div>

        {/* Search & Filter Toolbar (when in orders view) */}
        {currentSubTab === 'orders' && (
          <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by customer name, mobile number, or item (e.g. Blouse, Saree)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Filter:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'received', label: 'Received' },
                { id: 'in_progress', label: 'In Stitching ✂️' },
                { id: 'ready_for_pickup', label: 'Ready 🎉' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'udhar', label: 'Unpaid Dues ⚠️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Orders Grid */}
      {currentSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No orders found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try clearing the search or filter to see more orders.' 
                  : 'Start by creating your first tailoring order record!'}
              </p>
              <button
                type="button"
                onClick={onNewOrder}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                + Create New Order
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  settings={settings}
                  onStatusChange={onStatusChange}
                  onEdit={onEditOrder}
                  onDelete={onDeleteOrder}
                  onCollectPayment={onCollectPayment}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
