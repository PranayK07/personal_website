# Pranay Kakkar - Personal Portfolio Website

A minimalist, dark-themed personal portfolio website built with Next.js, TypeScript, and Tailwind CSS. Features smooth scrolling, animated tech stack carousel, and a clean, distraction-free design.

## 🎨 Design Features

- **Pure Dark Mode**: Minimalist dark theme with no light mode toggle
- **Cyan Accent Colors**: Strategic use of #14B8A6 (teal/cyan) for interactive elements
- **No Gradients**: Clean, flat colors throughout
- **Smooth Scrolling**: Native smooth scroll behavior
- **Animated Tech Stack**: Auto-scrolling carousel of technologies
- **Live NYC Clock**: Real-time clock in the footer
- **Responsive Layout**: Mobile-first design that adapts to all screen sizes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/PranayK07/personal_website.git
cd personal_website
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 📝 Customization Guide

### 1. Personal Information (Hero Section)

Edit `/components/Hero.tsx`:
- **Name**: Change "Pranay Kakkar" to your name (line 8)
- **Title**: Update "Computer Science Student" to your title (line 11)
- **Location**: Modify "South Windsor, CT" to your location (line 14)
- **Bio**: Update the description paragraph (lines 17-19)

### 2. Tech Stack

Edit `/components/TechStack.tsx`:
- Modify the `techStack` array (lines 6-17)
- Each item has a `name` and `logo` (emoji or text)
- Add/remove technologies as needed

Example:
```typescript
const techStack = [
  { name: 'Your Tech', logo: '🚀' },
  // Add more...
];
```

### 3. Projects

Edit `/components/Projects.tsx`:
- Modify the `projects` array (lines 15-40)
- Each project has:
  - `title`: Project name
  - `role`: Your role
  - `company`: Company name (optional)
  - `date`: Year or date range
  - `description`: Project description
  - `technologies`: Array of tech used

Example:
```typescript
{
  title: 'Your Project Name',
  role: 'Your Role',
  company: 'Company Name',
  date: '2024',
  description: 'Your project description...',
  technologies: ['React', 'Node.js', 'AWS'],
}
```

### 4. Contact Information

Edit `/components/Contact.tsx`:
- **Email**: Update line 25 (href and display text)
- **Location**: Update line 36
- **Social Links**: Update lines 47-73
  - GitHub: line 49
  - LinkedIn: line 58
  - Twitter: line 67

### 5. Navigation

Edit `/components/Navigation.tsx`:
- **Logo**: Change "PK" initials on line 33
- Add/remove navigation items in the buttons section (lines 37-49)

### 6. Color Theme

Edit `/app/globals.css`:
- All colors are defined in CSS variables (lines 3-11)
- Main background: `--background: #0F172A`
- Accent cyan: `--accent-cyan: #14B8A6`
- Modify these to change the entire color scheme

### 7. Resume PDF

- Replace `/public/Resume_Template_PDF.pdf` with your own resume
- Keep the same filename or update the link in `Navigation.tsx` line 47

### 8. Metadata (SEO)

Edit `/app/layout.tsx`:
- Update `title` and `description` (lines 5-7)

## 📁 Project Structure

```
personal_website/
├── app/
│   ├── globals.css       # Global styles and color theme
│   ├── layout.tsx        # Root layout and metadata
│   └── page.tsx          # Main page component
├── components/
│   ├── Hero.tsx          # Hero/landing section
│   ├── TechStack.tsx     # Animated tech stack carousel
│   ├── Projects.tsx      # Projects section
│   ├── Contact.tsx       # Contact section
│   ├── Footer.tsx        # Footer with live clock
│   └── Navigation.tsx    # Top navigation bar
├── public/
│   └── Resume_Template_PDF.pdf  # Your resume (replace this)
└── package.json
```

## 🎯 Key Features Explained

### Smooth Scrolling
- Enabled globally in `globals.css` with `scroll-behavior: smooth`
- Navigation buttons use smooth scroll with `scrollIntoView()`

### Tech Stack Animation
- Auto-scrolls using `useEffect` and `setInterval`
- Items are duplicated for seamless infinite loop
- Speed controlled by `scrollSpeed` variable (line 19 in TechStack.tsx)

### Live Clock
- Uses `useEffect` to update every second
- Timezone set to 'America/New_York' (line 12 in Footer.tsx)
- Change timezone by updating the `timeZone` parameter

### Responsive Design
- Mobile-first approach using Tailwind CSS
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px)

## 🛠️ Technologies Used

- **Next.js 15.5.6** - React framework
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Node.js** - Runtime environment

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🚀 Deployment

### GitHub Pages (Configured & Ready!) ⭐
This repository is **already configured** for GitHub Pages deployment!

**Quick Start:**
1. Go to repository Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Merge this branch to `main`
4. Your site will be live at `https://pranayk07.github.io/personal_website/`

See [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) for detailed setup instructions.

**Features:**
- ✅ Automatic deployment on every push to main
- ✅ Static export pre-configured
- ✅ GitHub Actions workflow ready
- ✅ Free hosting with HTTPS

### Vercel (Alternative)
1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Deploy automatically

### Other Platforms
- **Netlify**: Static export ready, deploy the `out` folder
- **AWS Amplify**: Connect GitHub repo
- See [DEPLOYMENT.md](DEPLOYMENT.md) for more options

## 💡 Tips for Customization

1. **Keep it Minimal**: Don't add too many sections - the power is in simplicity
2. **Use Emojis Wisely**: They add personality without visual clutter
3. **Test Responsiveness**: Always check mobile view after changes
4. **Update Regularly**: Keep your projects and skills current
5. **Optimize Images**: If you add images, use Next.js Image component

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and customize it for your own use. If you have suggestions or improvements, pull requests are welcome!

## 📧 Contact

For questions or suggestions about this template, feel free to reach out through the social links on the website.

---

**Built with ❤️ using Next.js and Tailwind CSS**
