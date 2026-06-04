import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
// Registration count hook removed as tournament is completed
import './Events.css';

const Events = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  // Registration count hook removed as tournament is completed

  const upcomingEvents = [
    {
      id: 1,
      title: t.tournament2v2,
      game: 'eFootball - EA Sports FC 26',
      date: 'May 23, 2026',
      time: '10:00 AM',
      prize: t.exclusivePrizePoolShort,
      participants: '12 Teams (24 Players)',
      image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
      featured: true,
      status: 'Registration Open',
      description: 'Our second 2v2 tournament! Team up with a partner and compete for glory and prizes. Building on the success of our inaugural event, this tournament promises even more excitement and competition.',
      badge: 'SECOND EDITION'
    }
  ];

  // Commented out - Classic League and Weekend Cup tournaments removed
  // const comingSoonEvents = [
  //   {
  //     id: 1,
  //     title: t.syncplayWeekendCup,
  //     game: 'eFootball',
  //     frequency: t.weeklyLabel,
  //     prize: '₦500,000',
  //     participants: '64 Players',
  //     image: '/fc-26-1024x639.jpg',
  //     description: t.weekendCupDesc
  //   },
  //   {
  //     id: 2,
  //     title: t.championshipSeries,
  //     game: 'eFootball',
  //     frequency: t.monthlyLabel,
  //     prize: '₦2,000,000',
  //     participants: '32 Players',
  //     image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
  //     description: t.championshipSeriesDesc
  //   }
  // ];


  const pastEvents = [
    {
      id: 1,
      title: t.tournament2v2,
      game: 'eFootball - EA Sports FC 26',
      date: 'December 20, 2025',
      prize: t.exclusivePrizePoolShort,
      participants: '12 Teams (24 Players)',
      status: t.tournamentCompleted,
      image: '/tournament-media/photos/winners ss.png',
      winner: t.winnerTeamName || 'Champions',
      description: t.tournament2v2Desc
    }
  ];

  return (
    <div className="events-page">
      {/* Hero Section */}
      <section className="events-hero">
        <div className="events-hero-overlay"></div>
        <div className="container">
          <h1>{t.eventsPageTitle}</h1>
          <p>{t.eventsPageSubtitle}</p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="upcoming-events">
        <div className="container">
          <div className="section-header">
            <h2>{t.upcomingEvents}</h2>
            <p>{t.upcomingEventsDesc}</p>
          </div>

          {upcomingEvents.length > 0 ? (
            <>
              {/* Featured 2v2 Tournament */}
              <div className="featured-event">
                {upcomingEvents.filter(e => e.featured).map(event => (
                  <div key={event.id} className="featured-event-card">
                    <div className="featured-badge">
                      <i className="fas fa-star"></i> {event.badge || 'UPCOMING TOURNAMENT'}
                    </div>
                    <div className="featured-content">
                      <div className="featured-header">
                        <div className="event-game-tag">{event.game}</div>
                        <h2>{event.title}</h2>
                        <p className="featured-subtitle">Saturday, May 23, 2026</p>
                        <p className="featured-description">{event.description || t.tournament2v2Details}</p>
                      </div>
                      <div className="featured-details">
                        <div className="featured-detail-item">
                          <i className="fas fa-calendar"></i>
                          <div>
                            <span className="detail-label">{t.dateLabel2}</span>
                            <span className="detail-value">{event.date}</span>
                          </div>
                        </div>
                        <div className="featured-detail-item">
                          <i className="fas fa-clock"></i>
                          <div>
                            <span className="detail-label">{t.timeLabel}</span>
                            <span className="detail-value">{event.time}</span>
                          </div>
                        </div>
                        <div className="featured-detail-item">
                          <i className="fas fa-users-cog"></i>
                          <div>
                            <span className="detail-label">{t.formatLabel}</span>
                            <span className="detail-value">{t.team2v2Format}</span>
                          </div>
                        </div>
                        <div className="featured-detail-item">
                          <i className="fas fa-users"></i>
                          <div>
                            <span className="detail-label">{t.teamsLabel}</span>
                            <span className="detail-value">{event.participants}</span>
                          </div>
                        </div>
                        <div className="featured-detail-item">
                          <i className="fas fa-trophy"></i>
                          <div>
                            <span className="detail-label">{t.prize}</span>
                            <span className="detail-value">{event.prize}</span>
                          </div>
                        </div>
                      </div>
                      <div className="featured-cta">
                        <Link to="/register" className="btn btn-primary btn-large">
                          <i className="fas fa-users"></i> {t.registerYourTeam}
                        </Link>
                        <p className="featured-note">{t.moreRegularEvents}</p>
                      </div>
                    </div>
                    <div className="featured-image">
                      <img src={event.image} alt={event.title} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Regular Events Grid */}
              <div className="events-grid">
                {upcomingEvents.filter(e => !e.featured).map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-image">
                      <img src={event.image} alt={event.title} />
                      <div className={`event-status ${event.status === 'Registration Open' ? 'open' : 'closed'}`}>
                        {event.status}
                      </div>
                    </div>
                    <div className="event-content">
                      <div className="event-game">{event.game}</div>
                      <h3>{event.title}</h3>
                      <div className="event-details">
                        <div className="event-detail">
                          <i className="fas fa-calendar"></i>
                          <span>{event.date}</span>
                        </div>
                        <div className="event-detail">
                          <i className="fas fa-clock"></i>
                          <span>{event.time}</span>
                        </div>
                        <div className="event-detail">
                          <i className="fas fa-trophy"></i>
                          <span>Prize: {event.prize}</span>
                        </div>
                        <div className="event-detail">
                          <i className="fas fa-users"></i>
                          <span>{event.participants}</span>
                        </div>
                      </div>
                      {event.status === t.registrationOpen ? (
                        <Link to="/tournaments" className="btn btn-primary">
                          {t.registerNow}
                        </Link>
                      ) : (
                        <button className="btn btn-secondary" disabled>
                          {t.qualifiersOnly}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-upcoming-events">
              <div className="no-events-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3>{t.nextTournament}</h3>
              <p>{t.nextTournamentDate}</p>
              <Link to="/tournament-results" className="btn btn-primary">
                <i className="fas fa-trophy"></i> {t.viewResults}
              </Link>
            </div>
          )}

          {/* Coming Soon Events - Commented out */}
          {/* <div className="section-header" style={{ marginTop: '4rem' }}>
            <h2>{t.comingSoonTitle}</h2>
            <p>{t.comingSoonDesc}</p>
          </div>

          <div className="events-grid">
            {comingSoonEvents.map(event => (
              <div key={event.id} className="event-card coming-soon">
                <div className="coming-soon-overlay">
                  <span className="coming-soon-badge">{t.comingSoonBadge}</span>
                </div>
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                </div>
                <div className="event-content">
                  <div className="event-game">{event.game}</div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className="event-details">
                    <div className="event-detail">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{event.frequency}</span>
                    </div>
                    <div className="event-detail">
                      <i className="fas fa-trophy"></i>
                      <span>{t.prize}: {event.prize}</span>
                    </div>
                    <div className="event-detail">
                      <i className="fas fa-users"></i>
                      <span>{event.participants}</span>
                    </div>
                  </div>
                  <button className="btn btn-secondary" disabled>
                    {t.comingSoonBadge}
                  </button>
                </div>
              </div>
            ))}
          </div> */}

          {/* Commented out - eBasketball section removed */}
          {/* <div className="coming-soon-section">
            <div className="coming-soon-card">
              <i className="fas fa-basketball-ball"></i>
              <h3>{t.eBasketballEventsComingSoon}</h3>
              <p>{t.eBasketballStayTuned}</p>
            </div>
          </div> */}
        </div>
      </section>

      {/* Past Events */}
      <section className="past-events">
        <div className="container">
          <div className="section-header">
            <h2>{t.pastEvents}</h2>
            <p>{t.pastEventsDesc}</p>
          </div>

          {pastEvents.length > 0 ? (
            <>
              <div className="past-events-list">
                {pastEvents.map(event => (
                  <div key={event.id} className="past-event-item">
                    <div className="past-event-image">
                      <img src={event.image} alt={event.title} />
                    </div>
                    <div className="past-event-info">
                      <h3>{event.title}</h3>
                      <div className="past-event-meta">
                        <span className="event-game-tag">{event.game}</span>
                        <span className="event-date">{event.date}</span>
                        <span className="event-status-badge completed">{t.tournamentCompleted}</span>
                      </div>
                      <div className="past-event-result">
                        <div className="winner-info">
                          <i className="fas fa-crown"></i>
                          <span>{t.winner}: <strong>{event.winner}</strong></span>
                        </div>
                        <div className="prize-info">
                          {t.prize}: <strong>{event.prize}</strong>
                        </div>
                      </div>
                      <div className="past-event-actions">
                        <Link to="/tournament-results" className="btn btn-primary">
                          <i className="fas fa-trophy"></i> {t.viewResults}
                        </Link>
                        <Link to="/gallery" className="btn btn-secondary">
                          <i className="fas fa-images"></i> {t.viewGallery}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="archive-cta">
                <Link to="/news" className="btn btn-secondary">
                  {t.viewFullArchive}
                </Link>
              </div>
            </>
          ) : (
            <div className="no-past-events">
              <div className="no-events-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h3>{t.gettingStartedTitle}</h3>
              <p>{t.gettingStartedDesc1} <strong>December 20, 2025</strong>.</p>
              <p>{t.gettingStartedDesc2}</p>
              <p>{t.gettingStartedDesc3}</p>
              <Link to="/register" className="btn btn-primary">
                <i className="fas fa-users"></i> {t.registerFirstTournament}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;

