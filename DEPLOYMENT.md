# Deployment Guide

This guide will help you deploy your personal website to various hosting platforms.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended) ⭐

Vercel is the creator of Next.js and provides the best hosting experience for Next.js apps.

**Pros:**
- Automatic deployments on git push
- Free SSL certificates
- Global CDN
- Zero configuration
- Preview deployments for PRs
- Free for personal projects

**Steps:**
1. Push your code to GitHub (already done!)
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your GitHub repository: `PranayK07/personal_website`
5. Click "Deploy" (no configuration needed!)
6. Your site will be live at `https://your-project-name.vercel.app`
7. Add a custom domain (optional)

**Command Line (Alternative):**
```bash
npm install -g vercel
vercel login
vercel
```

---

### Option 2: Netlify

Great alternative with similar features to Vercel.

**Steps:**
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up/login
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy site"
7. Your site will be live at `https://your-site.netlify.app`

---

### Option 3: GitHub Pages (Static Export)

Free hosting directly from your GitHub repository.

**Steps:**

1. Update `next.config.ts`:
```typescript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

2. Add deployment script to `package.json`:
```json
"scripts": {
  "deploy": "next build && touch out/.nojekyll && git add -f out && git commit -m 'Deploy' && git subtree push --prefix out origin gh-pages"
}
```

3. Run deployment:
```bash
npm run deploy
```

4. Enable GitHub Pages in repository settings:
   - Go to Settings → Pages
   - Source: gh-pages branch
   - Save

**Note:** Some features may not work with static export (like API routes).

---

### Option 4: AWS Amplify

Good for integration with other AWS services.

**Steps:**
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Build settings (auto-detected):
   - Build command: `npm run build`
   - Output directory: `.next`
5. Deploy

---

### Option 5: Railway

Simple and developer-friendly platform.

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Next.js and deploys
6. Your site will be live at `https://your-app.railway.app`

---

### Option 6: Render

Free tier available with automatic deploys.

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up/login
3. Click "New" → "Static Site"
4. Connect your GitHub repository
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Deploy

---

### Option 7: Self-Hosted (VPS)

For advanced users who want full control.

**Requirements:**
- A VPS (DigitalOcean, Linode, AWS EC2, etc.)
- Node.js installed
- A domain name (optional)

**Steps:**

1. SSH into your server:
```bash
ssh user@your-server-ip
```

2. Clone your repository:
```bash
git clone https://github.com/PranayK07/personal_website.git
cd personal_website
```

3. Install dependencies and build:
```bash
npm install
npm run build
```

4. Install PM2 (process manager):
```bash
npm install -g pm2
```

5. Start the application:
```bash
pm2 start npm --name "personal-website" -- start
pm2 save
pm2 startup
```

6. Set up Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

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

7. Set up SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d your-domain.com
```

---

## 🌐 Custom Domain Setup

### For Vercel:
1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### For Netlify:
1. Go to "Domain settings"
2. Click "Add custom domain"
3. Follow DNS configuration instructions

### DNS Configuration (General):
```
Type  | Name | Value
------|------|------
A     | @    | [Platform IP]
CNAME | www  | [Platform domain]
```

---

## 🔒 Environment Variables

If you add environment variables later:

### Vercel:
1. Project Settings → Environment Variables
2. Add variables
3. Redeploy

### Netlify:
1. Site Settings → Build & deploy → Environment
2. Add variables
3. Redeploy

---

## ⚡ Performance Tips

1. **Enable CDN**: Most platforms do this automatically
2. **Optimize Images**: Use Next.js Image component
3. **Enable Compression**: Usually automatic
4. **Set Cache Headers**: Configure in platform settings
5. **Monitor Performance**: Use Lighthouse or WebPageTest

---

## 📊 Analytics (Optional)

### Google Analytics:
1. Create GA4 property
2. Add tracking code to `app/layout.tsx`
3. Redeploy

### Vercel Analytics:
1. Enable in Vercel dashboard
2. Free for personal projects

---

## 🔄 Continuous Deployment

All recommended platforms support automatic deployment:

1. Push changes to GitHub
2. Platform automatically detects changes
3. Builds and deploys new version
4. Live in minutes!

**Example workflow:**
```bash
git add .
git commit -m "Update projects section"
git push origin main
# Auto-deploys! ✨
```

---

## 🆘 Troubleshooting

### Build Fails:
- Check build logs on platform
- Test locally: `npm run build`
- Ensure all dependencies are in `package.json`

### Site Not Loading:
- Check DNS propagation (can take 24-48 hours)
- Verify build completed successfully
- Check platform status page

### Changes Not Showing:
- Clear browser cache
- Check if deployment completed
- Force redeploy on platform

---

## 📝 Deployment Checklist

- [ ] All customization complete
- [ ] Tested locally (`npm run dev`)
- [ ] Production build works (`npm run build`)
- [ ] All links work
- [ ] Resume PDF is included
- [ ] Committed to GitHub
- [ ] Platform connected
- [ ] Site deployed
- [ ] Custom domain configured (optional)
- [ ] SSL enabled (automatic on most platforms)
- [ ] Analytics added (optional)

---

## 🎉 You're Live!

After deployment, share your website:
- Update your resume
- Add to LinkedIn profile
- Share on social media
- Add to GitHub profile README
- Include in email signature

---

**Need Help?** Check the platform-specific documentation or create an issue in the repository.
