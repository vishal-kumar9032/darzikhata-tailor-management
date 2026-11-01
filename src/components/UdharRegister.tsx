import React from 'react';
import { 
  AlertCircle, 
  Phone, 
  MessageSquare, 
  CreditCard, 
  CheckCircle2, 
  Clock,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { OrderRecord, ShopSettings } from '../types';
import { WhatsAppService } from '../services/whatsappService';

interface UdharRegisterProps {
  orders: OrderRecord[];
  settings: ShopSettings;
  onCollectPayment: (order: OrderRecord) => void;
}

export const UdharRegister: React.FC<UdharRegisterProps> = ({
  orders,
  settings,
  onCollectPayment,
}) => {
  // Filter all orders with balanceDue > 0
  const pendingOrders = orders
    .filter(o => o.balanceDue > 0)
    .sort((a, b) => b.balanceDue - a.balanceDue); // Highest balance first

  const totalPendingDues = pendingOrders.reduce((sum, o) => sum + o.balanceDue, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-rose-100 border border-white/20 mb-3">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Pending Dues Ledger (Udhar Khata)</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Total Baqaya: ₹{totalPendingDues}
            </h2>
            <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-md opacity-90">
              {pendingOrders.length} order{pendingOrders.length > 1 ? 's have' : ' has'} pending balances to be collected.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center sm:text-right">
            <span className="text-xs text-rose-200 block uppercase font-bold tracking-wider">
              Shop UPI for Payment
            </span>
            <span className="text-base sm:text-lg font-black text-white font-mono">
              {settings.upiId}
            </span>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sorted by Highest Pending Amount
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {pendingOrders.length} Customers Due
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sabhi Hisaab Clear Hai! 🎉</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
              There are currently no pending payments. All completed or active orders have cleared their dues.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-rose-300"
              >
                {/* Customer & Order details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{order.customerName}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {order.status === 'delivered' ? 'Delivered' : 'In Shop'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Clothes: {order.items.map(i => `${i.quantity}x ${i.description}`).join(', ')}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span>Total: ₹{order.totalAmount}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">Advance Paid: ₹{order.amountPaid}</span>
                  </div>
                </div>

                {/* Balance Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right mr-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Balance</span>
                    <span className="text-xl font-black text-rose-600">
                      ₹{order.balanceDue}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Call */}
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Call Customer"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    {/* WhatsApp Reminder */}
                    <button
                      type="button"
                      onClick={() => WhatsAppService.sendPaymentReminder(order, settings)}
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Send WhatsApp payment reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Remind on WhatsApp</span>
                    </button>

                    {/* Collect Payment */}
                    <button
                      type="button"
                      onClick={() => onCollectPayment(order)}
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collect</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
