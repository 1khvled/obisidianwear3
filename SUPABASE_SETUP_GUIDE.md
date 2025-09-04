# 🔧 Supabase Setup Guide for OBSIDIAN WEAR

## ✅ What I Fixed

1. **Removed hardcoded credentials** from `src/lib/supabaseDatabase.ts`
2. **Added proper environment variable validation**
3. **Updated API routes** to use Supabase instead of file storage
4. **Added Node.js runtime configuration** for Supabase compatibility
5. **Created test endpoint** to verify connection

## 🚀 Next Steps to Deploy

### 1. Set Environment Variables in Vercel

Go to your Vercel dashboard → Project → Settings → Environment Variables and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zrmxcjklkthpyanfslsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybXhjamtsa3RocHlhbmZzbHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDYxMzAsImV4cCI6MjA3MjQ4MjEzMH0.2Tjh9pPzc6BUGoV3lDUBymXzE_dvAGs1O_WewTdetE0
```

**Important**: Make sure to add these to **ALL environments** (Production, Preview, Development).

### 2. Run Database Schema Update

Execute the `supabase-update.sql` file in your Supabase SQL Editor to add missing columns:

```sql
-- The file is already prepared and will add missing columns safely
-- Run this in Supabase Dashboard → SQL Editor
```

### 3. Test the Connection

After deploying, test your Supabase connection:

```bash
# Test endpoint
GET https://your-vercel-app.vercel.app/api/test-supabase
```

### 4. Verify API Routes

Test your updated API routes:

```bash
# Get products
GET https://your-vercel-app.vercel.app/api/products

# Create product
POST https://your-vercel-app.vercel.app/api/products
```

## 🔍 Troubleshooting

### If you get "Missing Supabase environment variables":
- Check that environment variables are set in Vercel
- Redeploy after adding environment variables
- Ensure variables are added to all environments

### If you get "Supabase connection failed":
- Verify your Supabase URL and key are correct
- Check if your Supabase project is active
- Ensure the database tables exist (run the SQL schema)

### If you get "401 Unauthorized":
- You might be using the wrong key (anon vs service role)
- Check that your Supabase project allows the operations

## 📁 Files Modified

- `src/lib/supabaseDatabase.ts` - Removed hardcoded credentials
- `src/app/api/products/route.ts` - Updated to use Supabase
- `src/app/api/orders/route.ts` - Updated to use Supabase
- `src/app/api/test-supabase/route.ts` - New test endpoint

## 🎯 Expected Result

After following these steps:
1. Your app will connect to Supabase successfully
2. Data will persist across deployments
3. Admin panel will work with real database
4. No more hardcoded credentials (security fixed)

## 🚨 Security Note

The hardcoded credentials have been removed from your code. Make sure to:
1. Never commit `.env.local` files
2. Always use environment variables in production
3. Rotate your Supabase keys if they were exposed

---

**Ready to deploy!** 🚀
