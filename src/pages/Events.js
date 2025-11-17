import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import { useRegistrationCount } from '../hooks/useRegistrationCount';
import './Events.css';

const Events = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const { count, totalSlots, loading } = useRegistrationCount();

  const upcomingEvents = [
    {
      id: 1,
      title: t.tournament2v2,
      game: 'eFootball - EA Sports FC 26',
      date: 'December 20, 2025',
      time: '15:00 UTC',
      prize: '₦1,500,000',
      participants: loading ? '32 Teams (64 Players)' : `${totalSlots} Teams (${count} Registered, ${totalSlots * 2} Players Total)`,
      status: t.registrationOpen,
      image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
      featured: true,
      description: t.tournament2v2Desc
    },
  ];

  const comingSoonEvents = [
    {
      id: 1,
      title: t.syncplayWeekendCup,
      game: 'eFootball',
      frequency: t.weeklyLabel,
      prize: '₦500,000',
      participants: '64 Players',
      image: '/fc-26-1024x639.jpg',
      description: t.weekendCupDesc
    },
    {
      id: 2,
      title: t.championshipSeries,
      game: 'eFootball',
      frequency: t.monthlyLabel,
      prize: '₦2,000,000',
      participants: '32 Players',
      image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
      description: t.championshipSeriesDesc
    }
  ];

  const pastEvents = [];

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

          {/* Featured 2v2 Tournament */}
          <div className="featured-event">
            {upcomingEvents.filter(e => e.featured).map(event => (
              <div key={event.id} className="featured-event-card">
                <div className="featured-badge">
                  <i className="fas fa-star"></i> {t.firstTournamentBadge}
                </div>
                <div className="featured-content">
                  <div className="featured-header">
                    <div className="event-game-tag">{event.game}</div>
                    <h2>{event.title}</h2>
                    <p className="featured-subtitle">{t.launchingNov30}</p>
                    <p className="featured-description">{t.tournament2v2Details}</p>
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

          {/* Coming Soon Events */}
          <div className="section-header" style={{ marginTop: '4rem' }}>
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
          </div>

          <div className="coming-soon-section">
            <div className="coming-soon-card">
              <i className="fas fa-basketball-ball"></i>
              <h3>{t.eBasketballEventsComingSoon}</h3>
              <p>{t.eBasketballStayTuned}</p>
            </div>
          </div>
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
                    <div className="past-event-info">
                      <h3>{event.title}</h3>
                      <div className="past-event-meta">
                        <span className="event-game-tag">{event.game}</span>
                        <span className="event-date">{event.date}</span>
                      </div>
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
              <p>{t.gettingStartedDesc1} <strong>November 30, 2025</strong>.</p>
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

