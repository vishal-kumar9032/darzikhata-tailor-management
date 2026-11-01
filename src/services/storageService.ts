import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { CustomerProfile, OrderRecord, PaymentEntry, ShopSettings } from '../types';
import { DEFAULT_SHOP_SETTINGS, INITIAL_CUSTOMERS, INITIAL_ORDERS } from './dummyData';

const ORDERS_KEY = 'tailor_orders_local';
const CUSTOMERS_KEY = 'tailor_customers_local';
const SETTINGS_KEY = 'tailor_settings_local';

// Local storage helpers
function getLocalOrders(): OrderRecord[] {
  const data = localStorage.getItem(ORDERS_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    const clean = Array.isArray(parsed) 
      ? parsed.filter((o: any) => o.id !== 'ord-1001' && o.id !== 'ord-1002' && o.id !== 'ord-1003') 
      : [];
    return clean;
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: OrderRecord[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function getLocalCustomers(): CustomerProfile[] {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    const clean = Array.isArray(parsed) 
      ? parsed.filter((c: any) => c.phone !== '9876500001' && c.phone !== '9876500002' && c.phone !== '9876500003') 
      : [];
    return clean;
  } catch {
    return [];
  }
}

function saveLocalCustomers(customers: CustomerProfile[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

// Next Order Number generator
export function generateNextOrderNumber(orders: OrderRecord[]): string {
  if (orders.length === 0) return 'TK-1001';
  const numbers = orders
    .map(o => {
      const match = o.orderNumber.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 1000;
  return `TK-${max + 1}`;
}

export const StorageService = {
  // --- ORDERS ---
  async getAllOrders(): Promise<OrderRecord[]> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const orders: OrderRecord[] = [];
        snap.forEach(d => orders.push({ id: d.id, ...d.data() } as OrderRecord));
        return orders;
      } catch (err) {
        console.warn("Firestore error reading orders, falling back to local:", err);
      }
    }
    return getLocalOrders().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrdersByPhone(phone: string): Promise<OrderRecord[]> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) return [];

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'orders'), where('customerPhone', '==', cleanPhone));
        const snap = await getDocs(q);
        const orders: OrderRecord[] = [];
        snap.forEach(d => orders.push({ id: d.id, ...d.data() } as OrderRecord));
        return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        console.warn("Firestore error querying by phone, fallback to local:", err);
      }
    }

    const all = getLocalOrders();
    return all
      .filter(o => o.customerPhone.replace(/\D/g, '').slice(-10) === cleanPhone)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createOrder(orderData: Omit<OrderRecord, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<OrderRecord> {
    const existingOrders = await this.getAllOrders();
    const orderNumber = generateNextOrderNumber(existingOrders);
    const now = new Date().toISOString();
    const id = `ord-${Date.now()}`;

    const newOrder: OrderRecord = {
      ...orderData,
      id,
      orderNumber,
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firestore if available
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(collection(db, 'orders'), id);
        await setDoc(docRef, newOrder);
      } catch (err) {
        console.error("Firestore save order failed:", err);
      }
    }

    // Always update local storage for backup / offline view
    const local = getLocalOrders();
    local.unshift(newOrder);
    saveLocalOrders(local);

    // Also auto-update / save customer profile with measurements
    await this.updateOrCreateCustomer(newOrder.customerPhone, newOrder.customerName, newOrder.measurements);

    return newOrder;
  },

  async updateOrder(id: string, updates: Partial<OrderRecord>): Promise<void> {
    const now = new Date().toISOString();
    const cleanUpdates = { ...updates, updatedAt: now };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'orders', id);
        await updateDoc(docRef, cleanUpdates);
      } catch (err) {
        console.error("Firestore update failed:", err);
      }
    }

    const local = getLocalOrders();
    const idx = local.findIndex(o => o.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...cleanUpdates };
      saveLocalOrders(local);
    }
  },

  async deleteOrder(id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'orders', id));
      } catch (err) {
        console.error("Firestore delete failed:", err);
      }
    }

    const local = getLocalOrders();
    saveLocalOrders(local.filter(o => o.id !== id));
  },

  async recordPayment(orderId: string, payment: Omit<PaymentEntry, 'id'>): Promise<OrderRecord | null> {
    const orders = await this.getAllOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const newPayment: PaymentEntry = {
      ...payment,
      id: `pay-${Date.now()}`,
    };

    const newPaymentHistory = [...(order.paymentHistory || []), newPayment];
    const newAmountPaid = newPaymentHistory.reduce((sum, p) => sum + Number(p.amount), 0);
    const newBalanceDue = Math.max(0, order.totalAmount - newAmountPaid);
    
    // Auto update status if fully paid and currently ready for pickup
    let newStatus = order.status;
    if (newBalanceDue === 0 && order.status === 'ready_for_pickup') {
      newStatus = 'delivered';
    }

    const updates: Partial<OrderRecord> = {
      paymentHistory: newPaymentHistory,
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    await this.updateOrder(orderId, updates);
    return { ...order, ...updates };
  },

  // --- CUSTOMERS ---
  async getAllCustomers(): Promise<CustomerProfile[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'customers'));
        const list: CustomerProfile[] = [];
        snap.forEach(d => list.push({ ...d.data() } as CustomerProfile));
        return list;
      } catch (err) {
        console.warn("Firestore customer get failed, using local:", err);
      }
    }
    return getLocalCustomers();
  },

  async getCustomerByPhone(phone: string): Promise<CustomerProfile | null> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) return null;

    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'customers', cleanPhone));
        if (snap.exists()) {
          return snap.data() as CustomerProfile;
        }
      } catch (err) {
        console.warn("Firestore get customer error:", err);
      }
    }

    const customers = getLocalCustomers();
    return customers.find(c => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone) || null;
  },

  async updateOrCreateCustomer(phone: string, name: string, measurements?: any): Promise<void> {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) return;

    const now = new Date().toISOString();
    const existing = await this.getCustomerByPhone(cleanPhone);

    const customer: CustomerProfile = {
      phone: cleanPhone,
      name: name || existing?.name || 'Customer',
      measurements: measurements || existing?.measurements || {},
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'customers', cleanPhone), customer);
      } catch (err) {
        console.error("Firestore customer save error:", err);
      }
    }

    const local = getLocalCustomers();
    const idx = local.findIndex(c => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
    if (idx !== -1) {
      local[idx] = customer;
    } else {
      local.unshift(customer);
    }
    saveLocalCustomers(local);
  },

  // --- SETTINGS ---
  getSettings(): ShopSettings {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_SHOP_SETTINGS, ...JSON.parse(stored) };
      } catch {
        // ignore
      }
    }
    return DEFAULT_SHOP_SETTINGS;
  },

  saveSettings(settings: ShopSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('shop_settings_updated'));
  },

  // Live order listener for real-time updates
  subscribeToOrders(callback: (orders: OrderRecord[]) => void) {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snap) => {
          const orders: OrderRecord[] = [];
          snap.forEach(d => orders.push({ id: d.id, ...d.data() } as OrderRecord));
          callback(orders);
        });
      } catch (e) {
        console.warn("Firestore subscription failed:", e);
      }
    }

    // Local polling fallback
    const interval = setInterval(() => {
      callback(getLocalOrders());
    }, 2000);
    return () => clearInterval(interval);
  }
};
