import React, { useState, useEffect } from 'react';
import { getAllRegistrations, getRegistrationCount } from '../supabaseClient';
import './AdminRegistrations.css';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' or 'bracket'
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchRegistrations();
    
    // Auto-refresh every 10 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchRegistrations();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await getAllRegistrations();
      const count = await getRegistrationCount();
      setRegistrations(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.player1_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.player2_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.player1_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
    if (sortBy === 'created_at') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'team_name') {
      return (a.team_name || '').localeCompare(b.team_name || '');
    }
    return 0;
  });

  const exportToCSV = () => {
    const headers = [
      'Team Name',
      'Player 1 Name',
      'Player 1 Tournament ID',
      'Player 1 Email',
      'Player 1 Phone',
      'Player 1 PSN ID',
      'Player 2 Name',
      'Player 2 Tournament ID',
      'Player 2 Email',
      'Player 2 Phone',
      'Player 2 PSN ID',
      'Payment Reference',
      'Registration Date'
    ];

    const rows = sortedRegistrations.map(reg => [
      reg.team_name,
      reg.player1_name,
      reg.player1_tournament_id || 'N/A',
      reg.player1_email,
      reg.player1_phone,
      reg.player1_gamer_tag,
      reg.player2_name,
      reg.player2_tournament_id || 'N/A',
      reg.player2_email,
      reg.player2_phone,
      reg.player2_gamer_tag,
      reg.payment_reference,
      new Date(reg.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syncplay-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Generate bracket matches from registrations
  const generateBracket = () => {
    // Sort registrations by registration date (first come, first served)
    const sortedTeams = [...registrations]
      .filter(reg => (reg.payment_status === 'completed' || !reg.payment_status) && (reg.status === 'active' || !reg.status))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const rounds = [];
    const maxTeams = 32;
    const teamCount = Math.min(sortedTeams.length, maxTeams);

    // Round 1: Round of 32 (16 matches)
    const round1 = [];
    for (let i = 0; i < teamCount; i += 2) {
      if (i + 1 < teamCount) {
        round1.push({
          matchNumber: Math.floor(i / 2) + 1,
          team1: sortedTeams[i],
          team2: sortedTeams[i + 1],
          round: 1,
          roundName: 'Round of 32'
        });
      } else {
        // Odd number of teams - bye for last team
        round1.push({
          matchNumber: Math.floor(i / 2) + 1,
          team1: sortedTeams[i],
          team2: null,
          round: 1,
          roundName: 'Round of 32',
          bye: true
        });
      }
    }
    // Fill remaining slots with empty matches
    while (round1.length < 16) {
      round1.push({
        matchNumber: round1.length + 1,
        team1: null,
        team2: null,
        round: 1,
        roundName: 'Round of 32'
      });
    }
    rounds.push(round1);

    // Round 2: Round of 16 (8 matches)
    const round2 = [];
    for (let i = 0; i < 8; i++) {
      round2.push({
        matchNumber: i + 1,
        team1: null,
        team2: null,
        round: 2,
        roundName: 'Round of 16',
        winnerFrom: `Match ${i * 2 + 1} vs Match ${i * 2 + 2}`
      });
    }
    rounds.push(round2);

    // Round 3: Quarterfinals (4 matches)
    const round3 = [];
    for (let i = 0; i < 4; i++) {
      round3.push({
        matchNumber: i + 1,
        team1: null,
        team2: null,
        round: 3,
        roundName: 'Quarterfinals',
        winnerFrom: `Match ${i * 2 + 1} vs Match ${i * 2 + 2}`
      });
    }
    rounds.push(round3);

    // Round 4: Semifinals (2 matches)
    const round4 = [];
    for (let i = 0; i < 2; i++) {
      round4.push({
        matchNumber: i + 1,
        team1: null,
        team2: null,
        round: 4,
        roundName: 'Semifinals',
        winnerFrom: `Match ${i * 2 + 1} vs Match ${i * 2 + 2}`
      });
    }
    rounds.push(round4);

    // Final: 1 match
    rounds.push([{
      matchNumber: 1,
      team1: null,
      team2: null,
      round: 5,
      roundName: 'Final',
      winnerFrom: 'Match 1 vs Match 2'
    }]);

    return { rounds, teamCount, totalSlots: maxTeams };
  };

  const handlePrintBracket = () => {
    window.print();
  };

  const bracket = generateBracket();

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <h1>Loading...</h1>
          <p><i className="fas fa-spinner fa-spin"></i> Fetching registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <h1>Tournament Registrations</h1>
            <p className="subtitle">2v2 EA Sports FC 26 - December 20, 2025</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Registered Teams</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalCount * 2}</div>
              <div className="stat-label">Total Players</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{32 - totalCount}</div>
              <div className="stat-label">Slots Remaining</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₦{(totalCount * 100000).toLocaleString()}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            <i className="fas fa-list"></i> Registrations ({totalCount})
          </button>
          <button
            className={`tab-button ${activeTab === 'bracket' ? 'active' : ''}`}
            onClick={() => setActiveTab('bracket')}
          >
            <i className="fas fa-trophy"></i> Tournament Bracket
          </button>
        </div>

        {/* Controls */}
        <div className="admin-controls">
          {activeTab === 'registrations' ? (
            <>
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by team name, player name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="control-buttons">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="created_at">Sort by Date</option>
                  <option value="team_name">Sort by Team Name</option>
                </select>
                <button className="btn btn-primary" onClick={fetchRegistrations}>
                  <i className="fas fa-sync-alt"></i> Refresh
                </button>
                <button className="btn btn-secondary" onClick={exportToCSV}>
                  <i className="fas fa-download"></i> Export CSV
                </button>
              </div>
            </>
          ) : (
            <div className="control-buttons">
              <label className="auto-refresh-toggle">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span>Auto-refresh (10s)</span>
              </label>
              <button className="btn btn-primary" onClick={fetchRegistrations}>
                <i className="fas fa-sync-alt"></i> Refresh Now
              </button>
              <button className="btn btn-success" onClick={handlePrintBracket}>
                <i className="fas fa-print"></i> Print Bracket
              </button>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'registrations' ? (
          <>
            {/* Results Count */}
            <div className="results-count">
              Showing {sortedRegistrations.length} of {totalCount} registrations
            </div>

            {/* Registrations Table */}
            <div className="registrations-table-wrapper">
              <table className="registrations-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team Name</th>
                    <th>Player 1</th>
                    <th>Player 2</th>
                    <th>Contact</th>
                    <th>Payment Ref</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegistrations.map((reg, index) => (
                    <tr key={reg.id}>
                      <td data-label="#">{index + 1}</td>
                      <td data-label="Team Name" className="team-name-cell">
                        <strong>{reg.team_name}</strong>
                      </td>
                      <td data-label="Player 1" className="player-cell">
                        <div className="player-info">
                          <strong>{reg.player1_name}</strong>
                          {reg.player1_tournament_id && (
                            <span className="tournament-id">
                              🎫 {reg.player1_tournament_id}
                            </span>
                          )}
                          <span className="gamer-tag">🎮 {reg.player1_gamer_tag}</span>
                          <span className="platform">
                            <i className="fab fa-playstation"></i> {reg.player1_platform}
                          </span>
                        </div>
                      </td>
                      <td data-label="Player 2" className="player-cell">
                        <div className="player-info">
                          <strong>{reg.player2_name}</strong>
                          {reg.player2_tournament_id && (
                            <span className="tournament-id">
                              🎫 {reg.player2_tournament_id}
                            </span>
                          )}
                          <span className="gamer-tag">🎮 {reg.player2_gamer_tag}</span>
                          <span className="platform">
                            <i className="fab fa-playstation"></i> {reg.player2_platform}
                          </span>
                        </div>
                      </td>
                      <td data-label="Contact" className="contact-cell">
                        <div className="contact-info">
                          <a href={`mailto:${reg.player1_email}`}>
                            <i className="fas fa-envelope"></i> {reg.player1_email}
                          </a>
                          <span><i className="fas fa-phone"></i> {reg.player1_phone}</span>
                        </div>
                      </td>
                      <td data-label="Payment Ref" className="payment-ref-cell">
                        <code>{reg.payment_reference}</code>
                      </td>
                      <td data-label="Date" className="date-cell">
                        {new Date(reg.created_at).toLocaleDateString('en-NG', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedRegistrations.length === 0 && (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>No registrations found</p>
              </div>
            )}
          </>
        ) : (
          <div className="bracket-container">
            <div className="bracket-header">
              <h2>Tournament Bracket</h2>
              <p className="bracket-subtitle">
                2v2 EA Sports FC 26 - December 20, 2025
              </p>
              <div className="bracket-stats">
                <span>{bracket.teamCount} / {bracket.totalSlots} Teams Registered</span>
                {bracket.teamCount < bracket.totalSlots && (
                  <span className="pending-slots">
                    ({bracket.totalSlots - bracket.teamCount} slots remaining)
                  </span>
                )}
              </div>
            </div>

            <div className="bracket-wrapper">
              {bracket.rounds.map((round, roundIndex) => (
                <div key={roundIndex} className="bracket-round">
                  <h3 className="round-title">{round[0]?.roundName || `Round ${roundIndex + 1}`}</h3>
                  <div className="round-matches">
                    {round.map((match, matchIndex) => (
                      <div key={matchIndex} className="bracket-match">
                        <div className="match-header">
                          <span className="match-number">Match {match.matchNumber}</span>
                          {match.winnerFrom && (
                            <span className="winner-from">Winner: {match.winnerFrom}</span>
                          )}
                        </div>
                        <div className="match-teams">
                          <div className={`team-slot ${match.team1 ? 'filled' : 'empty'} ${match.bye && matchIndex === round.length - 1 ? 'bye' : ''}`}>
                            {match.team1 ? (
                              <>
                                <strong>{match.team1.team_name}</strong>
                                <span className="team-players">
                                  {match.team1.player1_name} & {match.team1.player2_name}
                                </span>
                              </>
                            ) : match.bye ? (
                              <span className="bye-text">BYE</span>
                            ) : (
                              <span className="empty-text">TBD</span>
                            )}
                          </div>
                          <div className="vs-divider">VS</div>
                          <div className={`team-slot ${match.team2 ? 'filled' : 'empty'}`}>
                            {match.team2 ? (
                              <>
                                <strong>{match.team2.team_name}</strong>
                                <span className="team-players">
                                  {match.team2.player1_name} & {match.team2.player2_name}
                                </span>
                              </>
                            ) : (
                              <span className="empty-text">TBD</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {bracket.teamCount === 0 && (
              <div className="no-results">
                <i className="fas fa-trophy"></i>
                <p>No teams registered yet. Bracket will appear as teams register.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRegistrations;

