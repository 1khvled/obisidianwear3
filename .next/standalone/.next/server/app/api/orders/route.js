"use strict";(()=>{var e={};e.id=9146,e.ids=[9146],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},9523:e=>{e.exports=require("dns")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},19655:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>y,originalPathname:()=>b,patchFetch:()=>f,requestAsyncStorage:()=>m,routeModule:()=>u,serverHooks:()=>v,staticGenerationAsyncStorage:()=>h,staticGenerationBailout:()=>g});var s={};r.r(s),r.d(s,{GET:()=>p,POST:()=>c});var o=r(95419),a=r(69108),i=r(99678),d=r(78070),n=r(4750),l=r(4442);async function c(e){try{let t=await e.json(),r=t.items&&t.items.length>0,s=t.product,o=t.items&&t.items.length>0;if(!s&&!o||!t.customer||!t.delivery)return d.Z.json({success:!1,error:"Missing required order data"},{status:400});if(!/^0\d{9}$/.test(t.customer.phone))return d.Z.json({success:!1,error:"Invalid phone number format. Must start with 0 and be 10 digits."},{status:400});for(let e of r?t.items:[t.product])if(!e.quantity||e.quantity<=0)return d.Z.json({success:!1,error:"Quantity must be greater than 0"},{status:400});let a=r?t.items:[t.product];for(let e of a){let{data:t,error:r}=await n.OQ.from("products").select("*").eq("id",e.id).single();if(r||!t)return d.Z.json({success:!1,error:`Product ${e.name} not found`},{status:404});if(t.stock){let r=t.stock?.[e.selectedSize]?.[e.selectedColor]||0,s=e.quantity;if(r<s)return d.Z.json({success:!1,error:`${e.name} - Size ${e.selectedSize} in ${e.selectedColor}: Only ${r} available (requested ${s})`},{status:400})}}let i=`order_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,c=`customer_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,p=a.map(e=>({productId:e.id,product_name:e.name,product_price:e.price,selectedSize:e.selectedSize,selectedColor:e.selectedColor,quantity:e.quantity})),u={id:i,customer_id:c,items:p,total:r?t.total:t.product.price*t.product.quantity+t.delivery.cost,shipping_cost:t.delivery.cost,shipping_type:t.delivery.option,payment_method:"cod",payment_status:"pending",status:"pending",order_date:new Date().toISOString(),created_at:new Date().toISOString(),updated_at:new Date().toISOString()},m={id:c,name:t.customer.name,email:t.customer.email||`${t.customer.phone}@temp.com`,phone:t.customer.phone,address:t.customer.address||"Not provided",city:t.customer.wilaya,wilaya:t.customer.wilaya,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};try{let e=await n.OQ.from("customers").upsert([m],{onConflict:"email"}).select().single();e.data,e.error}catch(e){}let{data:h,error:v}=await n.OQ.from("orders").insert([u]).select().single();if(v)return d.Z.json({success:!1,error:"Failed to save order to database",details:v.message},{status:500});if(t.customer.email&&t.customer.email!==`${t.customer.phone}@temp.com`)try{let e={id:h.id,customerName:t.customer.name,customerEmail:t.customer.email,customerPhone:t.customer.phone,customerAddress:t.customer.address,wilaya:t.customer.wilaya,product:r?{name:`${a.length} items`,price:a.reduce((e,t)=>e+t.price*t.quantity,0),selectedSize:"Multiple",selectedColor:"Multiple",quantity:a.reduce((e,t)=>e+t.quantity,0),items:a.map(e=>({name:e.name,size:e.selectedSize,color:e.selectedColor,quantity:e.quantity,price:e.price}))}:{name:t.product.name,price:t.product.price,selectedSize:t.product.selectedSize,selectedColor:t.product.selectedColor,quantity:t.product.quantity},delivery:{option:t.delivery.option,cost:t.delivery.cost},total:r?t.total:t.product.total,orderDate:new Date().toLocaleDateString(),status:"pending"};await (0,l.b)(e)}catch(e){}return d.Z.json({success:!0,order:h,message:"Order placed successfully"})}catch(e){return d.Z.json({success:!1,error:"Internal server error"},{status:500})}}async function p(){try{let{data:e,error:t}=await n.OQ.from("orders").select("*").order("created_at",{ascending:!1});if(t)return d.Z.json({success:!1,error:"Failed to fetch orders"},{status:500});return d.Z.json({success:!0,orders:e||[],count:e?.length||0})}catch(e){return d.Z.json({success:!1,error:"Internal server error"},{status:500})}}let u=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/orders/route",pathname:"/api/orders",filename:"route",bundlePath:"app/api/orders/route"},resolvedPagePath:"C:\\Users\\HP\\Desktop\\Obsidian wear\\projectt\\src\\app\\api\\orders\\route.ts",nextConfigOutput:"standalone",userland:s}),{requestAsyncStorage:m,staticGenerationAsyncStorage:h,serverHooks:v,headerHooks:y,staticGenerationBailout:g}=u,b="/api/orders/route";function f(){return(0,i.patchFetch)({serverHooks:v,staticGenerationAsyncStorage:h})}},4442:(e,t,r)=>{async function s(e){try{let t={to:e.customerEmail,subject:"Your Order Confirmation - OBSIDIAN WEAR",text:`
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
  `.trim()},s=r(68140).createTransport({service:"gmail",auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}}),o={from:{name:"OBSIDIAN WEAR",address:process.env.GMAIL_USER||""},to:t.to,subject:t.subject,text:t.text,html:t.html};return await s.sendMail(o),!0}catch(e){return!1}}r.d(t,{b:()=>s})}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[1638,6206,2409,8140,4750],()=>r(19655));module.exports=s})();