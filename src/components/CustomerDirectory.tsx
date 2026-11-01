import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Ruler, 
  Calendar, 
  Plus, 
  Edit3, 
  ChevronRight,
  BookOpen,
  Check,
  X
} from 'lucide-react';
import { CustomerProfile, MeasurementProfile, OrderRecord } from '../types';
import { StorageService } from '../services/storageService';

interface CustomerDirectoryProps {
  orders: OrderRecord[];
  onSelectCustomerForNewOrder: (phone: string, name: string) => void;
}

export const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({
  orders,
  onSelectCustomerForNewOrder,
}) => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [editingMeasurements, setEditingMeasurements] = useState<MeasurementProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [orders]);

  const loadCustomers = async () => {
    const list = await StorageService.getAllCustomers();
    setCustomers(list);
    if (list.length > 0 && !selectedCustomer) {
      setSelectedCustomer(list[0]);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleSaveMeasurements = async () => {
    if (!selectedCustomer || !editingMeasurements) return;
    setIsSaving(true);
    try {
      await StorageService.updateOrCreateCustomer(
        selectedCustomer.phone,
        selectedCustomer.name,
        editingMeasurements
      );
      setSelectedCustomer({
        ...selectedCustomer,
        measurements: editingMeasurements,
      });
      setEditingMeasurements(null);
      await loadCustomers();
    } catch (e) {
      console.error(e);
      alert('Failed to update measurements.');
    } finally {
      setIsSaving(false);
    }
  };

  // Get orders belonging to this customer
  const customerOrders = selectedCustomer 
    ? orders.filter(o => o.customerPhone.replace(/\D/g, '').slice(-10) === selectedCustomer.phone)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-600" />
            <span>Digital Measurement Book (Khata)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Never lose customer sizes. Saved measurements automatically attach to their future orders.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute inset-y-0 left-3 my-auto text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-2 max-h-[600px] overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Registered Customers ({filteredCustomers.length})
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No customer profiles found.
            </div>
          ) : (
            filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.phone === cust.phone;
              const hasMeasurements = cust.measurements && Object.keys(cust.measurements).length > 0;
              return (
                <div
                  key={cust.phone}
                  onClick={() => { setSelectedCustomer(cust); setEditingMeasurements(null); }}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-rose-50 border-rose-300 shadow-xs'
                      : 'hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cust.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">+91 {cust.phone}</p>
                    </div>
                    <div className="text-right">
                      {hasMeasurements ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Ruler className="w-3 h-3" /> Sizes Saved
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">No sizes yet</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Customer Details & Measurement Card */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCustomer ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700">+91 {selectedCustomer.phone}</span>
                    <span>•</span>
                    <span>Customer since {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onSelectCustomerForNewOrder(selectedCustomer.phone, selectedCustomer.name)}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Order for {selectedCustomer.name.split(' ')[0]}</span>
                  </button>
                </div>
              </div>

              {/* Measurements Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler className="w-4 h-4 text-rose-600" />
                    Saved Body Measurements (Inches)
                  </span>

                  {!editingMeasurements ? (
                    <button
                      type="button"
                      onClick={() => setEditingMeasurements(selectedCustomer.measurements || {})}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Measurements</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingMeasurements(null)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveMeasurements}
                        disabled={isSaving}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>

                {editingMeasurements ? (
                  /* Edit Mode Inputs */
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { key: 'blouseLength', label: 'Blouse Length' },
                        { key: 'chest', label: 'Chest' },
                        { key: 'waist', label: 'Waist' },
                        { key: 'shoulder', label: 'Shoulder' },
                        { key: 'sleeveLength', label: 'Sleeve Length' },
                        { key: 'armhole', label: 'Armhole' },
                        { key: 'neckFront', label: 'Neck Front' },
                        { key: 'neckBack', label: 'Neck Back' },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="text-slate-600 font-semibold block mb-1">{field.label}:</label>
                          <input
                            type="text"
                            placeholder="e.g. 14"
                            value={(editingMeasurements as any)[field.key] || ''}
                            onChange={(e) => setEditingMeasurements({ ...editingMeasurements, [field.key]: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 font-semibold block mb-1">Fitting & Design Preferences:</label>
                      <input
                        type="text"
                        placeholder="e.g. Princess cut, boat neck, loves latkan dori"
                        value={editingMeasurements.customNotes || ''}
                        onChange={(e) => setEditingMeasurements({ ...editingMeasurements, customNotes: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  /* Display Mode Grid */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Blouse Length', val: selectedCustomer.measurements?.blouseLength },
                        { label: 'Chest', val: selectedCustomer.measurements?.chest },
                        { label: 'Waist', val: selectedCustomer.measurements?.waist },
                        { label: 'Shoulder', val: selectedCustomer.measurements?.shoulder },
                        { label: 'Sleeve Length', val: selectedCustomer.measurements?.sleeveLength },
                        { label: 'Armhole', val: selectedCustomer.measurements?.armhole },
                        { label: 'Neck Front', val: selectedCustomer.measurements?.neckFront },
                        { label: 'Neck Back', val: selectedCustomer.measurements?.neckBack },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{item.label}</span>
                          <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                            {item.val ? `${item.val}"` : '—'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {selectedCustomer.measurements?.customNotes && (
                      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 text-xs text-amber-900">
                        <strong className="font-bold">Preferences:</strong> {selectedCustomer.measurements.customNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order History for this customer */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Previous Stitching Orders ({customerOrders.length})
                </h4>

                <div className="space-y-2.5">
                  {customerOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No orders found for this customer.</p>
                  ) : (
                    customerOrders.map((o) => (
                      <div key={o.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{o.orderNumber} • {o.items.map(i => i.description).join(', ')}</span>
                          <span className="text-slate-400">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">Total: ₹{o.totalAmount}</span>
                          <span className={o.balanceDue > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                            {o.balanceDue > 0 ? `Pending: ₹${o.balanceDue}` : 'Cleared ✅'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400">
              Select a customer from the left list to view their measurements and order history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
