import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Ruler, 
  ChevronDown,
  ChevronUp,
  Scissors
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

  const addPresetItem = (preset: ItemPreset) => {
    // If the only item is empty, replace it
    if (items.length === 1 && !items[0].description) {
      setItems([{
        id: `item-${Date.now()}`,
        description: preset.name,
        quantity: 1,
        unitPrice: preset.defaultPrice,
        subtotal: preset.defaultPrice,
      }]);
      return;
    }

    const existingIndex = items.findIndex(i => i.description === preset.name);
    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setItems(updated);
    } else {
      setItems([...items, {
        id: `item-${Date.now()}-${items.length + 1}`,
        description: preset.name,
        quantity: 1,
        unitPrice: preset.defaultPrice,
        subtotal: preset.defaultPrice,
      }]);
    }
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };
    
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
    const validItems = items.filter(i => i.description.trim() !== '');
    if (validItems.length === 0) {
      alert('Please add at least one item description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload: any = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.replace(/\D/g, '').slice(-10),
        items: validItems,
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
      alert('Failed to save order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-8 shadow-xl overflow-hidden border border-stone-200">
        {/* Clean Header */}
        <div className="px-6 py-4 bg-white border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-stone-900" />
              <span>{initialOrder ? `Edit Order #${initialOrder.orderNumber}` : 'New Order & Bill'}</span>
            </h2>
            <p className="text-xs text-stone-500">
              Customer details, clothes, and advance payment
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-stone-400">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="10 digits"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full pl-11 pr-3 py-2 rounded-xl border border-stone-200 font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 text-xs sm:text-sm bg-stone-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sunita Verma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 text-xs sm:text-sm bg-stone-50"
              />
            </div>
          </div>

          {/* Quick-Tap Presets Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Quick-Add Tailor Presets:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {settings.presetItems.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => addPresetItem(preset)}
                  className="px-2.5 py-1 rounded-xl bg-stone-50 hover:bg-stone-100 hover:border-stone-300 border border-stone-200 text-xs font-medium text-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-stone-400" />
                  <span>{preset.name}</span>
                  <span className="text-stone-400">₹{preset.defaultPrice}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Items & Automatic Calculator */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                Clothes for Stitching / Alteration *
              </label>
              <button
                type="button"
                onClick={addNewCustomItem}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div 
                  key={item.id} 
                  className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row items-center gap-2"
                >
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="e.g. Blouse stitching with lining"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-900 bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-12 px-1.5 py-1 rounded-lg border border-stone-200 text-xs text-center font-bold bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">Rate ₹:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-16 px-1.5 py-1 rounded-lg border border-stone-200 text-xs text-right font-bold bg-white"
                      />
                    </div>

                    <div className="w-16 text-right font-bold text-stone-900 text-xs">
                      ₹{item.subtotal}
                    </div>

                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => removeItem(index)}
                      className="p-1 text-stone-300 hover:text-rose-600 disabled:opacity-20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary Bar */}
          <div className="bg-stone-900 text-white rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                  Total Bill
                </span>
                <span className="text-xl font-bold text-white">
                  ₹{totalAmount}
                </span>
              </div>

              <div>
                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block mb-0.5">
                  Advance Paid (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 font-bold text-emerald-400 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                  Balance Remaining
                </span>
                <span className={`text-xl font-bold ${balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  ₹{balanceDue}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-400 text-[11px]">Payment Mode:</span>
              <div className="flex gap-1.5">
                {(['Cash', 'UPI / Online'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors ${
                      paymentMode === mode
                        ? 'bg-stone-700 text-white'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Date & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-500" />
                  Target Delivery Date
                </label>
                <div className="flex gap-1 text-[10px] text-stone-500 font-medium">
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
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 font-medium text-stone-900 text-xs bg-stone-50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                Priority
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPriority('normal')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    priority === 'normal'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('urgent')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    priority === 'urgent'
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-white text-rose-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  ⚡ Urgent
                </button>
              </div>
            </div>
          </div>

          {/* Measurements Accordion */}
          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMeasurements(!showMeasurements)}
              className="w-full px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100/80 flex items-center justify-between text-xs font-semibold text-stone-700 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-stone-600" />
                Customer Measurements (Optional)
              </span>
              {showMeasurements ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMeasurements && (
              <div className="p-3.5 bg-white space-y-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block">Blouse Length:</label>
                    <input
                      type="text"
                      placeholder="14"
                      value={measurements.blouseLength || ''}
                      onChange={(e) => setMeasurements({ ...measurements, blouseLength: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block">Chest:</label>
                    <input
                      type="text"
                      placeholder="36"
                      value={measurements.chest || ''}
                      onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block">Waist:</label>
                    <input
                      type="text"
                      placeholder="30"
                      value={measurements.waist || ''}
                      onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block">Shoulder:</label>
                    <input
                      type="text"
                      placeholder="13.5"
                      value={measurements.shoulder || ''}
                      onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block">Sleeve:</label>
                    <input
                      type="text"
                      placeholder="6"
                      value={measurements.sleeveLength || ''}
                      onChange={(e) => setMeasurements({ ...measurements, sleeveLength: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block">Armhole:</label>
                    <input
                      type="text"
                      placeholder="15"
                      value={measurements.armhole || ''}
                      onChange={(e) => setMeasurements({ ...measurements, armhole: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block">Neck Front:</label>
                    <input
                      type="text"
                      placeholder="6"
                      value={measurements.neckFront || ''}
                      onChange={(e) => setMeasurements({ ...measurements, neckFront: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-500 font-medium block">Neck Back:</label>
                    <input
                      type="text"
                      placeholder="7.5"
                      value={measurements.neckBack || ''}
                      onChange={(e) => setMeasurements({ ...measurements, neckBack: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-stone-500 font-medium block">Fit & Pattern Note:</label>
                  <input
                    type="text"
                    placeholder="e.g. Princess cut, boat neck"
                    value={measurements.customNotes || ''}
                    onChange={(e) => setMeasurements({ ...measurements, customNotes: e.target.value })}
                    className="w-full mt-0.5 px-2.5 py-1 border border-stone-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
              Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Red silk fabric with golden border lace"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-800 bg-stone-50"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 font-semibold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialOrder ? 'Update Order' : 'Create Order & Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
