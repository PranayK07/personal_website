# 🌟 Personal Portfolio Website

A modern, sleek personal portfolio website with a unique glassmorphism design, smooth animations, and easy customization. This website features multiple pages (Home, About, Experience, Projects, Contact) with seamless transitions and a dark/light theme toggle.

## ✨ Features

- **🎨 Modern Glassmorphism Design** - Beautiful frosted glass effect with backdrop blur
- **🌓 Dark/Light Theme Toggle** - Smooth theme switching with localStorage persistence
- **📱 Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **🎭 Smooth Page Transitions** - Fade-in animations and seamless navigation
- **🎯 Interactive Elements** - Hover effects, parallax animations, and floating cards
- **⚡ Fast & Lightweight** - Pure HTML, CSS, and JavaScript (no frameworks needed)
- **🔧 Easy to Customize** - Well-structured code with clear sections for personalization

## 🚀 Quick Start

1. **Download the files** - Clone or download this repository
2. **Open `index.html`** - Simply double-click to open in your browser
3. **Customize** - Follow the guide below to add your information

That's it! No build process, no dependencies to install.

## 📝 How to Customize

### 1. **Update Personal Information** (index.html)

#### Home Page
Find the hero section (around line 33) and update:
```html
<h1 class="glitch" data-text="Hello, I'm Your Name">Hello, I'm Your Name</h1>
<p class="hero-subtitle">Software Engineer | Developer | Creator</p>
<p class="hero-description">
    Welcome to my digital space. I create amazing things with code.
</p>
```
Replace "Your Name" with your actual name and update the subtitle and description.

#### About Page
Find the About section (around line 70) and update:
```html
<h3>Hi, I'm [Your Name]</h3>
<p>
    Add your bio here. Tell your story - who you are, what drives you, 
    and what makes you passionate about your work.
</p>
```

**Update Skills**: Modify the skills grid to reflect your actual skills. Add or remove skill items as needed:
```html
<div class="skill-item">
    <i class="fab fa-python"></i>
    <span>Python</span>
</div>
```

For different skill icons, visit [Font Awesome Icons](https://fontawesome.com/icons) and find the appropriate icon class.

#### Experience Page
Find the timeline section (around line 120) and update job information:
```html
<div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
        <div class="timeline-date">2023 - Present</div>
        <h3>Job Title</h3>
        <h4>Company Name</h4>
        <p>Describe your role and responsibilities...</p>
        <div class="tags">
            <span class="tag">Technology 1</span>
            <span class="tag">Technology 2</span>
        </div>
    </div>
</div>
```

**To add more experiences**: Copy the entire `timeline-item` div and paste it below existing ones.

#### Projects Page
Find the projects section (around line 163) and update:
```html
<div class="project-card">
    <div class="project-image">
        <i class="fas fa-project-diagram"></i>
    </div>
    <div class="project-content">
        <h3>Project Name 1</h3>
        <p>Brief description of your project...</p>
        <div class="tags">
            <span class="tag">React</span>
            <span class="tag">Node.js</span>
        </div>
        <div class="project-links">
            <a href="#" class="project-link"><i class="fab fa-github"></i> Code</a>
            <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i> Demo</a>
        </div>
    </div>
</div>
```

**To add more projects**: Copy an entire `project-card` div and paste it in the projects grid.

#### Contact Page
Find the contact section (around line 232) and update your contact information:
```html
<a href="mailto:your.email@example.com" class="contact-item">
    <i class="fas fa-envelope"></i>
    <div>
        <h4>Email</h4>
        <p>your.email@example.com</p>
    </div>
</a>
```

Update all social media links with your actual profiles.

### 2. **Customize Colors and Theme** (styles.css)

Find the CSS variables at the top of `styles.css` (around line 2):

```css
:root {
    /* Light Theme Colors */
    --primary-color: #6366f1;      /* Main accent color */
    --secondary-color: #8b5cf6;    /* Secondary accent */
    --accent-color: #ec4899;       /* Accent highlights */
    --bg-primary: #f8fafc;         /* Main background */
    --bg-secondary: #ffffff;       /* Secondary background */
    --text-primary: #1e293b;       /* Main text color */
    --text-secondary: #64748b;     /* Secondary text */
}
```

**To change the color scheme**:
1. Choose your colors from a tool like [Coolors](https://coolors.co/)
2. Replace the hex color codes
3. The dark theme colors are in the `[data-theme="dark"]` section

**Popular color schemes**:
- **Blue-Purple**: `#6366f1` and `#8b5cf6` (current)
- **Green-Teal**: `#10b981` and `#14b8a6`
- **Orange-Red**: `#f97316` and `#ef4444`
- **Pink-Purple**: `#ec4899` and `#a855f7`

### 3. **Add Your Profile Picture**

Replace the placeholder in the About section:
```html
<!-- Current: -->
<div class="image-placeholder">
    <i class="fas fa-user"></i>
</div>

<!-- Replace with: -->
<img src="path/to/your/image.jpg" alt="Your Name" style="width: 100%; border-radius: 20px;">
```

### 4. **Add Real Project Images**

Replace the project placeholder icons with actual images:
```html
<!-- Current: -->
<div class="project-image">
    <i class="fas fa-project-diagram"></i>
</div>

<!-- Replace with: -->
<div class="project-image" style="background: url('path/to/project-image.jpg'); background-size: cover; background-position: center;">
</div>
```

### 5. **Configure Contact Form**

The form currently shows an alert. To make it functional, integrate with:

#### Option A: FormSpree (Easiest)
1. Sign up at [FormSpree.io](https://formspree.io/)
2. Get your form endpoint
3. Update the form in index.html:
```html
<form class="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

#### Option B: Netlify Forms
1. Deploy to Netlify
2. Add `netlify` attribute to form:
```html
<form class="contact-form" name="contact" netlify>
```

#### Option C: EmailJS
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Follow their documentation to integrate
3. Update the JavaScript in `script.js`

### 6. **Update Page Title and Metadata**

In `index.html`, update the `<head>` section:
```html
<title>Your Name - Portfolio</title>
<meta name="description" content="Personal portfolio of Your Name, Software Engineer">
```

For better SEO, add these meta tags:
```html
<meta name="author" content="Your Name">
<meta name="keywords" content="software engineer, developer, portfolio, your skills">
```

## 🎨 Advanced Customization

### Change Font
Add a Google Font in the `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
```

Update CSS:
```css
body {
    font-family: 'Poppins', sans-serif;
}
```

### Modify Animations
Adjust animation speeds in `styles.css`:
```css
@keyframes float {
    /* Modify duration: animation: float 3s ease-in-out infinite; */
}
```

### Add New Sections
Copy the structure of existing sections and modify:
```html
<section id="newsection" class="page">
    <div class="section-header">
        <h2 class="section-title">New Section</h2>
        <div class="title-underline"></div>
    </div>
    <!-- Your content here -->
</section>
```

Don't forget to add a navigation link:
```html
<li><a href="#newsection" class="nav-link" data-page="newsection">New Section</a></li>
```

## 📱 Mobile Menu (Optional)

The current design hides the menu on mobile. To add a hamburger menu:

1. Add hamburger button in index.html:
```html
<div class="hamburger">
    <span></span>
    <span></span>
    <span></span>
</div>
```

2. Add mobile menu styles in styles.css
3. Add toggle functionality in script.js

(This is left as an exercise for customization)

## 🚀 Deployment

### GitHub Pages
1. Push to GitHub
2. Go to Settings > Pages
3. Select branch and save
4. Your site will be live at `https://yourusername.github.io/repository-name`

### Netlify
1. Sign up at [Netlify](https://www.netlify.com/)
2. Drag and drop your folder
3. Done! Your site is live

### Vercel
1. Sign up at [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Deploy automatically

## 🔧 Troubleshooting

**Icons not showing?**
- Check your internet connection (Font Awesome loads from CDN)
- Verify the CDN link in index.html is correct

**Colors look weird?**
- Clear your browser cache
- Check if you modified the CSS variables correctly
- Ensure hex color codes start with #

**Page transitions not working?**
- Check browser console for JavaScript errors
- Ensure script.js is linked correctly in index.html

**Theme toggle not persisting?**
- Check if localStorage is enabled in your browser
- Some browsers in private mode block localStorage

## 📚 Resources

- **Icons**: [Font Awesome](https://fontawesome.com/icons)
- **Colors**: [Coolors](https://coolors.co/), [Adobe Color](https://color.adobe.com/)
- **Fonts**: [Google Fonts](https://fonts.google.com/)
- **Images**: [Unsplash](https://unsplash.com/), [Pexels](https://www.pexels.com/)
- **Gradients**: [CSS Gradient](https://cssgradient.io/)

## 💡 Tips

1. **Keep it simple** - Don't overload with information
2. **Use high-quality images** - They make a huge difference
3. **Test on mobile** - Most visitors will be on mobile devices
4. **Update regularly** - Keep your projects and experience current
5. **Get feedback** - Ask friends to review your site
6. **Check accessibility** - Ensure good contrast ratios
7. **Optimize images** - Compress images for faster loading

## 🎯 What to Add from Your Resume

Based on your resume, add:
- ✅ **Summary/Objective** in the About section
- ✅ **Work Experience** in the Experience timeline
- ✅ **Education** (add a new timeline item in Experience)
- ✅ **Projects** in the Projects grid
- ✅ **Skills** in the About skills grid
- ✅ **Certifications** (add a new section or in About)
- ✅ **Contact Info** in the Contact page

## 📄 File Structure

```
portfolio/
│
├── index.html          # Main HTML file (update your info here)
├── styles.css          # All styling (customize colors here)
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🤝 Contributing

Feel free to customize this template and make it your own! If you create something cool, share it!

## 📝 License

This template is free to use for personal and commercial projects. Attribution is appreciated but not required.

---

**Made with ❤️ for you to showcase your amazing work!**

Need help? Check the troubleshooting section or search for specific CSS/HTML tutorials online.

Happy customizing! 🎉
