import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import './TournamentResults.css';

const TournamentResults = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];

  // Tournament results data - update with actual results
  const tournamentResults = {
    tournamentName: t.inauguralTournament,
    date: 'December 20, 2025',
    format: '2v2 Team Competition',
    totalTeams: 12,
    totalPlayers: 24,
    winner: {
      team: 'CENTURY',
      prize: t.winnerPrize || '₦800,000',
      image: '/tournament-media/photos/winners ss.png'
    },
    runnerUp: {
      team: 'ORBYTERS',
      prize: t.runnerUpPrize || '₦400,000',
      image: '/tournament-media/photos/second place.png'
    },
    thirdPlace: {
      team: 'Y.FOLA',
      prize: t.thirdPlacePrize || '₦300,000',
      image: '/tournament-media/photos/3RD PLACE.png'
    }
  };

  return (
    <div className="tournament-results-page">
      {/* Hero Section */}
      <section className="results-hero">
        <div className="results-hero-overlay"></div>
        <div className="container">
          <div className="results-badge">
            <i className="fas fa-trophy"></i> {t.tournamentCompleted}
          </div>
          <h1>{t.tournamentResults}</h1>
          <p>{t.tournamentResultsDesc}</p>
          <div className="results-meta">
            <span><i className="fas fa-calendar"></i> {tournamentResults.date}</span>
            <span><i className="fas fa-users"></i> {tournamentResults.totalTeams} Teams</span>
            <span><i className="fas fa-gamepad"></i> {tournamentResults.format}</span>
          </div>
        </div>
      </section>

      {/* Winner Highlight */}
      <section className="winner-highlight">
        <div className="container">
          <div className="winner-crown-top">
            <i className="fas fa-crown"></i>
          </div>
          <div className="winner-card">
            <div className="winner-card-header">
              <div className="winner-logos">
                <span className="logo-text">SYNCPLAY</span>
                <span className="logo-text">EA</span>
              </div>
              <div className="winner-partnership">
                <span>in partnership with</span>
                <img src="/the-twelfth-man.jpg" alt="The Twelfth Man" className="partner-logo-small" />
              </div>
            </div>
            <div className="winner-title">WINNER</div>
            <div className="winner-image-container">
              <img src={tournamentResults.winner.image} alt={tournamentResults.winner.team} />
            </div>
            <div className="winner-team-badge">{tournamentResults.winner.team}</div>
            <div className="winner-message">
              <div className="congrats-text">CONGRATULATION!!</div>
              <div className="champions-text">TO THE CHAMPIONS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Podium Section */}
      <section className="podium-section">
        <div className="container">
          <h2 className="section-title">{t.finalStandings}</h2>
          <div className="podium-wrapper">
            <div className="podium-item-wrapper podium-second-wrapper">
              <div className="podium-item podium-second">
                <div className="podium-card-header">
                  <div className="podium-logos">
                    <span className="logo-text">SYNCPLAY</span>
                  </div>
                  <div className="podium-partnership">
                    <span>in partnership with</span>
                    <img src="/the-twelfth-man.jpg" alt="The Twelfth Man" className="partner-logo-tiny" />
                  </div>
                </div>
                <div className="podium-card-title">2ND PLACE</div>
                <div className="podium-image">
                  <img src={tournamentResults.runnerUp.image} alt={tournamentResults.runnerUp.team} />
                </div>
                <div className="podium-team-badge">{tournamentResults.runnerUp.team}</div>
                <div className="podium-card-message">CONGRATULATION!!</div>
              </div>
              <div className="podium-info">
                <div className="podium-position">2</div>
                <div className="podium-label">Runner-Up</div>
                <div className="podium-prize">{tournamentResults.runnerUp.prize}</div>
              </div>
            </div>

            <div className="podium-item-wrapper podium-first-wrapper">
              <div className="podium-item podium-first">
                <div className="podium-card-header">
                  <div className="podium-logos">
                    <span className="logo-text">SYNCPLAY</span>
                  </div>
                  <div className="podium-partnership">
                    <span>in partnership with</span>
                    <img src="/the-twelfth-man.jpg" alt="The Twelfth Man" className="partner-logo-tiny" />
                  </div>
                </div>
                <div className="podium-card-title">WINNER</div>
                <div className="podium-image">
                  <img src={tournamentResults.winner.image} alt={tournamentResults.winner.team} />
                </div>
                <div className="podium-team-badge">{tournamentResults.winner.team}</div>
                <div className="podium-card-message">
                  <div>CONGRATULATION!!</div>
                  <div>TO THE CHAMPIONS</div>
                </div>
              </div>
              <div className="podium-info">
                <div className="podium-position">1</div>
                <div className="podium-label">Champions</div>
                <div className="podium-prize">{tournamentResults.winner.prize}</div>
              </div>
            </div>

            <div className="podium-item-wrapper podium-third-wrapper">
              <div className="podium-item podium-third">
                <div className="podium-card-header">
                  <div className="podium-logos">
                    <span className="logo-text">SYNCPLAY</span>
                  </div>
                  <div className="podium-partnership">
                    <span>in partnership with</span>
                    <img src="/the-twelfth-man.jpg" alt="The Twelfth Man" className="partner-logo-tiny" />
                  </div>
                </div>
                <div className="podium-card-title">3RD PLACE</div>
                <div className="podium-image">
                  <img src={tournamentResults.thirdPlace.image} alt={tournamentResults.thirdPlace.team} />
                </div>
                <div className="podium-team-badge">{tournamentResults.thirdPlace.team}</div>
                <div className="podium-card-message">CONGRATULATION!!</div>
              </div>
              <div className="podium-info">
                <div className="podium-position">3</div>
                <div className="podium-label">Third Place</div>
                <div className="podium-prize">{tournamentResults.thirdPlace.prize}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prize Distribution */}
      <section className="prize-distribution">
        <div className="container">
          <h2 className="section-title">{t.prizeDistribution}</h2>
          <div className="prize-grid">
            <div className="prize-item prize-gold">
              <div className="prize-icon">
                <i className="fas fa-medal"></i>
              </div>
              <div className="prize-rank">1st Place</div>
              <div className="prize-amount">{tournamentResults.winner.prize}</div>
              <div className="prize-team">{tournamentResults.winner.team}</div>
            </div>
            <div className="prize-item prize-silver">
              <div className="prize-icon">
                <i className="fas fa-medal"></i>
              </div>
              <div className="prize-rank">2nd Place</div>
              <div className="prize-amount">{tournamentResults.runnerUp.prize}</div>
              <div className="prize-team">{tournamentResults.runnerUp.team}</div>
            </div>
            <div className="prize-item prize-bronze">
              <div className="prize-icon">
                <i className="fas fa-medal"></i>
              </div>
              <div className="prize-rank">3rd Place</div>
              <div className="prize-amount">{tournamentResults.thirdPlace.prize}</div>
              <div className="prize-team">{tournamentResults.thirdPlace.team}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Media Links */}
      <section className="tournament-media-links">
        <div className="container">
          <div className="media-links-cta">
            <Link to="/gallery" className="btn btn-primary btn-large">
              <i className="fas fa-images"></i> {t.viewGallery || 'View Gallery & Highlights'}
            </Link>
            <Link to="/videos" className="btn btn-secondary btn-large">
              <i className="fas fa-video"></i> {t.watchVideos || 'Watch All Videos'}
            </Link>
          </div>
        </div>
      </section>

      {/* Next Tournament */}
      <section className="next-tournament">
        <div className="container">
          <div className="next-tournament-card">
            <i className="fas fa-calendar-alt"></i>
            <h2>{t.nextTournament}</h2>
            <p>{t.nextTournamentDate}</p>
            <Link to="/events" className="btn btn-primary">
              {t.viewUpcomingEvents}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TournamentResults;
