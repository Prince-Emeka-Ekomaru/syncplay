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

// Two-Legged Match Component
const TwoLeggedMatch = ({ match, getKnockoutLegResult, saveKnockoutLegResult, matchResults, setMatchResults }) => {
  const leg1Result = getKnockoutLegResult(match.round, match.matchNumber, 1);
  const leg2Result = getKnockoutLegResult(match.round, match.matchNumber, 2);
  const [leg1Team1Score, setLeg1Team1Score] = useState(leg1Result?.team1Score?.toString() || '');
  const [leg1Team2Score, setLeg1Team2Score] = useState(leg1Result?.team2Score?.toString() || '');
  const [leg2Team1Score, setLeg2Team1Score] = useState(leg2Result?.team1Score?.toString() || '');
  const [leg2Team2Score, setLeg2Team2Score] = useState(leg2Result?.team2Score?.toString() || '');

  useEffect(() => {
    if (leg1Result) {
      setLeg1Team1Score(leg1Result.team1Score?.toString() || '');
      setLeg1Team2Score(leg1Result.team2Score?.toString() || '');
    }
    if (leg2Result) {
      setLeg2Team1Score(leg2Result.team1Score?.toString() || '');
      setLeg2Team2Score(leg2Result.team2Score?.toString() || '');
    }
  }, [leg1Result, leg2Result]);

  // Calculate aggregate
  // Leg 1: Team1 (Home) vs Team2 (Away)
  // Leg 2: Team2 (Home) vs Team1 (Away)
  // Team1 aggregate = leg1 home + leg2 away
  // Team2 aggregate = leg1 away + leg2 home
  const team1Aggregate = leg1Result && leg2Result 
    ? leg1Result.team1Score + leg2Result.team1Score 
    : null;
  const team2Aggregate = leg1Result && leg2Result 
    ? leg1Result.team2Score + leg2Result.team2Score 
    : null;

  const handleClearResults = () => {
    const leg1Key = `round-${match.round}-match-${match.matchNumber}-leg-1`;
    const leg2Key = `round-${match.round}-match-${match.matchNumber}-leg-2`;
    const newResults = { ...matchResults };
    delete newResults[leg1Key];
    delete newResults[leg2Key];
    setMatchResults(newResults);
    localStorage.setItem('tournament_match_results', JSON.stringify(newResults));
    setLeg1Team1Score('');
    setLeg1Team2Score('');
    setLeg2Team1Score('');
    setLeg2Team2Score('');
  };

  return (
    <div className="bracket-match two-legged-match">
      <div className="match-header">
        <span className="match-number">Match {match.matchNumber}</span>
        {match.winnerFrom && (
          <span className="winner-from">Winner: {match.winnerFrom}</span>
        )}
        {match.winnerId && (
          <span className="aggregate-winner">
            Winner: {match.team1?.id === match.winnerId ? match.team1.team_name : match.team2.team_name}
          </span>
        )}
      </div>
      
      {/* Leg 1: Team1 Home vs Team2 Away */}
      <div className="match-leg">
        <div className="leg-header">
          <span className="leg-label">Leg 1</span>
          <span className="leg-venue">{match.team1.team_name} (Home) vs {match.team2.team_name} (Away)</span>
        </div>
        <div className="leg-scores">
          <div className="score-input-group">
            <label>{match.team1.team_name}</label>
            <input
              type="number"
              min="0"
              value={leg1Team1Score}
              onChange={(e) => setLeg1Team1Score(e.target.value)}
              placeholder="0"
              className="score-input"
            />
          </div>
          <span className="score-separator">-</span>
          <div className="score-input-group">
            <label>{match.team2.team_name}</label>
            <input
              type="number"
              min="0"
              value={leg1Team2Score}
              onChange={(e) => setLeg1Team2Score(e.target.value)}
              placeholder="0"
              className="score-input"
            />
          </div>
          <button
            className="btn-save-score"
            onClick={() => {
              const t1Score = parseInt(leg1Team1Score) || 0;
              const t2Score = parseInt(leg1Team2Score) || 0;
              saveKnockoutLegResult(match.round, match.matchNumber, 1, t1Score, t2Score);
            }}
          >
            Save
          </button>
        </div>
        {leg1Result && (
          <div className="leg-result">
            Result: {leg1Result.team1Score} - {leg1Result.team2Score}
          </div>
        )}
      </div>
      
      {/* Leg 2: Team1 Away vs Team2 Home */}
      <div className="match-leg">
        <div className="leg-header">
          <span className="leg-label">Leg 2</span>
          <span className="leg-venue">{match.team2.team_name} (Home) vs {match.team1.team_name} (Away)</span>
        </div>
        <div className="leg-scores">
          <div className="score-input-group">
            <label>{match.team2.team_name}</label>
            <input
              type="number"
              min="0"
              value={leg2Team2Score}
              onChange={(e) => setLeg2Team2Score(e.target.value)}
              placeholder="0"
              className="score-input"
            />
          </div>
          <span className="score-separator">-</span>
          <div className="score-input-group">
            <label>{match.team1.team_name}</label>
            <input
              type="number"
              min="0"
              value={leg2Team1Score}
              onChange={(e) => setLeg2Team1Score(e.target.value)}
              placeholder="0"
              className="score-input"
            />
          </div>
          <button
            className="btn-save-score"
            onClick={() => {
              const t1Score = parseInt(leg2Team1Score) || 0;
              const t2Score = parseInt(leg2Team2Score) || 0;
              saveKnockoutLegResult(match.round, match.matchNumber, 2, t1Score, t2Score);
            }}
          >
            Save
          </button>
        </div>
        {leg2Result && (
          <div className="leg-result">
            Result: {leg2Result.team2Score} - {leg2Result.team1Score}
          </div>
        )}
      </div>
      
      {/* Aggregate Score Display */}
      {team1Aggregate !== null && team2Aggregate !== null && (
        <div className="aggregate-score">
          <strong>Aggregate: {match.team1.team_name} {team1Aggregate} - {team2Aggregate} {match.team2.team_name}</strong>
          {team1Aggregate === team2Aggregate && (
            <span className="tie-note"> (Tied - Away goals rule applies)</span>
          )}
        </div>
      )}
      
      {/* Undo Button */}
      {(leg1Result || leg2Result) && (
        <div className="match-actions">
          <button
            className="btn-undo"
            onClick={handleClearResults}
          >
            <i className="fas fa-undo"></i> Clear Results
          </button>
        </div>
      )}
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

  // Save match result (for group stage - single match)
  const saveMatchResult = (round, matchNumber, winnerTeamId, groupNumber = null) => {
    let key;
    if (groupNumber !== null) {
      key = `group-${groupNumber}-match-${matchNumber}`;
    } else {
      key = `round-${round}-match-${matchNumber}`;
    }
    const newResults = { ...matchResults, [key]: winnerTeamId };
    setMatchResults(newResults);
    try {
      localStorage.setItem('tournament_match_results', JSON.stringify(newResults));
    } catch (error) {
      console.error('Error saving match result:', error);
    }
  };

  // Save knockout leg result (for two-legged matches)
  const saveKnockoutLegResult = (round, matchNumber, leg, team1Score, team2Score) => {
    const key = `round-${round}-match-${matchNumber}-leg-${leg}`;
    const newResults = { 
      ...matchResults, 
      [key]: { team1Score, team2Score }
    };
    setMatchResults(newResults);
    try {
      localStorage.setItem('tournament_match_results', JSON.stringify(newResults));
    } catch (error) {
      console.error('Error saving knockout leg result:', error);
    }
  };

  // Get match winner (for group stage)
  const getMatchWinner = (round, matchNumber, groupNumber = null) => {
    if (groupNumber !== null) {
      const key = `group-${groupNumber}-match-${matchNumber}`;
      return matchResults[key] || null;
    }
    const key = `round-${round}-match-${matchNumber}`;
    return matchResults[key] || null;
  };

  // Get knockout leg result
  const getKnockoutLegResult = (round, matchNumber, leg) => {
    const key = `round-${round}-match-${matchNumber}-leg-${leg}`;
    return matchResults[key] || null;
  };

  // Calculate aggregate winner for two-legged match
  const getKnockoutAggregateWinner = (round, matchNumber, team1Id, team2Id) => {
    const leg1 = getKnockoutLegResult(round, matchNumber, 1);
    const leg2 = getKnockoutLegResult(round, matchNumber, 2);
    
    if (!leg1 || !leg2) return null;
    
    // Leg 1: Team1 (Home) vs Team2 (Away)
    // Leg 2: Team2 (Home) vs Team1 (Away)
    // Team1 aggregate = leg1 home goals + leg2 away goals
    // Team2 aggregate = leg1 away goals + leg2 home goals
    const team1Aggregate = leg1.team1Score + leg2.team1Score;
    const team2Aggregate = leg1.team2Score + leg2.team2Score;
    
    if (team1Aggregate > team2Aggregate) return team1Id;
    if (team2Aggregate > team1Aggregate) return team2Id;
    
    // If aggregate is tied, check away goals
    // Team1 away goals = leg2.team1Score (they're away in leg2)
    // Team2 away goals = leg1.team2Score (they're away in leg1)
    const team1AwayGoals = leg2.team1Score;
    const team2AwayGoals = leg1.team2Score;
    
    if (team1AwayGoals > team2AwayGoals) return team1Id;
    if (team2AwayGoals > team1AwayGoals) return team2Id;
    
    // Still tied - return null (would need penalties or other tiebreaker)
    return null;
  };

  // Get group stage match winner
  const getGroupMatchWinner = (groupNumber, matchNumber) => {
    const key = `group-${groupNumber}-match-${matchNumber}`;
    return matchResults[key] || null;
  };

  // Calculate group standings
  const calculateGroupStandings = (groupTeams, groupNumber) => {
    const standings = groupTeams.map(team => ({
      team,
      wins: 0,
      losses: 0,
      points: 0
    }));

    // Calculate matches: 6 matches per group (round-robin)
    // Match 1: Team 1 vs Team 2
    // Match 2: Team 1 vs Team 3
    // Match 3: Team 1 vs Team 4
    // Match 4: Team 2 vs Team 3
    // Match 5: Team 2 vs Team 4
    // Match 6: Team 3 vs Team 4
    const matchPairs = [
      [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
    ];

    matchPairs.forEach(([team1Idx, team2Idx], matchIdx) => {
      const winnerId = getGroupMatchWinner(groupNumber, matchIdx + 1);
      if (winnerId) {
        if (standings[team1Idx].team?.id === winnerId) {
          standings[team1Idx].wins++;
          standings[team1Idx].points += 3;
          standings[team2Idx].losses++;
        } else if (standings[team2Idx].team?.id === winnerId) {
          standings[team2Idx].wins++;
          standings[team2Idx].points += 3;
          standings[team1Idx].losses++;
        }
      }
    });

    // Sort by points (desc), then wins (desc)
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.wins - a.wins;
    });

    return standings;
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
    const groups = [];
    const maxTeams = 12;
    const teamCount = Math.min(sortedTeams.length, maxTeams);
    const teamsToUse = sortedTeams.slice(0, teamCount);

    // GROUP STAGE: 3 groups, 4 teams each
    const numGroups = 3;
    const teamsPerGroup = 4;
    
    for (let groupNum = 1; groupNum <= numGroups; groupNum++) {
      const groupTeams = [];
      for (let i = 0; i < teamsPerGroup; i++) {
        const teamIndex = (groupNum - 1) * teamsPerGroup + i;
        if (teamIndex < teamsToUse.length) {
          const team1Key = `group-${groupNum}-team-${i + 1}`;
          const team = bracketPositions[team1Key] 
            ? findTeamById(bracketPositions[team1Key], teamsToUse)
            : teamsToUse[teamIndex] || null;
          groupTeams.push(team);
        }
      }

      // Group matches (round-robin: 6 matches per group)
      // Match 1: Team 1 vs Team 2
      // Match 2: Team 1 vs Team 3
      // Match 3: Team 1 vs Team 4
      // Match 4: Team 2 vs Team 3
      // Match 5: Team 2 vs Team 4
      // Match 6: Team 3 vs Team 4
      const groupMatches = [];
      const matchPairs = [
        [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
      ];

      matchPairs.forEach(([team1Idx, team2Idx], matchIdx) => {
        const matchNum = matchIdx + 1;
        const team1 = groupTeams[team1Idx] || null;
        const team2 = groupTeams[team2Idx] || null;
        const winnerId = getGroupMatchWinner(groupNum, matchNum);

        groupMatches.push({
          matchNumber: matchNum,
          team1: team1,
          team2: team2,
          round: 0,
          groupNumber: groupNum,
          roundName: `Group ${String.fromCharCode(64 + groupNum)}`,
          winnerId: winnerId
        });
      });

      groups.push({
        groupNumber: groupNum,
        groupName: `Group ${String.fromCharCode(64 + groupNum)}`,
        teams: groupTeams,
        matches: groupMatches,
        standings: calculateGroupStandings(groupTeams, groupNum)
      });
    }

    // Get top 2 from each group for knockout stage
    // Structure: [Group A 1st, Group A 2nd, Group B 1st, Group B 2nd, Group C 1st, Group C 2nd]
    const getQualifiedTeams = () => {
      const qualified = [];
      groups.forEach(group => {
        const top2 = group.standings.slice(0, 2).map(s => s.team).filter(Boolean);
        qualified.push(...top2);
      });
      return qualified;
    };

    const qualifiedTeams = getQualifiedTeams();

    // QUARTERFINALS: 6 teams (2 from each group) - TWO-LEGGED
    // Qualified teams array: [A1, A2, B1, B2, C1, C2]
    // Top 2 teams (A1 and B1) get byes to semifinals
    // Other 4 teams play quarterfinals (2 matches)
    const quarterfinals = [];
    // Pairing: 
    // QF1: Group A 2nd (idx 1) vs Group B 2nd (idx 3)
    // QF2: Group C 1st (idx 4) vs Group C 2nd (idx 5)
    const quarterfinalPairings = [
      [1, 3], // Group A 2nd vs Group B 2nd
      [4, 5]  // Group C 1st vs Group C 2nd
    ];

    quarterfinalPairings.forEach(([team1Idx, team2Idx], matchIdx) => {
      const matchNum = matchIdx + 1;
      const team1 = qualifiedTeams[team1Idx] || null;
      const team2 = qualifiedTeams[team2Idx] || null;
      const winnerId = team1 && team2 ? getKnockoutAggregateWinner(1, matchNum, team1.id, team2.id) : null;

      quarterfinals.push({
        matchNumber: matchNum,
        team1: team1,
        team2: team2,
        round: 1,
        roundName: 'Quarterfinals',
        winnerId: winnerId,
        isTwoLegged: true
      });
    });
    rounds.push(quarterfinals);

    // SEMIFINALS: 4 teams - TWO-LEGGED
    // SF1: Group A 1st (bye) vs QF1 winner
    // SF2: Group B 1st (bye) vs QF2 winner
    const semifinals = [];
    const groupA1st = qualifiedTeams[0] || null; // Group A 1st (bye)
    const groupB1st = qualifiedTeams[2] || null; // Group B 1st (bye)
    const qf1WinnerId = quarterfinals[0]?.winnerId || null;
    const qf2WinnerId = quarterfinals[1]?.winnerId || null;
    
    // Semifinal 1: Group A 1st vs QF1 winner
    const semi1Team1 = groupA1st;
    const semi1Team2 = qf1WinnerId ? findTeamById(qf1WinnerId, teamsToUse) : null;
    const semi1WinnerId = semi1Team1 && semi1Team2 ? getKnockoutAggregateWinner(2, 1, semi1Team1.id, semi1Team2.id) : null;
    
    semifinals.push({
      matchNumber: 1,
      team1: semi1Team1,
      team2: semi1Team2,
      round: 2,
      roundName: 'Semifinals',
      winnerFrom: 'Group A 1st vs QF1 Winner',
      winnerId: semi1WinnerId,
      isTwoLegged: true
    });

    // Semifinal 2: Group B 1st vs QF2 winner
    const semi2Team1 = groupB1st;
    const semi2Team2 = qf2WinnerId ? findTeamById(qf2WinnerId, teamsToUse) : null;
    const semi2WinnerId = semi2Team1 && semi2Team2 ? getKnockoutAggregateWinner(2, 2, semi2Team1.id, semi2Team2.id) : null;
    
    semifinals.push({
      matchNumber: 2,
      team1: semi2Team1,
      team2: semi2Team2,
      round: 2,
      roundName: 'Semifinals',
      winnerFrom: 'Group B 1st vs QF2 Winner',
      winnerId: semi2WinnerId,
      isTwoLegged: true
    });
    
    rounds.push(semifinals);

    // THIRD PLACE: Losers of semifinals - SINGLE-LEGGED
    const semi1Winner = semifinals[0]?.winnerId || null;
    const semi2Winner = semifinals[1]?.winnerId || null;
    const semi1Loser = semifinals[0]?.team1?.id === semi1Winner 
      ? semifinals[0].team2 
      : semifinals[0].team1;
    const semi2Loser = semifinals[1]?.team1?.id === semi2Winner 
      ? semifinals[1].team2 
      : semifinals[1].team1;
    const thirdPlaceWinner = getMatchWinner(3, 1);

    rounds.push([{
      matchNumber: 1,
      team1: semi1Loser,
      team2: semi2Loser,
      round: 3,
      roundName: 'Third Place',
      winnerId: thirdPlaceWinner,
      isTwoLegged: false
    }]);

    // FINALS: Winners of semifinals - SINGLE-LEGGED
    const finalTeam1 = semi1Winner ? findTeamById(semi1Winner, teamsToUse) : null;
    const finalTeam2 = semi2Winner ? findTeamById(semi2Winner, teamsToUse) : null;
    const finalWinner = getMatchWinner(4, 1);

    rounds.push([{
      matchNumber: 1,
      team1: finalTeam1,
      team2: finalTeam2,
      round: 4,
      roundName: 'Finals',
      winnerId: finalWinner,
      isTwoLegged: false
    }]);

    return { groups, rounds, teamCount, totalSlots: maxTeams };
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
      let positionKey;
      
      // Handle group stage positioning
      if (overData.match.groupNumber !== undefined) {
        // Find which team slot in the group this is
        const groupNum = overData.match.groupNumber;
        // Determine which team position in group based on match and slot
        // This is complex - for now, use match-slot based key
        positionKey = `group-${groupNum}-match-${overData.match.matchNumber}-${overData.slotPosition}`;
      } else {
        // Knockout stage positioning
        positionKey = `round-${overData.match.round}-match-${overData.match.matchNumber}-${overData.slotPosition}`;
      }
      
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
              <div className="stat-value">{12 - totalCount}</div>
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
                <a href="/admin/news" className="btn btn-warning">
                  <i className="fas fa-newspaper"></i> Manage News
                </a>
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
              {/* GROUP STAGE */}
              {bracket.groups && bracket.groups.length > 0 && (
                <div className="group-stage-section">
                  <h2 className="section-title">Group Stage</h2>
                  <div className="groups-wrapper">
                    {bracket.groups.map((group) => (
                      <div key={group.groupNumber} className="group-container">
                        <h3 className="group-title">{group.groupName}</h3>
                        
                        {/* Group Standings */}
                        <div className="group-standings">
                          <h4>Standings</h4>
                          <table className="standings-table">
                            <thead>
                              <tr>
                                <th>Pos</th>
                                <th>Team</th>
                                <th>W</th>
                                <th>L</th>
                                <th>Pts</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.standings.map((standing, idx) => (
                                <tr 
                                  key={idx} 
                                  className={idx < 2 ? 'qualified' : ''}
                                >
                                  <td>{idx + 1}</td>
                                  <td>
                                    <strong>{standing.team?.team_name || 'TBD'}</strong>
                                  </td>
                                  <td>{standing.wins}</td>
                                  <td>{standing.losses}</td>
                                  <td><strong>{standing.points}</strong></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Group Matches */}
                        <div className="group-matches">
                          <h4>Matches</h4>
                          {group.matches.map((match, matchIndex) => (
                            <div key={matchIndex} className="bracket-match">
                              <div className="match-header">
                                <span className="match-number">Match {match.matchNumber}</span>
                              </div>
                              <div className="match-teams">
                                <DroppableMatchSlot match={match} slotPosition="team1">
                                  <DraggableTeamSlot
                                    team={match.team1}
                                    match={match}
                                    slotPosition="team1"
                                    isWinner={match.winnerId === match.team1?.id}
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
                              {match.team1 && match.team2 && !match.winnerId && (
                                <div className="match-actions">
                                  <button
                                    className="btn-winner btn-winner-team1"
                                    onClick={() => saveMatchResult(match.round, match.matchNumber, match.team1.id, match.groupNumber)}
                                    disabled={!match.team1}
                                  >
                                    <i className="fas fa-check"></i> {match.team1.team_name} Wins
                                  </button>
                                  <button
                                    className="btn-winner btn-winner-team2"
                                    onClick={() => saveMatchResult(match.round, match.matchNumber, match.team2.id, match.groupNumber)}
                                    disabled={!match.team2}
                                  >
                                    <i className="fas fa-check"></i> {match.team2.team_name} Wins
                                  </button>
                                </div>
                              )}
                              {match.winnerId && (
                                <div className="match-actions">
                                  <button
                                    className="btn-undo"
                                    onClick={() => {
                                      const key = `group-${match.groupNumber}-match-${match.matchNumber}`;
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
                </div>
              )}

              {/* KNOCKOUT STAGE */}
              <div className="knockout-stage-section">
                <h2 className="section-title">Knockout Stage</h2>
                <div className="bracket-wrapper">
                  {bracket.rounds.map((round, roundIndex) => (
                    <div key={roundIndex} className="bracket-round">
                      <h3 className="round-title">{round[0]?.roundName || `Round ${roundIndex + 1}`}</h3>
                      <div className="round-matches">
                        {round.map((match, matchIndex) => {
                          // Check if this is a two-legged match (only Quarterfinals and Semifinals)
                          if (match.isTwoLegged && match.team1 && match.team2) {
                            return (
                              <TwoLeggedMatch
                                key={matchIndex}
                                match={match}
                                getKnockoutLegResult={getKnockoutLegResult}
                                saveKnockoutLegResult={saveKnockoutLegResult}
                                matchResults={matchResults}
                                setMatchResults={setMatchResults}
                              />
                            );
                          }
                          
                          // Single-legged match (Third Place and Finals)
                          return (
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
                              {match.team1 && match.team2 && !match.winnerId && (
                                <div className="match-actions">
                                  <button
                                    className="btn-winner btn-winner-team1"
                                    onClick={() => saveMatchResult(match.round, match.matchNumber, match.team1.id)}
                                    disabled={!match.team1}
                                  >
                                    <i className="fas fa-check"></i> {match.team1.team_name} Wins
                                  </button>
                                  <button
                                    className="btn-winner btn-winner-team2"
                                    onClick={() => saveMatchResult(match.round, match.matchNumber, match.team2.id)}
                                    disabled={!match.team2}
                                  >
                                    <i className="fas fa-check"></i> {match.team2.team_name} Wins
                                  </button>
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
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
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

