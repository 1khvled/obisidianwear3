"use strict";(()=>{var e={};e.id=7367,e.ids=[7367],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},9523:e=>{e.exports=require("dns")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},71911:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>b,originalPathname:()=>x,patchFetch:()=>w,requestAsyncStorage:()=>v,routeModule:()=>h,serverHooks:()=>y,staticGenerationAsyncStorage:()=>g,staticGenerationBailout:()=>f});var a={};t.r(a),t.d(a,{DELETE:()=>m,GET:()=>p,POST:()=>c,PUT:()=>u});var o=t(95419),s=t(69108),i=t(99678),d=t(78070),n=t(4750),l=t(4442);async function p(){try{let{data:e,error:r}=await n.OQ.from("made_to_order_orders").select(`
        *,
        made_to_order_products (
          id,
          name,
          image,
          images,
          description,
          price
        )
      `).order("order_date",{ascending:!1});if(r)return d.Z.json({error:"Failed to fetch orders"},{status:500});let t=d.Z.json(e);return t.headers.set("Cache-Control","no-cache, no-store, must-revalidate"),t.headers.set("Pragma","no-cache"),t.headers.set("Expires","0"),t}catch(e){return d.Z.json({error:"Internal server error"},{status:500})}}async function c(e){try{let{productId:r,customerName:t,customerPhone:a,customerEmail:o,customerAddress:s,customerCity:i,wilayaId:p,wilayaName:c,selectedSize:u,selectedColor:m,quantity:h,unitPrice:v,whatsappContact:g,notes:y}=await e.json();if(!r||!t||!a||!s||!p||!u||!m||!h||!v)return d.Z.json({error:"Missing required fields"},{status:400});let b=v*h,{data:f,error:x}=await n.OQ.from("made_to_order_orders").insert({product_id:r,customer_name:t,customer_phone:a,customer_email:o,customer_address:s,wilaya_id:p,wilaya_name:c,selected_size:u,selected_color:m,quantity:h,unit_price:v,total_price:b,deposit_amount:.5*b,remaining_amount:.5*b,shipping_time:"20-18 days",status:"pending",whatsapp_contact:g,notes:y}).select().single();if(x)return d.Z.json({error:"Failed to create order",details:x.message},{status:500});if(o&&f){let e={id:f.id,customerName:t,customerEmail:o,customerPhone:a,customerAddress:s,customerCity:i||"",wilayaId:p,wilayaName:c,productId:r,productName:"Special Order Product",productImage:"",selectedSize:u,selectedColor:m,quantity:h,subtotal:b,shippingCost:0,total:b,shippingType:"homeDelivery",paymentMethod:"cod",paymentStatus:"pending",status:"pending",orderDate:new Date,notes:y||"",trackingNumber:"",estimatedDelivery:"20-18 days",createdAt:new Date,updatedAt:new Date};(0,l.b)(e).catch(e=>{})}return d.Z.json(f,{status:201})}catch(e){return d.Z.json({error:"Internal server error"},{status:500})}}async function u(e){try{let{id:r,status:t,estimatedCompletionDate:a,notes:o}=await e.json();if(!r)return d.Z.json({error:"Order ID is required"},{status:400});let s={};t&&(s.status=t),a&&(s.estimated_completion_date=a),void 0!==o&&(s.notes=o);let{data:i,error:l}=await n.OQ.from("made_to_order_orders").update(s).eq("id",r).select().single();if(l)return d.Z.json({error:"Failed to update order"},{status:500});return d.Z.json(i)}catch(e){return d.Z.json({error:"Internal server error"},{status:500})}}async function m(e){try{let{searchParams:r}=new URL(e.url),t=r.get("id");if(!t)return d.Z.json({error:"Order ID is required"},{status:400});let{error:a}=await n.OQ.from("made_to_order_orders").delete().eq("id",t);if(a)return d.Z.json({error:"Failed to delete order"},{status:500});return d.Z.json({message:"Order deleted successfully"})}catch(e){return d.Z.json({error:"Internal server error"},{status:500})}}let h=new o.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/made-to-order/orders/route",pathname:"/api/made-to-order/orders",filename:"route",bundlePath:"app/api/made-to-order/orders/route"},resolvedPagePath:"C:\\Users\\HP\\Desktop\\Obsidian wear\\projectt\\src\\app\\api\\made-to-order\\orders\\route.ts",nextConfigOutput:"standalone",userland:a}),{requestAsyncStorage:v,staticGenerationAsyncStorage:g,serverHooks:y,headerHooks:b,staticGenerationBailout:f}=h,x="/api/made-to-order/orders/route";function w(){return(0,i.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:g})}},4442:(e,r,t)=>{async function a(e){try{let r={to:e.customerEmail,subject:"Your Order Confirmation - OBSIDIAN WEAR",text:`
Order Confirmation - OBSIDIAN WEAR

Dear ${e.customerName},

Thank you for your order! Your order has been confirmed and we'll start processing it immediately.

Order Details:
- Order ID: #${e.id}
- Date: ${e.orderDate}
- Product: ${e.product.name}
- Size: ${e.product.selectedSize}
- Color: ${e.product.selectedColor}
- Quantity: ${e.product.quantity}
- Total: ${e.total.toLocaleString()} DZD

Shipping Information:
- Shipping Type: ${"domicile"===e.delivery.option?"Home Delivery":"Stop Desk"}
- Wilaya: ${e.wilaya}
- Address: ${e.customerAddress}
- Shipping Cost: ${e.delivery.cost.toLocaleString()} DZD

Payment Method: Cash on Delivery

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
                    <span>${e.orderDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Product:</span>
                    <span>${e.product.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Size:</span>
                    <span>${e.product.selectedSize}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Color:</span>
                    <span>${e.product.selectedColor}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantity:</span>
                    <span>${e.product.quantity}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Shipping Information</h3>
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Shipping Type:</span>
                    <span>${"domicile"===e.delivery.option?"Home Delivery":"Stop Desk"}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Wilaya:</span>
                    <span>${e.wilaya}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Address:</span>
                    <span>${e.customerAddress}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Shipping Cost:</span>
                    <span>${e.delivery.cost.toLocaleString()} DZD</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Payment Information</h3>
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span>Cash on Delivery</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Subtotal:</span>
                    <span>${(e.product.price*e.product.quantity).toLocaleString()} DZD</span>
                </div>
            </div>
        </div>

        <div class="total">
            Total: ${e.total.toLocaleString()} DZD
        </div>

        <p>We will contact you soon to confirm the delivery details.</p>

        <div class="footer">
            <p>Best regards,<br><strong>OBSIDIAN WEAR Team</strong></p>
            <p>If you have any questions, please contact us.</p>
        </div>
    </div>
</body>
</html>
  `.trim()},a=t(68140).createTransport({service:"gmail",auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}}),o={from:{name:"OBSIDIAN WEAR",address:process.env.GMAIL_USER||""},to:r.to,subject:r.subject,text:r.text,html:r.html};return await a.sendMail(o),!0}catch(e){return!1}}t.d(r,{b:()=>a})}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[1638,6206,2409,8140,4750],()=>t(71911));module.exports=a})();