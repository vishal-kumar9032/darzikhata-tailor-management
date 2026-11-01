import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerLookup } from './components/CustomerLookup';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerDirectory } from './components/CustomerDirectory';
import { UdharRegister } from './components/UdharRegister';
import { OrderFormModal } from './components/OrderFormModal';
import { PaymentModal } from './components/PaymentModal';
import { SettingsModal } from './components/SettingsModal';
import { LoginModal } from './components/LoginModal';
import { OrderRecord, OrderStatus, ShopSettings } from './types';
import { StorageService } from './services/storageService';
import { subscribeToAuth, logout, clearLocalAdminSession } from './services/firebase';
import { WhatsAppService } from './services/whatsappService';

export function App() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(StorageService.getSettings());
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Tab State
  const [currentTab, setCurrentTab] = useState<'customer' | 'admin' | 'customers_dir' | 'udhar'>('customer');
  const [adminSubTab, setAdminSubTab] = useState<'orders' | 'udhar' | 'customers'>('orders');

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState<OrderRecord | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Pre-fill for new order from customer directory
  const [prefilledCustomer, setPrefilledCustomer] = useState<{ phone: string; name: string } | null>(null);

  // 1. Initial Data Load & Live Firestore subscription
  useEffect(() => {
    loadAllOrders();
    const unsubscribeOrders = StorageService.subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
    });

    const handleSettingsUpdate = () => {
      setSettings(StorageService.getSettings());
    };
    window.addEventListener('shop_settings_updated', handleSettingsUpdate);

    return () => {
      if (typeof unsubscribeOrders === 'function') unsubscribeOrders();
      window.removeEventListener('shop_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const loadAllOrders = async () => {
    const list = await StorageService.getAllOrders();
    setOrders(list);
  };

  // 2. Auth state subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      if (user) {
        setIsAdmin(true);
        setAdminEmail(user.email || user.displayName || 'Admin');
      } else {
        setIsAdmin(false);
        setAdminEmail(null);
      }
    });

    const handleCustomAuth = () => {
      const local = localStorage.getItem('tailor_local_admin_session');
      if (local) {
        setIsAdmin(true);
        setAdminEmail(local);
      } else {
        setIsAdmin(false);
        setAdminEmail(null);
      }
    };
    window.addEventListener('auth_state_changed', handleCustomAuth);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('auth_state_changed', handleCustomAuth);
    };
  }, []);

  // 3. Check URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' && isAdmin) {
      setCurrentTab('admin');
    }
  }, [isAdmin]);

  // Order Handlers
  const handleSaveOrder = async (orderData: any) => {
    if (editingOrder) {
      await StorageService.updateOrder(editingOrder.id, orderData);
      setEditingOrder(null);
    } else {
      const created = await StorageService.createOrder(orderData);
      // Ask tailor if they want to send WhatsApp receipt
      if (window.confirm(`Order #${created.orderNumber} created! Would you like to send the booking receipt & bill link to ${created.customerName} on WhatsApp?`)) {
        WhatsAppService.sendBookingReceipt(created, settings);
      }
    }
    await loadAllOrders();
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    await StorageService.updateOrder(id, { status: newStatus });
    await loadAllOrders();

    const targetOrder = orders.find(o => o.id === id);
    if (targetOrder && newStatus === 'ready_for_pickup') {
      if (window.confirm(`Marked as Ready! Would you like to notify ${targetOrder.customerName} on WhatsApp that their clothes are ready for pickup?`)) {
        WhatsAppService.sendReadyAlert(targetOrder, settings);
      }
    }
  };

  const handleDeleteOrder = async (id: string) => {
    await StorageService.deleteOrder(id);
    await loadAllOrders();
  };

  const handleLogout = async () => {
    await logout();
    clearLocalAdminSession();
    setIsAdmin(false);
    setAdminEmail(null);
    setCurrentTab('customer');
  };

  const handleSelectCustomerForNewOrder = (phone: string, name: string) => {
    setPrefilledCustomer({ phone, name });
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-rose-100 selection:text-rose-700">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAdmin={isAdmin}
        adminEmail={adminEmail}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        settings={settings}
      />

      {/* Main Content Areas */}
      <main className="flex-1 pb-16">
        {currentTab === 'customer' && (
          <CustomerLookup
            settings={settings}
            onAdminLoginClick={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentTab === 'admin' && (
          <>
            {adminSubTab === 'orders' && (
              <AdminDashboard
                orders={orders}
                settings={settings}
                onNewOrder={() => { setEditingOrder(null); setPrefilledCustomer(null); setIsOrderModalOpen(true); }}
                onEditOrder={(order) => { setEditingOrder(order); setIsOrderModalOpen(true); }}
                onDeleteOrder={handleDeleteOrder}
                onStatusChange={handleStatusChange}
                onCollectPayment={(order) => setPaymentModalOrder(order)}
                currentSubTab={adminSubTab}
                setCurrentSubTab={setAdminSubTab}
              />
            )}

            {adminSubTab === 'customers' && (
              <div>
                <div className="max-w-6xl mx-auto px-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setAdminSubTab('orders')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
                  >
                    ← Back to Orders Dashboard
                  </button>
                </div>
                <CustomerDirectory
                  orders={orders}
                  onSelectCustomerForNewOrder={handleSelectCustomerForNewOrder}
                />
              </div>
            )}

            {adminSubTab === 'udhar' && (
              <div>
                <div className="max-w-5xl mx-auto px-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setAdminSubTab('orders')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2"
                  >
                    ← Back to Orders Dashboard
                  </button>
                </div>
                <UdharRegister
                  orders={orders}
                  settings={settings}
                  onCollectPayment={(order) => setPaymentModalOrder(order)}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => { setIsOrderModalOpen(false); setEditingOrder(null); setPrefilledCustomer(null); }}
        onSave={handleSaveOrder}
        initialOrder={editingOrder}
        prefilledCustomer={prefilledCustomer}
        settings={settings}
      />

      <PaymentModal
        order={paymentModalOrder}
        onClose={() => setPaymentModalOrder(null)}
        onPaymentSuccess={() => loadAllOrders()}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          StorageService.saveSettings(newSettings);
          setSettings(newSettings);
        }}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(email) => {
          setIsAdmin(true);
          setAdminEmail(email);
          setCurrentTab('admin');
        }}
      />
    </div>
  );
}

export default App;
