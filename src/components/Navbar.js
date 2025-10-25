import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations, languages } from '../translations/translations';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const { currentLanguage, changeLanguage} = useLanguage();
  
  const t = translations[currentLanguage];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleLangDropdown = () => {
    setIsLangDropdownOpen(!isLangDropdownOpen);
  };

  const selectLanguage = (langCode) => {
    changeLanguage(langCode);
    setIsLangDropdownOpen(false);
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <>
      {/* Vertical Social Sidebar */}
      <div className={`social-sidebar ${isMobileMenuOpen ? 'hidden' : ''}`}>
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

      {/* Invisible Click Outside Area */}
      {isMobileMenuOpen && (
        <div className="click-outside-overlay" onClick={closeMobileMenu}></div>
      )}

      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Left Side: Hamburger Only */}
          <div className="navbar-left">
            <button 
              className={`navbar-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          {/* Centered Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <img src="/syncplay nobg (1).png" alt="syncplay eSports" />
          </Link>

          {/* Mobile Menu Overlay */}
          <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {/* Language Selector Inside Mobile Menu */}
            <div className="mobile-language-selector" onClick={toggleLangDropdown}>
              <span>{currentLang.code.toUpperCase()}</span>
              <i className={`fas fa-chevron-down ${isLangDropdownOpen ? 'rotate' : ''}`}></i>
              
              {isLangDropdownOpen && (
                <div className="language-dropdown-mobile">
                  {languages.map(lang => (
                    <div
                      key={lang.code}
                      className={`lang-option ${lang.code === currentLanguage ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectLanguage(lang.code);
                      }}
                    >
                      {lang.code === currentLanguage && (
                        <i className="fas fa-check lang-checkmark"></i>
                      )}
                      <span className="lang-name">{lang.code.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" className="nav-link" onClick={closeMobileMenu}>
                  {t.home}
                </Link>
              </li>
              <li className="nav-item nav-item-dropdown">
                <div className="nav-link nav-link-with-dropdown">
                  {t.tournaments}
                </div>
                <div className="nav-dropdown-mobile">
                  <Link to="/tournaments#classic" className="dropdown-item" onClick={closeMobileMenu}>
                    {t.classicLeague}
                  </Link>
                  <Link to="/tournaments#weekend" className="dropdown-item" onClick={closeMobileMenu}>
                    {t.weekendTournaments}
                  </Link>
                  <Link to="/news" className="dropdown-item" onClick={closeMobileMenu}>
                    {t.archives}
                  </Link>
                </div>
              </li>
              <li className="nav-item">
                <Link to="/events" className="nav-link" onClick={closeMobileMenu}>
                  {t.events}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/players" className="nav-link" onClick={closeMobileMenu}>
                  {t.players}
                </Link>
              </li>
              <li className="nav-item nav-item-dropdown">
                <div className="nav-link nav-link-with-dropdown">
                  {t.aboutUs}
                </div>
                <div className="nav-dropdown-mobile">
                  <Link to="/events" className="dropdown-item" onClick={closeMobileMenu}>
                    {t.eventCalendars}
                  </Link>
                  <Link to="/tournaments" className="dropdown-item" onClick={closeMobileMenu}>
                    {t.tournamentRegulations}
                  </Link>
                  <Link to="/tournaments" className="dropdown-item" onClick={closeMobileMenu}>
                    {t.gameSettings}
                  </Link>
                  <Link to="/contact" className="dropdown-item" onClick={closeMobileMenu}>
                    {t.contacts}
                  </Link>
                </div>
              </li>
              <li className="nav-item">
                <Link to="/news" className="nav-link" onClick={closeMobileMenu}>
                  {t.news}
                </Link>
              </li>
            </ul>

            {/* Mobile Menu CTA Buttons */}
            <div className="mobile-menu-actions">
              <Link to="/events" className="mobile-btn mobile-btn-primary" onClick={closeMobileMenu}>
                {t.events}
              </Link>
              <Link to="/register" className="mobile-btn mobile-btn-secondary" onClick={closeMobileMenu}>
                {t.joinTournaments}
              </Link>
            </div>

            {/* Mobile Menu Social Icons */}
            <div className="mobile-menu-social">
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
      </nav>
    </>
  );
};

export default Navbar;

