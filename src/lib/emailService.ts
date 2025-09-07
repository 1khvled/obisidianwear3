import { Order } from '@/types';

export interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  try {
    const emailData: EmailData = {
      to: order.customerEmail,
      subject: 'Your Order Confirmation - OBSIDIAN WEAR',
      text: generateOrderConfirmationText(order),
      html: generateOrderConfirmationHTML(order),
    };

    // Use the direct email sending logic instead of making an API call
    const nodemailer = require('nodemailer');

    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: {
        name: 'OBSIDIAN WEAR',
        address: process.env.GMAIL_USER || '',
      },
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Order confirmation email sent successfully:', info.messageId);
    return true;

  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
}

function generateOrderConfirmationText(order: Order): string {
  return `
Order Confirmation - OBSIDIAN WEAR

Dear ${order.customerName},

Thank you for your order! Your order has been confirmed and we'll start processing it immediately.

Order Details:
- Order ID: #${order.id}
- Date: ${new Date(order.orderDate).toLocaleDateString()}
- Product: ${order.productName}
- Size: ${order.selectedSize}
- Color: ${order.selectedColor}
- Quantity: ${order.quantity}
- Total: ${order.total.toLocaleString()} DA

Shipping Information:
- Shipping Type: ${order.shippingType === 'homeDelivery' ? 'Home Delivery' : 'Stop Desk'}
- Wilaya: ${order.wilayaName}
- City: ${order.customerCity}
- Address: ${order.customerAddress}
- Shipping Cost: ${order.shippingCost.toLocaleString()} DA

Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}

We will contact you soon to confirm the delivery details.

Best regards,
OBSIDIAN WEAR Team
  `.trim();
}

function generateOrderConfirmationHTML(order: Order): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - OBSIDIAN WEAR</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin-bottom: 10px;
        }
        .order-id {
            background-color: #000;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            font-weight: bold;
        }
        .section {
            margin-bottom: 25px;
        }
        .section h3 {
            color: #000;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        .order-details {
            background-color: #f8f8f8;
            padding: 15px;
            border-radius: 5px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .detail-label {
            font-weight: bold;
            color: #666;
        }
        .total {
            background-color: #000;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">OBSIDIAN WEAR</div>
            <h1>Order Confirmation</h1>
            <div class="order-id">#${order.id}</div>
        </div>

        <p>Dear <strong>${order.customerName}</strong>,</p>
        
        <p>Thank you for your order! Your order has been confirmed and we'll start processing it immediately.</p>

        <div class="section">
            <h3>Order Details</h3>
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    <span>#${order.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span>${new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Product:</span>
                    <span>${order.productName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Size:</span>
                    <span>${order.selectedSize}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Color:</span>
                    <span>${order.selectedColor}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantity:</span>
                    <span>${order.quantity}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Shipping Information</h3>
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Shipping Type:</span>
                    <span>${order.shippingType === 'homeDelivery' ? 'Home Delivery' : 'Stop Desk'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Wilaya:</span>
                    <span>${order.wilayaName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">City:</span>
                    <span>${order.customerCity}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span>${order.customerAddress}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Shipping Cost:</span>
                    <span>${order.shippingCost.toLocaleString()} DA</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Payment Information</h3>
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span>${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Subtotal:</span>
                    <span>${order.subtotal.toLocaleString()} DA</span>
                </div>
            </div>
        </div>

        <div class="total">
            Total: ${order.total.toLocaleString()} DA
        </div>

        <p>We will contact you soon to confirm the delivery details.</p>

        <div class="footer">
            <p>Best regards,<br><strong>OBSIDIAN WEAR Team</strong></p>
            <p>If you have any questions, please contact us.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}
