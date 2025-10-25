import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import './News.css';

const News = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const newsArticles = [
    {
      id: 1,
      title: t.newsArticle1Title,
      excerpt: t.newsArticle1Excerpt,
      image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
      date: 'October 23, 2025',
      category: 'announcements',
      author: t.syncplayTeam
    },
    {
      id: 2,
      title: t.newsArticle2Title,
      excerpt: t.newsArticle2Excerpt,
      image: '/fc-26-1024x639.jpg',
      date: 'October 23, 2025',
      category: 'announcements',
      author: t.syncplayTeam
    },
    {
      id: 3,
      title: t.newsArticle3Title,
      excerpt: t.newsArticle3Excerpt,
      image: '/1acc9234056000389336228dc9f195d0570f25a5.png',
      date: 'October 22, 2025',
      category: 'announcements',
      author: t.syncplayTeam
    },
    {
      id: 4,
      title: t.newsArticle4Title,
      excerpt: t.newsArticle4Excerpt,
      image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
      date: 'October 22, 2025',
      category: 'announcements',
      author: t.syncplayTeam
    },
    {
      id: 5,
      title: t.newsArticle5Title,
      excerpt: t.newsArticle5Excerpt,
      image: '/49f5b4f9bcc62ca23349c7f4096a7d52b91a7a3f.jpg',
      date: 'October 21, 2025',
      category: 'announcements',
      author: t.syncplayTeam
    },
    {
      id: 6,
      title: t.newsArticle6Title,
      excerpt: t.newsArticle6Excerpt,
      image: '/fc-26-1024x639.jpg',
      date: 'October 20, 2025',
      category: 'announcements',
      author: t.syncplayTeam
    }
  ];

  const categories = [
    { key: 'all', label: t.all },
    { key: 'tournament-results', label: t.tournamentResults },
    { key: 'announcements', label: t.announcements },
    { key: 'player-profiles', label: t.playerProfiles }
  ];
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const filteredArticles = selectedCategory === 'all' 
    ? newsArticles 
    : newsArticles.filter(article => article.category === selectedCategory);

  // Helper function to get translated category label
  const getCategoryLabel = (categoryKey) => {
    const category = categories.find(cat => cat.key === categoryKey);
    return category ? category.label : categoryKey;
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
                  <Link to={`/news/${article.id}`} className="read-more">
                    {t.readMore} <i className="fas fa-arrow-right"></i>
                  </Link>
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

