import React, { useState, useEffect } from 'react';
import { getAllRegistrations, getRegistrationCount } from '../supabaseClient';
import { getEntryFee, setEntryFee, getEntryFeeInNaira, formatPrice, clearPriceCache } from '../utils/priceManager';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './AdminRegistrations.css';

// Draggable Team Slot Component
const DraggableTeamSlot = ({ team, match, slotPosition, isWinner, isBye }) => {
  // Only make it draggable if there's a team
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: team ? `team-${team.id}` : `empty-${match.round}-${match.matchNumber}-${slotPosition}`,
    data: { team, match, slotPosition },
    disabled: !team // Disable dragging if no team
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(team ? { ...attributes, ...listeners } : {})}
      className={`team-slot ${team ? 'filled draggable' : 'empty'} ${isWinner ? 'winner' : ''} ${isBye ? 'bye' : ''}`}
    >
      {team ? (
        <>
          <strong>{team.team_name}</strong>
          <span className="team-players">
            {team.player1_name} & {team.player2_name}
          </span>
          {isWinner && (
            <span className="winner-badge">
              <i className="fas fa-trophy"></i> Winner
            </span>
          )}
          <span className="drag-handle">
            <i className="fas fa-grip-vertical"></i> Drag to move
          </span>
        </>
      ) : isBye ? (
        <span className="bye-text">BYE</span>
      ) : (
        <span className="empty-text">Drop team here</span>
      )}
    </div>
  );
};

// Droppable Match Slot Component
const DroppableMatchSlot = ({ match, slotPosition, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `match-${match.round}-${match.matchNumber}-${slotPosition}`,
    data: { match, slotPosition }
  });

  return (
    <div
      ref={setNodeRef}
      className={`droppable-slot ${isOver ? 'drag-over' : ''}`}
      style={{ minHeight: '80px' }}
    >
      {children}
    </div>
  );
};

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' or 'bracket'
  const [matchResults, setMatchResults] = useState({}); // Store match winners: { "round-1-match-1": teamId, ... }
  const [bracketPositions, setBracketPositions] = useState({}); // Store custom bracket positions: { "round-1-match-1-team1": teamId, ... }
  const [activeId, setActiveId] = useState(null); // Currently dragging item
  const [entryFee, setEntryFeeState] = useState(20000); // Current entry fee in Naira (default, will be updated)
  const [priceEditMode, setPriceEditMode] = useState(false);
  const [newPrice, setNewPrice] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchRegistrations();
    loadMatchResults();
    loadBracketPositions();
    // Refresh price on mount (async)
    getEntryFee().then(price => {
      setEntryFeeState(price / 100);
    });
  }, []);

  // Load match results from localStorage
  const loadMatchResults = () => {
    try {
      const saved = localStorage.getItem('tournament_match_results');
      if (saved) {
        setMatchResults(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading match results:', error);
    }
  };

  // Load bracket positions from localStorage
  const loadBracketPositions = () => {
    try {
      const saved = localStorage.getItem('tournament_bracket_positions');
      if (saved) {
        setBracketPositions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading bracket positions:', error);
    }
  };

  // Save bracket positions to localStorage
  const saveBracketPositions = (positions) => {
    setBracketPositions(positions);
    try {
      localStorage.setItem('tournament_bracket_positions', JSON.stringify(positions));
    } catch (error) {
      console.error('Error saving bracket positions:', error);
    }
  };

  // Save match result
  const saveMatchResult = (round, matchNumber, winnerTeamId) => {
    const key = `round-${round}-match-${matchNumber}`;
    const newResults = { ...matchResults, [key]: winnerTeamId };
    setMatchResults(newResults);
    try {
      localStorage.setItem('tournament_match_results', JSON.stringify(newResults));
    } catch (error) {
      console.error('Error saving match result:', error);
    }
  };

  // Get match winner
  const getMatchWinner = (round, matchNumber) => {
    const key = `round-${round}-match-${matchNumber}`;
    return matchResults[key] || null;
  };

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

  // Helper function to find team by ID
  const findTeamById = (teamId, teams) => {
    return teams.find(team => team.id === teamId) || null;
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
    for (let matchNum = 1; matchNum <= 16; matchNum++) {
      const team1Key = `round-1-match-${matchNum}-team1`;
      const team2Key = `round-1-match-${matchNum}-team2`;
      const winnerId = getMatchWinner(1, matchNum);
      
      // Use custom bracket positions if available, otherwise use default pairing
      let team1 = bracketPositions[team1Key] ? findTeamById(bracketPositions[team1Key], sortedTeams) : null;
      let team2 = bracketPositions[team2Key] ? findTeamById(bracketPositions[team2Key], sortedTeams) : null;
      
      // If no custom positions, use default pairing
      if (!team1 && !team2 && matchNum <= Math.ceil(teamCount / 2)) {
        const i = (matchNum - 1) * 2;
        if (i < teamCount) {
          team1 = sortedTeams[i];
        }
        if (i + 1 < teamCount) {
          team2 = sortedTeams[i + 1];
        } else if (i < teamCount) {
          // Odd number - bye
          round1.push({
            matchNumber: matchNum,
            team1: team1,
            team2: null,
            round: 1,
            roundName: 'Round of 32',
            bye: true,
            winnerId: winnerId || team1?.id
          });
          continue;
        }
      }
      
      round1.push({
        matchNumber: matchNum,
        team1: team1,
        team2: team2,
        round: 1,
        roundName: 'Round of 32',
        winnerId: winnerId
      });
    }
    rounds.push(round1);

    // Round 2: Round of 16 (8 matches) - Advance winners from Round 1
    const round2 = [];
    for (let i = 0; i < 8; i++) {
      const matchNum = i + 1;
      const match1Num = i * 2 + 1;
      const match2Num = i * 2 + 2;
      const winner1Id = getMatchWinner(1, match1Num);
      const winner2Id = getMatchWinner(1, match2Num);
      const winnerId = getMatchWinner(2, matchNum);
      
      // Get teams from previous round winners
      const team1 = winner1Id ? findTeamById(winner1Id, sortedTeams) : null;
      const team2 = winner2Id ? findTeamById(winner2Id, sortedTeams) : null;
      
      round2.push({
        matchNumber: matchNum,
        team1: team1,
        team2: team2,
        round: 2,
        roundName: 'Round of 16',
        winnerFrom: `Match ${match1Num} vs Match ${match2Num}`,
        winnerId: winnerId
      });
    }
    rounds.push(round2);

    // Round 3: Quarterfinals (4 matches) - Advance winners from Round 2
    const round3 = [];
    for (let i = 0; i < 4; i++) {
      const matchNum = i + 1;
      const match1Num = i * 2 + 1;
      const match2Num = i * 2 + 2;
      const winner1Id = getMatchWinner(2, match1Num);
      const winner2Id = getMatchWinner(2, match2Num);
      const winnerId = getMatchWinner(3, matchNum);
      
      const team1 = winner1Id ? findTeamById(winner1Id, sortedTeams) : null;
      const team2 = winner2Id ? findTeamById(winner2Id, sortedTeams) : null;
      
      round3.push({
        matchNumber: matchNum,
        team1: team1,
        team2: team2,
        round: 3,
        roundName: 'Quarterfinals',
        winnerFrom: `Match ${match1Num} vs Match ${match2Num}`,
        winnerId: winnerId
      });
    }
    rounds.push(round3);

    // Round 4: Semifinals (2 matches) - Advance winners from Round 3
    const round4 = [];
    for (let i = 0; i < 2; i++) {
      const matchNum = i + 1;
      const match1Num = i * 2 + 1;
      const match2Num = i * 2 + 2;
      const winner1Id = getMatchWinner(3, match1Num);
      const winner2Id = getMatchWinner(3, match2Num);
      const winnerId = getMatchWinner(4, matchNum);
      
      const team1 = winner1Id ? findTeamById(winner1Id, sortedTeams) : null;
      const team2 = winner2Id ? findTeamById(winner2Id, sortedTeams) : null;
      
      round4.push({
        matchNumber: matchNum,
        team1: team1,
        team2: team2,
        round: 4,
        roundName: 'Semifinals',
        winnerFrom: `Match ${match1Num} vs Match ${match2Num}`,
        winnerId: winnerId
      });
    }
    rounds.push(round4);

    // Final: 1 match - Advance winners from Round 4
    const finalMatch1Winner = getMatchWinner(4, 1);
    const finalMatch2Winner = getMatchWinner(4, 2);
    const finalWinner = getMatchWinner(5, 1);
    
    const finalTeam1 = finalMatch1Winner ? findTeamById(finalMatch1Winner, sortedTeams) : null;
    const finalTeam2 = finalMatch2Winner ? findTeamById(finalMatch2Winner, sortedTeams) : null;
    
    rounds.push([{
      matchNumber: 1,
      team1: finalTeam1,
      team2: finalTeam2,
      round: 5,
      roundName: 'Final',
      winnerFrom: 'Match 1 vs Match 2',
      winnerId: finalWinner
    }]);

    return { rounds, teamCount, totalSlots: maxTeams };
  };

  const handlePrintBracket = () => {
    window.print();
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // If dragging a team to a match slot
    if (activeData?.team && overData?.match && overData?.slotPosition) {
      const teamId = activeData.team.id;
      const positionKey = `round-${overData.match.round}-match-${overData.match.matchNumber}-${overData.slotPosition}`;
      
      // Remove team from old position
      const newPositions = { ...bracketPositions };
      Object.keys(newPositions).forEach(key => {
        if (newPositions[key] === teamId) {
          delete newPositions[key];
        }
      });
      
      // Add team to new position
      newPositions[positionKey] = teamId;
      saveBracketPositions(newPositions);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
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
              <div className="stat-value">₦{(totalCount * getEntryFeeInNaira()).toLocaleString()}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card price-management-card">
              <div className="stat-value">{formatPrice()}</div>
              <div className="stat-label">Entry Fee</div>
              {priceEditMode ? (
                <div className="price-edit-form">
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Enter new price"
                    min="1"
                    step="1000"
                    className="price-input"
                  />
                  <div className="price-actions">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={async () => {
                        const price = parseFloat(newPrice);
                        if (price > 0) {
                          const success = await setEntryFee(price);
                          if (success) {
                            clearPriceCache(); // Clear cache to force reload
                            setEntryFeeState(price);
                            setPriceEditMode(false);
                            setNewPrice('');
                            alert(`Entry fee updated to ₦${price.toLocaleString()}`);
                          } else {
                            alert('Failed to update price');
                          }
                        } else {
                          alert('Please enter a valid price');
                        }
                      }}
                    >
                      <i className="fas fa-check"></i> Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setPriceEditMode(false);
                        setNewPrice('');
                      }}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setNewPrice(entryFee.toString());
                    setPriceEditMode(true);
                  }}
                >
                  <i className="fas fa-edit"></i> Change Price
                </button>
              )}
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
              <button className="btn btn-primary" onClick={fetchRegistrations}>
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
              <a href="/admin/manual-registration" className="btn btn-warning">
                <i className="fas fa-user-plus"></i> Manual Registration
              </a>
              <button className="btn btn-success" onClick={handlePrintBracket}>
                <i className="fas fa-print"></i> Print Bracket
              </button>
              {Object.keys(matchResults).length > 0 && (
                <button 
                  className="btn btn-danger" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all match results? This cannot be undone.')) {
                      setMatchResults({});
                      localStorage.removeItem('tournament_match_results');
                    }
                  }}
                >
                  <i className="fas fa-trash"></i> Clear All Results
                </button>
              )}
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

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
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
                            <DroppableMatchSlot match={match} slotPosition="team1">
                              <DraggableTeamSlot
                                team={match.team1}
                                match={match}
                                slotPosition="team1"
                                isWinner={match.winnerId === match.team1?.id}
                                isBye={match.bye && matchIndex === round.length - 1}
                              />
                            </DroppableMatchSlot>
                            <div className="vs-divider">VS</div>
                            <DroppableMatchSlot match={match} slotPosition="team2">
                              <DraggableTeamSlot
                                team={match.team2}
                                match={match}
                                slotPosition="team2"
                                isWinner={match.winnerId === match.team2?.id}
                              />
                            </DroppableMatchSlot>
                          </div>
                        {/* Winner Selection Buttons */}
                        {match.team1 && (match.team2 || match.bye) && !match.winnerId && (
                          <div className="match-actions">
                            <button
                              className="btn-winner btn-winner-team1"
                              onClick={() => saveMatchResult(match.round, match.matchNumber, match.team1.id)}
                              disabled={!match.team1}
                            >
                              <i className="fas fa-check"></i> {match.team1.team_name} Wins
                            </button>
                            {match.team2 && (
                              <button
                                className="btn-winner btn-winner-team2"
                                onClick={() => saveMatchResult(match.round, match.matchNumber, match.team2.id)}
                                disabled={!match.team2}
                              >
                                <i className="fas fa-check"></i> {match.team2.team_name} Wins
                              </button>
                            )}
                          </div>
                        )}
                        {match.winnerId && (
                          <div className="match-actions">
                            <button
                              className="btn-undo"
                              onClick={() => {
                                const key = `round-${match.round}-match-${match.matchNumber}`;
                                const newResults = { ...matchResults };
                                delete newResults[key];
                                setMatchResults(newResults);
                                localStorage.setItem('tournament_match_results', JSON.stringify(newResults));
                              }}
                            >
                              <i className="fas fa-undo"></i> Undo Result
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              </div>
              <DragOverlay>
                {activeId ? (
                  <div className="team-slot filled draggable" style={{ opacity: 0.8 }}>
                    <i className="fas fa-grip-vertical"></i> Dragging...
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

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

