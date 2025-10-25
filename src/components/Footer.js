import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import './Footer.css';

const Footer = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  
  return (
    <footer className="footer">
      <div className="footer-container container">
        <div className="footer-top">
          <div className="footer-logo">
            <img src="/syncplay nobg (1).png" alt="syncplay eSports" />
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>{t.navigation}</h4>
              <ul>
                <li><Link to="/">{t.home}</Link></li>
                <li><Link to="/events">{t.events}</Link></li>
                <li><Link to="/tournaments">{t.tournaments}</Link></li>
                <li><Link to="/players">{t.players}</Link></li>
                <li><Link to="/news">{t.news}</Link></li>
                <li><Link to="/contact">{t.contact}</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>{t.games}</h4>
              <ul>
                <li>eFootball</li>
                <li>eBasketball <span className="coming-soon">({t.comingSoon})</span></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>{t.legal}</h4>
              <ul>
                <li><Link to="/privacy">{t.privacyPolicy}</Link></li>
                <li><Link to="/terms">{t.termsAndConditions}</Link></li>
                <li><Link to="/tournament-rules">{t.tournamentRules}</Link></li>
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
                <a href="https://facebook.com/syncplayesports" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fab fa-facebook"></i>
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

