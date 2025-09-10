"use strict";(()=>{var e={};e.id=7367,e.ids=[7367],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},9523:e=>{e.exports=require("dns")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},61788:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>f,originalPathname:()=>x,patchFetch:()=>w,requestAsyncStorage:()=>h,routeModule:()=>g,serverHooks:()=>y,staticGenerationAsyncStorage:()=>v,staticGenerationBailout:()=>b});var o={};t.r(o),t.d(o,{DELETE:()=>m,GET:()=>c,POST:()=>p,PUT:()=>u});var a=t(95419),s=t(69108),i=t(99678),d=t(78070),n=t(4750),l=t(4442);async function c(){try{let{data:e,error:r}=await n.OQ.from("made_to_order_orders").select(`
        *,
        made_to_order_products (
          id,
          name,
          image,
          images,
          description,
          price
        )
      `).order("order_date",{ascending:!1});if(r)return console.error("Error fetching made-to-order orders:",r),d.Z.json({error:"Failed to fetch orders"},{status:500});return d.Z.json(e)}catch(e){return console.error("Error in made-to-order orders GET:",e),d.Z.json({error:"Internal server error"},{status:500})}}async function p(e){try{let r=await e.json();console.log("Received order data:",r);let{productId:t,customerName:o,customerPhone:a,customerEmail:s,customerAddress:i,customerCity:c,wilayaId:p,wilayaName:u,selectedSize:m,selectedColor:g,quantity:h,unitPrice:v,whatsappContact:y,notes:f}=r;if(!t||!o||!a||!i||!p||!m||!g||!h||!v)return console.error("Missing required fields:",{productId:!!t,customerName:!!o,customerPhone:!!a,customerAddress:!!i,wilayaId:!!p,selectedSize:!!m,selectedColor:!!g,quantity:!!h,unitPrice:!!v}),d.Z.json({error:"Missing required fields"},{status:400});let b=v*h,x={product_id:t,customer_name:o,customer_phone:a,customer_email:s,customer_address:i,wilaya_id:p,wilaya_name:u,selected_size:m,selected_color:g,quantity:h,unit_price:v,total_price:b,deposit_amount:.5*b,remaining_amount:.5*b,shipping_time:"20-18 days",status:"pending",whatsapp_contact:y,notes:f};console.log("Inserting order data:",x);let{data:w,error:D}=await n.OQ.from("made_to_order_orders").insert(x).select().single();if(D)return console.error("Error creating made-to-order order:",D),console.error("Error details:",{message:D.message,details:D.details,hint:D.hint,code:D.code}),d.Z.json({error:"Failed to create order",details:D.message},{status:500});if(s&&w){let e={id:w.id,customerName:o,customerEmail:s,customerPhone:a,customerAddress:i,customerCity:c||"",wilayaId:p,wilayaName:u,productId:t,productName:"Special Order Product",productImage:"",selectedSize:m,selectedColor:g,quantity:h,subtotal:b,shippingCost:0,total:b,shippingType:"homeDelivery",paymentMethod:"cod",paymentStatus:"pending",status:"pending",orderDate:new Date,notes:f||"",trackingNumber:"",estimatedDelivery:"20-18 days",createdAt:new Date,updatedAt:new Date};(0,l.b)(e).catch(e=>{console.error("Made-to-order API: Failed to send confirmation email:",e)})}return d.Z.json(w,{status:201})}catch(e){return console.error("Error in made-to-order orders POST:",e),d.Z.json({error:"Internal server error"},{status:500})}}async function u(e){try{let{id:r,status:t,estimatedCompletionDate:o,notes:a}=await e.json();if(!r)return d.Z.json({error:"Order ID is required"},{status:400});let s={};t&&(s.status=t),o&&(s.estimated_completion_date=o),void 0!==a&&(s.notes=a);let{data:i,error:l}=await n.OQ.from("made_to_order_orders").update(s).eq("id",r).select().single();if(l)return console.error("Error updating made-to-order order:",l),d.Z.json({error:"Failed to update order"},{status:500});return d.Z.json(i)}catch(e){return console.error("Error in made-to-order orders PUT:",e),d.Z.json({error:"Internal server error"},{status:500})}}async function m(e){try{let{searchParams:r}=new URL(e.url),t=r.get("id");if(!t)return d.Z.json({error:"Order ID is required"},{status:400});let{error:o}=await n.OQ.from("made_to_order_orders").delete().eq("id",t);if(o)return console.error("Error deleting made-to-order order:",o),d.Z.json({error:"Failed to delete order"},{status:500});return d.Z.json({message:"Order deleted successfully"})}catch(e){return console.error("Error in made-to-order orders DELETE:",e),d.Z.json({error:"Internal server error"},{status:500})}}let g=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/made-to-order/orders/route",pathname:"/api/made-to-order/orders",filename:"route",bundlePath:"app/api/made-to-order/orders/route"},resolvedPagePath:"C:\\Users\\HP\\Desktop\\projectt\\src\\app\\api\\made-to-order\\orders\\route.ts",nextConfigOutput:"standalone",userland:o}),{requestAsyncStorage:h,staticGenerationAsyncStorage:v,serverHooks:y,headerHooks:f,staticGenerationBailout:b}=g,x="/api/made-to-order/orders/route";function w(){return(0,i.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:v})}},4442:(e,r,t)=>{async function o(e){try{let r={to:e.customerEmail,subject:"Your Order Confirmation - OBSIDIAN WEAR",text:`
Order Confirmation - OBSIDIAN WEAR

Dear ${e.customerName},

Thank you for your order! Your order has been confirmed and we'll start processing it immediately.

Order Details:
- Order ID: #${e.id}
- Date: ${new Date(e.orderDate).toLocaleDateString()}
- Product: ${e.productName}
- Size: ${e.selectedSize}
- Color: ${e.selectedColor}
- Quantity: ${e.quantity}
- Total: ${e.total.toLocaleString()} DA

Shipping Information:
- Shipping Type: ${"homeDelivery"===e.shippingType?"Home Delivery":"Stop Desk"}
- Wilaya: ${e.wilayaName}
- City: ${e.customerCity}
- Address: ${e.customerAddress}
- Shipping Cost: ${e.shippingCost.toLocaleString()} DA

Payment Method: ${"cod"===e.paymentMethod?"Cash on Delivery":"Bank Transfer"}

We will contact you soon to confirm the delivery details.

Best regards,
OBSIDIAN WEAR Team
  `.trim(),html:`
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
            <div class="order-id">#${e.id}</div>
        </div>

        <p>Dear <strong>${e.customerName}</strong>,</p>
        
        <p>Thank you for your order! Your order has been confirmed and we'll start processing it immediately.</p>

        <div class="section">
            <h3>Order Details</h3>
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    <span>#${e.id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span>${new Date(e.orderDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Product:</span>
                    <span>${e.productName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Size:</span>
                    <span>${e.selectedSize}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Color:</span>
                    <span>${e.selectedColor}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantity:</span>
                    <span>${e.quantity}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Shipping Information</h3>
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Shipping Type:</span>
                    <span>${"homeDelivery"===e.shippingType?"Home Delivery":"Stop Desk"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Wilaya:</span>
                    <span>${e.wilayaName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">City:</span>
                    <span>${e.customerCity}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span>${e.customerAddress}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Shipping Cost:</span>
                    <span>${e.shippingCost.toLocaleString()} DA</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Payment Information</h3>
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span>${"cod"===e.paymentMethod?"Cash on Delivery":"Bank Transfer"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Subtotal:</span>
                    <span>${e.subtotal.toLocaleString()} DA</span>
                </div>
            </div>
        </div>

        <div class="total">
            Total: ${e.total.toLocaleString()} DA
        </div>

        <p>We will contact you soon to confirm the delivery details.</p>

        <div class="footer">
            <p>Best regards,<br><strong>OBSIDIAN WEAR Team</strong></p>
            <p>If you have any questions, please contact us.</p>
        </div>
    </div>
</body>
</html>
  `.trim()},o=t(68140).createTransport({service:"gmail",auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}}),a={from:{name:"OBSIDIAN WEAR",address:process.env.GMAIL_USER||""},to:r.to,subject:r.subject,text:r.text,html:r.html},s=await o.sendMail(a);return console.log("Order confirmation email sent successfully:",s.messageId),!0}catch(e){return console.error("Error sending order confirmation email:",e),!1}}t.d(r,{b:()=>o})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),o=r.X(0,[1638,6206,2409,8140,4750],()=>t(61788));module.exports=o})();