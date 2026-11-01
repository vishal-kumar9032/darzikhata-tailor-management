import React, { useState } from 'react';
import { X, Check, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { OrderRecord, PaymentMode, ShopSettings } from '../types';
import { StorageService } from '../services/storageService';

interface PaymentModalProps {
  order: OrderRecord | null;
  onClose: () => void;
  onPaymentSuccess: (updatedOrder: OrderRecord) => void;
  settings: ShopSettings;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  order,
  onClose,
  onPaymentSuccess,
}) => {
  if (!order) return null;

  const [amount, setAmount] = useState<number>(order.balanceDue);
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [notes, setNotes] = useState<string>('Balance cleared');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await StorageService.recordPayment(order.id, {
        amount: Number(amount),
        date: new Date().toISOString(),
        mode,
        notes: notes.trim(),
      });

      if (updated) {
        if (updated.balanceDue === 0) {
          confetti({
            particleCount: 70,
            spread: 50,
            origin: { y: 0.7 },
          });
        }
        onPaymentSuccess(updated);
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Record Payment</h3>
              <p className="text-[11px] text-stone-500">{order.orderNumber} • {order.customerName}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Due Info */}
          <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Pending Balance</span>
              <span className="text-xl font-bold text-stone-900">₹{order.balanceDue}</span>
            </div>
            <button
              type="button"
              onClick={() => setAmount(order.balanceDue)}
              className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs transition-colors"
            >
              Clear Full
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
              Amount Received (₹) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-sm font-bold text-stone-400">
                ₹
              </span>
              <input
                type="number"
                min="1"
                max={order.balanceDue}
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 font-bold text-stone-900 text-base focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
              Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['Cash', 'UPI / Online'] as PaymentMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-1.5 rounded-xl font-semibold border transition-colors ${
                    mode === m
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash at shop"
              className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-stone-50"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-stone-600 font-semibold text-xs hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="flex-1 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
