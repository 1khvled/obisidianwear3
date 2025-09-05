# Deployment Instructions

## Vercel Deployment

### 1. Environment Variables Setup

You need to set the following environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Get your project URL and anon key from the API settings
3. Run the SQL script in `database-setup.sql` to create the required tables

### 3. Database Tables Required

The following tables need to be created in your Supabase database:

- `products`
- `orders` 
- `customers`
- `maintenance_status`
- `wilaya_tariffs`

### 4. Redeploy

After setting the environment variables, redeploy your Vercel project.

## Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Run `npm run dev`
