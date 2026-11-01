# 🧵 DarziKhata - Tailoring Order & Dues Tracker

A modern, mobile-first tailoring business & ledger management web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Firebase (Auth & Firestore)**.

Designed specifically for tailors to eliminate messy paper notebooks, calculate bills automatically, maintain customer measurement books, track pending dues (baqaya/udhar), and allow customers to view their records and pay online simply by entering their mobile number.

---

## ✨ Key Features

### 👩‍💼 For the Tailor (Mother & Admin View)
1. **Interactive Bill & Order Calculator:**
   - Add items like *"2 sarees at ₹50"* and *"1 blouse at ₹150"*.
   - **One-tap presets:** `[+ Blouse ₹150]`, `[+ Saree Fall & Pico ₹50]`, `[+ Kurti ₹250]`, `[+ Alteration ₹40]`, etc.
   - Automatically computes Total Amount, Advance Received, and Remaining Balance Due.
2. **Digital Measurement Book:**
   - Save customer body measurements once (Blouse length, Chest, Waist, Shoulder, Sleeve, Armhole, Neck front/back).
   - Saved measurements auto-populate on all future orders for repeat customers!
3. **Pending Dues Register (Udhar Khata):**
   - High-visibility dashboard showing total pending dues across all customers.
   - Sorted by highest balance due first.
   - 1-click **WhatsApp Payment Reminder** with balance amount and shop UPI ID.
4. **Order Status Pipeline:**
   - Track order stages: `Received 📥` ➔ `In Stitching ✂️` ➔ `Ready for Pickup 🎉` ➔ `Delivered ✅`.
   - 1-click **WhatsApp "Ready for Pickup" Alert** to notify customers when their clothes are stitched.
5. **Quick Payment Collection:**
   - Record partial or full payments at trial/pickup with festive confetti celebration when balance hits ₹0.
6. **Firebase Single Sign-In:**
   - Google Sign-In or Email/Password admin access via Firebase Auth.
   - Built-in graceful offline/demo mode so it works immediately out-of-the-box.

---

### 👥 For Customers (Public Lookup View)
1. **Phone Number Lookup:**
   - Customers simply enter their 10-digit mobile number to view their order status and bills.
2. **Itemized Transparency:**
   - See what clothes they gave, item rates, advance paid, and remaining balance.
3. **Direct UPI QR Code Payment:**
   - Automatically generates a dynamic UPI payment QR code with the exact balance due!
   - Customers can tap or scan to pay with Google Pay, PhonePe, or Paytm directly to your mother's UPI ID.
4. **Direct WhatsApp Shop Button:**
   - Contact the shop with a single tap.

---

## 🚀 Quick Start

### 1. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Firebase Setup (Optional but Recommended for Cloud Sync)

The application works immediately in **Local Demo Mode** (persisting in browser local storage). To enable cloud backup and multi-device access across phones:

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g. `my-tailor-shop`).
2. **Enable Authentication:**
   - In Firebase Console ➔ **Authentication** ➔ **Sign-in method**.
   - Enable **Google** (or Email/Password).
3. **Enable Firestore Database:**
   - In Firebase Console ➔ **Firestore Database** ➔ **Create Database** (Start in Test mode or configure rules).
4. **Recommended Firestore Security Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated admins to read and write everything
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
       // Allow public read access to orders matching customerPhone for customer lookup
       match /orders/{orderId} {
         allow read: if true;
       }
     }
   }
   ```
5. **Add Your Firebase Config:**
   - In the app, click the **⚙️ Settings** icon in the navbar.
   - Go to the **Firebase Cloud DB** tab and paste your web app config snippet or enter `apiKey` and `projectId`.
   - Click **Save & Connect Firebase**. Done!

---

## 📱 Mobile-First App (PWA)
On Android or iPhone:
1. Open the website in Chrome or Safari.
2. Tap **Share** (iOS) or **Three Dots** (Android) ➔ **"Add to Home Screen"**.
3. It installs like a native app with an icon on your mother's phone!
