"use strict";(()=>{var e={};e.id=9146,e.ids=[9146],e.modules={30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},32081:e=>{e.exports=require("child_process")},6113:e=>{e.exports=require("crypto")},9523:e=>{e.exports=require("dns")},82361:e=>{e.exports=require("events")},57147:e=>{e.exports=require("fs")},13685:e=>{e.exports=require("http")},95687:e=>{e.exports=require("https")},41808:e=>{e.exports=require("net")},22037:e=>{e.exports=require("os")},71017:e=>{e.exports=require("path")},85477:e=>{e.exports=require("punycode")},12781:e=>{e.exports=require("stream")},24404:e=>{e.exports=require("tls")},57310:e=>{e.exports=require("url")},73837:e=>{e.exports=require("util")},59796:e=>{e.exports=require("zlib")},12773:(e,t,s)=>{s.r(t),s.d(t,{headerHooks:()=>w,originalPathname:()=>x,patchFetch:()=>A,requestAsyncStorage:()=>v,routeModule:()=>g,serverHooks:()=>b,staticGenerationAsyncStorage:()=>y,staticGenerationBailout:()=>f});var r={};s.r(r),s.d(r,{GET:()=>m,POST:()=>h,runtime:()=>p});var a=s(95419),i=s(69108),o=s(99678),n=s(78070),l=s(4750),d=s(4627),c=s(50316),u=s(4442);let p="nodejs";async function m(){try{console.log("Orders API: GET request started");let e=await (0,l.AU)();return console.log("Orders API: GET request - returning",e.length,"orders"),n.Z.json({success:!0,data:e,count:e.length,timestamp:Date.now()})}catch(e){return console.error("Orders API: GET error:",e),console.error("Orders API: Error details:",{message:e instanceof Error?e.message:"Unknown error",stack:e instanceof Error?e.stack:void 0}),n.Z.json({success:!1,error:"Failed to fetch orders",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}let h=(0,d.QO)(async e=>{try{let t=await e.json();console.log("Orders API: Received order data:",t);let s=c.v.validateRequired(t,["customerName","productId","total"]);if(!s.isValid)return n.Z.json({success:!1,error:`Missing required fields: ${s.missingFields.join(", ")}`},{status:400});if(t.customerEmail&&!c.v.isValidEmail(t.customerEmail))return n.Z.json({success:!1,error:"Invalid email format"},{status:400});if(t.customerPhone&&!c.v.isValidPhone(t.customerPhone))return n.Z.json({success:!1,error:"Invalid phone number format"},{status:400});if(!c.v.isValidNumber(t.total,0,999999))return n.Z.json({success:!1,error:"Total must be a valid number between 0 and 999999"},{status:400});if(!c.v.isValidNumber(t.quantity,1,100))return n.Z.json({success:!1,error:"Quantity must be between 1 and 100"},{status:400});let r=c.v.sanitizeOrderData(t),a={id:`ORD-${Date.now()}`,customerName:r.customerName,customerEmail:r.customerEmail,customerPhone:r.customerPhone,customerAddress:r.customerAddress,customerCity:r.customerCity||"",wilayaId:r.wilayaId||0,wilayaName:r.wilayaName||"",productId:r.productId,productName:r.productName,productImage:r.productImage||"",selectedSize:r.selectedSize,selectedColor:r.selectedColor,quantity:r.quantity,subtotal:r.subtotal||0,shippingCost:r.shippingCost||0,total:r.total,shippingType:r.shippingType||"homeDelivery",paymentMethod:r.paymentMethod||"cod",paymentStatus:"pending",status:"pending",orderDate:new Date,notes:r.notes,trackingNumber:"",estimatedDelivery:r.estimatedDelivery||"",createdAt:new Date,updatedAt:new Date},i=await (0,l.fS)(a),o=await (0,l.nE)(a);return o||console.warn("Orders API: Failed to deduct stock for order:",a.id),i.customerEmail&&(0,u.b)(i).catch(e=>{console.error("Orders API: Failed to send confirmation email:",e)}),console.log("Orders API: POST request - created order:",a.id),n.Z.json({success:!0,data:i,message:"Order created successfully",stockDeducted:o,timestamp:Date.now()},{status:201})}catch(e){return console.error("Orders API: POST error:",e),n.Z.json({success:!1,error:"Failed to create order"},{status:500})}}),g=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/orders/route",pathname:"/api/orders",filename:"route",bundlePath:"app/api/orders/route"},resolvedPagePath:"C:\\Users\\HP\\Desktop\\projectt\\src\\app\\api\\orders\\route.ts",nextConfigOutput:"standalone",userland:r}),{requestAsyncStorage:v,staticGenerationAsyncStorage:y,serverHooks:b,headerHooks:w,staticGenerationBailout:f}=g,x="/api/orders/route";function A(){return(0,o.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:y})}},4627:(e,t,s)=>{s.d(t,{QO:()=>o});var r=s(78070);class a{constructor(e=6e4,t=100){this.requests=new Map,this.windowMs=e,this.maxRequests=t}isAllowed(e){let t=Date.now(),s=this.requests.get(e);return!s||t>s.resetTime?(this.requests.set(e,{count:1,resetTime:t+this.windowMs}),{allowed:!0,remaining:this.maxRequests-1,resetTime:t+this.windowMs}):s.count>=this.maxRequests?{allowed:!1,remaining:0,resetTime:s.resetTime}:(s.count++,this.requests.set(e,s),{allowed:!0,remaining:this.maxRequests-s.count,resetTime:s.resetTime})}cleanup(){let e=Date.now();this.requests.forEach((t,s)=>{e>t.resetTime&&this.requests.delete(s)})}}let i=new a(6e4,100);function o(e){return async(t,...s)=>{let a=new URL(t.url);if(["/api/maintenance","/api/test-db","/api/test-supabase"].some(e=>a.pathname.startsWith(e)))return e(t,...s);let o=function(e,t){let s=t.isAllowed(e);.01>Math.random()&&t.cleanup();let r={"X-RateLimit-Limit":t.maxRequests.toString(),"X-RateLimit-Remaining":s.remaining.toString(),"X-RateLimit-Reset":new Date(s.resetTime).toISOString()};return{allowed:s.allowed,headers:r}}(t.ip||t.headers.get("x-forwarded-for")||"unknown",i);return o.allowed?!function(e){let t=e.headers.get("authorization");return!!(t&&t.startsWith("Bearer "))&&t.substring(7)===(process.env.NEXT_PUBLIC_API_AUTH_TOKEN||"obsidian-api-token-2025")}(t)?r.Z.json({success:!1,error:"Unauthorized",message:"Authentication required"},{status:401,headers:o.headers}):e(t,...s):r.Z.json({success:!1,error:"Too Many Requests",message:"Rate limit exceeded. Please try again later."},{status:429,headers:o.headers})}}new a(3e5,5)},4442:(e,t,s)=>{async function r(e){try{let t={to:e.customerEmail,subject:"Your Order Confirmation - OBSIDIAN WEAR",text:`
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
  `.trim()},r=s(68140).createTransport({service:"gmail",auth:{user:process.env.GMAIL_USER,pass:process.env.GMAIL_APP_PASSWORD}}),a={from:{name:"OBSIDIAN WEAR",address:process.env.GMAIL_USER||""},to:t.to,subject:t.subject,text:t.text,html:t.html},i=await r.sendMail(a);return console.log("Order confirmation email sent successfully:",i.messageId),!0}catch(e){return console.error("Error sending order confirmation email:",e),!1}}s.d(t,{b:()=>r})},50316:(e,t,s)=>{s.d(t,{v:()=>r});class r{static sanitizeHtml(e){return"string"!=typeof e?"":e.replace(/[<>]/g,"").replace(/javascript:/gi,"").replace(/on\w+=/gi,"").trim()}static isValidEmail(e){return"string"==typeof e&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())}static isValidPhone(e){return"string"==typeof e&&/^[\+]?[0-9\s\-\(\)]{8,}$/.test(e.trim())}static validateRequired(e,t){let s=[];for(let r of t)e[r]&&("string"!=typeof e[r]||""!==e[r].trim())||s.push(r);return{isValid:0===s.length,missingFields:s}}static validateLength(e,t,s){if("string"!=typeof e)return!1;let r=e.trim().length;return r>=t&&r<=s}static isValidNumber(e,t,s){let r=Number(e);return!isNaN(r)&&(void 0===t||!(r<t))&&(void 0===s||!(r>s))}static sanitizeProductData(e){return{...e,name:this.sanitizeHtml(e.name||""),description:this.sanitizeHtml(e.description||""),category:this.sanitizeHtml(e.category||""),price:this.isValidNumber(e.price,0,999999)?Number(e.price):0,stock:e.stock||{},image:this.sanitizeHtml(e.image||""),colors:Array.isArray(e.colors)?e.colors.map(e=>this.sanitizeHtml(e)):[],sizes:Array.isArray(e.sizes)?e.sizes.map(e=>this.sanitizeHtml(e)):[]}}static sanitizeOrderData(e){return{...e,customerName:this.sanitizeHtml(e.customerName||""),customerEmail:this.isValidEmail(e.customerEmail)?e.customerEmail.trim():"",customerPhone:this.isValidPhone(e.customerPhone)?e.customerPhone.trim():"",customerAddress:this.sanitizeHtml(e.customerAddress||""),productName:this.sanitizeHtml(e.productName||""),selectedSize:this.sanitizeHtml(e.selectedSize||""),selectedColor:this.sanitizeHtml(e.selectedColor||""),notes:this.sanitizeHtml(e.notes||""),quantity:this.isValidNumber(e.quantity,1,100)?Number(e.quantity):1,total:this.isValidNumber(e.total,0,999999)?Number(e.total):0}}}}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),r=t.X(0,[1638,6206,2409,8140,4750],()=>s(12773));module.exports=r})();