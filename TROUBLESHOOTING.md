# Troubleshooting Guide

## Common Issues and Solutions

### CSS Not Loading on GitHub Pages 🎨

**Symptoms:**
- Website content (text, buttons, images) loads but has no styling
- Browser console shows 404 errors for CSS files
- Files like `/_next/static/chunks/*.css` return 404

**Root Cause:**
The `basePath` in `next.config.ts` doesn't match your repository name.

**Solution:**
Ensure `basePath` in `next.config.ts` matches your repository name:

```typescript
// For repository: https://github.com/PranayK07/personal_website
// Deployed at: https://pranayk07.github.io/personal_website/

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/personal_website',  // Must match repository name!
  trailingSlash: true,
};
```

**Why This Happens:**
- GitHub Pages serves your site at `https://username.github.io/repository-name/`
- Without the correct `basePath`, Next.js references assets from the root (`/_next/...`)
- With `basePath: '/personal_website'`, assets are correctly referenced from `/personal_website/_next/...`

**How to Fix:**
1. Open `next.config.ts`
2. Set `basePath: '/personal_website'` (or your repository name)
3. Commit and push changes
4. Wait for GitHub Actions to rebuild and deploy

---

### Images Not Displaying 🖼️

**Solution:**
Images are already configured with `unoptimized: true` for static export. Make sure:
1. Images are in the `public/` directory
2. You reference them with the basePath: `{process.env.basePath || ''}/image.png`
3. Or use Next.js Image component which handles this automatically

---

### Site Not Updating After Push 🔄

**Possible Causes:**
1. GitHub Actions workflow didn't run
2. Browser cache
3. DNS propagation delay

**Solutions:**
1. Check the **Actions** tab in your repository to see if the workflow ran
2. Hard refresh your browser (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)
3. Wait a few minutes for deployment to complete
4. Manually trigger the workflow:
   - Go to Actions tab
   - Select "Deploy to GitHub Pages"
   - Click "Run workflow"

---

### Build Fails ❌

**Common Causes:**
- TypeScript errors
- Missing dependencies
- Syntax errors

**Steps to Debug:**
1. Test the build locally:
   ```bash
   npm run build
   ```
2. Fix any errors shown
3. Commit and push the fixes
4. Check Actions tab for detailed error logs

---

### 404 Error When Accessing Site 🚫

**Solutions:**
1. Verify GitHub Pages is enabled:
   - Go to Settings → Pages
   - Ensure "Source" is set to "GitHub Actions"
2. Wait 2-3 minutes after first deployment
3. Check the Actions tab to ensure deployment succeeded
4. Clear browser cache and try again

---

### Links Not Working (404 on Navigation) 🔗

**Cause:**
Internal links might not account for the basePath.

**Solution:**
Always use Next.js `<Link>` component for internal navigation:
```typescript
import Link from 'next/link';

// Correct
<Link href="/about">About</Link>

// Avoid
<a href="/about">About</a>
```

Next.js automatically handles the basePath for `<Link>` components.

---

### Custom Domain Issues 🌐

If you've configured a custom domain:

1. Ensure DNS records are correct:
   - A records pointing to GitHub Pages IPs
   - CNAME record pointing to `username.github.io`
2. Wait 24-48 hours for DNS propagation
3. Check GitHub Pages settings to ensure custom domain is saved
4. HTTPS certificate may take a few minutes to provision

---

## Need More Help?

1. **Check the Actions tab** for detailed deployment logs
2. **Review browser console** (F12 → Console) for JavaScript errors
3. **Check Network tab** (F12 → Network) to see which resources fail to load
4. **Test locally** with `npm run build && npx serve out` to verify the built site works

---

## Useful Commands

```bash
# Test development server
npm run dev

# Build for production (test locally)
npm run build

# View build output
ls -la out/

# Check git status
git status

# View recent commits
git log --oneline -5
```
