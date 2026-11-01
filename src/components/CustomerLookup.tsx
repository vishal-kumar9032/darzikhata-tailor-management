import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  QrCode, 
  MessageSquare, 
  Sparkles,
  Scissors,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { OrderRecord, ShopSettings } from '../types';
import { StorageService } from '../services/storageService';

interface CustomerLookupProps {
  settings: ShopSettings;
  onAdminLoginClick: () => void;
}

export const CustomerLookup: React.FC<CustomerLookupProps> = ({ settings, onAdminLoginClick }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [showQrModal, setShowQrModal] = useState<OrderRecord | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Check URL query parameters for ?phone=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phoneParam = params.get('phone');
    if (phoneParam) {
      const clean = phoneParam.replace(/\D/g, '').slice(-10);
      setPhoneNumber(clean);
      handleSearch(clean);
    }
  }, []);

  const handleSearch = async (phoneToSearch?: string) => {
    const target = phoneToSearch || phoneNumber;
    const clean = target.replace(/\D/g, '').slice(-10);
    if (clean.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setSearched(true);
    try {
      const results = await StorageService.getOrdersByPhone(clean);
      setOrders(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <Clock className="w-3.5 h-3.5 text-stone-500" /> Received
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Scissors className="w-3.5 h-3.5 text-amber-600" /> In Stitching
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Ready for Pickup
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
          </span>
        );
    }
  };

  const customerName = orders.length > 0 ? orders[0].customerName : '';
  const totalBalanceDue = orders.reduce((sum, o) => sum + (o.status !== 'delivered' || o.balanceDue > 0 ? o.balanceDue : 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Search Header Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-xs mb-8 text-center relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
            <Scissors className="w-3.5 h-3.5" />
            <span>{settings.shopName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Customer Stitching & Dues Lookup
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm font-normal">
            Enter your 10-digit mobile number to view your clothes, stitching status, advance paid, and remaining balance.
          </p>

          {/* Clean Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="pt-4 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-stone-400">
                +91
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || phoneNumber.length < 10}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'Searching...' : 'View Records'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-stone-200/80 shadow-xs">
              <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">No Orders Found</h3>
              <p className="text-stone-500 text-xs sm:text-sm max-w-sm mx-auto mt-1 mb-6">
                No orders found under mobile number <span className="font-semibold text-stone-800">+91 {phoneNumber}</span>.
              </p>
              <a
                href={`https://wa.me/91${settings.shopPhone}?text=Hi,%20checking%20my%20tailoring%20order%20for%20mobile%20${phoneNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Contact Shop on WhatsApp</span>
              </a>
            </div>
          ) : (
            <>
              {/* Customer Banner */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-rose-600 tracking-wider uppercase block">
                    Customer Account
                  </span>
                  <h2 className="text-xl font-bold text-stone-900">
                    {customerName}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    +91 {phoneNumber} • {orders.length} order{orders.length > 1 ? 's' : ''} on record
                  </p>
                </div>

                <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-3 ${
                  totalBalanceDue > 0 ? 'bg-amber-50/70 border-amber-200/80 text-amber-900' : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                      {totalBalanceDue > 0 ? 'Total Due to Pay' : 'Account Status'}
                    </span>
                    <span className="text-lg font-extrabold">
                      {totalBalanceDue > 0 ? `₹${totalBalanceDue}` : 'All Cleared! 🎉'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Order Details
                  </span>
                </div>

                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-5 bg-stone-50/60 border-b border-stone-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-stone-900 text-sm">{order.orderNumber}</span>
                        <span className="text-xs text-stone-500 block">
                          Booked: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-5">
                      {/* Items */}
                      <div>
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                          Clothes for Stitching:
                        </span>
                        <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/60 space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-xs">
                              <div>
                                <span className="font-semibold text-stone-800">{item.description}</span>
                                <span className="text-stone-400 block text-[11px]">{item.quantity} × ₹{item.unitPrice}</span>
                              </div>
                              <span className="font-bold text-stone-900">₹{item.subtotal}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Due Date & Notes */}
                      {(order.dueDate || order.notes) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          {order.dueDate && (
                            <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-2.5 flex items-center gap-2 text-stone-700">
                              <Calendar className="w-3.5 h-3.5 text-stone-500" />
                              <span>Target Date: <strong className="font-semibold">{new Date(order.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></span>
                            </div>
                          )}
                          {order.notes && (
                            <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-2.5 text-stone-600 italic">
                              "{order.notes}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Calculation Box */}
                      <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between text-stone-400">
                          <span>Total Stitching Cost</span>
                          <span className="font-medium text-white">₹{order.totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-stone-400">
                          <span>Amount Paid (Advance)</span>
                          <span className="font-medium text-emerald-400">- ₹{order.amountPaid}</span>
                        </div>
                        <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline font-bold">
                          <span className="text-stone-200">Remaining Balance</span>
                          <span className={`text-lg sm:text-xl font-extrabold ${order.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            ₹{order.balanceDue}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        {order.balanceDue > 0 ? (
                          <button
                            type="button"
                            onClick={() => setShowQrModal(order)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>Pay ₹{order.balanceDue} via UPI QR Code</span>
                          </button>
                        ) : (
                          <div className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-semibold text-xs flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Full Payment Cleared</span>
                          </div>
                        )}

                        <a
                          href={`https://wa.me/91${settings.shopPhone}?text=Hi%20${encodeURIComponent(settings.shopName)},%20regarding%20my%20order%20%23${order.orderNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                          <span>WhatsApp Shop</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Pay via UPI Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900">
              Pay ₹{showQrModal.balanceDue}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 mb-4">
              Scan with GPay, PhonePe, or Paytm
            </p>

            {/* QR Code */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 inline-block mb-4">
              <QRCodeSVG
                value={`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.shopName)}&am=${showQrModal.balanceDue}&cu=INR&tn=${encodeURIComponent(showQrModal.orderNumber)}`}
                size={180}
                level="M"
              />
            </div>

            {/* UPI ID copy pill */}
            <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 flex items-center justify-between mb-4 text-xs">
              <span className="font-mono text-stone-700 truncate mr-2">{settings.upiId}</span>
              <button
                type="button"
                onClick={copyUpiId}
                className="px-2 py-1 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 font-semibold text-stone-700 text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <a
                href={`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.shopName)}&am=${showQrModal.balanceDue}&cu=INR&tn=${encodeURIComponent(showQrModal.orderNumber)}`}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs block transition-colors"
              >
                Open UPI App on Phone
              </a>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-xs text-stone-400 space-y-1">
        <p>{settings.shopName} • Mobile: +91 {settings.shopPhone}</p>
        <button 
          type="button"
          onClick={onAdminLoginClick}
          className="text-stone-500 hover:text-stone-800 font-medium underline cursor-pointer"
        >
          Shop Owner Login
        </button>
      </div>
    </div>
  );
};
