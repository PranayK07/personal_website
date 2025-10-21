# GitHub Pages Deployment - Setup Instructions

This repository is now configured to automatically deploy to GitHub Pages! 🎉

## What Has Been Done

1. ✅ **Fixed TypeScript Error**: Corrected type mismatch in the `useScrollAnimation` hook
2. ✅ **Configured Static Export**: Updated `next.config.ts` to enable static HTML export
3. ✅ **Created GitHub Actions Workflow**: Automated deployment on every push to main branch
4. ✅ **Added .nojekyll File**: Prevents GitHub Pages from processing files with Jekyll
5. ✅ **Fixed CSS Loading Issue**: Set correct `basePath: '/personal_website'` so CSS and JS files load properly

## How to Enable GitHub Pages (One-Time Setup)

To make your website live, you need to enable GitHub Pages in your repository settings. Follow these steps:

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/PranayK07/personal_website
2. Click on **Settings** (top menu bar)
3. Scroll down and click on **Pages** in the left sidebar (under "Code and automation")
4. Under "Build and deployment":
   - **Source**: Select "GitHub Actions" from the dropdown
   - (The workflow file is already created in `.github/workflows/deploy.yml`)
5. Click **Save** if prompted

### Step 2: Merge This PR and Deploy

1. Review and merge this Pull Request to the `main` branch
2. The GitHub Actions workflow will automatically run
3. Your website will be built and deployed to GitHub Pages

### Step 3: Access Your Website

After the workflow completes (usually takes 2-3 minutes), your website will be live at:

**🌐 https://pranayk07.github.io/personal_website/**

You can find the exact URL in:
- Repository Settings → Pages (it will show "Your site is live at...")
- GitHub Actions workflow run (the deploy job will output the URL)

## Automatic Deployments

From now on, every time you push changes to the `main` branch:
1. GitHub Actions will automatically trigger
2. Your site will be rebuilt with the latest changes
3. The new version will be deployed to GitHub Pages
4. Changes will be live in 2-3 minutes!

## Viewing Deployment Status

To check if your deployment is successful:

1. Go to the **Actions** tab in your repository
2. Look for the "Deploy to GitHub Pages" workflow
3. Click on the latest run to see detailed logs
4. Green checkmark ✓ = successful deployment
5. Red X ✗ = deployment failed (check logs for errors)

## Troubleshooting

### If CSS/Styling is not loading:

**This has been fixed!** The `basePath` is now correctly set to `/personal_website` in `next.config.ts`.

If you rename the repository or fork it, you MUST update the `basePath` in `next.config.ts`:
```typescript
basePath: '/your-new-repository-name',
```

### If the workflow doesn't run automatically:

1. Make sure you've enabled GitHub Pages (Step 1 above)
2. Check that the workflow file exists at `.github/workflows/deploy.yml`
3. Try manually triggering the workflow:
   - Go to Actions tab
   - Click "Deploy to GitHub Pages" on the left
   - Click "Run workflow" button on the right
   - Select the `main` branch
   - Click "Run workflow"

### If you get a 404 error:

1. Wait a few minutes - DNS propagation can take time
2. Check that GitHub Pages is enabled in Settings
3. Verify the workflow completed successfully in Actions tab
4. Make sure the Source is set to "GitHub Actions"

### If the site doesn't update after pushing changes:

1. Check the Actions tab to see if the workflow ran
2. Clear your browser cache (hard refresh with Ctrl+Shift+R or Cmd+Shift+R)
3. If the workflow didn't run, check that you pushed to the `main` branch

## Custom Domain (Optional)

If you want to use a custom domain like `www.yourname.com`:

1. Go to Settings → Pages
2. Under "Custom domain", enter your domain name
3. Follow the DNS configuration instructions provided by GitHub
4. GitHub will automatically configure HTTPS for your custom domain

## Tech Stack

Your website is built with:
- **Next.js 15.5.6** with static export
- **React 19.1.0**
- **TypeScript**
- **Tailwind CSS 4**
- **GitHub Actions** for CI/CD
- **GitHub Pages** for hosting

## Need Help?

If you encounter any issues:
1. Check the Actions tab for detailed error logs
2. Review the [GitHub Pages documentation](https://docs.github.com/en/pages)
3. Check the [Next.js static export docs](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

**Your website is ready to go live! 🚀**

Just merge this PR and enable GitHub Pages in your repository settings!
