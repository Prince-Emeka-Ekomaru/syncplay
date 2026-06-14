"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../supabaseClient';
import { useLanguage } from '../../../contexts/LanguageContext';
import { translations } from '../../../translations/translations';
import { getPlayersFromRegistrations, TOURNAMENT_MATCHES } from '../../../utils/playerStats';
import './Profile.css';

// Badge color classes based on rating/placement
const getTierBadge = (rating, placement) => {
  if (placement?.includes("Champion")) return { name: "Tournament Champion 🏆", class: "tier-champion" };
  if (placement?.includes("Runner-Up")) return { name: "Runner-Up Finalist 🥈", class: "tier-runnerup" };
  if (placement?.includes("3rd Place")) return { name: "Podium Finisher 🥉", class: "tier-third" };
  if (rating >= 90) return { name: "Legendary Elite 🌟", class: "tier-legend" };
  if (rating >= 80) return { name: "Master Class ⭐", class: "tier-master" };
  if (rating >= 70) return { name: "Pro Challenger ⚔️", class: "tier-pro" };
  return { name: "Rising Star ⚡", class: "tier-rising" };
};

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

// Outcome helper for matches
const getMatchOutcome = (match, teamName) => {
  const isHome = match.home.toLowerCase() === teamName.toLowerCase();
  const opponent = isHome ? match.away : match.home;
  const myScore = isHome ? match.homeScore : match.awayScore;
  const oppScore = isHome ? match.awayScore : match.homeScore;
  
  if (match.pensWinner) {
    if (match.pensWinner.toLowerCase() === teamName.toLowerCase()) {
      return { outcome: 'WIN', text: 'Won (Pens)', class: 'outcome-win' };
    } else {
      return { outcome: 'LOSS', text: 'Lost (Pens)', class: 'outcome-loss' };
    }
  }
  
  if (myScore > oppScore) {
    return { outcome: 'WIN', text: 'Win', class: 'outcome-win' };
  } else if (myScore < oppScore) {
    return { outcome: 'LOSS', text: 'Loss', class: 'outcome-loss' };
  } else {
    return { outcome: 'DRAW', text: 'Draw', class: 'outcome-draw' };
  }
};

const getPlayerPhoto = (player) => {
  if (!player) return "/syncplay nobg.png";
  if (player.photoUrl) return player.photoUrl;
  
  const tag = player.gamerTag.toLowerCase();
  if (tag.includes('tactical')) return "/tournament-media/photos/welcome clinton tactical.png";
  if (tag.includes('baji') || tag.includes('banji')) return "/tournament-media/photos/welcome baji jr.png";
  if (tag.includes('boyd')) return "/tournament-media/photos/welcome boyd.png";
  if (tag.includes('bright')) return "/tournament-media/photos/welcome bright.png";
  if (tag.includes('ebuka') || tag.includes('bukas')) return "/tournament-media/photos/welcome ebuka.png";
  if (tag.includes('eddy') || tag.includes('eddie')) return "/tournament-media/photos/welcome eddy.png";
  if (tag.includes('josh')) return "/tournament-media/photos/welcome game with josh.png";
  if (tag.includes('mitch')) return "/tournament-media/photos/welcome mitch.png";
  if (tag.includes('cad') || tag.includes('wole')) return "/tournament-media/photos/welcome wolevation.png";
  
  // Team-level fallback posters
  const team = player.teamName?.toLowerCase() || '';
  if (team.includes('century') || team.includes('flame')) {
    return "/tournament-media/photos/l'flames and century.png";
  }
  if (team.includes('temple') || team.includes('fantastic')) {
    return "/tournament-media/photos/temple boys and d fantastic 2.png";
  }
  if (team.includes('prime') || team.includes('twin')) {
    return "/tournament-media/photos/prime time and dangerous twins.png";
  }
  if (team.includes('orbyters') || team.includes('psych') || team.includes('banter')) {
    return "/tournament-media/photos/orbyters and get psyched.png";
  }
  if (team.includes('gameverse') || team.includes('titan')) {
    return "/tournament-media/photos/titans and gameverxe.png";
  }
  if (team.includes('fola') || team.includes('yemi')) {
    return "/tournament-media/photos/3RD PLACE.png";
  }
  
  return "/syncplay nobg.png";
};

export default function PlayerProfilePage({ params }) {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const gamerTag = decodeURIComponent(params.gamerTag);

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
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
        
        const allPlayers = getPlayersFromRegistrations(registrationsData, ratingsData);
        const matchedPlayer = allPlayers.find(p => p.gamerTag.toLowerCase() === gamerTag.toLowerCase());
        
        if (matchedPlayer) {
          setPlayer(matchedPlayer);
        } else {
          setError('Player not found');
        }
      } catch (err) {
        console.error('Error loading player profile:', err);
        setError('Error loading player profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [gamerTag]);

  if (loading) {
    return (
      <div className="profile-page loading-state">
        <div className="loader-container">
          <i className="fas fa-circle-notch fa-spin"></i>
          <span>Loading player profile...</span>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="profile-page error-state">
        <div className="error-card glass-panel">
          <i className="fas fa-exclamation-triangle error-icon"></i>
          <h2>{error || 'Player Profile Not Found'}</h2>
          <p>We couldn't find a player with the gamer tag "{gamerTag}". Check the spelling or browse the leaderboard.</p>
          <Link href="/players" className="btn-back">
            <i className="fas fa-arrow-left"></i> Back to Leaderboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Overall Rating
  const hasAttributes = player.hasCadesportsProfile && player.attributes;
  const attack = hasAttributes ? player.attributes.attack : 50;
  const defense = hasAttributes ? player.attributes.defense : 50;
  const passing = hasAttributes ? player.attributes.passing : 50;
  const consistency = hasAttributes ? player.attributes.consistency : 50;
  const clutch = hasAttributes ? player.attributes.clutch : 50;
  
  const overallRating = Math.round((attack + defense + passing + consistency + clutch) / 5);
  const tier = getTierBadge(overallRating, player.placement);

  // Get Match History for this player's team
  const matchHistory = [
    ...TOURNAMENT_MATCHES.groupStage,
    ...TOURNAMENT_MATCHES.knockouts
  ].filter(m => 
    m.home.toLowerCase() === player.teamName.toLowerCase() || 
    m.away.toLowerCase() === player.teamName.toLowerCase()
  );

  return (
    <div className="profile-page">
      <div className="profile-hero-overlay"></div>
      
      <div className="container profile-container">
        {/* Back Link */}
        <div className="back-link-wrapper">
          <Link href="/players" className="back-link">
            <i className="fas fa-chevron-left"></i> Back to Leaderboard
          </Link>
        </div>

        {/* Main Grid */}
        <div className="profile-grid">
          
          {/* Card Left: Profile Header & Details */}
          <div className="profile-left-column">
            <div className="glass-panel profile-card-main">
              <div className="profile-card-glow"></div>
              
              {/* Profile Avatar / Photo */}
              <div className="profile-avatar-container">
                <img src={getPlayerPhoto(player)} alt={player.gamerTag} className="profile-uploaded-photo" />
                <div className="platform-badge-overlay">
                  {getPlatformIcon(player.platform)}
                </div>
              </div>

              {/* Player Identity */}
              <div className="profile-identity">
                <h1 className="profile-gamer-tag">{player.gamerTag}</h1>
                <h2 className="profile-full-name">{player.name}</h2>
                <div className={`profile-tier-badge ${tier.class}`}>
                  {tier.name}
                </div>
              </div>

              <div className="profile-divider"></div>

              {/* Player Details List */}
              <div className="profile-details-list">
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-users"></i> Team</span>
                  <span className="detail-value text-glow">{player.teamName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label"><i className="fas fa-gamepad"></i> Platform</span>
                  <span className="detail-value">{player.platform}</span>
                </div>
                {player.email && (
                  <div className="detail-item">
                    <span className="detail-label"><i className="fas fa-envelope"></i> Email</span>
                    <span className="detail-value email-value" title={player.email}>{player.email}</span>
                  </div>
                )}
              </div>

              <div className="profile-actions">
                <Link href={`/comparison?t1=${player.teamName}`} className="btn-action btn-compare-player">
                  <i className="fas fa-arrows-alt-h"></i> Compare Team
                </Link>
              </div>
            </div>

            {/* Performance Stats Panel */}
            <div className="glass-panel stats-summary-panel">
              <h3 className="panel-title"><i className="fas fa-chart-line"></i> Tournament Performance</h3>
              <div className="stats-summary-grid">
                <div className="stat-summary-card">
                  <span className="stat-num">{player.matchesPlayed}</span>
                  <span className="stat-lbl">Played</span>
                </div>
                <div className="stat-summary-card">
                  <span className="stat-num win-txt">{player.wins}</span>
                  <span className="stat-lbl">Wins</span>
                </div>
                <div className="stat-summary-card">
                  <span className="stat-num draw-txt">{player.draws}</span>
                  <span className="stat-lbl">Draws</span>
                </div>
                <div className="stat-summary-card">
                  <span className="stat-num loss-txt">{player.losses}</span>
                  <span className="stat-lbl">Losses</span>
                </div>
                <div className="stat-summary-card Highlighted">
                  <span className="stat-num rating-txt">{player.winRate}%</span>
                  <span className="stat-lbl">Win Rate</span>
                </div>
                <div className="stat-summary-card Highlighted">
                  <span className="stat-num rating-txt">{player.points}</span>
                  <span className="stat-lbl">Points</span>
                </div>
              </div>

              <div className="goals-breakdown-row">
                <div className="goals-stat">
                  <span className="goals-lbl">Goals Scored</span>
                  <span className="goals-val">{player.goalsScored}</span>
                </div>
                <div className="goals-divider"></div>
                <div className="goals-stat">
                  <span className="goals-lbl">Goals Conceded</span>
                  <span className="goals-val">{player.goalsConceded}</span>
                </div>
                <div className="goals-divider"></div>
                <div className="goals-stat">
                  <span className="goals-lbl">Goal Difference</span>
                  <span className="goals-val text-glow">{(player.goalsScored - player.goalsConceded) > 0 ? `+${player.goalsScored - player.goalsConceded}` : player.goalsScored - player.goalsConceded}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Right: Attributes & Match History */}
          <div className="profile-right-column">
            
            {/* OVR Box & Attributes Bars */}
            <div className="glass-panel attributes-panel">
              <div className="attributes-header">
                <div>
                  <h3 className="panel-title"><i className="fas fa-sliders-h"></i> Player Attributes</h3>
                  <p className="panel-subtitle">Performance ratings scaled by tournament placement and stats</p>
                </div>
                
                {/* OVR Rating Circle */}
                {player.hasCadesportsProfile && (
                  <div className="ovr-rating-box">
                    <div className="ovr-rating-circle">
                      <span className="ovr-num">{overallRating}</span>
                      <span className="ovr-lbl">OVR</span>
                    </div>
                  </div>
                )}
              </div>

              {player.hasCadesportsProfile ? (
                /* Progress Bars */
                <div className="attributes-list">
                  <div className="attribute-bar-item">
                    <div className="attr-meta">
                      <span className="attr-name">ATTACK (ATT)</span>
                      <span className="attr-score">{attack}</span>
                    </div>
                    <div className="attr-progress-track">
                      <div className="attr-progress-fill att-fill" style={{ width: `${attack}%` }}></div>
                    </div>
                  </div>

                  <div className="attribute-bar-item">
                    <div className="attr-meta">
                      <span className="attr-name">DEFENSE (DEF)</span>
                      <span className="attr-score">{defense}</span>
                    </div>
                    <div className="attr-progress-track">
                      <div className="attr-progress-fill def-fill" style={{ width: `${defense}%` }}></div>
                    </div>
                  </div>

                  <div className="attribute-bar-item">
                    <div className="attr-meta">
                      <span className="attr-name">PASSING (PAS)</span>
                      <span className="attr-score">{passing}</span>
                    </div>
                    <div className="attr-progress-track">
                      <div className="attr-progress-fill pas-fill" style={{ width: `${passing}%` }}></div>
                    </div>
                  </div>

                  <div className="attribute-bar-item">
                    <div className="attr-meta">
                      <span className="attr-name">CONSISTENCY (CON)</span>
                      <span className="attr-score">{consistency}</span>
                    </div>
                    <div className="attr-progress-track">
                      <div className="attr-progress-fill con-fill" style={{ width: `${consistency}%` }}></div>
                    </div>
                  </div>

                  <div className="attribute-bar-item">
                    <div className="attr-meta">
                      <span className="attr-name">CLUTCH (CLU)</span>
                      <span className="attr-score">{clutch}</span>
                    </div>
                    <div className="attr-progress-track">
                      <div className="attr-progress-fill clu-fill" style={{ width: `${clutch}%` }}></div>
                    </div>
                  </div>

                  {/* Subtle attribute explanation notice */}
                  <div className="attribute-source-notice" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.45', textAlign: 'left' }}>
                    <i className="fas fa-info-circle" style={{ color: '#e63946', marginRight: '0.5rem' }}></i>
                    <p style={{ color: '#a1a1aa', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                      <strong>Attribute Rationale:</strong> Ratings are derived from the player's latest performance standings in the <strong>Cadesports National E-Soccer Pro League</strong>:
                    </p>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'rgba(255,255,255,0.4)', listStyleType: 'disc' }}>
                      <li><strong>ATT (Attack)</strong>: Goal scoring efficiency per match.</li>
                      <li><strong>DEF (Defense)</strong>: Goal difference scaled and discounted for losses.</li>
                      <li><strong>PAS (Passing)</strong>: Possession control based on win/draw ratios.</li>
                      <li><strong>CON (Consistency)</strong>: Average undefeated match rate.</li>
                      <li><strong>CLU (Clutch)</strong>: Efficiency in securing points under pressure.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* No verified attributes notice */
                <div className="no-attributes-data" style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="no-data-icon-wrapper" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(230, 57, 70, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <i className="fas fa-info-circle" style={{ color: '#E63946', fontSize: '1.5rem' }}></i>
                  </div>
                  <h4 style={{ color: '#f4f4f5', fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>No Public Info Available</h4>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0, lineHeight: 1.5, maxWidth: '320px' }}>There is no public info on the player rating. Individual player attributes are only available for verified players.</p>
                </div>
              )}
            </div>

            {/* Match History List */}
            <div className="glass-panel match-history-panel">
              <h3 className="panel-title"><i className="fas fa-history"></i> Tournament Match History</h3>
              {matchHistory.length === 0 ? (
                <div className="no-matches-state">
                  <i className="fas fa-calendar-times"></i>
                  <p>No matches recorded for this team in the tournament history.</p>
                </div>
              ) : (
                <div className="matches-list">
                  {matchHistory.map((match, idx) => {
                    const outcome = getMatchOutcome(match, player.teamName);
                    const isHome = match.home.toLowerCase() === player.teamName.toLowerCase();
                    const opponent = isHome ? match.away : match.home;
                    
                    return (
                      <div key={idx} className="match-history-card">
                        <div className="match-card-meta">
                          <span className="match-stage-badge">
                            {match.round || `Group ${match.group}`}
                          </span>
                          <span className={`match-outcome-badge ${outcome.class}`}>
                            {outcome.text}
                          </span>
                        </div>
                        
                        <div className="match-card-vs">
                          <div className="match-team my-team">
                            <span className="team-name-lbl">{player.teamName}</span>
                            <span className="score-lbl">{isHome ? match.homeScore : match.awayScore}</span>
                          </div>
                          
                          <div className="match-vs-divider">vs</div>
                          
                          <div className="match-team opponent-team">
                            <span className="score-lbl">{isHome ? match.awayScore : match.homeScore}</span>
                            <span className="team-name-lbl">{opponent}</span>
                          </div>
                        </div>

                        {match.pensWinner && (
                          <div className="pens-indicator">
                            <i className="fas fa-info-circle"></i> Won on penalties by {match.pensWinner}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
