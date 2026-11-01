import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Receipt, 
  QrCode, 
  MessageSquare, 
  CreditCard, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Scissors
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
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [showQrModal, setShowQrModal] = useState<OrderRecord | null>(null);

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
      if (results.length > 0) {
        setSelectedOrder(results[0]);
      } else {
        setSelectedOrder(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Order Received
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Scissors className="w-3.5 h-3.5" /> Stitching in Progress
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Ready for Pickup!
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed & Delivered
          </span>
        );
    }
  };

  const customerName = orders.length > 0 ? orders[0].customerName : '';
  const totalBalanceDue = orders.reduce((sum, o) => sum + (o.status !== 'delivered' || o.balanceDue > 0 ? o.balanceDue : 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-rose-900/10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium text-rose-100 mb-4 border border-white/20">
            <Scissors className="w-3.5 h-3.5" />
            <span>{settings.shopName} Online Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Check Your Stitching Records & Bills
          </h1>
          <p className="text-rose-100 text-sm sm:text-base max-w-xl font-normal opacity-95">
            Enter your mobile number to view what items you have given, stitching status, payments cleared, and balance dues.
          </p>

          {/* Search Input Box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="mt-6 flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <span className="text-xs font-bold text-slate-500 mr-1">+91</span>
                <Phone className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number (e.g. 9876500001)"
                className="w-full pl-16 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-medium text-base shadow-inner focus:outline-none focus:ring-4 focus:ring-rose-400/40"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || phoneNumber.length < 10}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Search className="w-5 h-5" />
              <span>{isLoading ? 'Searching...' : 'Find My Records'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Records Found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                We couldn't find any orders matching mobile number <span className="font-semibold text-slate-700">+91 {phoneNumber}</span>. 
                Please verify the number or contact the shop.
              </p>
              <div className="flex justify-center gap-3">
                <a
                  href={`https://wa.me/91${settings.shopPhone}?text=Hi,%20I%20am%20checking%20my%20tailoring%20records%20for%20mobile%20${phoneNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Shop</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Customer Header Overview Banner */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-rose-600 tracking-wider uppercase">Welcome Back</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {customerName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mobile: +91 {phoneNumber} • Total {orders.length} order{orders.length > 1 ? 's' : ''} on record
                  </p>
                </div>

                <div className={`px-4 py-3 rounded-2xl flex items-center gap-3 border ${
                  totalBalanceDue > 0 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    totalBalanceDue > 0 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    ₹
                  </div>
                  <div>
                    <span className="text-xs font-semibold block uppercase tracking-wider">
                      {totalBalanceDue > 0 ? 'Total Balance Pending' : 'Account Status'}
                    </span>
                    <span className="text-lg font-extrabold">
                      {totalBalanceDue > 0 ? `₹${totalBalanceDue}` : 'All Cleared! 🎉'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Cards List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase px-1">
                  Your Orders & Items List
                </h3>

                {orders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Order Card Header */}
                    <div className="p-5 sm:p-6 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-extrabold text-sm">
                          #{order.orderNumber.replace('TK-', '')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-base">{order.orderNumber}</span>
                          <span className="text-xs text-slate-500 block">
                            Booked on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="p-5 sm:p-6 space-y-6">
                      {/* Items Given / To Stitch Table */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                          Items Given for Stitching
                        </h4>
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 divide-y divide-slate-200/60">
                          {order.items.map((item) => (
                            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-slate-900 text-sm block">
                                  {item.description}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">
                                  Quantity: {item.quantity} × ₹{item.unitPrice} each
                                </span>
                              </div>
                              <span className="font-bold text-slate-900 text-sm">
                                ₹{item.subtotal}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Due Date & Notes if available */}
                      {(order.dueDate || order.notes) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {order.dueDate && (
                            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-center gap-2 text-indigo-900">
                              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span>Ready / Delivery Target: <strong className="font-semibold">{new Date(order.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                            </div>
                          )}
                          {order.notes && (
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-slate-700">
                              <span className="font-semibold text-slate-900 block mb-0.5">Design / Work Instructions:</span>
                              {order.notes}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Payment Summary Box */}
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-inner">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-slate-300">
                            <span>Total Stitching Cost</span>
                            <span className="font-medium text-white">₹{order.totalAmount}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Amount Paid so far (Advance)</span>
                            <span className="font-medium text-emerald-400">- ₹{order.amountPaid}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline font-bold">
                            <span className="text-slate-100 text-base">Remaining Balance to Pay</span>
                            <span className={`text-xl ${order.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              ₹{order.balanceDue}
                            </span>
                          </div>
                        </div>

                        {/* Payment History Log */}
                        {order.paymentHistory && order.paymentHistory.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-700/80">
                            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-2">
                              Payment Records:
                            </span>
                            <div className="space-y-1 text-xs text-slate-300">
                              {order.paymentHistory.map((p) => (
                                <div key={p.id} className="flex justify-between items-center bg-white/5 px-2.5 py-1.5 rounded-lg">
                                  <span>
                                    {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {p.mode}
                                    {p.notes ? ` (${p.notes})` : ''}
                                  </span>
                                  <span className="font-bold text-emerald-400">+₹{p.amount}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Bar (Pay via UPI / WhatsApp Shop) */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {order.balanceDue > 0 ? (
                          <button
                            type="button"
                            onClick={() => setShowQrModal(order)}
                            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>Pay ₹{order.balanceDue} via UPI QR Code</span>
                          </button>
                        ) : (
                          <div className="flex-1 py-3 px-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-center font-bold text-sm flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Payment Fully Cleared</span>
                          </div>
                        )}

                        <a
                          href={`https://wa.me/91${settings.shopPhone}?text=Hello%20${settings.shopName},%20regarding%20my%20order%20%23${order.orderNumber}%20(${order.customerName})`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Pay Balance: ₹{showQrModal.balanceDue}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Scan with any UPI App (GPay, PhonePe, Paytm) to clear dues for {showQrModal.orderNumber}
            </p>

            {/* UPI QR Code */}
            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-300 inline-block shadow-inner mb-4">
              <QRCodeSVG
                value={`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.shopName)}&am=${showQrModal.balanceDue}&cu=INR&tn=${encodeURIComponent(showQrModal.orderNumber)}`}
                size={200}
                level="M"
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-5 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Shop UPI ID:</span>
                <span className="font-bold text-slate-900 font-mono">{settings.upiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payee:</span>
                <span className="font-semibold text-slate-900">{settings.shopName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <a
                href={`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.shopName)}&am=${showQrModal.balanceDue}&cu=INR&tn=${encodeURIComponent(showQrModal.orderNumber)}`}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm block transition-colors"
              >
                Open in UPI App (GPay / PhonePe)
              </a>
              <button
                type="button"
                onClick={() => setShowQrModal(null)}
                className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info & Admin Link */}
      <div className="mt-12 text-center text-xs text-slate-400 space-y-2">
        <p>
          Need to book a new order or update measurements? Visit {settings.shopName} or call +91 {settings.shopPhone}.
        </p>
        <div>
          <button 
            type="button"
            onClick={onAdminLoginClick}
            className="text-slate-500 hover:text-rose-600 font-medium underline cursor-pointer"
          >
            Shop Owner / Tailor Login
          </button>
        </div>
      </div>
    </div>
  );
};
