import emailjs from '@emailjs/browser';

// EmailJS configuration - you'll need to set these up at https://www.emailjs.com/
const EMAIL_CONFIG = {
  serviceId: 'service_obsidian', // Replace with your EmailJS service ID
  templateId: 'template_order_notification', // Replace with your template ID
  publicKey: 'your_public_key_here', // Replace with your public key
};

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  wilayaName: string;
  productName: string;
  productImage: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingType: string;
  orderDate: string;
  paymentMethod: string;
}

export const sendOrderNotification = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    // Initialize EmailJS
    emailjs.init(EMAIL_CONFIG.publicKey);

    // Prepare email template parameters
    const templateParams = {
      // Order Details
      order_id: orderData.orderId,
      order_date: orderData.orderDate,
      
      // Customer Details
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      customer_address: orderData.customerAddress,
      wilaya_name: orderData.wilayaName,
      
      // Product Details
      product_name: orderData.productName,
      product_image: orderData.productImage,
      selected_size: orderData.selectedSize,
      selected_color: orderData.selectedColor,
      quantity: orderData.quantity,
      
      // Pricing
      subtotal: `${orderData.subtotal} DZD`,
      shipping_cost: `${orderData.shippingCost} DZD`,
      total: `${orderData.total} DZD`,
      shipping_type: orderData.shippingType,
      payment_method: orderData.paymentMethod,
      
      // Business Details
      business_name: 'OBSIDIAN WEAR',
      business_email: 'orders@obsidianwear.dz',
      business_phone: '+213 XXX XXX XXX',
      
      // Email Subject
      subject: `🛍️ New Order #${orderData.orderId} - OBSIDIAN WEAR`,
    };

    // Send email to business owner
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams
    );

    console.log('Order notification sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send order notification:', error);
    return false;
  }
};

// Customer confirmation email
export const sendCustomerConfirmation = async (orderData: OrderEmailData): Promise<boolean> => {
  try {
    const templateParams = {
      to_email: orderData.customerEmail,
      customer_name: orderData.customerName,
      order_id: orderData.orderId,
      product_name: orderData.productName,
      total: `${orderData.total} DZD`,
      estimated_delivery: '2-5 business days',
      tracking_url: `https://obsidianwear.dz/track/${orderData.orderId}`,
      subject: `✅ Order Confirmation #${orderData.orderId} - OBSIDIAN WEAR`,
    };

    await emailjs.send(
      EMAIL_CONFIG.serviceId,
      'template_customer_confirmation', // Different template for customers
      templateParams
    );

    return true;
  } catch (error) {
    console.error('Failed to send customer confirmation:', error);
    return false;
  }
};

// Email templates you'll need to create in EmailJS
export const EMAIL_TEMPLATES = {
  ORDER_NOTIFICATION: `
    🛍️ NEW ORDER RECEIVED - OBSIDIAN WEAR

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
    Name: {{product_name}}
    Size: {{selected_size}}
    Color: {{selected_color}}
    Quantity: {{quantity}}
    
    💰 PAYMENT:
    Subtotal: {{subtotal}}
    Shipping: {{shipping_cost}} ({{shipping_type}})
    Total: {{total}}
    Method: {{payment_method}}
    
    📦 Next Steps:
    1. Confirm stock availability
    2. Prepare package
    3. Contact customer for delivery
    4. Update order status
    
    🔗 Admin Panel: https://obsidianwear.dz/admin
  `,
  
  CUSTOMER_CONFIRMATION: `
    ✅ Order Confirmed - Thank You!
    
    Dear {{customer_name}},
    
    Your order #{{order_id}} has been received and is being processed.
    
    📦 What you ordered:
    {{product_name}} - {{total}}
    
    🚚 Delivery:
    Estimated: {{estimated_delivery}}
    Track: {{tracking_url}}
    
    Questions? Reply to this email or call us.
    
    Thank you for choosing OBSIDIAN WEAR! 🖤
  `
};

// Setup instructions for EmailJS
export const EMAILJS_SETUP_INSTRUCTIONS = `
🚀 EmailJS Setup Instructions:

1. Go to https://www.emailjs.com/ and create a free account
2. Create a new email service (Gmail, Outlook, etc.)
3. Create email templates using the templates above
4. Get your Service ID, Template IDs, and Public Key
5. Update the EMAIL_CONFIG in this file
6. Test the integration

📧 Free Limits:
- EmailJS: 200 emails/month
- Perfect for starting your business!

🔧 Alternative Services:
- Resend: 3,000 emails/month free
- SendGrid: 100 emails/day free
- Nodemailer + Gmail: Unlimited (your Gmail)
`;

export default {
  sendOrderNotification,
  sendCustomerConfirmation,
  EMAIL_TEMPLATES,
  EMAILJS_SETUP_INSTRUCTIONS
};
