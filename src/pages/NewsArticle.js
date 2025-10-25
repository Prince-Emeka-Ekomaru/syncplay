import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import './NewsArticle.css';

const NewsArticle = () => {
  const { id } = useParams();
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];

  // Mock article data - in real app this would come from API/database
  const article = {
    id: id,
    title: t.newsArticleTitle,
    category: t.tournamentAnnouncement,
    author: t.syncplayTeam,
    date: 'October 23, 2025',
    image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
    content: t.newsArticleContent
  };

  const relatedArticles = [
    {
      id: 2,
      title: t.tournamentRulesRegulations,
      image: '/fc-26-1024x639.jpg'
    },
    {
      id: 3,
      title: t.meetTheCompetition,
      image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg'
    }
  ];

  return (
    <div className="article-page">
      {/* Article Header */}
      <section className="article-header">
        <div className="article-header-overlay"></div>
        <div className="container">
          <div className="article-breadcrumb">
            <Link to="/news">{t.news}</Link>
            <i className="fas fa-chevron-right"></i>
            <span>{article.category}</span>
          </div>
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span className="meta-item">
              <i className="fas fa-folder"></i> {article.category}
            </span>
            <span className="meta-item">
              <i className="fas fa-calendar"></i> {article.date}
            </span>
            <span className="meta-item">
              <i className="fas fa-user"></i> {article.author}
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="article-content">
        <div className="container">
          <div className="article-wrapper">
            <div className="article-main">
              <div className="article-image">
                <img src={article.image} alt={article.title} />
              </div>
              
              <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

              <div className="article-share">
                <h4>{t.shareArticle}</h4>
                <div className="share-buttons">
                  <button className="share-btn twitter">
                    <i className="fab fa-twitter"></i>
                  </button>
                  <button className="share-btn facebook">
                    <i className="fab fa-facebook"></i>
                  </button>
                  <button className="share-btn linkedin">
                    <i className="fab fa-linkedin"></i>
                  </button>
                  <button className="share-btn link">
                    <i className="fas fa-link"></i>
                  </button>
                </div>
              </div>

              <div className="article-navigation">
                <Link to="/news" className="btn btn-secondary">
                  <i className="fas fa-arrow-left"></i> {t.backToNews}
                </Link>
              </div>
            </div>

            <aside className="article-sidebar">
              <div className="sidebar-widget">
                <h3>{t.relatedArticles}</h3>
                <div className="related-articles">
                  {relatedArticles.map(related => (
                    <Link key={related.id} to={`/news/${related.id}`} className="related-card">
                      <img src={related.image} alt={related.title} />
                      <h4>{related.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="sidebar-widget cta-widget">
                <i className="fas fa-trophy"></i>
                <h3>{t.joinATournament}</h3>
                <p>{t.joinTournamentDesc}</p>
                <Link to="/tournaments" className="btn btn-primary">
                  {t.viewTournaments}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsArticle;

