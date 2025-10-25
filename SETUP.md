# syncplay eSports - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18.2
- React Router DOM 6.20
- React Scripts 5.0.1

### 2. Start Development Server

```bash
npm start
```

The application will open automatically in your browser at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

Creates an optimized production build in the `/build` directory.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Overview

### Pages Created

1. **Home** (`/`) - Main landing page with hero, features, news, and CTA sections
2. **Events** (`/events`) - Upcoming and past tournament events
3. **Tournaments** (`/tournaments`) - Tournament formats and registration info
4. **News** (`/news`) - News articles with category filtering
5. **News Article** (`/news/:id`) - Individual news article pages
6. **Contact** (`/contact`) - Contact form and information

### Color Scheme

Your brand colors are implemented throughout:
- **Red**: #E63946 (Primary brand color)
- **Black**: #1A1A1A (Dark backgrounds)
- **White**: #FFFFFF (Text and accents)

### Logos

The site uses your existing logos from the `/public` folder:
- `syncplay logo red font on white circle then in red bg.jpg`
- `syncplay logo white in black bg.jpg`
- `syncplay logo black in white bg.jpg`
- `syncplay logo white font on black circle then in white bg.jpg`
- `syncplay logo black font on white circle then in black bg.jpg`

### Features Implemented

✅ Fully responsive design (mobile, tablet, desktop)
✅ Fixed navigation with mobile hamburger menu
✅ Smooth scroll animations
✅ Social media integration
✅ Newsletter subscription form
✅ Contact form (static)
✅ News filtering by category
✅ Tournament registration flows
✅ Modern eSports aesthetic
✅ Fast page load times
✅ SEO-friendly structure

### Design Highlights

- **CyberLive!Arena Inspired**: Layout and structure mirrors the reference site
- **syncplay Branding**: All text, colors, and logos use syncplay branding
- **eFootball Focus**: Primary sport with eBasketball "Coming Soon" notices
- **Professional Look**: Clean, modern design suitable for professional eSports

## Customization

### Updating Content

#### News Articles
Edit `src/pages/News.js` and `src/pages/NewsArticle.js` to add/modify news content.

#### Events
Edit `src/pages/Events.js` to add new tournaments and events.

#### Tournament Types
Edit `src/pages/Tournaments.js` to modify tournament formats and details.

### Styling

All styles use CSS custom properties defined in `src/index.css`:
```css
--color-primary-red: #E63946;
--color-dark: #1A1A1A;
--color-white: #FFFFFF;
```

Change these to instantly update colors site-wide.

### Social Media Links

Update social media URLs in:
- `src/components/Navbar.js`
- `src/components/Footer.js`
- `src/pages/Home.js`
- `src/pages/Contact.js`

## Deployment

### Netlify / Vercel

1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `build`

### Traditional Hosting

1. Run `npm run build`
2. Upload contents of `/build` folder to your web server
3. Configure server to route all requests to `index.html`

## Browser Compatibility

Tested and works on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized images
- Code splitting with React Router
- Lazy loading for better initial load
- Minimal dependencies

## Support

For issues or questions, refer to:
- React Documentation: https://react.dev
- React Router: https://reactrouter.com
- Create React App: https://create-react-app.dev

---

**Ready to compete!** 🎮🏆

