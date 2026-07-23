"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations/translations';
import { getMediaUrl } from '../../supabaseClient';
import './Tournaments.css';

const Tournaments = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];

  // Tab State
  const [activeTab, setActiveTab] = useState('compete'); // 'compete', 'standings', 'rules'

  // Rules Accordion States
  const [openSection, setOpenSection] = useState(null);

  // Read URL query param for tab selection on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'compete' || tabParam === 'standings' || tabParam === 'rules') {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const toggleRulesSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const upcomingEvents = [
    {
      id: 1,
      title: t.tournament2v2 || '2v2 eFootball Tournament',
      game: 'eFootball - EA Sports FC 26',
      date: 'July 30, 2026',
      time: '10:00 AM',
      prize: t.exclusivePrizePoolShort || 'Exclusive Prize Pool',
      participants: '',
      image: '/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg',
      featured: true,
      status: 'Registration Open',
      description: "Join us for the next syncplay 2v2 eFootball tournament live at Rufus and Bee's, Lagos! Teams of 2 players per team will compete in a league phase of 3 matches, with the top 8 teams proceeding to home-and-away playoffs till a single-match final. Players are highly encouraged to bring their own pads (controllers).",
      badge: 'SECOND EDITION'
    }
  ];

  const tournamentResults = {
    tournamentName: t.inauguralTournament || 'Inaugural 2v2 Tournament',
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

  const rulesData = [
    {
      title: '1. Tournament Format',
      content: (
        <ul>
          <li><strong>Game:</strong> EA Sports FC 26</li>
          <li><strong>Platform:</strong> PlayStation only</li>
          <li><strong>Format:</strong> 2v2 Team Competition</li>

          <li><strong>Entry Fee:</strong> ₦50,000 per team</li>
          <li><strong>Date:</strong> July 30, 2026 at 10:00 AM WAT</li>
          <li><strong>Structure:</strong> League Phase (3 matches per team) followed by Top 8 playoffs (Quarter-finals and Semi-finals: Home & Away matches; Grand Final: One Match).</li>
        </ul>
      )
    },
    {
      title: '2. Eligibility & Equipment',
      content: (
        <ul>
          <li>Must be 18 years or older (or have parental consent) with a valid PSN ID.</li>
          <li>Both team members must register under a unique team name. No substitutions allowed after registration closes.</li>
          <li><strong>Controllers:</strong> Players are highly encouraged to bring their own pads (controllers) to the venue.</li>
        </ul>
      )
    },
    {
      title: '3. Match Settings',
      content: (
        <ul>
          <li><strong>Match Length:</strong> 4 minutes per half (8 minutes total)</li>
          <li><strong>Difficulty:</strong> World Class | Game Speed: Normal</li>
          <li><strong>Squad Type:</strong> 95 Overall Mode</li>
          <li><strong>Injuries:</strong> Off | <strong>Offsides:</strong> On</li>
          <li><strong>Team Selection:</strong> Any club from EA Sports FC 26 (no restrictions). Custom tactics are allowed.</li>
        </ul>
      )
    },
    {
      title: '4. Prizes & Distribution',
      content: (
        <ul>
          <li><strong>1st Place:</strong> ₦500,000</li>
          <li><strong>2nd Place (Runner-Up):</strong> ₦300,000</li>
          <li>Prizes will be paid immediately the tournament finishes, split equally between team members.</li>
        </ul>
      )
    },
    {
      title: t.ruleStreamingTitle || '5. Official Live Streaming & Broadcast',
      content: (
        <div>
          <p>{t.ruleStreamingDesc || 'Streamlivr (https://streamlivr.com) is syncplay eSports\' exclusive live stream partner. All official tournament live broadcasts, spectator feeds, and featured matches are streamed solely and exclusively on Streamlivr.'}</p>
          <div style={{ marginTop: '12px' }}>
            <a 
              href="https://streamlivr.com/@syncplayesports" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#29A7E4',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <i className="fas fa-external-link-alt"></i> Join live stream on Streamlivr (@syncplayesports)
            </a>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="tournaments-page">
      {/* Hero Section */}
      <section className="tournaments-hero">
        <div className="tournaments-hero-overlay"></div>
        <div className="container">
          <h1>{t.tournaments || 'TOURNAMENT HUB'}</h1>
          <p>{t.joinTournamentsSubtitle || 'Compete with the best, win exclusive prizes, and claim your crown.'}</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="tournament-tabs-section">
        <div className="container">
          <div className="tournament-tabs">
            <button 
              className={`tab-btn ${activeTab === 'compete' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('compete');
                window.history.pushState(null, '', '?tab=compete');
              }}
            >
              <i className="fas fa-gamepad"></i> {t.registerForEvents || 'COMPETE & REGISTER'}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('standings');
                window.history.pushState(null, '', '?tab=standings');
              }}
            >
              <i className="fas fa-trophy"></i> {t.tournamentResults || 'STANDINGS & RESULTS'}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('rules');
                window.history.pushState(null, '', '?tab=rules');
              }}
            >
              <i className="fas fa-scroll"></i> {t.tournamentRules || 'RULES & SETTINGS'}
            </button>
          </div>
        </div>
      </section>

      {/* Tab 1: Compete & Register */}
      {activeTab === 'compete' && (
        <div className="tab-pane-content">
          {/* Upcoming Event Details */}
          <section className="upcoming-events-hub">
            <div className="container">
              <div className="section-header text-center">
                <h2>{t.upcomingEvents || 'UPCOMING TOURNAMENTS'}</h2>
                <p>{t.upcomingEventsDesc || 'Register today to secure your team slot.'}</p>
              </div>

              {upcomingEvents.map(event => (
                <div key={event.id} className="featured-event-card">
                  <div className="featured-badge">
                    <i className="fas fa-star"></i> {event.badge || 'UPCOMING'}
                  </div>
                  <div className="featured-content">
                    <div className="featured-header">
                      <div className="event-game-tag">{event.game}</div>
                      <h2>{event.title}</h2>
                      <p className="featured-subtitle">Thursday, July 30, 2026</p>
                      <p className="featured-description">{event.description}</p>
                    </div>
                    <div className="featured-details">
                      <div className="featured-detail-item">
                        <i className="fas fa-calendar"></i>
                        <div>
                          <span className="detail-label">{t.dateLabel2 || 'DATE'}</span>
                          <span className="detail-value">{event.date}</span>
                        </div>
                      </div>
                      <div className="featured-detail-item">
                        <i className="fas fa-clock"></i>
                        <div>
                          <span className="detail-label">{t.timeLabel || 'TIME'}</span>
                          <span className="detail-value">{event.time}</span>
                        </div>
                      </div>
                      <div className="featured-detail-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <div>
                          <span className="detail-label">VENUE</span>
                          <span className="detail-value">Rufus and Bee's, Lagos</span>
                        </div>
                      </div>
                      <div className="featured-detail-item">
                        <i className="fas fa-users-cog"></i>
                        <div>
                          <span className="detail-label">{t.formatLabel || 'FORMAT'}</span>
                          <span className="detail-value">{t.team2v2Format || '2v2 League + Playoff'}</span>
                        </div>
                      </div>
                      {event.participants && (
                        <div className="featured-detail-item">
                          <i className="fas fa-users"></i>
                          <div>
                            <span className="detail-label">{t.teamsLabel || 'TEAMS'}</span>
                            <span className="detail-value">{event.participants}</span>
                          </div>
                        </div>
                      )}
                      <div className="featured-detail-item">
                        <i className="fas fa-trophy"></i>
                        <div>
                          <span className="detail-label">{t.prize || 'PRIZE POOL'}</span>
                          <span className="detail-value">{event.prize}</span>
                        </div>
                      </div>
                    </div>
                    <div className="featured-cta">
                      <div className="cta-btn-group">
                        <Link href="/register" className="btn btn-primary btn-large">
                          <i className="fas fa-gamepad"></i> REGISTER TEAM (₦50,000)
                        </Link>
                        <Link href="/spectator-register" className="btn btn-secondary btn-large">
                          <i className="fas fa-ticket-alt"></i> SPECTATOR TICKET (₦5,000)
                        </Link>
                      </div>
                      <p className="featured-note">
                        * Spectator tickets include a Rufus & Bee's Buzz Card loaded with gaming credits/chips!
                      </p>
                    </div>
                  </div>
                  <div className="featured-image">
                    <img src={getMediaUrl(event.image)} alt={event.title} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How to Join */}
          <section className="how-to-join">
            <div className="container">
              <div className="section-header text-center">
                <h2>{t.howToJoin || 'HOW TO COMPETE'}</h2>
                <p>{t.howToJoinDesc || 'Four simple steps to register and compete.'}</p>
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
                    <h3>{t.step1Title || 'Create a Team'}</h3>
                    <p>{t.step1Desc || 'Form a duo with your partner and register your team details.'}</p>
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
                    <h3>{t.step2Title || 'Complete Payment'}</h3>
                    <p>{t.step2Desc || 'Pay the entry fee securely to guarantee your bracket slot.'}</p>
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
                    <h3>{t.step3Title || 'Join Discord'}</h3>
                    <p>{t.step3Desc || 'Get check-in details, schedules, and match rules in our Discord.'}</p>
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
                    <h3>{t.step4Title || 'Play & Win'}</h3>
                    <p>{t.step4Desc || 'Show your skills at the venue, win matches, and claim your share of the prize pool.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Games Section */}
          <section className="games-section">
            <div className="container">
              <div className="section-header text-center">
                <h2>{t.availableGames || 'FEATURED TITLES'}</h2>
                <p>{t.availableGamesDesc || 'Current game tournaments supported on our platform.'}</p>
              </div>

              <div className="games-grid">
                <div className="game-card active">
                  <div className="game-badge">{t.active || 'ACTIVE'}</div>
                  <div className="game-image">
                    <img src="/ea-sports-fc-26-xbox-one-xbox-series-x-s-microsoft-store-cover.jpg" alt="EA Sports FC 26" />
                  </div>
                  <h3>eFootball - EA Sports FC 26</h3>
                  <p>{t.eFootballDesc || 'Experience the next-gen football simulation in our 2v2 tournaments.'}</p>
                  <div className="game-stats">
                    <div className="stat">
                      <strong>32</strong>
                      <span>{t.teamsLabel || 'TEAMS'}</span>
                    </div>
                    <div className="stat">
                      <strong>₦800k</strong>
                      <span>{t.prize || 'PRIZE POOL'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Standings & Results */}
      {activeTab === 'standings' && (
        <div className="tab-pane-content results-tab-content">
          {/* Winner Highlight */}
          <section className="winner-highlight">
            <div className="container">
              <div className="winner-crown-top">
                <i className="fas fa-crown"></i>
              </div>
              <div className="winner-card">
                <div className="winner-card-header">
                  <div className="winner-logos">
                    <span className="logo-text">SYNCPLAY CHAMPIONS</span>
                  </div>
                </div>
                <div className="winner-title">TOURNAMENT WINNER</div>
                <div className="winner-image-container">
                  <img src={tournamentResults.winner.image} alt={tournamentResults.winner.team} />
                </div>
                <div className="winner-team-badge">{tournamentResults.winner.team}</div>
                <div className="winner-message">
                  <div className="congrats-text">CONGRATULATIONS!!</div>
                  <div className="champions-text">TO THE CHAMPIONS (₦800,000)</div>
                </div>
              </div>
            </div>
          </section>

          {/* Standings Podium */}
          <section className="podium-section">
            <div className="container">
              <h2 className="section-title text-center">{t.finalStandings || 'INAUGURAL TOURNAMENT PODIUM'}</h2>
              <div className="podium-wrapper">
                {/* 2nd Place */}
                <div className="podium-item-wrapper podium-second-wrapper">
                  <div className="podium-item podium-second">
                    <div className="podium-card-header">
                      <span className="logo-text">SYNCPLAY</span>
                    </div>
                    <div className="podium-card-title">2ND PLACE</div>
                    <div className="podium-image">
                      <img src={tournamentResults.runnerUp.image} alt={tournamentResults.runnerUp.team} />
                    </div>
                    <div className="podium-team-badge">{tournamentResults.runnerUp.team}</div>
                  </div>
                  <div className="podium-info">
                    <div className="podium-position">2</div>
                    <div className="podium-label">Runner-Up</div>
                    <div className="podium-prize">{tournamentResults.runnerUp.prize}</div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="podium-item-wrapper podium-first-wrapper">
                  <div className="podium-item podium-first">
                    <div className="podium-card-header">
                      <span className="logo-text">SYNCPLAY</span>
                    </div>
                    <div className="podium-card-title">WINNER</div>
                    <div className="podium-image">
                      <img src={tournamentResults.winner.image} alt={tournamentResults.winner.team} />
                    </div>
                    <div className="podium-team-badge">{tournamentResults.winner.team}</div>
                  </div>
                  <div className="podium-info">
                    <div className="podium-position">1</div>
                    <div className="podium-label">Champions</div>
                    <div className="podium-prize">{tournamentResults.winner.prize}</div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="podium-item-wrapper podium-third-wrapper">
                  <div className="podium-item podium-third">
                    <div className="podium-card-header">
                      <span className="logo-text">SYNCPLAY</span>
                    </div>
                    <div className="podium-card-title">3RD PLACE</div>
                    <div className="podium-image">
                      <img src={tournamentResults.thirdPlace.image} alt={tournamentResults.thirdPlace.team} />
                    </div>
                    <div className="podium-team-badge">{tournamentResults.thirdPlace.team}</div>
                  </div>
                  <div className="podium-info">
                    <div className="podium-position">3</div>
                    <div className="podium-label">Third Place</div>
                    <div className="podium-prize">{tournamentResults.thirdPlace.prize}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons to Leaderboards */}
              <div className="results-navigation-banner text-center" style={{ marginTop: '4rem' }}>
                <div className="cta-btn-group" style={{ display: 'inline-flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Link href="/players" className="btn btn-primary">
                    <i className="fas fa-list-ol"></i> VIEW PLAYER LEADERBOARD
                  </Link>
                  <Link href="/comparison" className="btn btn-secondary">
                    <i className="fas fa-exchange-alt"></i> TEAM COMPARISON TOOL
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 3: Rules & Regulations */}
      {activeTab === 'rules' && (
        <div className="tab-pane-content rules-tab-content">
          <section className="rules-section-hub">
            <div className="container">
              <div className="section-header text-center">
                <h2>TOURNAMENT RULES & REGULATIONS</h2>
                <p>Ensure you understand the terms, eligibility, settings, and conduct guidelines prior to competing.</p>
              </div>

              <div className="rules-accordion">
                {rulesData.map((rule, idx) => (
                  <div key={idx} className={`accordion-item ${openSection === idx ? 'open' : ''}`}>
                    <button className="accordion-header" onClick={() => toggleRulesSection(idx)}>
                      <span>{rule.title}</span>
                      <i className={`fas fa-chevron-down ${openSection === idx ? 'rotate' : ''}`}></i>
                    </button>
                    <div className="accordion-body">
                      <div className="accordion-content">
                        {rule.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rules-disclaimer text-center" style={{ marginTop: '3rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
                <p>By registering for syncplay eSports tournaments, you agree to adhere to all terms, structures, and administrator rules outlined above.</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
