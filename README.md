# syncplay eSports

A professional eSports tournament platform for eFootball and eBasketball competitions. Built with React, featuring a modern design with red, black, and white color scheme.

## Features

- **Home Page**: Hero section, features showcase, news highlights, and contact call-to-action
- **Events**: Browse upcoming and past tournament events, featuring the inaugural 2v2 tournament
- **Tournaments**: Learn about different tournament formats (active and coming soon)
- **Tournament Registration**: Multi-step registration form with integrated Paystack payment processing
- **News**: Latest updates, tournament announcements, and player spotlights
- **Contact**: Get in touch with the syncplay team
- **Multi-language Support**: English, Pidgin, Yoruba, Hausa, Igbo, and French

## Color Scheme

- **Primary Red**: #E63946
- **Dark**: #1A1A1A
- **White**: #FFFFFF

## Tech Stack

- React 18.2
- React Router DOM 6.20
- React Paystack (Payment Integration)
- Plain CSS (no preprocessors or frameworks)
- Font Awesome for icons
- Google Fonts (Poppins)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd syncplay
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Paystack public key:
   ```env
   REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
   ```
   - See `ENV_SETUP.md` for detailed instructions
   - See `PAYSTACK_INTEGRATION.md` for complete payment setup guide

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
syncplay/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── [logo images]
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Navbar.css
│   │   ├── Footer.js
│   │   └── Footer.css
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Home.css
│   │   ├── Events.js
│   │   ├── Events.css
│   │   ├── Tournaments.js
│   │   ├── Tournaments.css
│   │   ├── Register.js        ← NEW: Registration form
│   │   ├── Register.css
│   │   ├── News.js
│   │   ├── News.css
│   │   ├── NewsArticle.js
│   │   ├── NewsArticle.css
│   │   ├── Contact.js
│   │   └── Contact.css
│   ├── contexts/
│   │   └── LanguageContext.js  ← NEW: Multi-language support
│   ├── translations/
│   │   └── translations.js     ← NEW: Translation strings
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env                        ← CREATE: Environment variables
├── ENV_SETUP.md                ← Payment setup instructions
├── PAYSTACK_INTEGRATION.md     ← Paystack integration guide
├── package.json
└── README.md
```

## Features in Detail

### Navigation
- Fixed navigation bar with smooth scroll
- Mobile-responsive hamburger menu
- Social media links

### Home Page
- Animated hero section with call-to-action
- What We Do section with feature cards
- Who We Are section with statistics
- Latest news preview
- Contact section

### Events
- Featured 2v2 EA Sports FC 26 Tournament (November 30, 2025)
- ₦1,500,000 prize pool
- Upcoming events with registration status
- Coming soon events (Weekend Cup, Championship Series, Amateur League)
- Past events with results
- eBasketball announcements

### Tournaments
- Active: 2v2 Tournament (Register Now)
- Coming Soon: Weekend Cup, Championship Series, Amateur League
- Tournament format descriptions
- Step-by-step guide to joining
- Available games showcase

### Registration & Payment
- Multi-step registration form (4 steps)
  1. Team Information
  2. Player 1 Details
  3. Player 2 Details
  4. Review & Confirmation
- Integrated Paystack payment processing
- Entry fee: ₦100,000 per team
- Secure payment popup
- Instant confirmation after payment
- Payment reference tracking
- Email confirmation (to be implemented)

### News
- Category filtering
- Article cards with images
- Newsletter subscription
- Related articles

### Contact
- Contact form (static)
- Contact information cards
- Social media links
- FAQ section

### Multi-language Support
- English
- Nigerian Pidgin
- Yoruba
- Hausa
- Igbo
- French
- Language selector in navigation bar
- Persistent language preference

## Customization

### Colors
Colors are defined as CSS custom properties in `src/index.css`:
```css
:root {
  --color-primary-red: #E63946;
  --color-dark: #1A1A1A;
  --color-white: #FFFFFF;
  /* ... */
}
```

### Fonts
The project uses Poppins font from Google Fonts. You can change this in `public/index.html`.

## Payment Integration

This project uses **Paystack** for secure payment processing.

### Setup Instructions

1. **Get Paystack Keys:**
   - Sign up at https://paystack.com/
   - Get your Public Key from Settings → API Keys
   - Use test keys for development
   - Use live keys for production

2. **Configure Environment:**
   - Create `.env` file in project root
   - Add: `REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_key`
   - Restart development server

3. **Test Payment:**
   - Test Card: `4084 0840 8408 4081`
   - CVV: `408`
   - PIN: `0000`
   - OTP: `123456`

### Important Notes

⚠️ **Security:**
- NEVER commit `.env` file to version control
- NEVER expose secret keys in frontend
- Always verify payments on backend

📝 **For Production:**
- Set up backend verification endpoint
- Implement webhook for payment notifications
- Store registrations in database
- Send email confirmations
- Switch to live Paystack keys

📚 **Documentation:**
- See `PAYSTACK_INTEGRATION.md` for complete guide
- See `ENV_SETUP.md` for environment setup

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is private and proprietary.

## Disclaimer

The tournaments are not affiliated with Electronic Arts Inc., Take-Two Interactive, Big Ant Studios Pty Ltd. and are not sponsored by any of these companies or their licensors.

---

**syncplay eSports** - Professional eSport Tournaments Platform

