import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import { useRegistrationCount } from '../hooks/useRegistrationCount';
import './Comparison.css';

const Comparison = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const { count, totalSlots, loading } = useRegistrationCount();

  return (
    <div className="comparison-page">
      {/* Hero Section */}
      <section className="comparison-hero">
        <div className="comparison-hero-overlay"></div>
        <div className="container">
          <h1>{t.playerComparison}</h1>
          <p>{t.compareStatsPerformance}</p>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="comparison-coming-soon">
        <div className="container">
          <div className="coming-soon-wrapper">
            <div className="coming-soon-icon">
              <i className="fas fa-chart-bar"></i>
            </div>
            <h2>{t.comparisonToolComingSoon}</h2>
            <p className="coming-soon-text">
              {t.comparisonFeatureAvailable}
            </p>

            <div className="feature-preview">
              <h3>{t.whatYouCanCompare}</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <i className="fas fa-trophy"></i>
                  <span>{t.tournamentWins}</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-chart-line"></i>
                  <span>{t.winRates}</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-star"></i>
                  <span>{t.rankings}</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-money-bill-wave"></i>
                  <span>{t.earnings}</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-gamepad"></i>
                  <span>{t.playStyle}</span>
                </div>
                <div className="feature-item">
                  <i className="fas fa-history"></i>
                  <span>{t.headToHead}</span>
                </div>
              </div>
            </div>

            <div className="launch-info">
              <div className="launch-card">
                <i className="fas fa-calendar-check"></i>
                <h4>{t.firstTournament}</h4>
                <p>November 30, 2025</p>
              </div>
              <div className="launch-card">
                <i className="fas fa-users"></i>
                <h4>2v2 {t.formatLabel}</h4>
                <p>{loading ? '32' : totalSlots} {t.teams} {t.competing}</p>
              </div>
              <div className="launch-card">
                <i className="fas fa-trophy"></i>
                <h4>{t.prizePoolLabel}</h4>
                <p>₦1,500,000</p>
              </div>
            </div>

            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                <i className="fas fa-users"></i> {t.registerForTournament}
              </Link>
              <Link to="/players" className="btn btn-secondary btn-lg">
                <i className="fas fa-list"></i> {t.viewLeaderboard}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Comparison;
