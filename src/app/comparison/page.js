"use client";
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations/translations';
import { getPlayersFromRegistrations } from '../../utils/playerStats';
import './Comparison.css';

const getPlacementBadgeClass = (placement) => {
  if (placement?.includes("Champion")) return "champion";
  if (placement?.includes("Runner-Up")) return "runnerup";
  if (placement?.includes("3rd Place")) return "rdplace";
  if (placement?.includes("4th Place")) return "thplace";
  return "";
};

const ComparisonContent = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const searchParams = useSearchParams();

  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparisonMode, setComparisonMode] = useState('team'); // 'team' or 'player'

  // Selected Team Mode States
  const [team1, setTeam1] = useState(null);
  const [team2, setTeam2] = useState(null);

  // Selected Player Mode States
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);

  // Fetch and process registrations and custom ratings
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
        
        const processedPlayers = getPlayersFromRegistrations(registrationsData, ratingsData);
        setPlayers(processedPlayers);
        
        // Group players into teams using ORIGINAL tournament ratings and statistics (ignoring DB overrides)
        const originalPlayers = getPlayersFromRegistrations(registrationsData, []);
        const teamsMap = {};
        originalPlayers.forEach(player => {
          if (!teamsMap[player.teamName]) {
            teamsMap[player.teamName] = {
              teamName: player.teamName,
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
        
        const teamsList = Object.values(teamsMap);
        setTeams(teamsList);
        
        // Handle pre-selection via URL search params
        const t1Param = searchParams.get('t1') || searchParams.get('p1');
        const t2Param = searchParams.get('t2') || searchParams.get('p2');
        
        // Check if params are player gamer tags or team names
        const isPlayerParam = processedPlayers.some(p => 
          p.gamerTag.toLowerCase() === t1Param?.toLowerCase() || 
          p.gamerTag.toLowerCase() === t2Param?.toLowerCase()
        );

        if (isPlayerParam) {
          setComparisonMode('player');
          
          if (processedPlayers.length > 0) {
            let defaultP1 = processedPlayers.find(p => p.gamerTag.toLowerCase() === t1Param?.toLowerCase());
            if (!defaultP1) defaultP1 = processedPlayers[0];
            
            let defaultP2 = processedPlayers.find(p => p.gamerTag.toLowerCase() === t2Param?.toLowerCase());
            if (!defaultP2 || defaultP2.hasCustomStandings !== defaultP1.hasCustomStandings || defaultP2.gamerTag === defaultP1.gamerTag) {
              defaultP2 = processedPlayers.find(p => p.gamerTag !== defaultP1.gamerTag && p.hasCustomStandings === defaultP1.hasCustomStandings);
            }
            if (!defaultP2) defaultP2 = defaultP1;
            
            setPlayer1(defaultP1);
            setPlayer2(defaultP2);
          }
        } else {
          setComparisonMode('team');

          if (teamsList.length > 0) {
            let defaultT1 = teamsList.find(t => t.teamName.toLowerCase() === t1Param?.toLowerCase());
            if (!defaultT1 && t1Param) {
              const playerMatch = processedPlayers.find(p => p.gamerTag.toLowerCase() === t1Param.toLowerCase());
              if (playerMatch) defaultT1 = teamsList.find(t => t.teamName === playerMatch.teamName);
            }
            if (!defaultT1) defaultT1 = teamsList[0];
            
            let defaultT2 = teamsList.find(t => t.teamName.toLowerCase() === t2Param?.toLowerCase());
            if (!defaultT2 && t2Param) {
              const playerMatch = processedPlayers.find(p => p.gamerTag.toLowerCase() === t2Param.toLowerCase());
              if (playerMatch) defaultT2 = teamsList.find(t => t.teamName === playerMatch.teamName);
            }
            if (!defaultT2) defaultT2 = teamsList[1] || teamsList[0];
            
            setTeam1(defaultT1);
            setTeam2(defaultT2);
          }
        }

        // Initialize fallbacks if not selected
        if (processedPlayers.length > 0 && !player1) {
          const defaultP1 = processedPlayers[0];
          const defaultP2 = processedPlayers.find(p => p.gamerTag !== defaultP1.gamerTag && p.hasCustomStandings === defaultP1.hasCustomStandings) || defaultP1;
          setPlayer1(defaultP1);
          setPlayer2(defaultP2);
        }
      } catch (err) {
        console.error('Error fetching registrations and ratings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationsAndRatings();
  }, [searchParams]);

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

  // Helper to aggregate team attributes from player attributes
  const getTeamAttributes = (teamPlayers) => {
    if (!teamPlayers || teamPlayers.length === 0) {
      return { attack: 50, defense: 50, passing: 50, consistency: 50, clutch: 50 };
    }
    
    let attackSum = 0;
    let defenseSum = 0;
    let passingSum = 0;
    let consistencySum = 0;
    let clutchSum = 0;
    
    teamPlayers.forEach(p => {
      attackSum += p.attributes.attack || 50;
      defenseSum += p.attributes.defense || 50;
      passingSum += p.attributes.passing || 50;
      consistencySum += p.attributes.consistency || 50;
      clutchSum += p.attributes.clutch || 50;
    });
    
    const count = teamPlayers.length;
    return {
      attack: Math.round(attackSum / count),
      defense: Math.round(defenseSum / count),
      passing: Math.round(passingSum / count),
      consistency: Math.round(consistencySum / count),
      clutch: Math.round(clutchSum / count)
    };
  };

  // Attributes for Active Comparison
  const team1Attributes = getTeamAttributes(team1?.players);
  const team2Attributes = getTeamAttributes(team2?.players);

  const p1Attributes = player1?.hasCadesportsProfile ? player1.attributes : null;
  const p2Attributes = player2?.hasCadesportsProfile ? player2.attributes : null;

  const p1Ovr = p1Attributes ? Math.round(
    (p1Attributes.attack + p1Attributes.defense + p1Attributes.passing + p1Attributes.consistency + p1Attributes.clutch) / 5
  ) : null;
  
  const p2Ovr = p2Attributes ? Math.round(
    (p2Attributes.attack + p2Attributes.defense + p2Attributes.passing + p2Attributes.consistency + p2Attributes.clutch) / 5
  ) : null;

  // SVG Radar Chart Coordinates Generator
  const getRadarCoordinates = (attributes, center, maxRadius) => {
    if (!attributes) return "";
    
    const angles = [
      -Math.PI / 2,                    // Attack (Up)
      -Math.PI / 2 + (2 * Math.PI) / 5,  // Defense (Right-Up)
      -Math.PI / 2 + (4 * Math.PI) / 5,  // Passing (Right-Down)
      -Math.PI / 2 + (6 * Math.PI) / 5,  // Consistency (Left-Down)
      -Math.PI / 2 + (8 * Math.PI) / 5,  // Clutch (Left-Up)
    ];
    
    const values = [
      attributes.attack || 50,
      attributes.defense || 50,
      attributes.passing || 50,
      attributes.consistency || 50,
      attributes.clutch || 50
    ];
    
    return angles.map((angle, idx) => {
      const val = values[idx] / 100; // normalize 0-100 to 0-1
      const r = val * maxRadius;
      const x = center.x + r * Math.cos(angle);
      const y = center.y + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const center = { x: 150, y: 150 };
  const maxRadius = 100;
  
  // Background grid pentagons for the radar chart
  const gridRadii = [20, 40, 60, 80, 100];
  const angles = [
    -Math.PI / 2,
    -Math.PI / 2 + (2 * Math.PI) / 5,
    -Math.PI / 2 + (4 * Math.PI) / 5,
    -Math.PI / 2 + (6 * Math.PI) / 5,
    -Math.PI / 2 + (8 * Math.PI) / 5,
  ];

  const getPentagonPath = (radius) => {
    return angles.map((angle) => {
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const getAxisLine = (angle) => {
    const xOuter = center.x + maxRadius * Math.cos(angle);
    const yOuter = center.y + maxRadius * Math.sin(angle);
    return { x1: center.x, y1: center.y, x2: xOuter.toFixed(1), y2: yOuter.toFixed(1) };
  };

  const getLabelPosition = (angle, offset) => {
    const r = maxRadius + offset;
    const x = center.x + r * Math.cos(angle);
    const y = center.y + r * Math.sin(angle);
    return { x: x.toFixed(1), y: y.toFixed(1) };
  };

  const labels = ["ATTACK", "DEFENSE", "PASSING", "CONSISTENCY", "CLUTCH"];

  return (
    <div className="comparison-page">
      {/* Hero Section */}
      <section className="comparison-hero">
        <div className="comparison-hero-overlay"></div>
        <div className="container">
          <h1>{t.playerComparison || 'PLAYER COMPARISON'}</h1>
          <p>{t.compareStatsPerformance || 'Compare statistics and performance ratings of competitive players and teams side-by-side'}</p>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="comparison-tabs-wrapper">
        <div className="container">
          <div className="comparison-tabs">
            <Link href="/players" className="tab-item">
              <i className="fas fa-trophy"></i> Leaderboard
            </Link>
            <Link href="/comparison" className="tab-item active">
              <i className="fas fa-chart-bar"></i> Comparison Hub
            </Link>
          </div>
        </div>
      </div>

      <div className="container comparison-content-section">
        {loading ? (
          <div className="comparison-loading">
            <i className="fas fa-circle-notch fa-spin"></i>
            <span>Loading comparison data...</span>
          </div>
        ) : (
          <>
            {/* Comparison Mode Selector Buttons */}
            <div className="comparison-mode-selector" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <button 
                className={`mode-btn ${comparisonMode === 'team' ? 'active' : ''}`}
                onClick={() => setComparisonMode('team')}
                style={{
                  background: comparisonMode === 'team' ? '#e63946' : 'rgba(255,255,255,0.05)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: comparisonMode === 'team' ? '0 4px 14px rgba(230, 57, 70, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-users"></i> COMPARE TEAMS
              </button>
              <button 
                className={`mode-btn ${comparisonMode === 'player' ? 'active' : ''}`}
                onClick={() => setComparisonMode('player')}
                style={{
                  background: comparisonMode === 'player' ? '#e63946' : 'rgba(255,255,255,0.05)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: comparisonMode === 'player' ? '0 4px 14px rgba(230, 57, 70, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-user"></i> COMPARE PLAYERS
              </button>
            </div>

            {/* TEAM MODE DROPDOWNS */}
            {comparisonMode === 'team' && (
              <div className="selection-bar">
                <div className="selector-group">
                  <label>Team A</label>
                  <select 
                    value={team1?.teamName || ''} 
                    onChange={(e) => setTeam1(teams.find(t => t.teamName === e.target.value))}
                  >
                    {teams.map(t => (
                      <option key={t.teamName} value={t.teamName}>
                        {t.teamName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="vs-badge">VS</div>

                <div className="selector-group">
                  <label>Team B</label>
                  <select 
                    value={team2?.teamName || ''} 
                    onChange={(e) => setTeam2(teams.find(t => t.teamName === e.target.value))}
                  >
                    {teams.map(t => (
                      <option key={t.teamName} value={t.teamName} disabled={t.teamName === team1?.teamName}>
                        {t.teamName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* PLAYER MODE DROPDOWNS */}
            {comparisonMode === 'player' && (
              <div className="selection-bar">
                <div className="selector-group">
                  <label>Player A</label>
                  <select 
                    value={player1?.gamerTag || ''} 
                    onChange={(e) => {
                      const newP1 = players.find(p => p.gamerTag === e.target.value);
                      setPlayer1(newP1);
                      // If newP1 has different hasCustomStandings than player2, auto-select a matching player
                      if (newP1 && player2 && newP1.hasCustomStandings !== player2.hasCustomStandings) {
                        const matchingP2 = players.find(p => p.gamerTag !== newP1.gamerTag && p.hasCustomStandings === newP1.hasCustomStandings);
                        if (matchingP2) setPlayer2(matchingP2);
                      }
                    }}
                  >
                    <optgroup label="Tournament Standings (Live Stats)">
                      {players.filter(p => p.hasCustomStandings).map(p => (
                        <option 
                          key={p.gamerTag} 
                          value={p.gamerTag}
                          disabled={player2 && p.hasCustomStandings !== player2.hasCustomStandings}
                        >
                          {p.gamerTag} ({p.teamName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Default / Standard Stats">
                      {players.filter(p => !p.hasCustomStandings).map(p => (
                        <option 
                          key={p.gamerTag} 
                          value={p.gamerTag}
                          disabled={player2 && p.hasCustomStandings !== player2.hasCustomStandings}
                        >
                          {p.gamerTag} ({p.teamName})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="vs-badge">VS</div>

                <div className="selector-group">
                  <label>Player B</label>
                  <select 
                    value={player2?.gamerTag || ''} 
                    onChange={(e) => {
                      const newP2 = players.find(p => p.gamerTag === e.target.value);
                      setPlayer2(newP2);
                      // If newP2 has different hasCustomStandings than player1, auto-select a matching player
                      if (newP2 && player1 && newP2.hasCustomStandings !== player1.hasCustomStandings) {
                        const matchingP1 = players.find(p => p.gamerTag !== newP2.gamerTag && p.hasCustomStandings === newP2.hasCustomStandings);
                        if (matchingP1) setPlayer1(matchingP1);
                      }
                    }}
                  >
                    <optgroup label="Tournament Standings (Live Stats)">
                      {players.filter(p => p.hasCustomStandings).map(p => (
                        <option 
                          key={p.gamerTag} 
                          value={p.gamerTag}
                          disabled={p.gamerTag === player1?.gamerTag || (player1 && p.hasCustomStandings !== player1.hasCustomStandings)}
                        >
                          {p.gamerTag} ({p.teamName})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Default / Standard Stats">
                      {players.filter(p => !p.hasCustomStandings).map(p => (
                        <option 
                          key={p.gamerTag} 
                          value={p.gamerTag}
                          disabled={p.gamerTag === player1?.gamerTag || (player1 && p.hasCustomStandings !== player1.hasCustomStandings)}
                        >
                          {p.gamerTag} ({p.teamName})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            )}

            {/* COMPARISON RESULTS GRID */}
            <div className="comparison-grid">
              
              {/* CARD 1 (LEFT) */}
              {comparisonMode === 'team' ? (
                /* Team Card A */
                team1 && (
                  <div className="player-compare-card p1-card">
                    <div className="card-bg-glow"></div>
                    <div className="card-avatar-wrapper">
                      <div className="card-avatar">
                        {team1.teamName.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="card-details">
                      <span className="card-gamer-tag">{team1.teamName}</span>
                      {team1.placement && (
                        <span className={`placement-badge ${getPlacementBadgeClass(team1.placement)}`} style={{ alignSelf: 'center', marginTop: '0.25rem' }}>
                          {team1.placement}
                        </span>
                      )}
                      
                      {/* Players list */}
                      <div className="team-players-mini-list">
                        {team1.players.map(p => (
                          <div key={p.gamerTag} className="team-player-mini-row">
                            {getPlatformIcon(p.platform)}
                            <span className="mini-player-tag">{p.gamerTag}</span>
                            <span className="mini-player-platform">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="overall-rating">
                      <span className="rating-num">
                        {Math.round(
                          (team1Attributes.attack + 
                           team1Attributes.defense + 
                           team1Attributes.passing + 
                           team1Attributes.consistency + 
                           team1Attributes.clutch) / 5
                        )}
                      </span>
                      <span className="rating-lbl">TEAM OVERALL</span>
                    </div>
                  </div>
                )
              ) : (
                /* Player Card A */
                player1 && (
                  <div className="player-compare-card p1-card">
                    <div className="card-bg-glow"></div>
                    <div className="card-avatar-wrapper">
                      {player1.photoUrl ? (
                        <img src={player1.photoUrl} alt={player1.gamerTag} className="card-avatar-img" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e63946' }} />
                      ) : (
                        <div className="card-avatar">
                          {player1.gamerTag.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="card-details">
                      <span className="card-gamer-tag">{player1.gamerTag}</span>
                      <span className="player-name-lbl" style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', margin: '0.15rem 0' }}>{player1.name}</span>
                      <span className="placement-badge" style={{ alignSelf: 'center', background: 'rgba(230, 57, 70, 0.1)', color: '#e63946', border: '1px solid rgba(230, 57, 70, 0.2)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                        {player1.teamName}
                      </span>
                      <div className="player-platform-mini" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                        {getPlatformIcon(player1.platform)}
                        <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{player1.platform}</span>
                      </div>
                    </div>
                    
                    <div className="overall-rating">
                      <span className="rating-num">
                        {p1Ovr !== null ? p1Ovr : '--'}
                      </span>
                      <span className="rating-lbl">PLAYER OVERALL</span>
                      {p1Ovr === null && (
                        <span className="rating-no-info" style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.25rem' }}>No public info</span>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* RADAR CHART PANEL */}
              <div className="radar-chart-panel">
                <h3 className="panel-title">ATTRIBUTE COMPARISON</h3>
                
                {(comparisonMode === 'team' && team1Attributes && team2Attributes) ||
                 (comparisonMode === 'player' && p1Attributes && p2Attributes) ? (
                  <>
                    <div className="radar-svg-wrapper">
                      <svg viewBox="0 0 300 300" width="100%" height="100%">
                        {/* Polygon background grids */}
                        {gridRadii.map((radius) => (
                          <polygon
                            key={radius}
                            points={getPentagonPath(radius)}
                            className="radar-grid-line"
                          />
                        ))}
                        
                        {/* Axes Lines */}
                        {angles.map((angle, idx) => {
                          const axis = getAxisLine(angle);
                          return (
                            <line
                              key={idx}
                              x1={axis.x1}
                              y1={axis.y1}
                              x2={axis.x2}
                              y2={axis.y2}
                              className="radar-axis-line"
                            />
                          );
                        })}
                        
                        {/* Axis Labels */}
                        {angles.map((angle, idx) => {
                          const pos = getLabelPosition(angle, 18);
                          let anchor = "middle";
                          if (Math.cos(angle) > 0.1) anchor = "start";
                          if (Math.cos(angle) < -0.1) anchor = "end";
                          
                          return (
                            <text
                              key={idx}
                              x={pos.x}
                              y={parseFloat(pos.y) + 4}
                              textAnchor={anchor}
                              className="radar-label"
                            >
                              {labels[idx]}
                            </text>
                          );
                        })}
                        
                        {/* Radar Area 1 (Red) */}
                        <polygon
                          points={getRadarCoordinates(
                            comparisonMode === 'team' ? team1Attributes : p1Attributes, 
                            center, 
                            maxRadius
                          )}
                          className="radar-fill-p1"
                        />
                        
                        {/* Radar Area 2 (Gold) */}
                        <polygon
                          points={getRadarCoordinates(
                            comparisonMode === 'team' ? team2Attributes : p2Attributes, 
                            center, 
                            maxRadius
                          )}
                          className="radar-fill-p2"
                        />
                      </svg>
                    </div>

                    {/* Legend */}
                    <div className="radar-legend">
                      <div className="legend-item p1-legend">
                        <span className="color-dot"></span>
                        <span>{comparisonMode === 'team' ? team1.teamName : player1.gamerTag}</span>
                      </div>
                      <div className="legend-item p2-legend">
                        <span className="color-dot"></span>
                        <span>{comparisonMode === 'team' ? team2.teamName : player2.gamerTag}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="radar-no-data-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', minHeight: '220px', padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(230, 57, 70, 0.08)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <i className="fas fa-info-circle" style={{ color: '#E63946', fontSize: '1.8rem' }}></i>
                    </div>
                    <h4 style={{ color: '#f4f4f5', margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>Attribute Chart Unavailable</h4>
                    <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.85rem', lineHeight: 1.4, maxWidth: '240px' }}>
                      Individual player attributes are only available for verified players.
                    </p>
                  </div>
                )}

                {/* Subtle attribute notice */}
                <div className="attribute-source-notice" style={{ marginTop: '1.5rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.4', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
                  <i className="fas fa-info-circle" style={{ color: '#e63946', marginRight: '0.4rem' }}></i>
                  <strong>Attribute Source:</strong> Derived from the players' latest standings in the <strong>Cadesports National E-Soccer Pro League (CNEL)</strong> (ATT = Attack, DEF = Defense, PAS = Passing, CON = Consistency, CLU = Clutch).
                </div>
              </div>

              {/* CARD 2 (RIGHT) */}
              {comparisonMode === 'team' ? (
                /* Team Card B */
                team2 && (
                  <div className="player-compare-card p2-card">
                    <div className="card-bg-glow"></div>
                    <div className="card-avatar-wrapper">
                      <div className="card-avatar">
                        {team2.teamName.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="card-details">
                      <span className="card-gamer-tag">{team2.teamName}</span>
                      {team2.placement && (
                        <span className={`placement-badge ${getPlacementBadgeClass(team2.placement)}`} style={{ alignSelf: 'center', marginTop: '0.25rem' }}>
                          {team2.placement}
                        </span>
                      )}
                      
                      {/* Players list */}
                      <div className="team-players-mini-list">
                        {team2.players.map(p => (
                          <div key={p.gamerTag} className="team-player-mini-row">
                            {getPlatformIcon(p.platform)}
                            <span className="mini-player-tag">{p.gamerTag}</span>
                            <span className="mini-player-platform">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="overall-rating">
                      <span className="rating-num">
                        {Math.round(
                          (team2Attributes.attack + 
                           team2Attributes.defense + 
                           team2Attributes.passing + 
                           team2Attributes.consistency + 
                           team2Attributes.clutch) / 5
                        )}
                      </span>
                      <span className="rating-lbl">TEAM OVERALL</span>
                    </div>
                  </div>
                )
              ) : (
                /* Player Card B */
                player2 && (
                  <div className="player-compare-card p2-card">
                    <div className="card-bg-glow"></div>
                    <div className="card-avatar-wrapper">
                      {player2.photoUrl ? (
                        <img src={player2.photoUrl} alt={player2.gamerTag} className="card-avatar-img" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #D4AF37' }} />
                      ) : (
                        <div className="card-avatar">
                          {player2.gamerTag.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="card-details">
                      <span className="card-gamer-tag">{player2.gamerTag}</span>
                      <span className="player-name-lbl" style={{ color: '#a1a1aa', fontSize: '0.85rem', display: 'block', margin: '0.15rem 0' }}>{player2.name}</span>
                      <span className="placement-badge" style={{ alignSelf: 'center', background: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', border: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                        {player2.teamName}
                      </span>
                      <div className="player-platform-mini" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                        {getPlatformIcon(player2.platform)}
                        <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{player2.platform}</span>
                      </div>
                    </div>
                    
                    <div className="overall-rating">
                      <span className="rating-num">
                        {p2Ovr !== null ? p2Ovr : '--'}
                      </span>
                      <span className="rating-lbl">PLAYER OVERALL</span>
                      {p2Ovr === null && (
                        <span className="rating-no-info" style={{ display: 'block', fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.25rem' }}>No public info</span>
                      )}
                    </div>
                  </div>
                )
              )}

            </div>

            {/* H2H COMPARISON STATS BARS */}
            {comparisonMode === 'team' && team1 && team2 && (
              <div className="h2h-stats-section">
                <h3 className="section-title">TEAM STATISTICS H2H</h3>
                <div className="h2h-stats-container">
                  {[
                    { label: "Matches Played", key: "matchesPlayed", isPercentage: false },
                    { label: "Wins", key: "wins", isPercentage: false },
                    { label: "Draws", key: "draws", isPercentage: false },
                    { label: "Losses", key: "losses", isPercentage: false },
                    { label: "Win Rate", key: "winRate", isPercentage: true },
                    { label: "Goals Scored", key: "goalsScored", isPercentage: false },
                    { label: "Goals Conceded", key: "goalsConceded", isPercentage: false },
                    { label: "Group Stage Points", key: "points", isPercentage: false }
                  ].map((stat) => {
                    const val1 = stat.isPercentage ? parseFloat(team1[stat.key]) : team1[stat.key];
                    const val2 = stat.isPercentage ? parseFloat(team2[stat.key]) : team2[stat.key];
                    
                    const maxVal = Math.max(val1, val2, 1);
                    const pct1 = (val1 / maxVal) * 100;
                    const pct2 = (val2 / maxVal) * 100;
                    
                    return (
                      <div key={stat.key} className="h2h-stat-row">
                        <div className="h2h-stat-player-val p1-val">{team1[stat.key]}{stat.isPercentage ? '%' : ''}</div>
                        <div className="h2h-stat-bar-container">
                          <span className="h2h-stat-label">{stat.label}</span>
                          <div className="h2h-bars-wrapper">
                            <div className="h2h-bar-track p1-track">
                              <div className="h2h-bar-fill p1-fill" style={{ width: `${pct1}%` }}></div>
                            </div>
                            <div className="h2h-bar-track p2-track">
                              <div className="h2h-bar-fill p2-fill" style={{ width: `${pct2}%` }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="h2h-stat-player-val p2-val">{team2[stat.key]}{stat.isPercentage ? '%' : ''}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {comparisonMode === 'player' && player1 && player2 && (
              <div className="h2h-stats-section">
                <h3 className="section-title">
                  {player1.hasCustomStandings || player2.hasCustomStandings 
                    ? "PLAYER LEAGUE STATS H2H" 
                    : "PLAYER TOURNAMENT STATS H2H"}
                </h3>
                <div className="h2h-stats-container">
                  {[
                    { label: "Matches Played", key: "matchesPlayed", isPercentage: false },
                    { label: "Wins", key: "wins", isPercentage: false },
                    { label: "Draws", key: "draws", isPercentage: false },
                    { label: "Losses", key: "losses", isPercentage: false },
                    { label: "Win Rate", key: "winRate", isPercentage: true },
                    { label: "Goals Scored", key: "goalsScored", isPercentage: false },
                    { label: "Goals Conceded", key: "goalsConceded", isPercentage: false },
                    { label: "Points", key: "points", isPercentage: false }
                  ].map((stat) => {
                    const val1 = stat.isPercentage ? parseFloat(player1[stat.key]) : player1[stat.key];
                    const val2 = stat.isPercentage ? parseFloat(player2[stat.key]) : player2[stat.key];
                    
                    const maxVal = Math.max(val1, val2, 1);
                    const pct1 = (val1 / maxVal) * 100;
                    const pct2 = (val2 / maxVal) * 100;
                    
                    return (
                      <div key={stat.key} className="h2h-stat-row">
                        <div className="h2h-stat-player-val p1-val">{player1[stat.key]}{stat.isPercentage ? '%' : ''}</div>
                        <div className="h2h-stat-bar-container">
                          <span className="h2h-stat-label">{stat.label}</span>
                          <div className="h2h-bars-wrapper">
                            <div className="h2h-bar-track p1-track">
                              <div className="h2h-bar-fill p1-fill" style={{ width: `${pct1}%` }}></div>
                            </div>
                            <div className="h2h-bar-track p2-track">
                              <div className="h2h-bar-fill p2-fill" style={{ width: `${pct2}%` }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="h2h-stat-player-val p2-val">{player2[stat.key]}{stat.isPercentage ? '%' : ''}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default function ComparisonPage() {
  return (
    <Suspense fallback={
      <div className="comparison-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#09090b', color: 'white' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: '#E63946' }}></i>
          <span>Loading comparison tools...</span>
        </div>
      </div>
    }>
      <ComparisonContent />
    </Suspense>
  );
}
