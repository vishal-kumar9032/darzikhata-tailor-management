import React from 'react';
import { 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Scissors, 
  MessageSquare, 
  CreditCard, 
  Edit2, 
  Trash2, 
  Sparkles,
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
    <div className={`bg-white rounded-2xl border transition-all hover:border-stone-300 shadow-xs overflow-hidden ${
      order.priority === 'urgent' && order.status !== 'delivered'
        ? 'border-rose-300/80'
        : 'border-stone-200/80'
    }`}>
      {/* Top Header */}
      <div className="p-4 bg-stone-50/70 border-b border-stone-100 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">{order.customerName}</h3>
            {order.priority === 'urgent' && order.status !== 'delivered' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                ⚡ Urgent
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
            <a 
              href={`tel:${order.customerPhone}`} 
              className="flex items-center gap-1 hover:text-stone-900 font-medium"
            >
              <Phone className="w-3 h-3 text-stone-400" />
              <span>+91 {order.customerPhone}</span>
            </a>
            <span>•</span>
            <span className="font-mono text-stone-400">{order.orderNumber}</span>
          </div>
        </div>

        {/* Status Dropdown */}
        <select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer focus:outline-none ${
            order.status === 'ready_for_pickup'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : order.status === 'in_progress'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : order.status === 'delivered'
              ? 'bg-stone-100 text-stone-600 border-stone-200'
              : 'bg-stone-50 text-stone-700 border-stone-200'
          }`}
        >
          <option value="received">Received</option>
          <option value="in_progress">In Stitching</option>
          <option value="ready_for_pickup">Ready for Pickup</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3.5">
        {/* Items Summary */}
        <div className="space-y-1">
          <div className="bg-stone-50/70 rounded-xl p-3 border border-stone-200/60 divide-y divide-stone-200/50">
            {order.items.map((item) => (
              <div key={item.id} className="py-1.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                <span className="font-medium text-stone-800">
                  {item.quantity}× {item.description}
                </span>
                <span className="font-semibold text-stone-900">
                  ₹{item.subtotal}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Due Date & Notes */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {order.dueDate && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
              isOverdue
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : isDueSoon
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-stone-100 text-stone-600'
            }`}>
              <Calendar className="w-3 h-3 text-stone-500" />
              <span>Target: {new Date(order.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              {isOverdue && <span className="font-bold text-rose-600">(Overdue)</span>}
            </div>
          )}

          {order.notes && (
            <span className="text-stone-500 italic truncate max-w-xs text-[11px]" title={order.notes}>
              "{order.notes}"
            </span>
          )}
        </div>

        {/* Financial Strip */}
        <div className="bg-stone-900 text-white rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">
              Total / Paid
            </span>
            <div className="font-bold text-stone-200">
              ₹{order.totalAmount} <span className="text-emerald-400 font-medium">(Paid: ₹{order.amountPaid})</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase font-semibold tracking-wider block">
              Balance Due
            </span>
            <div className={`text-sm font-bold ${order.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              ₹{order.balanceDue}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex items-center justify-between gap-2">
          {/* WhatsApp buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => WhatsAppService.sendBookingReceipt(order, settings)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Send bill on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bill</span>
            </button>

            {order.status === 'ready_for_pickup' && (
              <button
                type="button"
                onClick={() => WhatsAppService.sendReadyAlert(order, settings)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Send 'Order Ready' message"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ready Alert</span>
              </button>
            )}

            {order.balanceDue > 0 && (
              <button
                type="button"
                onClick={() => WhatsAppService.sendPaymentReminder(order, settings)}
                className="px-2 py-1.5 rounded-lg hover:bg-stone-100 text-stone-600 text-xs font-medium transition-colors cursor-pointer"
                title="Send payment reminder on WhatsApp"
              >
                Remind
              </button>
            )}
          </div>

          {/* Payment & Edit */}
          <div className="flex items-center gap-1.5">
            {order.balanceDue > 0 && (
              <button
                type="button"
                onClick={() => onCollectPayment(order)}
                className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <CreditCard className="w-3 h-3 text-stone-300" />
                <span>Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit(order)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
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
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
