import { CustomerProfile, ItemPreset, OrderRecord, ShopSettings } from '../types';

export const DEFAULT_PRESETS: ItemPreset[] = [
  { id: '1', name: 'Blouse Stitching (Plain)', defaultPrice: 150, category: 'Blouse' },
  { id: '2', name: 'Blouse with Lining (Astar)', defaultPrice: 250, category: 'Blouse' },
  { id: '3', name: 'Saree Fall & Pico', defaultPrice: 50, category: 'Saree' },
  { id: '4', name: 'Kurti / Kameez Stitching', defaultPrice: 250, category: 'Suit' },
  { id: '5', name: 'Full Salwar Suit Set', defaultPrice: 400, category: 'Suit' },
  { id: '6', name: 'Pant / Trouser Stitching', defaultPrice: 200, category: 'Bottom' },
  { id: '7', name: 'Dress / Gown Stitching', defaultPrice: 600, category: 'Dress' },
  { id: '8', name: 'Alteration (Tight/Loose)', defaultPrice: 40, category: 'Alteration' },
  { id: '9', name: 'Zip Replacement', defaultPrice: 50, category: 'Alteration' },
];

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: "Asha Tailors & Boutique",
  ownerName: "Asha Devi",
  shopPhone: "9032374977",
  shopAddress: "Main Market, Tailor Shop",
  upiId: "ashadevi903237@upi",
  currencySymbol: "₹",
  presetItems: DEFAULT_PRESETS,
  adminEmail: "ashadevi903237@gmail.com",
};

// Pure empty initial state - no dummy data
export const INITIAL_CUSTOMERS: CustomerProfile[] = [];
export const INITIAL_ORDERS: OrderRecord[] = [];
