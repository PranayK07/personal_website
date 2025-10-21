# Personal Website Customization Guide

## 🎨 Design Overview

Your website features a **minimalist dark theme** with:
- **Background**: Pure black (#0a0a0a) for maximum contrast
- **Text**: Clean white (#ffffff) for readability
- **Accent**: Teal/cyan (#14b8a6) for interactive elements
- **Typography**: Inter font family for modern, clean look
- **Layout**: Centered content with max-width of 1100px for optimal readability

## 📁 File Structure

```
personal_website/
├── app/
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout with metadata
│   └── page.tsx             # Main page component
├── components/
│   ├── Navigation.tsx       # Sticky navigation with smooth scrolling
│   ├── Hero.tsx            # Landing section with your name and intro
│   ├── TechStack.tsx       # Animated horizontal scrolling tech stack
│   ├── Projects.tsx       # Project cards with clean layout
│   ├── Contact.tsx         # Contact info and social links
│   └── Footer.tsx          # Footer with live clock
└── public/
    └── Resume_Template_PDF.pdf  # Your resume file
```

## 🛠️ How to Customize

### 1. **Personal Information**

#### Update Hero Section (`components/Hero.tsx`)
```tsx
// Line 9-11: Update your name and title
<h1 className="heading-1">
  Your Name Here
</h1>
<p className="text-large mb-4">
  Your Title Here
</p>
<p className="text-muted mb-12">
  Your Location
</p>

// Line 18-22: Update your description
<p className="text-lg text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
  Write your personal description here. Keep it concise and engaging.
</p>
```

#### Update Navigation (`components/Navigation.tsx`)
```tsx
// Line 54: Update your name in the navigation
<span className="text-xl font-semibold text-foreground">Your Name</span>
```

### 2. **Tech Stack Customization**

#### Add/Remove Technologies (`components/TechStack.tsx`)
```tsx
// Lines 11-24: Update the techStack array
const techStack: Tech[] = [
  { name: 'React', icon: '⚛️', color: '#61DAFB' },
  { name: 'Next.js', icon: '▲', color: '#000000' },
  { name: 'TypeScript', icon: '🔷', color: '#3178C6' },
  // Add your technologies here
  { name: 'Your Tech', icon: '🔧', color: '#YOUR_COLOR' },
];
```

**Available Icons**: Use emojis or Unicode symbols for tech logos
**Colors**: Use hex codes for brand colors

### 3. **Projects Section**

#### Add Your Projects (`components/Projects.tsx`)
```tsx
// Lines 12-36: Update the projects array
const projects: Project[] = [
  {
    title: 'Your Project Name',
    role: 'Your Role',
    company: 'Company Name (optional)',
    date: '2024',
    description: 'Describe your project, what you built, and its impact.',
    technologies: ['React', 'Node.js', 'MongoDB'],
  },
  // Add more projects here
];
```

### 4. **Contact Information**

#### Update Contact Details (`components/Contact.tsx`)
```tsx
// Line 27: Update your email
href="mailto:your.email@example.com"

// Lines 45-78: Update social media links
href="https://github.com/yourusername"
href="https://linkedin.com/in/yourusername"
href="https://twitter.com/yourusername"
```

### 5. **Color Scheme Customization**

#### Update Colors (`app/globals.css`)
```css
:root {
  /* Change these values to customize your color scheme */
  --background: #0a0a0a;        /* Main background */
  --foreground: #ffffff;        /* Main text color */
  --text-muted: #6b7280;         /* Muted text */
  --accent: #14b8a6;            /* Accent color (teal) */
  --accent-hover: #0d9488;      /* Accent hover state */
  --card-bg: #111111;           /* Card backgrounds */
  --card-border: #1f1f1f;       /* Card borders */
  --section-bg: #0f0f0f;        /* Section backgrounds */
}
```

### 6. **Typography Customization**

#### Update Font Sizes (`app/globals.css`)
```css
/* Adjust these classes to change typography */
.heading-1 {
  font-size: 3.5rem;    /* Main heading size */
  font-weight: 700;
}

.heading-2 {
  font-size: 2.5rem;    /* Section heading size */
  font-weight: 600;
}

.text-large {
  font-size: 1.25rem;   /* Large text size */
}
```

### 7. **Animation Customization**

#### Tech Stack Animation Speed (`components/TechStack.tsx`)
```tsx
// Line 35: Adjust scroll speed (lower = slower)
const scrollSpeed = 0.3; // pixels per frame

// Line 54: Adjust animation delay
const timeoutId = setTimeout(() => {
  animationId = requestAnimationFrame(animate);
}, 1000); // milliseconds
```

### 8. **Layout Customization**

#### Container Width (`app/globals.css`)
```css
.container {
  max-width: 1100px;  /* Change this to adjust content width */
  margin: 0 auto;
  padding: 0 2rem;
}
```

#### Section Spacing (`app/globals.css`)
```css
.section {
  padding: 5rem 0;  /* Adjust vertical spacing between sections */
}
```

## 🎯 Quick Customization Checklist

- [ ] Update your name in Hero and Navigation components
- [ ] Add your personal description in Hero component
- [ ] Customize tech stack with your technologies
- [ ] Add your projects with descriptions and tech stacks
- [ ] Update contact information and social links
- [ ] Replace resume PDF with your own
- [ ] Adjust colors if desired
- [ ] Test on mobile devices

## 📱 Mobile Responsiveness

The website is fully responsive with:
- **Mobile-first design** with breakpoints at 768px
- **Flexible grid layouts** that stack on smaller screens
- **Touch-friendly buttons** and interactive elements
- **Optimized typography** that scales appropriately

## 🚀 Deployment

1. **Build the project**: `npm run build`
2. **Deploy to Vercel**: Connect your GitHub repository to Vercel
3. **Custom domain**: Add your custom domain in Vercel settings

## 💡 Pro Tips

1. **Keep descriptions concise** - aim for 2-3 lines maximum
2. **Use high-quality project images** if you add them later
3. **Test on multiple devices** before deploying
4. **Keep the minimalist aesthetic** - avoid adding too many elements
5. **Use consistent spacing** throughout the site

## 🔧 Advanced Customizations

### Adding New Sections
1. Create a new component in `components/`
2. Import and add it to `app/page.tsx`
3. Add navigation link in `components/Navigation.tsx`

### Custom Animations
- Modify CSS animations in `globals.css`
- Add new animation classes as needed
- Use `fade-in-up` class for entrance animations

### Performance Optimization
- Images should be optimized (WebP format recommended)
- Use Next.js Image component for better performance
- Minimize external dependencies

---

**Need help?** The code is well-commented and follows React/Next.js best practices. Each component is self-contained and easy to modify.
