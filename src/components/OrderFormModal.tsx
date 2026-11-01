import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calculator, 
  Calendar, 
  Sparkles, 
  Ruler, 
  Clock, 
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ItemPreset, MeasurementProfile, OrderItem, OrderRecord, ShopSettings } from '../types';
import { StorageService } from '../services/storageService';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: any) => Promise<void>;
  initialOrder?: OrderRecord | null;
  prefilledCustomer?: { phone: string; name: string } | null;
  settings: ShopSettings;
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialOrder,
  prefilledCustomer,
  settings,
}) => {
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, subtotal: 0 },
  ]);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI / Online' | 'Other'>('Cash');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderRecord['status']>('received');
  
  // Measurements
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState<MeasurementProfile>({
    blouseLength: '',
    chest: '',
    waist: '',
    shoulder: '',
    sleeveLength: '',
    armhole: '',
    neckFront: '',
    neckBack: '',
    customNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form state
  useEffect(() => {
    if (initialOrder) {
      setCustomerPhone(initialOrder.customerPhone);
      setCustomerName(initialOrder.customerName);
      setItems(initialOrder.items);
      setAdvancePaid(initialOrder.amountPaid);
      setDueDate(initialOrder.dueDate || '');
      setPriority(initialOrder.priority);
      setNotes(initialOrder.notes || '');
      setStatus(initialOrder.status);
      if (initialOrder.measurements) {
        setMeasurements(initialOrder.measurements);
        setShowMeasurements(true);
      }
    } else {
      // New Order defaults
      setCustomerPhone(prefilledCustomer?.phone || '');
      setCustomerName(prefilledCustomer?.name || '');
      if (prefilledCustomer?.phone) {
        handlePhoneChange(prefilledCustomer.phone);
      }
      setItems([
        { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, subtotal: 0 },
      ]);
      setAdvancePaid(0);
      setPaymentMode('Cash');
      
      // Default due date: 4 days from now
      const d = new Date();
      d.setDate(d.getDate() + 4);
      setDueDate(d.toISOString().split('T')[0]);
      
      setPriority('normal');
      setNotes('');
      setStatus('received');
      setShowMeasurements(false);
      setMeasurements({});
    }
  }, [initialOrder, isOpen]);

  // Auto-lookup existing customer by phone number
  const handlePhoneChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(clean);

    if (clean.length === 10 && !initialOrder) {
      const existing = await StorageService.getCustomerByPhone(clean);
      if (existing) {
        setCustomerName(existing.name);
        if (existing.measurements && Object.keys(existing.measurements).length > 0) {
          setMeasurements(existing.measurements);
          setShowMeasurements(true);
        }
      }
    }
  };

  // Preset items quick-add
  const addPresetItem = (preset: ItemPreset) => {
    const existingIndex = items.findIndex(i => i.description === preset.name);
    if (existingIndex !== -1) {
      // Increment quantity
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setItems(updated);
    } else {
      const newItem: OrderItem = {
        id: `item-${Date.now()}-${items.length + 1}`,
        description: preset.name,
        quantity: 1,
        unitPrice: preset.defaultPrice,
        subtotal: preset.defaultPrice,
      };
      setItems([...items, newItem]);
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    
    // Auto calculate subtotal
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.unitPrice) || 0);
      item.quantity = qty;
      item.unitPrice = price;
      item.subtotal = qty * price;
    }
    
    updated[index] = item;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const addNewCustomItem = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  // Totals calculations
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const balanceDue = Math.max(0, totalAmount - (Number(advancePaid) || 0));

  const setDueDateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone || customerPhone.length < 10) {
      alert('Please enter a valid 10-digit customer mobile number.');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter customer name.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload: any = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\D/g, '').slice(-10),
        items,
        totalAmount,
        amountPaid: Number(advancePaid) || 0,
        balanceDue,
        status,
        priority,
        dueDate,
        notes: notes.trim(),
        measurements: showMeasurements ? measurements : undefined,
      };

      if (!initialOrder) {
        orderPayload.paymentHistory = advancePaid > 0 ? [
          {
            id: `pay-${Date.now()}`,
            amount: Number(advancePaid),
            date: new Date().toISOString(),
            mode: paymentMode,
            notes: 'Advance at booking',
          }
        ] : [];
      }

      await onSave(orderPayload);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-8 shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              <span>{initialOrder ? `Edit Order #${initialOrder.orderNumber}` : 'New Stitching Order & Bill'}</span>
            </h2>
            <p className="text-xs text-rose-100">
              Enter customer details, clothes to stitch, and advance payment
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer Mobile Number *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sunita Verma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Quick-Tap Presets Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick-Add Tailor Presets (1-Tap):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {settings.presetItems.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => addPresetItem(preset)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3 h-3 text-rose-500" />
                  <span>{preset.name}</span>
                  <span className="text-slate-400 font-normal">₹{preset.defaultPrice}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Items & Automatic Calculator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Items Given for Stitching / Alteration *
              </label>
              <button
                type="button"
                onClick={addNewCustomItem}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Custom Item</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2"
                >
                  {/* Item Description */}
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 2 Sarees Fall & Pico"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                    {/* Quantity */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-14 px-2 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-center font-bold bg-white"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500 font-bold uppercase">Rate ₹:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-18 px-2 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-right font-bold bg-white"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="w-20 text-right font-extrabold text-slate-900 text-sm">
                      ₹{item.subtotal}
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => removeItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automatic Calculation & Payment Summary Bar */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase block">
                  Total Stitching Bill
                </span>
                <span className="text-2xl font-black text-white">
                  ₹{totalAmount}
                </span>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold uppercase block mb-1">
                  Advance Paid Now (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-600 font-bold text-emerald-400 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase block">
                  Remaining Balance Due
                </span>
                <span className={`text-2xl font-black ${balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{balanceDue}
                </span>
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400">Payment Mode for Advance:</span>
              <div className="flex gap-2">
                {(['Cash', 'UPI / Online'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      paymentMode === mode
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Due Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Target Delivery Date
                </label>
                <div className="flex gap-1 text-[11px] text-indigo-600 font-semibold">
                  <button type="button" onClick={() => setDueDateOffset(2)} className="hover:underline">+2d</button>
                  <span>•</span>
                  <button type="button" onClick={() => setDueDateOffset(4)} className="hover:underline">+4d</button>
                  <span>•</span>
                  <button type="button" onClick={() => setDueDateOffset(7)} className="hover:underline">+1w</button>
                </div>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Order Priority
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    priority === 'normal'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    priority === 'urgent'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-rose-600 border-rose-300 hover:bg-rose-50'
                  }`}
                >
                  ⚡ Urgent (Wedding)
                </button>
              </div>
            </div>
          </div>

          {/* Status selector (for editing existing order) */}
          {initialOrder && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderRecord['status'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 text-sm"
              >
                <option value="received">Order Received</option>
                <option value="in_progress">Cutting & Stitching in Progress</option>
                <option value="ready_for_pickup">Ready for Pickup / Trial</option>
                <option value="delivered">Delivered & Closed</option>
              </select>
            </div>
          )}

          {/* Optional Measurements Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMeasurements(!showMeasurements)}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider transition-colors"
            >
              <span className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-rose-600" />
                Customer Measurements (Digital Measurement Book)
              </span>
              {showMeasurements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMeasurements && (
              <div className="p-4 bg-white space-y-3">
                <p className="text-xs text-slate-500">
                  Values entered here are saved to the customer's profile for future orders.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="text-slate-500 font-medium">Blouse Length:</label>
                    <input
                      type="text"
                      placeholder="e.g. 14.5"
                      value={measurements.blouseLength || ''}
                      onChange={(e) => setMeasurements({ ...measurements, blouseLength: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium">Chest:</label>
                    <input
                      type="text"
                      placeholder="e.g. 36"
                      value={measurements.chest || ''}
                      onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium">Waist:</label>
                    <input
                      type="text"
                      placeholder="e.g. 30"
                      value={measurements.waist || ''}
                      onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium">Shoulder:</label>
                    <input
                      type="text"
                      placeholder="e.g. 13.5"
                      value={measurements.shoulder || ''}
                      onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium">Sleeve Length:</label>
                    <input
                      type="text"
                      placeholder="e.g. 6.5"
                      value={measurements.sleeveLength || ''}
                      onChange={(e) => setMeasurements({ ...measurements, sleeveLength: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium">Armhole:</label>
                    <input
                      type="text"
                      placeholder="e.g. 15"
                      value={measurements.armhole || ''}
                      onChange={(e) => setMeasurements({ ...measurements, armhole: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium">Neck Front:</label>
                    <input
                      type="text"
                      placeholder="e.g. 6"
                      value={measurements.neckFront || ''}
                      onChange={(e) => setMeasurements({ ...measurements, neckFront: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-medium">Neck Back:</label>
                    <input
                      type="text"
                      placeholder="e.g. 7.5"
                      value={measurements.neckBack || ''}
                      onChange={(e) => setMeasurements({ ...measurements, neckBack: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-medium">Custom Pattern / Fit Notes:</label>
                  <input
                    type="text"
                    placeholder="e.g. Deep back with dori, princess cut, boat neck"
                    value={measurements.customNotes || ''}
                    onChange={(e) => setMeasurements({ ...measurements, customNotes: e.target.value })}
                    className="w-full mt-0.5 px-3 py-1.5 border rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Special Work Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Design & Fabric Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Customer brought red silk cloth + golden lace border. Needs piping on sleeves."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialOrder ? 'Update Order' : 'Save Order & Create Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
