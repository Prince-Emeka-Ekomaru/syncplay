import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import './Players.css';

const Players = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];

  return (
    <div className="players-page">
      {/* Hero Section */}
      <section className="players-hero">
        <div className="players-hero-overlay"></div>
        <div className="container">
          <h1>{t.playerLeaderboard}</h1>
          <p>{t.topCompetitivePlayers}</p>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="players-coming-soon">
        <div className="container">
          <div className="coming-soon-content">
            <div className="coming-soon-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <h2>{t.leaderboardComingSoon}</h2>
            <p className="coming-soon-subtitle">
              {t.leaderboardAvailableAfterTournament}
            </p>
            
            <div className="coming-soon-details">
              <div className="detail-item">
                <i className="fas fa-calendar-alt"></i>
                <div>
                  <strong>{t.firstTournament}</strong>
                  <span>November 30, 2025</span>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-users"></i>
                <div>
                  <strong>{t.formatLabel}</strong>
                  <span>2v2 {t.teamCompetition}</span>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-trophy"></i>
                <div>
                  <strong>{t.prizePoolLabel}</strong>
                  <span>₦1,500,000</span>
                </div>
              </div>
            </div>

            <div className="coming-soon-info">
              <h3>{t.whatWillBeDisplayed}</h3>
              <div className="info-grid">
                <div className="info-card">
                  <i className="fas fa-medal"></i>
                  <h4>{t.playerRankings}</h4>
                  <p>{t.basedOnPerformance}</p>
                </div>
                <div className="info-card">
                  <i className="fas fa-chart-line"></i>
                  <h4>{t.statistics}</h4>
                  <p>{t.winsLossesHistory}</p>
                </div>
                <div className="info-card">
                  <i className="fas fa-money-bill-wave"></i>
                  <h4>{t.earnings}</h4>
                  <p>{t.totalPrizeMoneyWon}</p>
                </div>
                <div className="info-card">
                  <i className="fas fa-star"></i>
                  <h4>{t.achievements}</h4>
                  <p>{t.badgesTitlesVictories}</p>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <p className="cta-text">
                {t.beFirstOnLeaderboard}
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-primary btn-large">
                  <i className="fas fa-users"></i> {t.registerForTournament}
                </Link>
                <Link to="/tournaments" className="btn btn-secondary btn-large">
                  <i className="fas fa-info-circle"></i> {t.learnMore}
                </Link>
              </div>
            </div>

            <div className="timeline-section">
              <h3>{t.whatNext}</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <strong>November 30, 2025</strong>
                    <p>{t.first2v2Tournament}</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <strong>{t.afterTournament}</strong>
                    <p>{t.leaderboardGoesLive}</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <strong>{t.ongoing}</strong>
                    <p>{t.regularTournamentsUpdates}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Players;
