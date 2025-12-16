import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import { useRegistrationCount } from '../hooks/useRegistrationCount';
import './Home.css';

const Home = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const { slotsRemaining, totalSlots, loading } = useRegistrationCount();
  
  useEffect(() => {
    // Scroll animation observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const newsArticles = [
    {
      id: 1,
      title: 'syncplay eSports Launches - Historic 2v2 Tournament December 20th',
      excerpt: 'syncplay eSports officially launches with our inaugural 2v2 EA Sports FC 26 Tournament. Be part of history with our exclusive prize pool reserved for registered teams...',
      image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
      date: 'October 23, 2025'
    },
    {
      id: 2,
      title: 'Registration Now Open - 2v2 EA Sports FC 26 Tournament',
      excerpt: 'Registration is officially open for our first tournament! Limited spots available for exclusive prize pool. Entry fee is ₦20,000 per team (subsidized rate)...',
      image: '/fc-26-1024x639.jpg',
      date: 'October 23, 2025'
    },
    {
      id: 3,
      title: 'Meet syncplay - Nigeria\'s New eSports Platform',
      excerpt: 'Introducing syncplay eSports, a dedicated platform for competitive eFootball and eBasketball tournaments in Nigeria...',
      image: '/1acc9234056000389336228dc9f195d0570f25a5.png',
      date: 'October 22, 2025'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content container">
          <div className="hero-logo animate-on-scroll">
            <img src="/syncplay text nobg 1.png" alt="syncplay Logo" />
          </div>
          <h1 className="hero-title animate-on-scroll" data-title={t.heroTitle}></h1>
          <p className="hero-subtitle animate-on-scroll">
            {t.heroSubtitle}
          </p>
          <div className="hero-cta animate-on-scroll">
            <Link to="/tournaments" className="btn btn-primary">{t.joinTournaments}</Link>
            <Link to="/events" className="btn btn-secondary">{t.viewEvents}</Link>
          </div>
          <div className="hero-social animate-on-scroll">
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
        <div className="hero-scroll-indicator">
          <span>{t.explore}</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="what-we-do">
        <div className="container">
          <div className="section-header text-center animate-on-scroll">
            <h2>{t.whatWeDo}</h2>
            <p>
              {t.whatWeDoDesc}
            </p>
          </div>

          <div className="what-we-do-grid">
            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <h3>{t.regularTournaments}</h3>
              <p>
                {t.regularTournamentsDesc}
              </p>
              <Link to="/tournaments" className="feature-link">
                {t.learnMore} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-calendar-week"></i>
              </div>
              <h3>{t.weekendCup}</h3>
              <p>
                {t.weekendCupDesc}
              </p>
              <Link to="/events" className="feature-link">
                {t.learnMore} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-archive"></i>
              </div>
              <h3>{t.archive}</h3>
              <p>
                {t.archiveDesc}
              </p>
              <Link to="/news" className="feature-link">
                {t.learnMore} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="coming-soon-banner animate-on-scroll">
            <i className="fas fa-basketball-ball"></i>
            <h3>{t.comingSoon}</h3>
            <p>{t.comingSoonDesc}</p>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="who-we-are">
        <div className="who-we-are-background"></div>
        <div className="container">
          <div className="who-we-are-content animate-on-scroll">
            <h2>{t.whoWeAre}</h2>
            <p>
              {t.whoWeAreDesc1}
            </p>
            <p>
              {t.whoWeAreDesc2}
            </p>
            <div className="stats-grid">
              <div className="stat-item stat-item-highlight">
                <h3>DEC 20</h3>
                <p>{t.firstTournament}</p>
              </div>
              <div className="stat-item stat-item-highlight">
                <h3>{t.exclusivePrizePoolAbbrev}</h3>
                <p>{t.exclusivePrizePoolShort}</p>
              </div>
              <div className="stat-item">
                <h3>{slotsRemaining === 0 ? '!' : '⚡'}</h3>
                <p>{slotsRemaining === 0 ? t.slotsUrgencyFull : t.slotsUrgency}</p>
              </div>
              <div className="stat-item">
                <h3>2025</h3>
                <p>{t.yearFounded}</p>
              </div>
            </div>
            <Link to="/contact" className="btn btn-primary">{t.discoverSyncplay}</Link>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="latest-news">
        <div className="container">
          <div className="section-header text-center animate-on-scroll">
            <h2>{t.latestNews}</h2>
            <p>{t.latestNewsDesc}</p>
          </div>

          <div className="news-grid">
            {newsArticles.map(article => (
              <div key={article.id} className="news-card animate-on-scroll">
                <div className="news-image">
                  <img src={article.image} alt={article.title} />
                  <div className="news-date">{article.date}</div>
                </div>
                <div className="news-content">
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <Link to={`/news/${article.id}`} className="news-link">
                    {t.readMore} <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="news-cta text-center animate-on-scroll">
            <Link to="/news" className="btn btn-secondary">{t.viewAllNews}</Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="home-contact">
        <div className="container">
          <div className="contact-content text-center animate-on-scroll">
            <h2>{t.stillQuestions}</h2>
            <div className="decorative-line">
              <div className="line-dot"></div>
              <div className="line"></div>
              <div className="line-dot"></div>
            </div>
            <p>
              {t.contactDesc}
            </p>
            <Link to="/contact" className="btn btn-primary btn-get-in-touch">{t.getInTouch}</Link>
          </div>

          {/* Partner Logos */}
          <div className="partners-section animate-on-scroll">
            <h3 className="partners-title">{t.mediaPartner}</h3>
            <div className="partner-logos">
              <div className="partner-logo partner-logo-featured">
                <img src="/the-twelfth-man.jpg" alt="The Twelfth Man" />
              </div>
            </div>
            <p className="partner-description">{t.mediaPartnerDesc}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

