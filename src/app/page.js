"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
// Registration count hook removed as tournament is completed
import { supabase, getMediaUrl } from '../supabaseClient';
import './Home.css';

const Home = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  // Registration count hook removed as tournament is completed
  
  const [newsArticles, setNewsArticles] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    // Fetch latest news
    const fetchLatestNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!error && data) {
          const formatted = data.map(art => ({
            id: art.id,
            title: art.title,
            excerpt: art.excerpt,
            image: art.image_url,
            date: new Date(art.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
            category: art.category
          }));
          setNewsArticles(formatted);
        }
      } catch (err) {
        console.error('Failed to load latest news:', err);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchLatestNews();
  }, []);

  const handleShare = async (article) => {
    const shareUrl = window.location.origin + `/news/${article.id}`;
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: shareUrl
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

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
  }, [newsArticles]);



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
          <h1 className="hero-title animate-on-scroll" data-title={t.heroTitle}>
            <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
              {t.heroTitle}
            </span>
          </h1>
          <p className="hero-subtitle animate-on-scroll">
            {t.heroSubtitle}
          </p>
          <div className="hero-cta animate-on-scroll">
            <Link href="/tournament-results" className="btn btn-primary">{t.viewResults}</Link>
            <Link href="/gallery" className="btn btn-secondary">{t.watchHighlights}</Link>
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
            <a href="https://streamlivr.com/@syncplayesports" target="_blank" rel="noopener noreferrer" aria-label="Streamlivr" title="Streamlivr - Official Stream Partner" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/STREAMLIVR logo WHITE.png" alt="Streamlivr" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
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
              <Link href="/tournaments" className="feature-link">
                {t.learnMore} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            {/* Commented out - Weekend Cup removed */}
            {/* <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-calendar-week"></i>
              </div>
              <h3>{t.weekendCup}</h3>
              <p>
                {t.weekendCupDesc}
              </p>
              <Link href="/events" className="feature-link">
                {t.learnMore} <i className="fas fa-arrow-right"></i>
              </Link>
            </div> */}

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-archive"></i>
              </div>
              <h3>{t.archive}</h3>
              <p>
                {t.archiveDesc}
              </p>
              <Link href="/news" className="feature-link">
                {t.learnMore} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-icon">
                <i className="fas fa-images"></i>
              </div>
              <h3>{t.gallery || 'Gallery'}</h3>
              <p>
                Browse photos and videos from our tournaments and events
              </p>
              <Link href="/gallery" className="feature-link">
                {t.learnMore} <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* Commented out - eBasketball banner removed */}
          {/* <div className="coming-soon-banner animate-on-scroll">
            <i className="fas fa-basketball-ball"></i>
            <h3>{t.comingSoon}</h3>
            <p>{t.comingSoonDesc}</p>
          </div> */}
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
                <h3>1</h3>
                <p>{t.tournamentCompleted}</p>
              </div>
              <div className="stat-item stat-item-highlight">
                <h3>{t.exclusivePrizePoolAbbrev}</h3>
                <p>{t.exclusivePrizePoolShort}</p>
              </div>
              <div className="stat-item">
                <h3>🏆</h3>
                <p>{t.championsCrowned}</p>
              </div>
              <div className="stat-item">
                <h3>2025</h3>
                <p>{t.yearFounded}</p>
              </div>
            </div>
            <Link href="/contact" className="btn btn-primary">{t.discoverSyncplay}</Link>
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
            {loadingNews ? (
              <div className="loading-spinner" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#71717a' }}>
                <i className="fas fa-circle-notch fa-spin"></i> Loading latest news...
              </div>
            ) : newsArticles.length > 0 ? (
              newsArticles.map(article => (
                <div key={article.id} className="news-card animate-on-scroll">
                  <div className="news-image">
                    <img src={getMediaUrl(article.image)} alt={article.title} />
                    <div className="news-date">{article.date}</div>
                  </div>
                  <div className="news-content">
                    <h3>{article.title}</h3>
                    <p>{article.excerpt}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                      <Link href={`/news/${article.id}`} className="news-link" style={{ margin: 0 }}>
                        {t.readMore} <i className="fas fa-arrow-right"></i>
                      </Link>
                      <button 
                        onClick={() => handleShare(article)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#a1a1aa',
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#e63946'; e.currentTarget.style.borderColor = '#e63946'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                        title="Share this news"
                      >
                        <i className="fas fa-share-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#71717a' }}>
                No news articles found.
              </div>
            )}
          </div>

          <div className="news-cta text-center animate-on-scroll">
            <Link href="/news" className="btn btn-secondary">{t.viewAllNews}</Link>
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
            <Link href="/contact" className="btn btn-primary btn-get-in-touch">{t.getInTouch}</Link>
          </div>

          {/* Official Partners Spotlight */}
          <div className="partners-section animate-on-scroll" style={{ marginTop: '3rem' }}>
            <div className="stream-partner-card" style={{
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '2px solid rgba(41, 167, 228, 0.4)',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              margin: '0 auto 3rem auto',
              maxWidth: '850px',
              boxShadow: '0 10px 30px rgba(41, 167, 228, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                background: 'linear-gradient(90deg, #29A7E4, #e63946)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '800',
                letterSpacing: '1.5px',
                padding: '6px 16px',
                borderBottomLeftRadius: '12px',
                textTransform: 'uppercase'
              }}>
                <i className="fas fa-signal" style={{ marginRight: '6px' }}></i>
                {t.streamPartner || 'EXCLUSIVE LIVESTREAM PARTNER'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <a href="https://streamlivr.com/@syncplayesports" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', margin: '1rem 0' }}>
                  <img 
                    src="/STREAMLIVR logo WHITE.png" 
                    alt="Streamlivr - Official Exclusive Stream Partner" 
                    style={{ height: '70px', width: 'auto', maxWidth: '100%', filter: 'drop-shadow(0 4px 12px rgba(41, 167, 228, 0.3))' }}
                  />
                </a>
                
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: '0.5rem 0 1rem 0' }}>
                  {t.streamPartnerSubtitle || 'Official & Exclusive Live Streaming Home for syncplay eSports'}
                </h3>
                
                <p style={{ color: '#cbd5e1', fontSize: '0.98rem', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 1.5rem auto' }}>
                  {t.streamPartnerDesc || 'Streamlivr is our exclusive live stream partner — the only platform where you can join and watch our live streams! Streamlivr is a social and livestreaming app where gamers, creators, and streamers create and share content, go live, and earn from rewards, fan gifts, and purchases with a built-in wallet and instant bank payouts.'}
                </p>

                <div style={{
                  background: 'rgba(230, 57, 70, 0.1)',
                  border: '1px solid rgba(230, 57, 70, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: '#f87171',
                  fontWeight: '600'
                }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                  {t.streamPartnerDisclaimer || 'Streamlivr is the ONLY official platform to join syncplay live streams.'}
                </div>

                <a 
                  href="https://streamlivr.com/@syncplayesports" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #29A7E4 0%, #1d4ed8 100%)',
                    borderColor: '#29A7E4',
                    boxShadow: '0 4px 15px rgba(41, 167, 228, 0.4)',
                    padding: '12px 28px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <i className="fas fa-play-circle" style={{ fontSize: '1.2rem' }}></i>
                  {t.watchLiveOnStreamlivr || 'Watch Live on Streamlivr'}
                </a>
              </div>
            </div>

            {/* Venue Spotlight */}
            <h3 className="partners-title">{t.nextVenue || 'NEXT EVENT VENUE'}</h3>
            <div className="partner-logos">
              <div className="partner-logo partner-logo-featured" style={{ background: 'transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#FFB300', letterSpacing: '2px' }}>RUFUS & BEE'S</span>
              </div>
            </div>
            <p className="partner-description" style={{ maxWidth: '600px', margin: '1rem auto 0 auto' }}>
              {t.nextVenueDesc || "Lagos' premier arcade games center, sports bar, and bowling alley. Join us live at Twinwaters Lagos for high-stakes esports action, arcade chips, and premium entertainment."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
