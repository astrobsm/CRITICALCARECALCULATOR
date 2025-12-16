# Deployment Guide

## Quick Deploy to Vercel (Easiest)

### Option 1: Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Clinical Critical Calculator"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings
   - Click "Deploy"
   - Done! Your app will be live in ~2 minutes

3. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Alternative Deployment Options

### Netlify

1. **Via GitHub**
   - Connect your GitHub repo at [netlify.com](https://netlify.com)
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Deploy site"

2. **Via CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

### AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Build settings (auto-detected):
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### Digital Ocean App Platform

1. Go to [Digital Ocean Apps](https://cloud.digitalocean.com/apps)
2. Click "Create App" → "GitHub"
3. Select your repository
4. Configure:
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Environment: Node.js 18+
5. Deploy

### Self-Hosted (VPS/Server)

```bash
# On your server
git clone <your-repo-url>
cd CRITICAL\ CARE\ CALCULATOR
npm install
npm run build

# Using PM2 for process management
npm install -g pm2
pm2 start npm --name "ccc" -- start
pm2 save
pm2 startup

# Or using screen/tmux
screen -S ccc
npm start
# Ctrl+A, D to detach
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Environment Variables

This app requires **NO environment variables** to run! All calculations are client-side.

Optional analytics (if you want to add):
```env
# .env.local (not required)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

---

## CI/CD with GitHub Actions

The project includes `.github/workflows/deploy.yml` for automatic deployments.

### Setup GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VERCEL_TOKEN`: Get from [Vercel Account Settings](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID`: Run `vercel link` and check `.vercel/project.json`
   - `VERCEL_PROJECT_ID`: Same file as above

Now every push to `main` automatically deploys to Vercel!

---

## Post-Deployment Checklist

✅ **Test PWA Installation**
- Open site on mobile device
- Click "Add to Home Screen"
- Verify offline functionality
- Test app icon and splash screen

✅ **Performance Check**
- Run [PageSpeed Insights](https://pagespeed.web.dev/)
- Target: 90+ score on mobile
- Check Core Web Vitals

✅ **Medical Validation**
- Test all calculators with known values
- Verify PDF exports
- Check safety warnings display correctly
- Validate correction rate limits

✅ **Browser Testing**
- Chrome (desktop & mobile)
- Safari (iOS)
- Firefox
- Edge

✅ **Security**
- Enable HTTPS (automatic on Vercel/Netlify)
- Check CSP headers
- Verify no sensitive data exposure

---

## Monitoring & Analytics (Optional)

### Add Google Analytics

1. Create GA4 property
2. Add to `app/layout.tsx`:

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## Troubleshooting

### Build Fails

**Error: Module not found**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**TypeScript errors**
```bash
npm run build -- --no-lint
```

### PWA Not Working

1. Check `manifest.json` is accessible at `/manifest.json`
2. Verify service worker is registered
3. Use Chrome DevTools → Application → Manifest
4. Clear cache and hard reload

### PDF Export Issues

**jsPDF not loading**
- Check network tab for errors
- Verify `jspdf` and `jspdf-autotable` are installed
- Try: `npm install jspdf jspdf-autotable --force`

---

## Performance Optimization

### Already Implemented
✅ Next.js 15 App Router (automatic code splitting)
✅ Static page generation
✅ Tailwind CSS purging
✅ Image optimization ready
✅ Font optimization (next/font)

### Additional Optimizations

**Enable Compression** (Vercel does this automatically)

For self-hosted, add to `next.config.js`:
```javascript
module.exports = {
  compress: true,
}
```

**Service Worker Enhancements**

Update `public/sw.js` to cache more resources:
```javascript
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/_next/static/css/*',
  '/_next/static/chunks/*',
];
```

---

## Support

For deployment issues:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [GitHub Issues](your-repo-url/issues)

---

**Last Updated:** December 2025
