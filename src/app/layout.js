import { Poppins } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdBanner from '../components/AdBanner';

const poppins = Poppins({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap',
});

export const metadata = {
  title: '🎮 syncplay eSports | Professional eSport Tournaments',
  description: 'syncplay eSports - Professional eSport Tournaments of eFootball and eBasketball in Nigeria',
  icons: {
    icon: '/syncplay nobg.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <LanguageProvider>
          <div className="App">
            <AdBanner />
            <Navbar />
            {children}
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
