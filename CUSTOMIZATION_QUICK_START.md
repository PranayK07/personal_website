# Quick Start Customization Guide

This is a quick reference for customizing your personal website. For detailed information, see [README.md](README.md).

## 🎯 Most Common Edits

### 1. Change Your Name & Info
**File:** `components/Hero.tsx`
```typescript
// Line 8: Change your name
<h1>Your Name Here</h1>

// Line 11: Change your title
<h2>Your Title/Position</h2>

// Line 14: Change your location
<p>Your City, State</p>

// Lines 17-19: Change your bio
<p>Your personal description...</p>
```

### 2. Update Your Tech Stack
**File:** `components/TechStack.tsx`
```typescript
// Lines 6-17: Edit this array
const techStack = [
  { name: 'React', logo: '⚛️' },
  { name: 'Your Tech', logo: '🚀' },  // Add your own
  // Remove ones you don't use
];
```

### 3. Add Your Projects
**File:** `components/Projects.tsx`
```typescript
// Lines 15-40: Replace with your projects
const projects = [
  {
    title: 'Your Project Name',
    role: 'Your Role',
    company: 'Company Name',  // Optional
    date: '2024',
    description: 'What you built and achieved...',
    technologies: ['Tech1', 'Tech2', 'Tech3'],
  },
  // Add more projects...
];
```

### 4. Update Contact Info
**File:** `components/Contact.tsx`

```typescript
// Line 25: Your email
href="mailto:your.email@example.com"

// Line 49: Your GitHub
href="https://github.com/yourusername"

// Line 58: Your LinkedIn
href="https://linkedin.com/in/yourusername"

// Line 67: Your Twitter
href="https://twitter.com/yourusername"
```

### 5. Change Colors
**File:** `app/globals.css`
```css
/* Lines 3-11: CSS Variables */
:root {
  --background: #0F172A;        /* Dark background */
  --accent-cyan: #14B8A6;       /* Cyan accent color */
  --accent-cyan-light: #2DD4BF; /* Lighter cyan */
}
```

### 6. Replace Resume
1. Add your resume PDF to `public/` folder
2. Name it `Resume_Template_PDF.pdf` OR
3. Update the link in `components/Navigation.tsx` line 47

## 🚀 Run the Website

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

## 📦 Deploy Your Website

### Option 1: Vercel (Easiest)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

### Option 2: Netlify
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site"
4. Connect your repository
5. Deploy

## 🎨 Design Guidelines

- Keep sections minimal and focused
- Use emojis sparingly for personality
- Maintain the dark color scheme
- Test on mobile devices
- Update content regularly

## ⚠️ Important Files (Don't Delete)

- `app/layout.tsx` - Root layout
- `app/page.tsx` - Main page structure
- `app/globals.css` - All styling
- `components/*` - All UI components
- `package.json` - Dependencies
- `next.config.ts` - Next.js config

## 📱 Testing Checklist

- [ ] Changed name and personal info
- [ ] Updated tech stack
- [ ] Added your projects
- [ ] Updated contact links
- [ ] Replaced resume PDF
- [ ] Changed colors (if desired)
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] All links work
- [ ] Resume link opens

## 💡 Pro Tips

1. **Keep descriptions concise** - 1-2 sentences max
2. **Use real emojis** - They're already in the code
3. **Update tech stack** - Remove what you don't use
4. **Add real projects** - Use actual work/school projects
5. **Professional email** - Use a professional email address
6. **Test thoroughly** - Check all links and sections
7. **Version control** - Commit changes regularly

## 🆘 Need Help?

- Check [README.md](README.md) for detailed guide
- Review commit message for full instructions
- Look at component files for inline comments
- Test changes with `npm run dev` before deploying

---

**Happy Customizing! 🎉**
