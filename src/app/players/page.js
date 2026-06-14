"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations/translations';
import { getPlayersFromRegistrations } from '../../utils/playerStats';
import './Players.css';

const getPlacementBadgeClass = (placement) => {
  if (placement?.includes("Champion")) return "champion";
  if (placement?.includes("Runner-Up")) return "runnerup";
  if (placement?.includes("3rd Place")) return "rdplace";
  if (placement?.includes("4th Place")) return "thplace";
  return "";
};

const LeaderboardPage = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];

  const [livePlayers, setLivePlayers] = useState([]);
  const [pastPlayers, setPastPlayers] = useState([]);
  const [viewMode, setViewMode] = useState('live'); // 'live' or 'past'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [sortBy, setSortBy] = useState('points'); // 'points', 'wins', 'winRate', 'goalsScored'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [expandedTeams, setExpandedTeams] = useState({});

  const toggleTeam = (teamName) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamName]: !prev[teamName]
    }));
  };

  useEffect(() => {
    const fetchRegistrationsAndRatings = async () => {
      setLoading(true);
      try {
        let registrationsData = [];
        let ratingsData = [];
        
        if (supabase) {
          const [regRes, ratRes] = await Promise.all([
            supabase.from('registrations').select('*').eq('payment_status', 'completed'),
            supabase.from('player_ratings').select('*')
          ]);
          
          if (!regRes.error && regRes.data) {
            registrationsData = regRes.data;
          }
          if (!ratRes.error && ratRes.data) {
            ratingsData = ratRes.data;
          }
        }
        
        const pastList = getPlayersFromRegistrations(registrationsData, []);
        const liveList = getPlayersFromRegistrations(registrationsData, ratingsData).filter(p => p.hasCustomStandings);
        
        setPastPlayers(pastList);
        setLivePlayers(liveList);
        // If no live players found, default to past
        if (liveList.length === 0) {
          setViewMode('past');
        }
      } catch (err) {
        console.error('Error fetching registrations and ratings:', err);
        setPastPlayers(getPlayersFromRegistrations([], []));
        setLivePlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationsAndRatings();
  }, []);

  const players = viewMode === 'live' ? livePlayers : pastPlayers;

  // Platform Icon Helper
  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'playstation':
      case 'ps5':
        return <i className="fab fa-playstation platform-icon ps-color" title="PlayStation"></i>;
      case 'xbox':
        return <i className="fab fa-xbox platform-icon xbox-color" title="Xbox"></i>;
      case 'pc':
        return <i className="fas fa-desktop platform-icon pc-color" title="PC"></i>;
      default:
        return <i className="fas fa-gamepad platform-icon" title="Gamepad"></i>;
    }
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Grouping logic based on viewMode
  let rawItems = [];
  
  if (viewMode === 'past') {
    const teamsMap = {};
    players.forEach(player => {
      if (!teamsMap[player.teamName]) {
        teamsMap[player.teamName] = {
          isTeam: true,
          id: player.teamName,
          name: player.teamName,
          placement: player.placement,
          matchesPlayed: player.matchesPlayed,
          wins: player.wins,
          draws: player.draws,
          losses: player.losses,
          goalsScored: player.goalsScored,
          goalsConceded: player.goalsConceded,
          points: player.points,
          winRate: player.winRate,
          players: []
        };
      }
      teamsMap[player.teamName].players.push(player);
    });
    rawItems = Object.values(teamsMap);
  } else {
    // Live mode: Items are individual players
    rawItems = players.map(p => ({
      isPlayer: true,
      id: p.gamerTag,
      name: p.gamerTag,
      teamName: p.teamName,
      platform: p.platform,
      placement: p.placement,
      matchesPlayed: p.matchesPlayed,
      wins: p.wins,
      draws: p.draws,
      losses: p.losses,
      goalsScored: p.goalsScored,
      points: p.points,
      winRate: p.winRate,
      playerData: p
    }));
  }

  // Sort all items first to determine true global rank
  const sortedItems = [...rawItems].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    
    if (sortBy === 'winRate') {
      valA = parseFloat(a.winRate);
      valB = parseFloat(b.winRate);
    }
    
    if (valA < valB) return sortOrder === 'desc' ? 1 : -1;
    if (valA > valB) return sortOrder === 'desc' ? -1 : 1;
    
    // Fallback to internal placement/points if tied
    if (viewMode === 'past') {
      const getWeight = (placement) => {
        if (placement?.includes("Champion")) return 5;
        if (placement?.includes("Runner-Up")) return 4;
        if (placement?.includes("3rd Place")) return 3;
        if (placement?.includes("4th Place")) return 2;
        return 1;
      };
      return getWeight(b.placement) - getWeight(a.placement);
    } else {
      return (b.goalsScored || 0) - (a.goalsScored || 0);
    }
  });

  // Filter items
  const filteredItems = sortedItems.filter(item => {
    const query = searchQuery.toLowerCase();
    let matchesSearch = false;
    let matchesPlatform = false;

    if (viewMode === 'past') {
      matchesSearch = item.name?.toLowerCase().includes(query) || 
        item.players.some(p => p.name?.toLowerCase().includes(query) || p.gamerTag?.toLowerCase().includes(query));
      matchesPlatform = platformFilter === 'All' || item.players.some(p => p.platform?.toLowerCase() === platformFilter.toLowerCase());
    } else {
      matchesSearch = item.name?.toLowerCase().includes(query) || item.teamName?.toLowerCase().includes(query);
      matchesPlatform = platformFilter === 'All' || item.platform?.toLowerCase() === platformFilter.toLowerCase();
    }
    
    return matchesSearch && matchesPlatform;
  });

  // Arrange top three as [2nd, 1st, 3rd] for visual podium positioning
  const podiumArrangement = [];
  
  if (viewMode === 'past') {
    // Past mode uses hardcoded placement attributes
    const championItem = sortedItems.find(p => p.placement?.includes("Champion"));
    const runnerUpItem = sortedItems.find(p => p.placement?.includes("Runner-Up"));
    const thirdPlaceItem = sortedItems.find(p => p.placement?.includes("3rd Place"));
    
    if (runnerUpItem) podiumArrangement.push({ ...runnerUpItem, rank: 2 });
    if (championItem) podiumArrangement.push({ ...championItem, rank: 1 });
    if (thirdPlaceItem) podiumArrangement.push({ ...thirdPlaceItem, rank: 3 });
  } else {
    // Live mode dynamically grabs the top 3 sorted items
    if (sortedItems.length >= 2) podiumArrangement.push({ ...sortedItems[1], rank: 2 });
    if (sortedItems.length >= 1) podiumArrangement.push({ ...sortedItems[0], rank: 1 });
    if (sortedItems.length >= 3) podiumArrangement.push({ ...sortedItems[2], rank: 3 });
  }

  return (
    <div className="leaderboard-page">
      {/* Page Hero */}
      <section className="leaderboard-hero">
        <div className="leaderboard-hero-overlay"></div>
        <div className="container">
          <h1>{viewMode === 'live' ? 'CNEL LIVE STANDINGS' : 'TOURNAMENT STANDINGS'}</h1>
          <p>{viewMode === 'live' ? 'The official live standings for the Cadesports National E-Soccer Pro League.' : t.topCompetitivePlayers || 'Compare tournament ratings, win-rates and attributes of competitive players'}</p>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="leaderboard-tabs-wrapper">
        <div className="container">
          <div className="leaderboard-tabs">
            <Link href="/players" className="tab-item active">
              <i className="fas fa-trophy"></i> Leaderboard
            </Link>
            <Link href="/comparison" className="tab-item">
              <i className="fas fa-chart-bar"></i> Player Comparison
            </Link>
          </div>
        </div>
      </div>

      <div className="container leaderboard-content-section">
        {loading ? (
          <div className="leaderboard-loading">
            <i className="fas fa-circle-notch fa-spin"></i>
            <span>Loading player statistics...</span>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Showcase */}
            {podiumArrangement.length > 0 && (
              <div className="podium-showcase">
                <h3 className="section-title">CHAMPIONS STANDINGS</h3>
                <div className="podium-container">
                  {podiumArrangement.map((item) => (
                    <div key={item.id} className={`podium-card rank-${item.rank}`}>
                      <div className="podium-badge">
                        {item.rank === 1 && <i className="fas fa-crown gold-crown"></i>}
                        {item.rank === 2 && <span className="silver-badge">2nd</span>}
                        {item.rank === 3 && <span className="bronze-badge">3rd</span>}
                      </div>
                      <div className="podium-avatar-wrapper">
                        <div className="podium-avatar">
                          {item.name.substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <div className="podium-details">
                        <span className="podium-tag">{item.name}</span>
                        {item.isPlayer && <span className="podium-team">{item.teamName}</span>}
                        {item.isTeam && (
                          <div className="podium-team-members" style={{ fontSize: '0.8rem', color: '#a1a1aa', marginTop: '4px' }}>
                            {item.players.map(p => p.gamerTag).join(' & ')}
                          </div>
                        )}
                        <div className="podium-platform">
                          {item.isPlayer ? (
                            <>{getPlatformIcon(item.platform)} {item.platform}</>
                          ) : (
                            <i className="fas fa-users" style={{ marginRight: '6px' }}></i>
                          )}
                        </div>
                      </div>
                      <div className="podium-stats">
                        <div className="podium-stat">
                          <span className="stat-label">WIN RATE</span>
                          <span className="stat-val">{item.winRate}%</span>
                        </div>
                        <div className="podium-stat divider"></div>
                        <div className="podium-stat">
                          <span className="stat-label">POINTS</span>
                          <span className="stat-val">{item.points} pts</span>
                        </div>
                      </div>
                      <div className="podium-pillar">
                        <span className="pillar-rank-num">#{item.rank}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="view-mode-toggle-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <div className="view-mode-toggle" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '0.35rem', display: 'flex', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <button 
                  className={`toggle-btn ${viewMode === 'live' ? 'active' : ''}`}
                  onClick={() => setViewMode('live')}
                  style={{
                    background: viewMode === 'live' ? '#e63946' : 'transparent',
                    color: viewMode === 'live' ? '#fff' : '#a1a1aa',
                    border: 'none',
                    padding: '0.6rem 1.8rem',
                    borderRadius: '25px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: viewMode === 'live' ? '0 4px 12px rgba(230, 57, 70, 0.3)' : 'none'
                  }}
                >
                  <i className="fas fa-satellite-dish" style={{ marginRight: '8px' }}></i>
                  Live Data
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'past' ? 'active' : ''}`}
                  onClick={() => setViewMode('past')}
                  style={{
                    background: viewMode === 'past' ? '#e63946' : 'transparent',
                    color: viewMode === 'past' ? '#fff' : '#a1a1aa',
                    border: 'none',
                    padding: '0.6rem 1.8rem',
                    borderRadius: '25px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: viewMode === 'past' ? '0 4px 12px rgba(230, 57, 70, 0.3)' : 'none'
                  }}
                >
                  <i className="fas fa-history" style={{ marginRight: '8px' }}></i>
                  Past Tournament
                </button>
              </div>
            </div>

            {/* Filter and Search Section */}
            <div className="leaderboard-filter-bar">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Search player, tag or team..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <i className="fas fa-search search-icon"></i>
              </div>

              <div className="filter-options">
                <div className="filter-group">
                  <label>Platform</label>
                  <div className="button-group">
                    {['All', 'PlayStation', 'Xbox', 'PC'].map((p) => (
                      <button 
                        key={p}
                        className={`filter-btn ${platformFilter === p ? 'active' : ''}`}
                        onClick={() => setPlatformFilter(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="table-responsive leaderboard-table-wrapper">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: '80px' }}>Rank</th>
                    <th>{viewMode === 'live' ? 'Player' : 'Team'}</th>
                    <th className="text-center" style={{ width: '100px' }}>Played</th>
                    <th className="text-center" style={{ width: '150px' }}>W - D - L</th>
                    <th className="text-center cursor-pointer" style={{ width: '120px' }} onClick={() => handleSort('winRate')}>
                      Win Rate {sortBy === 'winRate' && (sortOrder === 'desc' ? '▼' : '▲')}
                    </th>
                    <th className="text-center cursor-pointer" style={{ width: '100px' }} onClick={() => handleSort('goalsScored')}>
                      Goals {sortBy === 'goalsScored' && (sortOrder === 'desc' ? '▼' : '▲')}
                    </th>
                    <th className="text-center cursor-pointer" style={{ width: '120px' }} onClick={() => handleSort('points')}>
                      Points {sortBy === 'points' && (sortOrder === 'desc' ? '▼' : '▲')}
                    </th>
                    <th className="text-center" style={{ width: '100px' }}>Compare</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-players-found">
                        <i className="far fa-frown"></i>
                        <p>No {viewMode === 'live' ? 'players' : 'teams'} matched your search filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => {
                      // Calculate rank based on index in master sorted array
                      const rank = sortedItems.findIndex(t => t.id === item.id) + 1;
                      const isExpanded = item.isTeam && !!expandedTeams[item.id];
                      
                      return (
                        <React.Fragment key={item.id}>
                          <tr 
                            className={`team-row ${index % 2 === 0 ? 'even' : 'odd'} ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => item.isTeam && toggleTeam(item.id)}
                            style={{ cursor: item.isTeam ? 'pointer' : 'default' }}
                          >
                            <td className="text-center rank-col">
                              {rank === 1 && <span className="rank-badge gold"><i className="fas fa-medal"></i></span>}
                              {rank === 2 && <span className="rank-badge silver"><i className="fas fa-medal"></i></span>}
                              {rank === 3 && <span className="rank-badge bronze"><i className="fas fa-medal"></i></span>}
                              {rank > 3 && <span className="rank-num">#{rank}</span>}
                            </td>
                            <td className="team-col-name">
                              <div className="team-name-cell">
                                {item.isTeam && <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} expand-chevron`}></i>}
                                {item.isPlayer && (
                                  <div className="player-avatar-mini" style={{ marginRight: '10px' }}>
                                    {item.name.substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                                <span className="team-name-txt">{item.name}</span>
                                {item.placement && (
                                  <span className={`placement-badge ${getPlacementBadgeClass(item.placement)}`}>
                                    {item.placement}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="text-center">{item.matchesPlayed}</td>
                            <td className="text-center wdl-col">
                              <span className="w-val">{item.wins}</span> - <span className="d-val">{item.draws}</span> - <span className="l-val">{item.losses}</span>
                            </td>
                            <td className="text-center winrate-col">{item.winRate}%</td>
                            <td className="text-center">{item.goalsScored}</td>
                            <td className="text-center points-col">{item.points} pts</td>
                            <td className="text-center action-col">
                              <Link 
                                href={item.isTeam ? `/comparison?t1=${item.name}` : `/comparison?p1=${item.id}`} 
                                className="btn-compare-action"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <i className="fas fa-arrows-alt-h"></i>
                              </Link>
                            </td>
                          </tr>
                                 {isExpanded && item.isTeam && (
                            <tr className="player-details-row">
                              <td colSpan="8">
                                <div className="player-details-container">
                                  {item.players.map((player) => (
                                    <div key={player.gamerTag} className="player-details-card">
                                      <div className="player-card-main">
                                        <Link href={`/players/${player.gamerTag}`} className="player-avatar-mini-link">
                                          <div className="player-avatar-mini">
                                            {player.gamerTag.substring(0, 2).toUpperCase()}
                                          </div>
                                        </Link>
                                        <div className="player-meta-mini">
                                          <Link href={`/players/${player.gamerTag}`} className="player-tag-link">
                                            <span className="player-tag">{player.gamerTag}</span>
                                          </Link>
                                          <span className="player-name">{player.name}</span>
                                        </div>
                                        <div className="player-platform-mini">
                                          {getPlatformIcon(player.platform)}
                                          <span>{player.platform}</span>
                                        </div>
                                      </div>
                                      
                                      {player.hasCadesportsProfile && player.attributes ? (
                                        <div className="player-attributes-mini">
                                          <div className="attr-item">
                                            <span className="attr-label">ATT</span>
                                            <span className="attr-val">{player.attributes.attack}</span>
                                          </div>
                                          <div className="attr-item">
                                            <span className="attr-label">DEF</span>
                                            <span className="attr-val">{player.attributes.defense}</span>
                                          </div>
                                          <div className="attr-item">
                                            <span className="attr-label">PAS</span>
                                            <span className="attr-val">{player.attributes.passing}</span>
                                          </div>
                                          <div className="attr-item">
                                            <span className="attr-label">CON</span>
                                            <span className="attr-val">{player.attributes.consistency}</span>
                                          </div>
                                          <div className="attr-item">
                                            <span className="attr-label">CLU</span>
                                            <span className="attr-val">{player.attributes.clutch}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="no-attr-info" style={{ color: '#a1a1aa', fontSize: '0.85rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 0' }}>
                                          <i className="fas fa-info-circle" style={{ color: '#E63946' }}></i> No public info on player rating
                                        </div>
                                      )}

                                      <div className="player-actions-mini">
                                        <Link href={`/players/${player.gamerTag}`} className="btn-profile-mini">
                                          <i className="fas fa-user"></i> Profile
                                        </Link>
                                        <Link href={`/comparison?t1=${item.name}`} className="btn-compare-mini">
                                          <i className="fas fa-arrows-alt-h"></i> Compare
                                        </Link>
                                      </div>
                                    </div>
                                  ))}

                                  {/* Subtle attribute explanation notice */}
                                  <div className="attribute-source-notice" style={{ width: '100%', gridColumn: 'span 2', marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '0.5rem', clear: 'both' }}>
                                    <i className="fas fa-info-circle" style={{ color: '#e63946' }}></i>
                                    <span>Player attributes (ATT, DEF, PAS, CON, CLU) are dynamically calculated based on their latest performance in the <strong>Cadesports National E-Soccer Pro League</strong>.</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
