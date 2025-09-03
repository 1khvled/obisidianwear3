# 🚀 Deployment Guide - OBSIDIAN WEAR

## Vercel Deployment (Recommended)

### 1. Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit - OBSIDIAN WEAR e-commerce store"
   git push origin main
   ```

### 2. Deploy to Vercel

1. **Go to [Vercel](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure project**:
   - Framework Preset: `Next.js`
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

### 3. Environment Variables (Optional)

If you need to customize settings, add these in Vercel dashboard:

```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=OBSIDIAN WEAR
ADMIN_USERNAME=khvled
ADMIN_PASSWORD=Dzt3ch456@
WHATSAPP_NUMBER=0672536920
INSTAGRAM_USERNAME=obsidianwear_dz
TIKTOK_USERNAME=obsidianwear.dz
```

### 4. Deploy

1. **Click "Deploy"**
2. **Wait for build to complete** (2-3 minutes)
3. **Your site is live!** 🎉

## GitHub Actions (Automatic Deployment)

The project includes GitHub Actions for automatic deployment:

1. **Add Vercel secrets to GitHub**:
   - Go to your GitHub repository
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN`: Your Vercel API token
     - `ORG_ID`: Your Vercel organization ID
     - `PROJECT_ID`: Your Vercel project ID

2. **Automatic deployment**:
   - Every push to `main` branch triggers deployment
   - Pull requests create preview deployments

## Manual Deployment Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "obsidian-wear" -- start
```

## Performance Optimization

The project is optimized for production:

- ✅ **Image Optimization**: Next.js Image component with WebP/AVIF
- ✅ **Code Splitting**: Automatic route-based splitting
- ✅ **Compression**: Gzip compression enabled
- ✅ **Caching**: Static assets cached for 1 year
- ✅ **Security Headers**: XSS, CSRF protection
- ✅ **Bundle Analysis**: Use `npm run build:analyze`

## Domain Setup

### Custom Domain (Optional)

1. **In Vercel Dashboard**:
   - Go to your project
   - Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Configuration**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

## Monitoring & Analytics

### Vercel Analytics (Free)
- Built-in performance monitoring
- Real user metrics
- Core Web Vitals tracking

### Google Analytics (Optional)
Add to `next.config.js`:
```javascript
module.exports = {
  // ... existing config
  env: {
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
}
```

## Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run type-check

# Fix linting issues
npm run lint:fix
```

### Performance Issues
```bash
# Analyze bundle size
npm run build:analyze

# Check for unused dependencies
npx depcheck
```

### Common Issues

1. **Build fails**: Check Node.js version (requires 18+)
2. **Images not loading**: Verify image paths and formats
3. **Admin not working**: Check localStorage in browser dev tools
4. **Cart not persisting**: Clear browser cache and localStorage

## Support

- **WhatsApp**: 0672536920
- **Instagram**: @obsidianwear_dz
- **TikTok**: @obsidianwear.dz

---

**Ready to launch!** 🚀 Your OBSIDIAN WEAR store is optimized for production deployment.
