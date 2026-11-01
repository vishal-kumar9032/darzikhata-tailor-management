import React, { useState } from 'react';
import { X, Check, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
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
  settings,
}) => {
  if (!order) return null;

  const [amount, setAmount] = useState<number>(order.balanceDue);
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [notes, setNotes] = useState<string>('Balance paid at pickup');
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
        // Trigger celebratory confetti if balance fully cleared!
        if (updated.balanceDue === 0) {
          confetti({
            particleCount: 80,
            spread: 60,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Payment</h3>
              <p className="text-xs text-slate-500">Order #{order.orderNumber} • {order.customerName}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Due Info Banner */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-800 font-semibold uppercase block">Current Pending Balance</span>
              <span className="text-2xl font-black text-amber-900">₹{order.balanceDue}</span>
            </div>
            <button
              type="button"
              onClick={() => setAmount(order.balanceDue)}
              className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-xs transition-colors"
            >
              Clear Full
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Amount Received (₹) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-base font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="1"
                max={order.balanceDue}
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-extrabold text-slate-900 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Cash', 'UPI / Online'] as PaymentMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    mode === m
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via GPay upon trial"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Save Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
