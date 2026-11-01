import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Database, 
  Store, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { FirebaseConfig, ItemPreset, ShopSettings } from '../types';
import { 
  getStoredFirebaseConfig, 
  saveFirebaseConfig, 
  clearFirebaseConfig, 
  isFirebaseConfigured 
} from '../services/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'presets' | 'firebase'>('shop');
  const [shopName, setShopName] = useState(settings.shopName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [shopPhone, setShopPhone] = useState(settings.shopPhone);
  const [shopAddress, setShopAddress] = useState(settings.shopAddress);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [presets, setPresets] = useState<ItemPreset[]>(settings.presetItems);

  // Firebase Config state
  const existingFb = getStoredFirebaseConfig();
  const [fbConfig, setFbConfig] = useState<FirebaseConfig>({
    apiKey: existingFb?.apiKey || '',
    authDomain: existingFb?.authDomain || '',
    projectId: existingFb?.projectId || '',
    storageBucket: existingFb?.storageBucket || '',
    messagingSenderId: existingFb?.messagingSenderId || '',
    appId: existingFb?.appId || '',
  });

  const [rawFbSnippet, setRawFbSnippet] = useState('');

  if (!isOpen) return null;

  const handleSaveShopSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      shopName: shopName.trim() || 'My Tailor Shop',
      ownerName: ownerName.trim(),
      shopPhone: shopPhone.replace(/\D/g, '').slice(-10),
      shopAddress: shopAddress.trim(),
      upiId: upiId.trim(),
      presetItems: presets,
    });
    alert('Shop settings updated successfully!');
    onClose();
  };

  const handleAddPreset = () => {
    setPresets([
      ...presets,
      {
        id: `preset-${Date.now()}`,
        name: 'New Stitching Item',
        defaultPrice: 100,
      },
    ]);
  };

  const handleRemovePreset = (index: number) => {
    setPresets(presets.filter((_, i) => i !== index));
  };

  const handlePresetChange = (index: number, field: keyof ItemPreset, val: any) => {
    const copy = [...presets];
    copy[index] = { ...copy[index], [field]: val };
    setPresets(copy);
  };

  // Helper to parse Firebase web config snippet if user pastes the whole object
  const handleParseSnippet = () => {
    try {
      const match = (key: string) => {
        const regex = new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`);
        const res = rawFbSnippet.match(regex);
        return res ? res[1] : '';
      };

      const extracted: FirebaseConfig = {
        apiKey: match('apiKey') || fbConfig.apiKey,
        authDomain: match('authDomain') || fbConfig.authDomain,
        projectId: match('projectId') || fbConfig.projectId,
        storageBucket: match('storageBucket') || fbConfig.storageBucket,
        messagingSenderId: match('messagingSenderId') || fbConfig.messagingSenderId,
        appId: match('appId') || fbConfig.appId,
      };

      if (extracted.apiKey && extracted.projectId) {
        setFbConfig(extracted);
        alert('Parsed Firebase credentials successfully! Click "Save & Connect" to activate.');
      } else {
        alert('Could not find apiKey or projectId in the pasted text. Please paste standard firebaseConfig object.');
      }
    } catch {
      alert('Error parsing snippet.');
    }
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbConfig.apiKey || !fbConfig.projectId) {
      alert('Please provide at least apiKey and projectId.');
      return;
    }
    saveFirebaseConfig(fbConfig);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-8 shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-rose-400" />
            <h2 className="text-base sm:text-lg font-bold">Shop & Firebase Settings</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'shop'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Shop Profile & UPI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tailor Price Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('firebase')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'firebase'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Firebase Cloud DB</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: Shop Profile */}
          {activeTab === 'shop' && (
            <form onSubmit={handleSaveShopSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shop Name (appears on bills & WhatsApp receipts)
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tailor / Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Shop Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shop UPI ID (for generating customer payment QR code)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210@paytm or mother@okaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Customers who open the bill online can scan this to pay their remaining balance directly to your account.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Shop Address / Location
                </label>
                <input
                  type="text"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Save Shop Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Item Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quick-Add Tailor Buttons & Rates
                  </h4>
                  <p className="text-xs text-slate-500">
                    Customize your standard charges so you don't have to type prices each time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPreset}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {presets.map((preset, idx) => (
                  <div key={preset.id} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      value={preset.name}
                      onChange={(e) => handlePresetChange(idx, 'name', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                      placeholder="Item name"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={preset.defaultPrice}
                        onChange={(e) => handlePresetChange(idx, 'defaultPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-right"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePreset(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveShopSettings}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Save Presets & Rates
              </button>
            </div>
          )}

          {/* TAB 3: Firebase Config */}
          {activeTab === 'firebase' && (
            <div className="space-y-5">
              {/* Connection Status Banner */}
              <div className={`p-4 rounded-2xl border ${
                isFirebaseConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isFirebaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {isFirebaseConfigured ? '🟢 Connected to Live Firebase Firestore' : '🟡 Running in Local Storage Mode'}
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-90">
                  {isFirebaseConfigured
                    ? 'All orders, customer measurements, and payments are automatically backed up to Google Firebase Cloud.'
                    : 'The app is fully functional using your browser\'s local storage. To sync data across multiple devices/phones, connect your Firebase project below.'}
                </p>
              </div>

              {/* Paste Snippet Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Quick Paste: Firebase SDK Config Code
                </label>
                <textarea
                  rows={3}
                  value={rawFbSnippet}
                  onChange={(e) => setRawFbSnippet(e.target.value)}
                  placeholder={`Paste snippet from Firebase Console (Project Settings > Web App > Config):
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  ...
};`}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 bg-slate-50"
                />
                <button
                  type="button"
                  onClick={handleParseSnippet}
                  className="mt-1.5 px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
                >
                  Auto-fill from pasted code
                </button>
              </div>

              {/* Manual Fields Form */}
              <form onSubmit={handleSaveFirebase} className="space-y-3 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-0.5">apiKey *</label>
                    <input
                      type="text"
                      required
                      value={fbConfig.apiKey}
                      onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-0.5">projectId *</label>
                    <input
                      type="text"
                      required
                      value={fbConfig.projectId}
                      onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-0.5">authDomain</label>
                    <input
                      type="text"
                      value={fbConfig.authDomain}
                      onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-0.5">appId</label>
                    <input
                      type="text"
                      value={fbConfig.appId}
                      onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    Save & Connect Firebase
                  </button>

                  {isFirebaseConfigured && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Disconnect Firebase and switch to local storage mode?')) {
                          clearFirebaseConfig();
                        }
                      }}
                      className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
