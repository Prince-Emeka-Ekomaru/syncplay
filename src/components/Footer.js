"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import './Footer.css';
import Image from 'next/image';

const Footer = () => {
  const pathname = usePathname();
  const { currentLanguage } = useLanguage();
  
  if (pathname === '/community' || pathname.startsWith('/admin')) {
    return null;
  }
  const t = translations[currentLanguage];
  
  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-top">
          <div className="footer-logo">
            <Image src="/syncplay-nobg-1.png" alt="syncplay eSports" width={200} height={45} style={{ width: 'auto', height: '45px' }} />
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>{t.navigation}</h4>
              <ul>
                <li><Link href="/">{t.home}</Link></li>
                <li><Link href="/tournaments">{t.tournaments}</Link></li>
                <li><Link href="/players">{t.playerLeaderboard || 'Leaderboard'}</Link></li>
                <li><Link href="/gallery">{t.gallery || 'Media'}</Link></li>
                <li><Link href="/community">{t.community}</Link></li>
                <li><Link href="/news">{t.news}</Link></li>
                <li><Link href="/contact">{t.contact}</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>{t.games}</h4>
              <ul>
                <li>eFootball</li>
                {/* Commented out - eBasketball removed */}
                {/* <li>eBasketball <span className="coming-soon">({t.comingSoon})</span></li> */}
              </ul>
            </div>

            <div className="footer-column">
              <h4>{t.legal}</h4>
              <ul>
                <li><Link href="/privacy">{t.privacyPolicy}</Link></li>
                <li><Link href="/terms">{t.termsAndConditions}</Link></li>
                <li><Link href="/tournaments?tab=rules">{t.tournamentRules}</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>{t.followUs}</h4>
              <div className="footer-social">
                <a href="https://www.instagram.com/syncplay_esports/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://www.tiktok.com/@syncplay_esport" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <i className="fab fa-tiktok"></i>
                </a>
                <a href="https://discord.gg/utstb8rGgM" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                  <i className="fab fa-discord"></i>
                </a>
                <a href="https://www.youtube.com/@syncplayEsports" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
                <a href="https://x.com/SyncplayEsport" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://streamlivr.com/@syncplayesports" target="_blank" rel="noopener noreferrer" aria-label="Streamlivr" title="Streamlivr - Official Exclusive Stream Partner" style={{ color: '#29A7E4' }}>
                  <i className="fas fa-tower-broadcast"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-legal">
            <p>
              <strong>syncplay eSports</strong> {t.trademark}
            </p>
            <p className="disclaimer">
              {t.disclaimer}
            </p>
          </div>
          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} syncplay eSports. {t.allRightsReserved}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

