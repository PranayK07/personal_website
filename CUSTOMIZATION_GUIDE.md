# 🎨 Quick Customization Guide

This guide provides a step-by-step checklist for personalizing your portfolio website.

## 📋 Customization Checklist

### Step 1: Basic Information (5 minutes)

- [ ] **Update your name** in the navigation bar (line 20 in index.html)
  ```html
  <span class="brand-text">Your Name</span>
  ```

- [ ] **Update hero title** (line 33 in index.html)
  ```html
  <h1 class="glitch" data-text="Hello, I'm Your Name">Hello, I'm Your Name</h1>
  ```

- [ ] **Update your role/subtitle** (line 34 in index.html)
  ```html
  <p class="hero-subtitle">Software Engineer | Developer | Creator</p>
  ```

- [ ] **Update hero description** (line 35 in index.html)
  ```html
  <p class="hero-description">
      Welcome to my digital space. I create amazing things with code.
  </p>
  ```

- [ ] **Update page title** (line 6 in index.html)
  ```html
  <title>Portfolio - Your Name</title>
  ```

### Step 2: About Section (10 minutes)

- [ ] **Update your bio** (lines 90-98 in index.html)
  - Replace placeholder text with your actual story
  - Keep it authentic and personal
  - Aim for 2-3 paragraphs

- [ ] **Update skills** (lines 100-125 in index.html)
  - Remove skills you don't have
  - Add your actual skills
  - Use Font Awesome icons for visual appeal
  
  **Available icon classes:**
  - Programming: `fab fa-python`, `fab fa-js`, `fab fa-java`, `fab fa-php`
  - Frameworks: `fab fa-react`, `fab fa-angular`, `fab fa-vuejs`, `fab fa-node`
  - Tools: `fab fa-docker`, `fab fa-git-alt`, `fab fa-aws`, `fab fa-linux`
  - Design: `fab fa-figma`, `fab fa-adobe`, `fas fa-palette`
  
  **To add a new skill:**
  ```html
  <div class="skill-item">
      <i class="fab fa-your-icon"></i>
      <span>Your Skill</span>
  </div>
  ```

- [ ] **Add your profile picture** (optional)
  - Replace lines 82-84 in index.html with:
  ```html
  <img src="your-photo.jpg" alt="Your Name" style="width: 100%; border-radius: 20px; box-shadow: var(--shadow-lg);">
  ```
  - Place your photo in the same folder as index.html

### Step 3: Experience Section (15 minutes)

- [ ] **Update work experiences** (lines 132-154 in index.html)
  
  For each job:
  1. Update dates
  2. Update job title
  3. Update company name
  4. Update description
  5. Update technology tags

- [ ] **Add more experiences** (if needed)
  - Copy the entire `timeline-item` div (lines 132-147)
  - Paste below the existing ones
  - Update the information

- [ ] **Add education** (optional)
  - Use the same timeline structure
  - Add degree, university, and dates

  **Example:**
  ```html
  <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
          <div class="timeline-date">2018 - 2022</div>
          <h3>Bachelor of Science in Computer Science</h3>
          <h4>University Name</h4>
          <p>Relevant coursework and achievements...</p>
          <div class="tags">
              <span class="tag">Machine Learning</span>
              <span class="tag">Algorithms</span>
          </div>
      </div>
  </div>
  ```

### Step 4: Projects Section (20 minutes)

- [ ] **Update project cards** (lines 163-235 in index.html)
  
  For each project:
  1. Change project name
  2. Update description
  3. Update technology tags
  4. Add GitHub link
  5. Add live demo link (or remove if not applicable)
  6. Update the icon or add an image

- [ ] **Add project images** (optional but recommended)
  - Replace the icon placeholder with an actual image:
  ```html
  <div class="project-image" style="background: url('project1-screenshot.jpg'); background-size: cover; background-position: center;">
  </div>
  ```

- [ ] **Add more projects**
  - Copy an entire `project-card` div
  - Paste in the `projects-grid`
  - Update the information

### Step 5: Contact Section (5 minutes)

- [ ] **Update email** (line 247 in index.html)
  ```html
  <a href="mailto:your.email@example.com" class="contact-item">
  ```

- [ ] **Update LinkedIn** (line 254 in index.html)
  ```html
  <a href="https://linkedin.com/in/yourprofile" class="contact-item" target="_blank">
  ```

- [ ] **Update GitHub** (line 261 in index.html)
  ```html
  <a href="https://github.com/yourusername" class="contact-item" target="_blank">
  ```

- [ ] **Update Twitter** (line 268 in index.html) or remove if not applicable

- [ ] **Add additional contact methods** (optional)
  - Instagram, Portfolio site, Blog, etc.
  - Follow the same structure as existing contact items

### Step 6: Color Customization (Optional - 5 minutes)

- [ ] **Choose your color scheme**
  - Visit [Coolors.co](https://coolors.co/) to find a color palette
  - Or use these popular combinations:

  **Professional Blue:**
  ```css
  --primary-color: #2563eb;
  --secondary-color: #3b82f6;
  ```

  **Creative Purple:**
  ```css
  --primary-color: #7c3aed;
  --secondary-color: #a855f7;
  ```

  **Energetic Orange:**
  ```css
  --primary-color: #f97316;
  --secondary-color: #fb923c;
  ```

  **Nature Green:**
  ```css
  --primary-color: #059669;
  --secondary-color: #10b981;
  ```

- [ ] **Update colors in styles.css** (lines 3-13)
  - Replace the hex color codes in `:root` section
  - Also update the dark theme colors (lines 15-25)

### Step 7: Contact Form Setup (Optional - 10 minutes)

Choose one of these options:

#### Option A: FormSpree (Easiest - Free)
1. Go to [formspree.io](https://formspree.io/) and sign up
2. Create a new form and get your form ID
3. Update the form tag in index.html (line 275):
   ```html
   <form class="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
4. Remove the JavaScript alert handler in script.js

#### Option B: Netlify Forms (If deploying to Netlify)
1. Add `netlify` attribute to form:
   ```html
   <form class="contact-form" name="contact" netlify>
   ```
2. Add hidden input fields:
   ```html
   <input type="hidden" name="form-name" value="contact">
   ```
3. Deploy to Netlify - forms work automatically!

#### Option C: EmailJS (More control)
1. Sign up at [emailjs.com](https://www.emailjs.com/)
2. Follow their setup guide
3. Update script.js with their SDK

### Step 8: Final Touches (5 minutes)

- [ ] **Test all links** - Make sure they work
- [ ] **Check spelling** - Run through all text
- [ ] **Test on mobile** - Open on your phone
- [ ] **Test theme toggle** - Switch between light/dark
- [ ] **Test navigation** - Click through all pages
- [ ] **Compress images** - Use [TinyPNG](https://tinypng.com/) for faster loading

## 🎯 Information from Your Resume

Here's what to extract from your resume:

| Resume Section | Website Location | What to Include |
|---------------|-----------------|----------------|
| Name | Nav bar, Hero, About | Your full name |
| Title/Role | Hero subtitle | Current role or desired role |
| Summary | About section | 2-3 paragraph bio |
| Experience | Experience timeline | Jobs with dates, descriptions |
| Education | Experience timeline | Degrees with dates |
| Skills | About skills grid | Technical skills with icons |
| Projects | Projects section | 3-6 best projects |
| Contact | Contact page | Email, social media links |
| Certifications | About or Experience | Add as timeline items |

## 💾 Saving Your Changes

After making changes:
1. Save all files (Ctrl+S or Cmd+S)
2. Refresh your browser (F5 or Cmd+R)
3. Check if changes appear correctly
4. If something looks wrong, check the browser console (F12) for errors

## 🚀 Ready to Deploy?

Once you're happy with your customization:

### Quick Deploy Options:

1. **GitHub Pages** (Free)
   - Create a GitHub repository
   - Upload your files
   - Enable GitHub Pages in Settings
   - Your site: `username.github.io/repo-name`

2. **Netlify** (Free, Easy)
   - Drag and drop your folder to [netlify.com](https://www.netlify.com/)
   - Get a free subdomain instantly
   - Auto-deploy on changes

3. **Vercel** (Free)
   - Connect your GitHub repo to [vercel.com](https://vercel.com/)
   - Auto-deploy on push
   - Great performance

## 🆘 Need Help?

**Common Issues:**

**Icons not showing:**
- Check internet connection
- Font Awesome CDN might be blocked

**Colors look wrong:**
- Clear browser cache
- Check color format (must be hex: #000000)

**JavaScript not working:**
- Check browser console for errors (F12)
- Make sure script.js is in the same folder

**Layout broken on mobile:**
- Test in different browsers
- Check if you modified responsive CSS

## 📞 Support Resources

- **HTML Help**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTML)
- **CSS Help**: [CSS-Tricks](https://css-tricks.com/)
- **JavaScript Help**: [JavaScript.info](https://javascript.info/)
- **Icons**: [Font Awesome](https://fontawesome.com/icons)
- **Colors**: [Coolors](https://coolors.co/)

## ✅ Final Checklist

Before publishing:
- [ ] All personal information updated
- [ ] All links working
- [ ] No placeholder text remaining
- [ ] Images optimized and loading
- [ ] Contact form configured (if using)
- [ ] Tested on mobile device
- [ ] Tested on different browsers
- [ ] No spelling errors
- [ ] Theme toggle working
- [ ] All navigation working

---

**You're all set! 🎉**

Your unique personal website is ready to impress potential employers, clients, and collaborators!
