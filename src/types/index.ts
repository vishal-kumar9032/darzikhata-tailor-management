export type OrderStatus = 'received' | 'in_progress' | 'ready_for_pickup' | 'delivered';
export type PriorityLevel = 'normal' | 'urgent';
export type PaymentMode = 'Cash' | 'UPI / Online' | 'Other';

export interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PaymentEntry {
  id: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  notes?: string;
}

export interface MeasurementProfile {
  blouseLength?: string;
  chest?: string;
  waist?: string;
  shoulder?: string;
  sleeveLength?: string;
  armhole?: string;
  neckFront?: string;
  neckBack?: string;
  bottomLength?: string;
  hips?: string;
  customNotes?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string; // 10 digit normalized
  items: OrderItem[];
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentHistory: PaymentEntry[];
  status: OrderStatus;
  priority: PriorityLevel;
  dueDate?: string;
  measurements?: MeasurementProfile;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  phone: string;
  name: string;
  measurements?: MeasurementProfile;
  createdAt: string;
  updatedAt: string;
}

export interface ItemPreset {
  id: string;
  name: string;
  defaultPrice: number;
  category?: string;
}

export interface ShopSettings {
  shopName: string;
  ownerName: string;
  shopPhone: string;
  shopAddress: string;
  upiId: string; // e.g. "mother@upi"
  currencySymbol: string;
  presetItems: ItemPreset[];
  adminEmail?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
