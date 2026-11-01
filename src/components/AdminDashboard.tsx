import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Scissors, 
  Sparkles, 
  AlertCircle, 
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
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const readyForPickupCount = orders.filter(o => o.status === 'ready_for_pickup').length;
  const totalUdhar = orders.reduce((sum, o) => sum + (o.balanceDue > 0 ? o.balanceDue : 0), 0);
  const totalRevenueCollected = orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const cleanSearch = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      order.customerName.toLowerCase().includes(cleanSearch) ||
      order.customerPhone.includes(cleanSearch) ||
      order.orderNumber.toLowerCase().includes(cleanSearch) ||
      order.items.some(i => i.description.toLowerCase().includes(cleanSearch));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'udhar') return order.balanceDue > 0;
    return order.status === statusFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Sleek KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: In Stitching */}
        <div 
          onClick={() => { setStatusFilter('in_progress'); setCurrentSubTab('orders'); }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'in_progress'
              ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
              : 'bg-white hover:border-stone-300 text-stone-800 border-stone-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'in_progress' ? 'text-stone-300' : 'text-stone-400'}`}>
              In Stitching
            </span>
            <div className={`p-1.5 rounded-lg ${statusFilter === 'in_progress' ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-600'}`}>
              <Scissors className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">
            {inProgressCount}
          </div>
          <span className={`text-[11px] block mt-0.5 ${statusFilter === 'in_progress' ? 'text-stone-400' : 'text-stone-500'}`}>
            Active cutting & tailoring
          </span>
        </div>

        {/* Metric 2: Ready for Pickup */}
        <div 
          onClick={() => { setStatusFilter('ready_for_pickup'); setCurrentSubTab('orders'); }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ready_for_pickup'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
              : 'bg-white hover:border-stone-300 text-stone-800 border-stone-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'ready_for_pickup' ? 'text-emerald-200' : 'text-stone-400'}`}>
              Ready for Pickup
            </span>
            <div className={`p-1.5 rounded-lg ${statusFilter === 'ready_for_pickup' ? 'bg-emerald-700/60 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">
            {readyForPickupCount}
          </div>
          <span className={`text-[11px] block mt-0.5 ${statusFilter === 'ready_for_pickup' ? 'text-emerald-200' : 'text-stone-500'}`}>
            Awaiting customer pickup
          </span>
        </div>

        {/* Metric 3: Pending Dues (Udhar) */}
        <div 
          onClick={() => { setStatusFilter('udhar'); setCurrentSubTab('orders'); }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'udhar'
              ? 'bg-rose-900 text-white border-rose-950 shadow-sm'
              : 'bg-white hover:border-stone-300 text-stone-800 border-stone-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'udhar' ? 'text-rose-200' : 'text-stone-400'}`}>
              Pending Dues
            </span>
            <div className={`p-1.5 rounded-lg ${statusFilter === 'udhar' ? 'bg-rose-800/60 text-white' : 'bg-rose-50 text-rose-700'}`}>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">
            ₹{totalUdhar}
          </div>
          <span className={`text-[11px] block mt-0.5 ${statusFilter === 'udhar' ? 'text-rose-200' : 'text-rose-600 font-medium'}`}>
            Baqaya to collect
          </span>
        </div>

        {/* Metric 4: Total Orders */}
        <div 
          onClick={() => { setStatusFilter('all'); setCurrentSubTab('orders'); }}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all' && currentSubTab === 'orders'
              ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
              : 'bg-white hover:border-stone-300 text-stone-800 border-stone-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'all' && currentSubTab === 'orders' ? 'text-stone-300' : 'text-stone-400'}`}>
              Total Orders
            </span>
            <div className={`p-1.5 rounded-lg ${statusFilter === 'all' && currentSubTab === 'orders' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'}`}>
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold">
            {orders.length}
          </div>
          <span className={`text-[11px] block mt-0.5 ${statusFilter === 'all' && currentSubTab === 'orders' ? 'text-emerald-300' : 'text-stone-500'}`}>
            ₹{totalRevenueCollected} collected
          </span>
        </div>
      </div>

      {/* Main Admin Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center bg-stone-100/80 p-0.5 rounded-xl border border-stone-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCurrentSubTab('orders')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all ${
                currentSubTab === 'orders'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setCurrentSubTab('customers')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                currentSubTab === 'customers'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Measurement Book</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentSubTab('udhar')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                currentSubTab === 'udhar'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Udhar (₹{totalUdhar})</span>
            </button>
          </div>

          {/* New Order Button */}
          <button
            type="button"
            onClick={onNewOrder}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Order & Bill</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        {currentSubTab === 'orders' && (
          <div className="pt-2 border-t border-stone-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by customer name, mobile number, or clothes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All' },
                { id: 'in_progress', label: 'In Stitching' },
                { id: 'ready_for_pickup', label: 'Ready for Pickup' },
                { id: 'delivered', label: 'Delivered' },
                { id: 'udhar', label: 'Unpaid Dues' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 shadow-xs">
              <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-stone-800">No orders found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try clearing the search or filter.' 
                  : 'Start by creating your first tailoring order record!'}
              </p>
              <button
                type="button"
                onClick={onNewOrder}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-semibold text-xs"
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
