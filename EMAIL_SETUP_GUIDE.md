# 📧 Email Notification Setup Guide for OBSIDIAN WEAR

## 🚀 Quick Setup (5 minutes)

### Option 1: EmailJS (Recommended - FREE & Easy)

1. **Create EmailJS Account**
   - Go to [https://www.emailjs.com/](https://www.emailjs.com/)
   - Sign up for FREE account (200 emails/month)

2. **Setup Email Service**
   - Add Email Service (Gmail, Outlook, etc.)
   - Get your **Service ID**

3. **Create Email Templates**

   **Template 1: Order Notification (for you)**
   ```
   Template ID: template_order_notification
   Subject: 🛍️ New Order #{{order_id}} - OBSIDIAN WEAR
   
   Content:
   NEW ORDER RECEIVED! 🎉
   
   📋 ORDER DETAILS:
   Order ID: {{order_id}}
   Date: {{order_date}}
   
   👤 CUSTOMER:
   Name: {{customer_name}}
   Email: {{customer_email}}
   Phone: {{customer_phone}}
   Address: {{customer_address}}
   Wilaya: {{wilaya_name}}
   
   🛒 PRODUCT:
   {{product_name}}
   Size: {{selected_size}}
   Color: {{selected_color}}
   Quantity: {{quantity}}
   
   💰 PAYMENT:
   Subtotal: {{subtotal}}
   Shipping: {{shipping_cost}} ({{shipping_type}})
   Total: {{total}}
   Method: {{payment_method}}
   
   📦 NEXT STEPS:
   1. Confirm stock availability
   2. Contact customer: {{customer_phone}}
   3. Prepare package
   4. Update order status in admin panel
   
   🔗 Admin Panel: https://your-domain.vercel.app/admin
   ```

   **Template 2: Customer Confirmation**
   ```
   Template ID: template_customer_confirmation
   Subject: ✅ Order Confirmation #{{order_id}} - OBSIDIAN WEAR
   
   Content:
   Dear {{customer_name}},
   
   Thank you for your order! 🖤
   
   📦 ORDER SUMMARY:
   Order #{{order_id}}
   {{product_name}}
   Total: {{total}}
   
   🚚 DELIVERY:
   We'll contact you within 24 hours to confirm delivery.
   Estimated delivery: 2-5 business days
   
   📞 CONTACT:
   Phone: {{customer_phone}}
   Address: {{customer_address}}, {{wilaya_name}}
   
   Questions? Reply to this email or call us.
   
   Thank you for choosing OBSIDIAN WEAR! 🖤
   
   ---
   OBSIDIAN WEAR
   Instagram: @obsidianwear_dz
   TikTok: @obsidianwear.dz
   ```

4. **Get Your Keys**
   - Copy **Service ID**
   - Copy **Template IDs**
   - Copy **Public Key**

5. **Update Configuration**
   - Open `src/services/emailService.ts`
   - Replace the placeholders:
   ```typescript
   const EMAIL_CONFIG = {
     serviceId: 'your_service_id_here',
     templateId: 'template_order_notification',
     publicKey: 'your_public_key_here',
   };
   ```

## 🎯 Alternative Options

### Option 2: Resend (3,000 emails/month FREE)
```bash
npm install resend
```

### Option 3: SendGrid (100 emails/day FREE)
```bash
npm install @sendgrid/mail
```

### Option 4: Nodemailer + Gmail (Unlimited)
```bash
npm install nodemailer
```

## 🔧 What Happens When Someone Orders:

1. **Customer places order** on checkout page
2. **Order is saved** to localStorage (and your database if you add one)
3. **2 Emails are sent automatically:**
   - ✅ **To YOU**: Complete order details, customer info, next steps
   - ✅ **To CUSTOMER**: Order confirmation, delivery info
4. **Order appears** in your admin panel
5. **You get notified** instantly via email

## 📱 Mobile Notifications

Add these to your phone:
- **Email notifications** (instant)
- **Admin panel bookmark** (manage orders)
- **WhatsApp Business** (customer contact)

## 🚀 Production Tips

1. **Use environment variables** for sensitive keys
2. **Set up domain authentication** for better delivery
3. **Add order tracking numbers** 
4. **Create email templates** for different order statuses
5. **Set up webhooks** for real-time updates

## 💡 Free Hosting + Email Solution

- **Frontend**: Vercel (FREE)
- **Email**: EmailJS (200/month FREE)
- **Database**: Vercel KV (FREE tier)
- **Total Cost**: $0/month for starting business! 🎉

## 🛠️ Need Help?

1. Check the browser console for errors
2. Test with a real email address
3. Verify EmailJS template IDs match
4. Check spam folder for test emails

---

Your customers will get professional email confirmations, and you'll never miss an order! 📧✨
