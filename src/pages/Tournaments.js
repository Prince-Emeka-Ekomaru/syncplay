import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import { useRegistrationCount } from '../hooks/useRegistrationCount';
import './Tournaments.css';

const Tournaments = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const { slotsRemaining, totalSlots, loading } = useRegistrationCount();
  
  const tournamentTypes = [
    {
      id: 1,
      title: t.tournament2v2,
      description: t.tournament2v2Desc,
      frequency: t.launchingNov30,
      prizePool: t.exclusivePrizePoolShort,
      participants: loading ? '32 Teams' : `${totalSlots} Teams (${slotsRemaining} Slots Left)`,
      icon: 'fa-users-cog',
      color: '#E63946',
      status: 'active'
    },
    {
      id: 2,
      title: t.weekendCupTitle,
      description: t.weekendCupDescription,
      frequency: t.weekly,
      prizePool: t.exclusivePrizePoolShort,
      participants: '64 Players',
      icon: 'fa-calendar-week',
      color: '#FFB300',
      status: 'coming-soon'
    },
    {
      id: 3,
      title: t.championshipSeriesTitle,
      description: t.championshipSeriesDescription,
      frequency: t.monthly,
      prizePool: t.exclusivePrizePoolShort,
      participants: '32 Players',
      icon: 'fa-trophy',
      color: '#FFD700',
      status: 'coming-soon'
    }
  ];

  return (
    <div className="tournaments-page">
      {/* Hero Section */}
      <section className="tournaments-hero">
        <div className="tournaments-hero-overlay"></div>
        <div className="container">
          <h1>{t.joinTournaments}</h1>
          <p>{t.joinTournamentsSubtitle}</p>
          <div className="hero-cta">
            <Link to="/events" className="btn btn-primary">{t.viewUpcomingEvents}</Link>
            <Link to="/contact" className="btn btn-secondary">{t.getInTouch}</Link>
          </div>
        </div>
      </section>

      {/* Tournament Types */}
      <section className="tournament-types">
        <div className="container">
          <div className="section-header">
            <h2>{t.tournamentFormats}</h2>
            <p>{t.tournamentFormatsDesc}</p>
          </div>

          <div className="tournament-grid">
            {tournamentTypes.map(tournament => (
              <div key={tournament.id} className={`tournament-card ${tournament.status === 'coming-soon' ? 'coming-soon' : ''}`}>
                <div className="tournament-icon" style={{ backgroundColor: tournament.color }}>
                  <i className={`fas ${tournament.icon}`}></i>
                </div>
                <h3>{tournament.title}</h3>
                <p>{tournament.description}</p>
                <div className="tournament-specs">
                  <div className="spec-item">
                    <span className="spec-label">{tournament.status === 'active' ? `${t.dateLabel}:` : `${t.frequency}:`}</span>
                    <span className="spec-value">{tournament.frequency}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">{t.prizePoolLabel}:</span>
                    <span className="spec-value">{tournament.prizePool}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">{tournament.status === 'active' ? `${t.teamsLabel}:` : `${t.maxPlayers}:`}</span>
                    <span className="spec-value">{tournament.participants}</span>
                  </div>
                </div>
                {tournament.status === 'active' ? (
                  <Link to="/register" className="tournament-link">
                    {t.registerNow} <i className="fas fa-arrow-right"></i>
                  </Link>
                ) : (
                  <button className="tournament-link disabled" disabled>
                    {t.comingSoon}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="how-to-join">
        <div className="container">
          <div className="section-header text-center">
            <h2>{t.howToJoin}</h2>
            <p>{t.howToJoinDesc}</p>
          </div>

          <div className="steps-timeline">
            <div className="step-item">
              <div className="step-icon-wrapper">
                <div className="step-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="step-connector"></div>
              </div>
              <div className="step-details">
                <div className="step-label">STEP 1</div>
                <h3>{t.step1Title}</h3>
                <p>{t.step1Desc}</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-icon-wrapper">
                <div className="step-icon">
                  <i className="fas fa-credit-card"></i>
                </div>
                <div className="step-connector"></div>
              </div>
              <div className="step-details">
                <div className="step-label">STEP 2</div>
                <h3>{t.step2Title}</h3>
                <p>{t.step2Desc}</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-icon-wrapper">
                <div className="step-icon">
                  <i className="fas fa-envelope-open-text"></i>
                </div>
                <div className="step-connector"></div>
              </div>
              <div className="step-details">
                <div className="step-label">STEP 3</div>
                <h3>{t.step3Title}</h3>
                <p>{t.step3Desc}</p>
              </div>
            </div>

            <div className="step-item">
              <div className="step-icon-wrapper">
                <div className="step-icon">
                  <i className="fas fa-trophy"></i>
                </div>
              </div>
              <div className="step-details">
                <div className="step-label">STEP 4</div>
                <h3>{t.step4Title}</h3>
                <p>{t.step4Desc}</p>
              </div>
            </div>
          </div>

          <div className="join-cta">
            <Link to="/register" className="btn btn-primary btn-large">
              <i className="fas fa-gamepad"></i> {t.registerYourTeam}
            </Link>
            <p className="cta-note">
              {loading 
                ? 'Limited to 32 teams • First come, first served'
                : `${slotsRemaining} of ${totalSlots} slots remaining • First come, first served`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="games-section">
        <div className="container">
          <div className="section-header">
            <h2>{t.availableGames}</h2>
            <p>{t.availableGamesDesc}</p>
          </div>

          <div className="games-grid">
            <div className="game-card active">
              <div className="game-badge">{t.active}</div>
              <div className="game-image">
                <img src="/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg" alt="EA Sports FC 26" />
              </div>
              <h3>eFootball - EA Sports FC 26</h3>
              <p>{t.eFootballDesc}</p>
              <div className="game-stats">
                <div className="stat">
                  <strong>150+</strong>
                  <span>{t.activePlayers}</span>
                </div>
                <div className="stat">
                  <strong>Exclusive</strong>
                  <span>{t.totalPrizes}</span>
                </div>
              </div>
            </div>

            <div className="game-card coming-soon">
              <div className="game-badge">{t.comingSoon.toUpperCase()}</div>
              <i className="fas fa-basketball-ball"></i>
              <h3>eBasketball</h3>
              <p>{t.eBasketballDesc}</p>
              <Link to="/contact" className="notify-btn">
                {t.notifyMe}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="tournaments-cta">
        <div className="container">
          <div className="cta-content">
            <h2>{t.readyToCompete}</h2>
            <p>{t.readyToCompeteDesc}</p>
            <div className="cta-buttons">
              <Link to="/events" className="btn btn-primary">{t.registerForEvents}</Link>
              <Link to="/contact" className="btn btn-secondary">{t.contactUs}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tournaments;
