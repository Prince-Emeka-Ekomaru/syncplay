"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations/translations';
import { supabase } from '../../supabaseClient';
import { getPlayersFromRegistrations } from '../../utils/playerStats';
import './News.css';

const News = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [dbArticles, setDbArticles] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map(art => ({
            id: art.id,
            title: art.title,
            excerpt: art.excerpt,
            image: art.image_url,
            date: new Date(art.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
            category: art.category,
            author: art.author
          }));
          setDbArticles(formatted);
        }
      } catch (err) {
        console.error('Failed to load news from database:', err);
      }
    };

    const loadPlayers = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('registrations')
            .select('*')
            .eq('payment_status', 'completed');
          if (!error && data) {
            setPlayers(getPlayersFromRegistrations(data));
          } else {
            setPlayers(getPlayersFromRegistrations([]));
          }
        } else {
          setPlayers(getPlayersFromRegistrations([]));
        }
      } catch (err) {
        console.error('Failed to load registrations for news:', err);
        setPlayers(getPlayersFromRegistrations([]));
      }
    };

    loadNews();
    loadPlayers();
  }, []);

  const getPlayerPhoto = (player) => {
    if (player.photoUrl) return player.photoUrl;
    
    const tag = player.gamerTag.toLowerCase();
    if (tag.includes('tactical')) return "/tournament-media/photos/welcome clinton tactical.png";
    if (tag.includes('baji') || tag.includes('banji')) return "/tournament-media/photos/welcome baji jr.png";
    if (tag.includes('boyd')) return "/tournament-media/photos/welcome boyd.png";
    if (tag.includes('bright')) return "/tournament-media/photos/welcome bright.png";
    if (tag.includes('ebuka') || tag.includes('bukas')) return "/tournament-media/photos/welcome ebuka.png";
    if (tag.includes('eddy') || tag.includes('eddie')) return "/tournament-media/photos/welcome eddy.png";
    if (tag.includes('josh')) return "/tournament-media/photos/welcome game with josh.png";
    if (tag.includes('mitch')) return "/tournament-media/photos/welcome mitch.png";
    if (tag.includes('cad') || tag.includes('wole')) return "/tournament-media/photos/welcome wolevation.png";
    
    // Team-level fallback posters
    const team = player.teamName?.toLowerCase() || '';
    if (team.includes('century') || team.includes('flame')) {
      return "/tournament-media/photos/l'flames and century.png";
    }
    if (team.includes('temple') || team.includes('fantastic')) {
      return "/tournament-media/photos/temple boys and d fantastic 2.png";
    }
    if (team.includes('prime') || team.includes('twin')) {
      return "/tournament-media/photos/prime time and dangerous twins.png";
    }
    if (team.includes('orbyters') || team.includes('psych') || team.includes('banter')) {
      return "/tournament-media/photos/orbyters and get psyched.png";
    }
    if (team.includes('gameverse') || team.includes('titan')) {
      return "/tournament-media/photos/titans and gameverxe.png";
    }
    if (team.includes('fola') || team.includes('yemi')) {
      return "/tournament-media/photos/3RD PLACE.png";
    }
    
    return "/syncplay nobg.png";
  };

  const playerProfileCards = players
    .filter(p => {
      // Only include players who have actual individual picture data (photoUrl or custom welcome poster)
      if (p.photoUrl) return true;
      const tag = p.gamerTag.toLowerCase();
      return (
        tag.includes('tactical') ||
        tag.includes('baji') || tag.includes('banji') ||
        tag.includes('boyd') ||
        tag.includes('bright') ||
        tag.includes('ebuka') || tag.includes('bukas') ||
        tag.includes('eddy') || tag.includes('eddie') ||
        tag.includes('josh') ||
        tag.includes('mitch') ||
        tag.includes('cad') || tag.includes('wole')
      );
    })
    .map(p => {
      const { attack, defense, passing, consistency, clutch } = p.attributes;
      const overallRating = Math.round((attack + defense + passing + consistency + clutch) / 5);
      
      const verifiedTeams = [
        'century', "l'flames", 'temple boys', 'd fantastic 2', 
        'orbyters', 'y.fola', 'banters fc', 'get psyched', 
        'gameverse', 'prime time', 'dangerous twins', 'footybands', 'titan'
      ];
      const teamLower = p.teamName ? p.teamName.toLowerCase().trim() : '';
      const isSureOfTeam = teamLower && verifiedTeams.includes(teamLower);
      
      const excerpt = isSureOfTeam
        ? `${p.name} is a member of team ${p.teamName} for the ${p.tournamentId || '2v2-nov-2025'} tournaments. Note: team rating is based on previous tournament outcome.`
        : `${p.name} is a member for the ${p.tournamentId || '2v2-nov-2025'} tournaments. Note: team rating is based on previous tournament outcome.`;
      
      return {
        id: `player-${p.gamerTag}`,
        title: `${p.name} (${p.gamerTag})`,
        excerpt,
        image: getPlayerPhoto(p),
        date: 'December 20, 2025',
        category: 'player-profiles',
        author: 'syncplay eSports',
        isPlayerProfile: true,
        gamerTag: p.gamerTag
      };
    });

  const categories = [
    { key: 'all', label: t.all },
    { key: 'tournament-results', label: t.tournamentResults },
    { key: 'announcements', label: t.announcements },
    { key: 'player-profiles', label: t.playerProfiles }
  ];
  const [selectedCategory, setSelectedCategory] = useState('all');

  const allArticles = [...dbArticles, ...playerProfileCards];
  
  // Exclude player profiles from the main "ALL" tab to avoid cluttering, but display them when selecting "PLAYER PROFILES"
  const filteredArticles = selectedCategory === 'all' 
    ? allArticles.filter(article => !article.isPlayerProfile) 
    : allArticles.filter(article => article.category === selectedCategory);

  // Helper function to get translated category label
  const getCategoryLabel = (categoryKey) => {
    const category = categories.find(cat => cat.key === categoryKey);
    return category ? category.label : categoryKey;
  };

  const handleShare = async (article) => {
    const shareUrl = window.location.origin + (article.isPlayerProfile ? `/players/${article.gamerTag}` : `/news/${article.id}`);
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

  return (
    <div className="news-page">
      {/* Hero Section */}
      <section className="news-hero">
        <div className="news-hero-overlay"></div>
        <div className="container">
          <h1>{t.latestNews}</h1>
          <p>{t.latestNewsDesc}</p>
        </div>
      </section>

      {/* News Content */}
      <section className="news-content">
        <div className="container">
          {/* Category Filter */}
          <div className="news-filter">
            {categories.map(category => (
              <button
                key={category.key}
                className={`filter-btn ${selectedCategory === category.key ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* News Grid */}
          <div className="news-grid">
            {filteredArticles.map(article => (
              <div key={article.id} className="news-card">
                <div className="news-image">
                  <img src={article.image} alt={article.title} />
                  <div className="news-category">{getCategoryLabel(article.category)}</div>
                </div>
                <div className="news-body">
                  <div className="news-meta">
                    <span className="news-date">
                      <i className="fas fa-calendar"></i> {article.date}
                    </span>
                    <span className="news-author">
                      <i className="fas fa-user"></i> {article.author}
                    </span>
                  </div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                    <Link href={article.isPlayerProfile ? `/players/${article.gamerTag}` : `/news/${article.id}`} className="read-more" style={{ margin: 0 }}>
                      {article.isPlayerProfile ? 'View Profile' : t.readMore} <i className="fas fa-arrow-right"></i>
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
            ))}
          </div>

          {/* Load More */}
          <div className="load-more">
            <button className="btn btn-secondary">{t.loadMoreArticles}</button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <i className="fas fa-envelope"></i>
            <h2>{t.stayUpdated}</h2>
            <p>{t.subscribeNewsletter}</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder={t.enterEmail} 
                required 
              />
              <button type="submit" className="btn btn-primary">{t.subscribe}</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default News;
