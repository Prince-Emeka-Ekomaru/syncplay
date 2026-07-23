"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { translations, languages } from '../translations/translations';
import './Navbar.css';

const Navbar = () => {
  const pathname = usePathname();
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

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Vertical Social Sidebar */}
      {pathname !== '/community' && !pathname.startsWith('/admin') && (
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
          <a href="https://streamlivr.com/@syncplayesports" target="_blank" rel="noopener noreferrer" aria-label="Streamlivr" title="Streamlivr - Official Stream Partner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/streamlivr-icon.png" alt="Streamlivr" style={{ width: '26px', height: '26px', borderRadius: '6px', objectFit: 'contain' }} />
          </a>
        </div>
      )}

      {/* Invisible Click Outside Area */}
      {isMobileMenuOpen && (
        <div className="click-outside-overlay" onClick={closeMobileMenu}></div>
      )}

      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Left Navigation (Desktop Only) */}
          <div className="navbar-desktop-nav desktop-nav-left">
            <ul className="desktop-nav-list">
              <li className="nav-item">
                <Link href="/" className={`desktop-nav-link ${pathname === '/' ? 'active' : ''}`}>
                  {t.home}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/tournaments" className={`desktop-nav-link ${pathname.startsWith('/tournaments') ? 'active' : ''}`}>
                  {t.tournaments}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/players" className={`desktop-nav-link ${pathname.startsWith('/players') ? 'active' : ''}`}>
                  {t.playerLeaderboard || 'LEADERBOARD'}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/gallery" className={`desktop-nav-link ${pathname.startsWith('/gallery') ? 'active' : ''}`}>
                  {t.gallery || 'MEDIA'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Left Side: Hamburger Only (Mobile Only) */}
          <div className="navbar-left mobile-only">
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

          <Link href="/" className="navbar-logo" onClick={closeMobileMenu}>
            <Image src="/syncplay-nobg-1.png" alt="syncplay eSports" width={200} height={60} style={{ width: '95%', height: '95%', objectFit: 'contain' }} priority />
          </Link>

          {/* Right Navigation (Desktop Only) */}
          <div className="navbar-desktop-nav desktop-nav-right">
            <ul className="desktop-nav-list">
              <li className="nav-item">
                <Link href="/community" className={`desktop-nav-link ${pathname.startsWith('/community') ? 'active' : ''}`}>
                  {t.community}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/news" className={`desktop-nav-link ${pathname.startsWith('/news') ? 'active' : ''}`}>
                  {t.news}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/contact" className={`desktop-nav-link ${pathname === '/contact' ? 'active' : ''}`}>
                  {t.contacts || 'CONTACT'}
                </Link>
              </li>
            </ul>
          </div>

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
                <Link href="/" className="nav-link" onClick={closeMobileMenu}>
                  {t.home}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/tournaments" className="nav-link" onClick={closeMobileMenu}>
                  {t.tournaments}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/players" className="nav-link" onClick={closeMobileMenu}>
                  {t.playerLeaderboard || 'LEADERBOARD'}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/gallery" className="nav-link" onClick={closeMobileMenu}>
                  {t.gallery || 'MEDIA'}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/community" className="nav-link" onClick={closeMobileMenu}>
                  {t.community}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/news" className="nav-link" onClick={closeMobileMenu}>
                  {t.news}
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/contact" className="nav-link" onClick={closeMobileMenu}>
                  {t.contacts || 'CONTACT'}
                </Link>
              </li>
            </ul>

            {/* Mobile Menu CTA Buttons */}
            <div className="mobile-menu-actions">
              <Link href="/register" className="mobile-btn mobile-btn-primary" onClick={closeMobileMenu}>
                {t.joinTournaments || 'REGISTER TEAM'}
              </Link>
              <Link href="/spectator-register" className="mobile-btn mobile-btn-secondary" onClick={closeMobileMenu}>
                {t.spectatorTickets || 'SPECTATOR TICKET'}
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
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

