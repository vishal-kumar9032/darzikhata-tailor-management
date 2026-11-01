import React from 'react';
import { 
  AlertCircle, 
  Phone, 
  MessageSquare, 
  CreditCard, 
  CheckCircle2, 
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
  const pendingOrders = orders
    .filter(o => o.balanceDue > 0)
    .sort((a, b) => b.balanceDue - a.balanceDue);

  const totalPendingDues = pendingOrders.reduce((sum, o) => sum + o.balanceDue, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Clean Banner */}
      <div className="bg-stone-900 rounded-2xl p-6 sm:p-7 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-800 text-[11px] font-semibold text-rose-300 mb-2 border border-stone-700">
              <AlertCircle className="w-3 h-3" />
              <span>Pending Dues Ledger (Udhar Khata)</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Total Pending: ₹{totalPendingDues}
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-0.5">
              {pendingOrders.length} customer order{pendingOrders.length > 1 ? 's' : ''} with pending balance.
            </p>
          </div>

          <div className="bg-stone-800/80 rounded-xl p-3 border border-stone-700 text-left sm:text-right">
            <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">
              Shop UPI ID
            </span>
            <span className="text-sm sm:text-base font-bold text-stone-200 font-mono">
              {settings.upiId}
            </span>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Highest Pending First
          </span>
          <span className="text-stone-400">
            {pendingOrders.length} Customers
          </span>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200/80 shadow-xs">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">All Cleared! 🎉</h3>
            <p className="text-stone-500 text-xs mt-0.5">
              There are no pending dues at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pendingOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white rounded-2xl p-4 sm:p-4.5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-colors hover:border-stone-300"
              >
                {/* Details */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">{order.customerName}</h3>
                    <span className="font-mono text-stone-400 text-xs">
                      {order.orderNumber}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500">
                    {order.items.map(i => `${i.quantity}× ${i.description}`).join(', ')}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-0.5">
                    <span>Total: ₹{order.totalAmount}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Paid: ₹{order.amountPaid}</span>
                  </div>
                </div>

                {/* Balance & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <div className="text-left sm:text-right mr-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Pending</span>
                    <span className="text-base sm:text-lg font-bold text-stone-900">
                      ₹{order.balanceDue}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => WhatsAppService.sendPaymentReminder(order, settings)}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Send WhatsApp payment reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Remind</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onCollectPayment(order)}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <CreditCard className="w-3 h-3 text-stone-300" />
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
