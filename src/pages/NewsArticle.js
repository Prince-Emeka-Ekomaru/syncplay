import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import './NewsArticle.css';

const NewsArticle = () => {
  const { id } = useParams();
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];

  // Article data based on ID
  const getArticleData = () => {
    const articleId = parseInt(id);
    
    if (articleId === 7) {
      return {
        id: articleId,
        title: t.tournamentChampionsCrowned || 'Tournament Champions Crowned - Full Results & Highlights',
        category: t.tournamentResults,
        author: t.syncplayTeam,
        date: 'December 20, 2025',
        image: '/tournament-media/photos/winners ss.png',
        content: `
          <p>Our inaugural 2v2 EA Sports FC 26 Tournament has been completed successfully! After intense competition, we're proud to announce our champions.</p>
          
          <h3>Final Standings</h3>
          <p><strong>1st Place:</strong> ${t.winnerTeamName || 'Champions'} - ${t.winnerPrize || '₦500,000'}</p>
          <p><strong>2nd Place:</strong> ${t.runnerUpTeamName || 'Runner-Up'} - ${t.runnerUpPrize || '₦300,000'}</p>
          <p><strong>3rd Place:</strong> ${t.thirdPlaceTeamName || 'Third Place'} - ${t.thirdPlacePrize || '₦200,000'}</p>
          
          <h3>Tournament Highlights</h3>
          <p>The tournament featured 12 teams competing in a group stage format, followed by knockout rounds. The competition was fierce, with many close matches and incredible displays of skill.</p>
          
          <p>Thank you to all participants, supporters, and our media partner The Twelfth Man for making this inaugural tournament a success!</p>
          
          <div style="margin: 2rem 0; text-align: center;">
            <a href="/tournament-results" style="display: inline-block; padding: 1rem 2rem; background: #E63946; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem;">
              View Full Results
            </a>
            <a href="/gallery" style="display: inline-block; padding: 1rem 2rem; background: #333; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem;">
              View Gallery
            </a>
            <a href="/videos" style="display: inline-block; padding: 1rem 2rem; background: #333; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem;">
              Watch Videos
            </a>
          </div>
        `
      };
    } else if (articleId === 8) {
      return {
        id: articleId,
        title: t.tournamentHighlightsArticle || 'Tournament Highlights & Best Moments',
        category: t.tournamentResults,
        author: t.syncplayTeam,
        date: 'December 21, 2025',
        image: '/tournament-media/photos/IMG_4596.JPEG',
        content: `
          <p>Relive the most exciting moments from our inaugural tournament! From incredible goals to nail-biting finishes, the tournament delivered non-stop action.</p>
          
          <h3>Best Moments</h3>
          <ul>
            <li>Incredible team coordination displays</li>
            <li>Last-minute winning goals</li>
            <li>Outstanding defensive plays</li>
            <li>Championship celebration</li>
          </ul>
          
          <h3>Player Interviews</h3>
          <p>Watch exclusive interviews with tournament participants, including pre-event predictions, post-match reactions, and winner celebrations.</p>
          
          <p>Check out our <a href="/videos">Videos page</a> for full match highlights and player interviews!</p>
        `
      };
    } else {
      return {
        id: articleId,
        title: t.newsArticleTitle,
        category: t.tournamentAnnouncement,
        author: t.syncplayTeam,
        date: 'October 23, 2025',
        image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
        content: t.newsArticleContent
      };
    }
  };

  const article = getArticleData();

  const relatedArticles = [
    {
      id: 7,
      title: t.tournamentChampionsCrowned || 'Tournament Champions Crowned',
      image: '/tournament-media/photos/winners ss.png'
    },
    {
      id: 8,
      title: t.tournamentHighlightsArticle || 'Tournament Highlights',
      image: '/tournament-media/photos/IMG_4596.JPEG'
    },
    {
      id: 1,
      title: t.newsArticle1Title,
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
                {parseInt(id) === 7 || parseInt(id) === 8 ? (
                  <>
                    <i className="fas fa-trophy"></i>
                    <h3>{t.tournamentResults}</h3>
                    <p>{t.tournamentResultsDesc}</p>
                    <Link to="/tournament-results" className="btn btn-primary">
                      {t.viewResults}
                    </Link>
                  </>
                ) : (
                  <>
                    <i className="fas fa-trophy"></i>
                    <h3>{t.joinATournament}</h3>
                    <p>{t.joinTournamentDesc}</p>
                    <Link to="/tournaments" className="btn btn-primary">
                      {t.viewTournaments}
                    </Link>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsArticle;

