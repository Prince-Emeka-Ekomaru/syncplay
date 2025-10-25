import React, { useState, useEffect } from 'react';
import { getAllRegistrations, getRegistrationCount } from '../supabaseClient';
import './AdminRegistrations.css';

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchRegistrations();
  }, []);

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
            <p className="subtitle">2v2 EA Sports FC 26 - November 30, 2025</p>
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

        {/* Controls */}
        <div className="admin-controls">
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
        </div>

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
      </div>
    </div>
  );
};

export default AdminRegistrations;

