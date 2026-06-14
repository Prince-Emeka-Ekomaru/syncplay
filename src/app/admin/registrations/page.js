"use client";
import React, { useState, useEffect } from 'react';
import { getAllRegistrations, getRegistrationCount, supabase } from '../../../supabaseClient';
import { getEntryFee, setEntryFee, getEntryFeeInNaira, formatPrice, clearPriceCache } from '../../../utils/priceManager';
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: team ? `team-${team.id}` : `empty-${match.round}-${match.matchNumber}-${slotPosition}`,
    data: { team, match, slotPosition },
    disabled: !team
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
      
      {team1Aggregate !== null && team2Aggregate !== null && (
        <div className="aggregate-score">
          <strong>Aggregate: {match.team1.team_name} {team1Aggregate} - {team2Aggregate} {match.team2.team_name}</strong>
          {team1Aggregate === team2Aggregate && (
            <span className="tie-note"> (Tied - Away goals rule applies)</span>
          )}
        </div>
      )}
      
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
  const [activeTab, setActiveTab] = useState('registrations');
  const [matchResults, setMatchResults] = useState({});
  const [bracketPositions, setBracketPositions] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [entryFee, setEntryFeeState] = useState(20000);
  const [priceEditMode, setPriceEditMode] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [editingRegistration, setEditingRegistration] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('All');

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
    getEntryFee().then(price => {
      setEntryFeeState(price / 100);
    });
  }, []);

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

  const saveBracketPositions = (positions) => {
    setBracketPositions(positions);
    try {
      localStorage.setItem('tournament_bracket_positions', JSON.stringify(positions));
    } catch (error) {
      console.error('Error saving bracket positions:', error);
    }
  };

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

  const getMatchWinner = (round, matchNumber, groupNumber = null) => {
    if (groupNumber !== null) {
      const key = `group-${groupNumber}-match-${matchNumber}`;
      return matchResults[key] || null;
    }
    const key = `round-${round}-match-${matchNumber}`;
    return matchResults[key] || null;
  };

  const getKnockoutLegResult = (round, matchNumber, leg) => {
    const key = `round-${round}-match-${matchNumber}-leg-${leg}`;
    return matchResults[key] || null;
  };

  const getKnockoutAggregateWinner = (round, matchNumber, team1Id, team2Id) => {
    const leg1 = getKnockoutLegResult(round, matchNumber, 1);
    const leg2 = getKnockoutLegResult(round, matchNumber, 2);
    
    if (!leg1 || !leg2) return null;
    
    const team1Aggregate = leg1.team1Score + leg2.team1Score;
    const team2Aggregate = leg1.team2Score + leg2.team2Score;
    
    if (team1Aggregate > team2Aggregate) return team1Id;
    if (team2Aggregate > team1Aggregate) return team2Id;
    
    const team1AwayGoals = leg2.team1Score;
    const team2AwayGoals = leg1.team2Score;
    
    if (team1AwayGoals > team2AwayGoals) return team1Id;
    if (team2AwayGoals > team1AwayGoals) return team2Id;
    
    return null;
  };

  const getGroupMatchWinner = (groupNumber, matchNumber) => {
    const key = `group-${groupNumber}-match-${matchNumber}`;
    return matchResults[key] || null;
  };

  const calculateGroupStandings = (groupTeams, groupNumber) => {
    const standings = groupTeams.map(team => ({
      team,
      wins: 0,
      losses: 0,
      points: 0
    }));

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

  // Mutation - Update registration row
  const handleUpdateRegistration = async (e) => {
    e.preventDefault();
    if (!editingRegistration) return;
    
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          team_name: editingRegistration.team_name,
          player1_name: editingRegistration.player1_name,
          player1_email: editingRegistration.player1_email,
          player1_phone: editingRegistration.player1_phone,
          player1_gamer_tag: editingRegistration.player1_gamer_tag,
          player1_platform: editingRegistration.player1_platform,
          player1_tournament_id: editingRegistration.player1_tournament_id,
          player2_name: editingRegistration.player2_name,
          player2_email: editingRegistration.player2_email,
          player2_phone: editingRegistration.player2_phone,
          player2_gamer_tag: editingRegistration.player2_gamer_tag,
          player2_platform: editingRegistration.player2_platform,
          player2_tournament_id: editingRegistration.player2_tournament_id,
          payment_status: editingRegistration.payment_status,
          status: editingRegistration.status,
          admin_notes: editingRegistration.admin_notes
        })
        .eq('id', editingRegistration.id);
        
      if (error) throw error;
      
      alert('Registration updated successfully!');
      setIsEditModalOpen(false);
      setEditingRegistration(null);
      await fetchRegistrations();
    } catch (error) {
      console.error('Error updating registration:', error);
      alert('Failed to update registration: ' + error.message);
    }
  };

  // Mutation - Delete registration row
  const handleDeleteRegistration = async (id, teamName) => {
    const confirmation = window.confirm(`Are you absolutely sure you want to delete registration for team "${teamName}"? This action CANNOT be undone.`);
    if (!confirmation) return;

    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      alert('Registration deleted successfully.');
      await fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration: ' + error.message);
    }
  };

  // Mutation - Toggle Payment status
  const handleTogglePayment = async (reg) => {
    const nextStatus = reg.payment_status === 'completed' ? 'pending' : 'completed';
    
    // Auto-generate ticket codes if marking as completed and codes are empty
    let p1Id = reg.player1_tournament_id;
    let p2Id = reg.player2_tournament_id;
    
    if (nextStatus === 'completed') {
      const { count, error: countErr } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'completed')
        .eq('tournament_id', reg.tournament_id);
      
      if (!countErr) {
        const total = (count || 0) * 2;
        if (!p1Id) {
          const num1 = String(total + 1).padStart(3, '0');
          p1Id = `SP-2025-${num1}`;
        }
        if (!p2Id) {
          const num2 = String(total + 2).padStart(3, '0');
          p2Id = `SP-2025-${num2}`;
        }
      }
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ 
          payment_status: nextStatus,
          player1_tournament_id: p1Id,
          player2_tournament_id: p2Id
        })
        .eq('id', reg.id);
        
      if (error) throw error;
      
      await fetchRegistrations();
    } catch (error) {
      console.error('Error toggling payment status:', error);
      alert('Failed to toggle status: ' + error.message);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.player1_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.player2_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.player1_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesPayment = paymentFilter === 'All' || 
      reg.payment_status?.toLowerCase() === paymentFilter.toLowerCase();
      
    return matchesSearch && matchesPayment;
  });

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

  const findTeamById = (teamId, teams) => {
    return teams.find(team => team.id === teamId) || null;
  };

  const generateBracket = () => {
    const sortedTeams = [...registrations]
      .filter(reg => (reg.payment_status === 'completed' || !reg.payment_status) && (reg.status === 'active' || !reg.status))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const rounds = [];
    const groups = [];
    const maxTeams = 12;
    const teamCount = Math.min(sortedTeams.length, maxTeams);
    const teamsToUse = sortedTeams.slice(0, teamCount);

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

    const getQualifiedTeams = () => {
      const qualified = [];
      groups.forEach(group => {
        const top2 = group.standings.slice(0, 2).map(s => s.team).filter(Boolean);
        qualified.push(...top2);
      });
      return qualified;
    };

    const qualifiedTeams = getQualifiedTeams();

    const quarterfinals = [];
    const quarterfinalPairings = [
      [1, 3],
      [4, 5]
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

    const semifinals = [];
    const groupA1st = qualifiedTeams[0] || null;
    const groupB1st = qualifiedTeams[2] || null;
    const qf1WinnerId = quarterfinals[0]?.winnerId || null;
    const qf2WinnerId = quarterfinals[1]?.winnerId || null;
    
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.team && overData?.match && overData?.slotPosition) {
      const teamId = activeData.team.id;
      let positionKey;
      
      if (overData.match.groupNumber !== undefined) {
        const groupNum = overData.match.groupNumber;
        positionKey = `group-${groupNum}-match-${overData.match.matchNumber}-${overData.slotPosition}`;
      } else {
        positionKey = `round-${overData.match.round}-match-${overData.match.matchNumber}-${overData.slotPosition}`;
      }
      
      const newPositions = { ...bracketPositions };
      Object.keys(newPositions).forEach(key => {
        if (newPositions[key] === teamId) {
          delete newPositions[key];
        }
      });
      
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
    <div className="admin-page" style={{ paddingTop: '90px' }}>
      <div className="admin-container">
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
                            clearPriceCache();
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

        {activeTab === 'registrations' ? (
          <>
            <div className="results-count">
              Showing {sortedRegistrations.length} of {totalCount} registrations
            </div>

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
              {bracket.groups && bracket.groups.length > 0 && (
                <div className="group-stage-section">
                  <h2 className="section-title">Group Stage</h2>
                  <div className="groups-wrapper">
                    {bracket.groups.map((group) => (
                      <div key={group.groupNumber} className="group-container">
                        <h3 className="group-title">{group.groupName}</h3>
                        
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

              <div className="knockout-stage-section">
                <h2 className="section-title">Knockout Stage</h2>
                <div className="bracket-wrapper">
                  {bracket.rounds.map((round, roundIndex) => (
                    <div key={roundIndex} className="bracket-round">
                      <h3 className="round-title">{round[0]?.roundName || `Round ${roundIndex + 1}`}</h3>
                      <div className="round-matches">
                        {round.map((match, matchIndex) => {
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
