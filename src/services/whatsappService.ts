import { OrderRecord, ShopSettings } from '../types';

export const WhatsAppService = {
  getCleanPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '').slice(-10);
    return `91${digits}`; // Default to Indian country code +91
  },

  formatOrderItems(order: OrderRecord): string {
    return order.items
      .map(item => `• ${item.quantity}x ${item.description} @ ₹${item.unitPrice} = ₹${item.subtotal}`)
      .join('\n');
  },

  sendBookingReceipt(order: OrderRecord, settings: ShopSettings) {
    const cleanPhone = this.getCleanPhone(order.customerPhone);
    const dateStr = order.dueDate ? new Date(order.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'As discussed';

    const message = 
`🧵 *${settings.shopName}*
--------------------------------
Namaste *${order.customerName}* ji! 🙏
Your order *#${order.orderNumber}* has been booked successfully.

📋 *Items Details:*
${this.formatOrderItems(order)}
--------------------------------
💰 *Total Bill:* ₹${order.totalAmount}
✅ *Advance Paid:* ₹${order.amountPaid}
⏳ *Balance Due:* ₹${order.balanceDue}
📅 *Ready by:* ${dateStr}

📍 *Shop Address:* ${settings.shopAddress}
📞 *Contact:* ${settings.shopPhone}

✨ Check your order status anytime by entering your mobile number (${order.customerPhone}) on our portal:
${window.location.origin}/?phone=${order.customerPhone}

Thank you for choosing us! ✨`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  },

  sendReadyAlert(order: OrderRecord, settings: ShopSettings) {
    const cleanPhone = this.getCleanPhone(order.customerPhone);
    const message = 
`🎉 *Your Clothes are Ready for Pickup!*
--------------------------------
Namaste *${order.customerName}* ji,
Your order *#${order.orderNumber}* is ready at *${settings.shopName}*.

👗 *Items:*
${order.items.map(i => `• ${i.quantity}x ${i.description}`).join('\n')}

💰 *Remaining Balance to Pay:* ₹${order.balanceDue}
${order.balanceDue > 0 ? `(You can pay in cash or via UPI to: ${settings.upiId})` : `(Fully Paid ✅)`}

📍 Please visit during shop hours to collect and try your clothes:
${settings.shopAddress}

Thank you! 🙏`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  },

  sendPaymentReminder(order: OrderRecord, settings: ShopSettings) {
    const cleanPhone = this.getCleanPhone(order.customerPhone);
    const message = 
`🙏 *Payment Reminder - ${settings.shopName}*
--------------------------------
Hello *${order.customerName}* ji,
This is a gentle reminder regarding the pending balance for order *#${order.orderNumber}*.

⏳ *Pending Balance:* ₹${order.balanceDue}
📱 *Pay via UPI to:* ${settings.upiId}

Or view your complete bill & pay online here:
${window.location.origin}/?phone=${order.customerPhone}

Thank you! 🙏`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  }
};
