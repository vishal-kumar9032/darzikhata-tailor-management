import React from 'react';
import { 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Scissors, 
  MessageSquare, 
  CreditCard, 
  Edit2, 
  Trash2, 
  Share2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { OrderRecord, OrderStatus, ShopSettings } from '../types';
import { WhatsAppService } from '../services/whatsappService';

interface OrderCardProps {
  order: OrderRecord;
  settings: ShopSettings;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onEdit: (order: OrderRecord) => void;
  onDelete: (id: string) => void;
  onCollectPayment: (order: OrderRecord) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  settings,
  onStatusChange,
  onEdit,
  onDelete,
  onCollectPayment,
}) => {
  const isDueSoon = order.dueDate && new Date(order.dueDate).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 2;
  const isOverdue = order.dueDate && new Date(order.dueDate).getTime() < Date.now() && order.status !== 'delivered';

  return (
    <div className={`bg-white rounded-3xl border transition-all hover:shadow-md overflow-hidden ${
      order.priority === 'urgent' && order.status !== 'delivered'
        ? 'border-rose-300 ring-2 ring-rose-400/20 shadow-xs'
        : 'border-slate-200/80 shadow-xs'
    }`}>
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
            order.status === 'delivered'
              ? 'bg-slate-200 text-slate-700'
              : order.status === 'ready_for_pickup'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}>
            #{order.orderNumber.replace('TK-', '')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">{order.customerName}</h3>
              {order.priority === 'urgent' && order.status !== 'delivered' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider animate-pulse">
                  ⚡ Urgent
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <a 
                href={`tel:${order.customerPhone}`} 
                className="flex items-center gap-1 hover:text-slate-900 font-medium"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                <span>+91 {order.customerPhone}</span>
              </a>
              <span>•</span>
              <span>{order.orderNumber}</span>
            </div>
          </div>
        </div>

        {/* Quick Status Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              order.status === 'ready_for_pickup'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : order.status === 'in_progress'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : order.status === 'delivered'
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
          >
            <option value="received">Received 📥</option>
            <option value="in_progress">Stitching ✂️</option>
            <option value="ready_for_pickup">Ready for Pickup 🎉</option>
            <option value="delivered">Delivered ✅</option>
          </select>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Items Summary */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Stitching Items:
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">
                  {item.quantity}× {item.description}
                </span>
                <span className="font-bold text-slate-900">
                  ₹{item.subtotal}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Due Date & Notes */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {order.dueDate && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold ${
              isOverdue
                ? 'bg-red-50 text-red-700 border border-red-200'
                : isDueSoon
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-700'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>Due: {new Date(order.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              {isOverdue && <span className="text-[10px] font-black uppercase text-red-600">(Overdue)</span>}
            </div>
          )}

          {order.notes && (
            <span className="text-slate-500 italic truncate max-w-xs text-[11px]" title={order.notes}>
              "{order.notes}"
            </span>
          )}
        </div>

        {/* Financial Overview Strip */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Total / Paid
            </span>
            <div className="text-xs font-bold text-slate-200">
              ₹{order.totalAmount} <span className="text-emerald-400 font-semibold">(Paid: ₹{order.amountPaid})</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Balance Due
            </span>
            <div className={`text-base font-black ${order.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ₹{order.balanceDue}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
          {/* WhatsApp communication */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => WhatsAppService.sendBookingReceipt(order, settings)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Send bill on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bill</span>
            </button>

            {order.status === 'ready_for_pickup' && (
              <button
                type="button"
                onClick={() => WhatsAppService.sendReadyAlert(order, settings)}
                className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer animate-bounce"
                title="Send 'Order Ready' message"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Ready Alert</span>
              </button>
            )}

            {order.balanceDue > 0 && (
              <button
                type="button"
                onClick={() => WhatsAppService.sendPaymentReminder(order, settings)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Send payment reminder on WhatsApp"
              >
                <span>Remind</span>
              </button>
            )}
          </div>

          {/* Payment & Edit actions */}
          <div className="flex items-center gap-1.5">
            {order.balanceDue > 0 && (
              <button
                type="button"
                onClick={() => onCollectPayment(order)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pay Balance</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit(order)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Edit Order"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Delete order #${order.orderNumber} for ${order.customerName}?`)) {
                  onDelete(order.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Order"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
