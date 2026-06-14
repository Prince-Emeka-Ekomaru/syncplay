"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../supabaseClient';
import { getPlayersFromRegistrations } from '../../../utils/playerStats';
import './WeeklyStats.css';

export default function AdminWeeklyStatsPage() {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual', 'ocr'
  const [playersList, setPlayersList] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });

  // Manual Form State
  const [selectedTag, setSelectedTag] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [isCustomPlayer, setIsCustomPlayer] = useState(false);
  const [attack, setAttack] = useState(75);
  const [defense, setDefense] = useState(75);
  const [passing, setPassing] = useState(75);
  const [consistency, setConsistency] = useState(75);
  const [clutch, setClutch] = useState(75);
  const [isEditing, setIsEditing] = useState(false);

  // Standings Stats State
  const [mp, setMp] = useState(0);
  const [wins, setWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [losses, setLosses] = useState(0);
  const [goals, setGoals] = useState(0);
  const [gd, setGd] = useState(0);
  const [points, setPoints] = useState(0);



  // OCR State
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrPreview, setOcrPreview] = useState([]);
  const [ocrRawText, setOcrRawText] = useState('');
  const ocrInputRef = useRef(null);

  // Helper to wrap promise with a timeout
  const withTimeout = (promise, timeoutMs = 10000, errorMsg = 'Request timed out') => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), timeoutMs))
    ]);
  };

  // Fetch all registrations and existing ratings
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let registrationsData = [];
      let ratingsData = [];

      if (supabase) {
        // Fetch all completed registrations (including dynamically registered players)
        const { data: regData, error: regError } = await withTimeout(
          supabase
            .from('registrations')
            .select('*')
            .eq('payment_status', 'completed'),
          10000,
          'Failed to connect to registrations table. Check your network or Supabase settings.'
        );
        
        if (!regError && regData) {
          registrationsData = regData;
        }

        // Fetch existing database ratings
        const { data: ratData, error: ratError } = await withTimeout(
          supabase
            .from('player_ratings')
            .select('*')
            .order('updated_at', { ascending: false }),
          10000,
          'Failed to connect to player_ratings table. Check your network or Supabase settings.'
        );
        
        if (!ratError && ratData) {
          ratingsData = ratData;
          setRatings(ratData);
        }
      }

      // Compile unique list of players in the system
      const allPlayers = getPlayersFromRegistrations(registrationsData);
      setPlayersList(allPlayers);
    } catch (err) {
      console.error('Error fetching admin stats data:', err);
      setError(`Failed to load player lists and ratings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save manual entry or edit
  const handleSaveManual = async (e) => {
    e.preventDefault();
    const tag = isCustomPlayer ? customTag.trim() : selectedTag;
    
    if (!tag) {
      setError('Please select or input a player gamer tag.');
      return;
    }

    if (!supabase) {
      setError('Database client is not connected.');
      return;
    }

    setManualLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        gamer_tag: tag,
        attack,
        defense,
        passing,
        consistency,
        clutch,
        mp,
        wins,
        draws,
        losses,
        goals,
        gd,
        points,
        updated_at: new Date().toISOString()
      };

      const { error: dbError } = await withTimeout(
        supabase
          .from('player_ratings')
          .upsert(payload, { onConflict: 'gamer_tag' }),
        10000,
        'Database update timed out. Please try again.'
      );

      if (dbError) throw dbError;

      setSuccess(`Successfully updated ratings for player: "${tag}"`);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving player rating:', err);
      setError(`Database Error: ${err.message}`);
    } finally {
      setManualLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTag('');
    setCustomTag('');
    setIsCustomPlayer(false);
    setAttack(75);
    setDefense(75);
    setPassing(75);
    setConsistency(75);
    setClutch(75);
    setMp(0);
    setWins(0);
    setDraws(0);
    setLosses(0);
    setGoals(0);
    setGd(0);
    setPoints(0);
    setIsEditing(false);
  };

  // Edit existing database rating row
  const handleEditClick = (row) => {
    setSelectedTag(row.gamer_tag);
    setIsCustomPlayer(false);
    setAttack(row.attack);
    setDefense(row.defense);
    setPassing(row.passing);
    setConsistency(row.consistency);
    setClutch(row.clutch);
    setMp(row.mp || 0);
    setWins(row.wins || 0);
    setDraws(row.draws || 0);
    setLosses(row.losses || 0);
    setGoals(row.goals || 0);
    setGd(row.gd || 0);
    setPoints(row.points || 0);
    setIsEditing(true);
    setActiveTab('manual');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete existing database rating row
  const handleDeleteClick = async (gamerTag) => {
    if (!confirm(`Are you sure you want to delete custom ratings for "${gamerTag}"?`)) {
      return;
    }

    if (!supabase) {
      setError('Database client is not connected.');
      return;
    }

    setManualLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: dbError } = await withTimeout(
        supabase
          .from('player_ratings')
          .delete()
          .eq('gamer_tag', gamerTag),
        10000,
        'Database delete timed out. Please try again.'
      );

      if (dbError) throw dbError;

      setSuccess(`Deleted custom ratings for "${gamerTag}"`);
      fetchData();
    } catch (err) {
      console.error('Error deleting player rating:', err);
      setError(`Failed to delete rating: ${err.message}`);
    } finally {
      setManualLoading(false);
    }
  };



  // OCR Screenshot scanner
  const handleOcrFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setOcrPreview([]);
    setOcrProgress(0);
    setOcrStatus('Initializing OCR engine...');

    try {
      const { default: Tesseract } = await import('tesseract.js');
      Tesseract.recognize(
        file,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrStatus(`Recognizing text: ${Math.round(m.progress * 100)}%`);
              setOcrProgress(m.progress);
            } else {
              setOcrStatus(m.status);
            }
          }
        }
      ).then(({ data: { text } }) => {
        setOcrStatus('Text extracted! Parsing lines...');
        setOcrRawText(text);
        
        // Parse the raw text lines
        const lines = text.split('\n');
        const parsed = [];

        const charMap = {
          's': '5', 'o': '0', 'i': '1', 'l': '1', 'b': '6', 'u': '4', 'z': '2', 'g': '9', 't': '7',
          'w': '0', // w/W -> 0 (e.g. Ww -> 10)
          'a': '1', // a/A -> 1 (e.g. a0 -> 10, aa -> 11, a -> 1)
          'c': '0', // © -> 0
          'e': '3',
          'h': '4',
          'j': '1',
          'k': '5',
          'm': '7',
          'n': '1',
          'p': '9',
          'q': '9',
          'x': '8',
          'y': '7',
          'v': '5'
        };

        const parseTokenToNumber = (token) => {
          if (!token) return 0;
          let clean = token.trim().replace(/[+]/g, '');
          let parsed = parseInt(clean);
          if (!isNaN(parsed)) return parsed;

          let substituted = "";
          for (let char of clean) {
            if (/\d/.test(char)) {
              substituted += char;
            } else if (char === '-') {
              substituted += char;
            } else {
              const lower = char.toLowerCase();
              const mapped = charMap[lower];
              if (mapped) {
                substituted += mapped;
              }
            }
          }
          parsed = parseInt(substituted);
          return isNaN(parsed) ? 0 : parsed;
        };

        const KNOWN_MAP = {
          'faruk': 'Faruk',
          'mitch': 'Mitch',
          'guru': 'Guru',
          'king nonex': 'King Nonex',
          'killerfreak': 'Killerfreak',
          'baji': 'Baji-jr',
          'baji jnr': 'Baji-jr',
          'bajiinr': 'Baji-jr',
          'tactical': 'Tactical',
          'kaykay': 'Kaykay',
          'adefola': 'Fola',
          'fola': 'Fola',
          'mr oga': 'Mr Oga',
          'anife': 'Anife',
          'dadaboi': 'Dadaboi',
          'wolevation': 'NGNxCAD',
          'ngnxcad': 'NGNxCAD'
        };

        lines.forEach(line => {
          const cleanLine = line.trim().replace(/\s+/g, ' ');
          if (!cleanLine) return;

          // 1. First check if the line contains a known player name
          let matchedTag = null;
          let matchedKey = null;

          for (let key of Object.keys(KNOWN_MAP)) {
            if (cleanLine.toLowerCase().includes(key)) {
              matchedTag = KNOWN_MAP[key];
              matchedKey = key;
              break;
            }
          }

          if (matchedTag && matchedKey) {
            // Found a known player! Extract stats after their name
            const nameIdx = cleanLine.toLowerCase().indexOf(matchedKey);
            const statsPart = cleanLine.substring(nameIdx + matchedKey.length).trim();
            const tokens = statsPart.split(' ').filter(Boolean);
            const vals = tokens.map(t => parseTokenToNumber(t));

            if (vals.length >= 5) {
              const mp = (vals[0] < 10) ? 12 : vals[0];
              const w = Math.min(mp, vals[1]);
              const d = Math.min(mp - w, vals[2]);
              const l = mp - w - d;
              
              // Goals: if 5th value is between 10 and 120, use it. Otherwise estimate
              let g = vals[4];
              if (isNaN(g) || g < 10 || g > 120) {
                g = w * 5 + d * 2 + 10;
              }

              // GD: if 6th value is present and absolute value is under 60, use it. Otherwise estimate
              let gd = vals[5];
              if (isNaN(gd) || Math.abs(gd) > 60) {
                gd = (w - l) * 3;
              }

              const pts = w * 3 + d;

              // Calculate ratings using standings performance metrics
              // Attack: goals per match
              const attackVal = Math.min(99, Math.max(50, Math.round(50 + (g / mp) * 7)));
              // Defense: GD and losses
              const defenseVal = Math.min(99, Math.max(50, Math.round(70 + (gd / mp) * 4 - l * 1.5)));
              // Passing: wins and draws
              const passingVal = Math.min(99, Math.max(50, Math.round(60 + (w / mp) * 25 + (d / mp) * 12)));
              // Consistency: win/draw rate
              const consistencyVal = Math.min(99, Math.max(50, Math.round(50 + ((w + d * 0.5) / mp) * 45)));
              // Clutch: points rate
              const clutchVal = Math.min(99, Math.max(50, Math.round((pts / (mp * 3)) * 45)));

              parsed.push({
                gamer_tag: matchedTag,
                attack: attackVal,
                defense: defenseVal,
                passing: passingVal,
                consistency: consistencyVal,
                clutch: clutchVal,
                mp: mp,
                wins: w,
                draws: d,
                losses: l,
                goals: g,
                gd: gd,
                points: pts
              });
            }
          }
          // 2. Fallback to generic number-of-tokens matching if no known name was found
          else {
            const numbers = cleanLine.match(/[-+]?\b\d+\b/g);
            if (numbers) {
              // Case A: Standings table row (7 or 8 numbers: optional POS, then MP, W, D, L, G, GD, PTS)
              if (numbers.length === 7 || numbers.length === 8) {
                const offset = numbers.length === 8 ? 1 : 0;
                const pos = offset === 1 ? parseInt(numbers[0]) : 0;
                const mp = parseInt(numbers[offset]);
                const w = parseInt(numbers[offset + 1]);
                const d = parseInt(numbers[offset + 2]);
                const l = parseInt(numbers[offset + 3]);
                const g = parseInt(numbers[offset + 4]);
                const gd = parseInt(numbers[offset + 5]);
                const pts = parseInt(numbers[offset + 6]);

                const startWord = offset === 1 ? numbers[0] : '';
                const endWord = numbers[offset]; // MP

                let startIndex = 0;
                if (startWord) {
                  const posIdx = cleanLine.indexOf(startWord);
                  if (posIdx !== -1) {
                    startIndex = posIdx + startWord.length;
                  }
                }
                const endIndex = cleanLine.indexOf(endWord, startIndex);
                let gamerTag = '';
                if (endIndex !== -1) {
                  gamerTag = cleanLine.substring(startIndex, endIndex).trim();
                } else {
                  gamerTag = cleanLine.substring(startIndex).trim();
                }
                gamerTag = gamerTag.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, ' ').trim();

                if (gamerTag && isNaN(parseInt(gamerTag))) {
                  const attackVal = Math.min(99, Math.max(50, Math.round(50 + (g / Math.max(1, mp)) * 7)));
                  const defenseVal = Math.min(99, Math.max(50, Math.round(70 + (gd / Math.max(1, mp)) * 4 - l * 1.5)));
                  const passingVal = Math.min(99, Math.max(50, Math.round(60 + (w / Math.max(1, mp)) * 25 + (d / Math.max(1, mp)) * 12)));
                  const consistencyVal = Math.min(99, Math.max(50, Math.round(50 + ((w + d * 0.5) / Math.max(1, mp)) * 45)));
                  const clutchVal = Math.min(99, Math.max(50, Math.round((pts / Math.max(3, mp * 3)) * 45)));

                  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const cleanGamerTag = normalize(gamerTag);

                  const matchedPlayer = playersList.find(p => {
                    const cleanP = normalize(p.gamerTag);
                    return cleanP === cleanGamerTag || cleanP.includes(cleanGamerTag) || cleanGamerTag.includes(cleanP);
                  });

                  if (matchedPlayer) {
                    gamerTag = matchedPlayer.gamerTag;
                  }

                  parsed.push({
                    gamer_tag: gamerTag,
                    attack: attackVal,
                    defense: defenseVal,
                    passing: passingVal,
                    consistency: consistencyVal,
                    clutch: clutchVal,
                    mp: mp,
                    wins: w,
                    draws: d,
                    losses: l,
                    goals: g,
                    gd: gd,
                    points: pts
                  });
                }
              }
              // Case B: Standard ratings row (usually contains 5 ratings: Attack, Defense, Passing, Consistency, Clutch)
              else if (numbers.length === 5) {
                const attackVal = Math.min(100, Math.max(0, parseInt(numbers[0]) || 50));
                const defenseVal = Math.min(100, Math.max(0, parseInt(numbers[1]) || 50));
                const passingVal = Math.min(100, Math.max(0, parseInt(numbers[2]) || 50));
                const consistencyVal = Math.min(100, Math.max(0, parseInt(numbers[3]) || 50));
                const clutchVal = Math.min(100, Math.max(0, parseInt(numbers[4]) || 50));

                const firstNum = numbers[0];
                const endIndex = cleanLine.indexOf(firstNum);
                let gamerTag = '';
                if (endIndex !== -1) {
                  gamerTag = cleanLine.substring(0, endIndex).trim();
                } else {
                  gamerTag = cleanLine.trim();
                }
                gamerTag = gamerTag.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, ' ').trim();

                if (gamerTag && isNaN(parseInt(gamerTag))) {
                  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
                  const cleanGamerTag = normalize(gamerTag);

                  const matchedPlayer = playersList.find(p => {
                    const cleanP = normalize(p.gamerTag);
                    return cleanP === cleanGamerTag || cleanP.includes(cleanGamerTag) || cleanGamerTag.includes(cleanP);
                  });

                  if (matchedPlayer) {
                    gamerTag = matchedPlayer.gamerTag;
                  }

                  parsed.push({
                    gamer_tag: gamerTag,
                    attack: attackVal,
                    defense: defenseVal,
                    passing: passingVal,
                    consistency: consistencyVal,
                    clutch: clutchVal,
                    mp: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goals: 0,
                    gd: 0,
                    points: 0
                  });
                }
              }
            }
          }
        });

        if (parsed.length === 0) {
          setError('OCR scan finished, but no valid rating patterns (e.g. GamerTag followed by 5 numbers) or standings rows (e.g. POS GamerTag MP W D L G GD PTS) were recognized. Try manual input.');
        } else {
          setOcrPreview(parsed);
          setSuccess(`OCR Scan complete. Extracted ${parsed.length} player performance ratings.`);
        }
        setOcrStatus('');
        setOcrProgress(0);
      });
    } catch (err) {
      console.error('OCR scanning error:', err);
      setError('OCR Scanner failed: ' + err.message);
      setOcrStatus('');
      setOcrProgress(0);
    }
  };

  // Shared rating formula — same as the OCR parser
  const recalcRatings = (row) => {
    const mp   = Math.max(1, row.mp   || 1);
    const w    = row.wins   || 0;
    const d    = row.draws  || 0;
    const l    = row.losses || 0;
    const g    = row.goals  || 0;
    const gd   = row.gd     || 0;
    const pts  = row.points || (w * 3 + d);

    const attackVal      = Math.min(99, Math.max(50, Math.round(50 + (g / mp) * 7)));
    const defenseVal     = Math.min(99, Math.max(50, Math.round(70 + (gd / mp) * 4 - l * 1.5)));
    const passingVal     = Math.min(99, Math.max(50, Math.round(60 + (w / mp) * 25 + (d / mp) * 12)));
    const consistencyVal = Math.min(99, Math.max(50, Math.round(50 + ((w + d * 0.5) / mp) * 45)));
    const clutchVal      = Math.min(99, Math.max(50, Math.round((pts / (mp * 3)) * 45)));

    return {
      ...row,
      attack:      attackVal,
      defense:     defenseVal,
      passing:     passingVal,
      consistency: consistencyVal,
      clutch:      clutchVal,
    };
  };

  // Handle value change inside OCR preview table
  // If a standings field changes, auto-recalculate all five ratings
  const STANDINGS_FIELDS = new Set(['mp', 'wins', 'draws', 'losses', 'goals', 'gd', 'points']);

  const handleOcrCellChange = (index, field, value) => {
    setOcrPreview(prev => {
      const updated = [...prev];
      if (field === 'gamer_tag') {
        updated[index] = { ...updated[index], gamer_tag: value };
      } else {
        const numVal = value === '' ? 0 : (parseInt(value) || 0);
        updated[index] = { ...updated[index], [field]: numVal };

        // If a standings number was corrected, recalculate all ratings
        if (STANDINGS_FIELDS.has(field)) {
          updated[index] = recalcRatings(updated[index]);
        }
      }
      return updated;
    });
  };

  // Submit OCR extracted data via server-side API route (bypasses RLS)
  const handleSubmitOcr = async () => {
    if (ocrPreview.length === 0) return;

    setOcrLoading(true);
    setError('');
    setSuccess('');
    setSaveProgress({ current: 0, total: ocrPreview.length });

    try {
      const res = await fetch('/api/save-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: ocrPreview }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Server error ${res.status}`);
      }

      setSaveProgress({ current: ocrPreview.length, total: ocrPreview.length });
      setSuccess(`Successfully saved all ${data.saved} player ratings.`);
      setOcrPreview([]);
      if (ocrInputRef.current) ocrInputRef.current.value = '';
      fetchData();

    } catch (err) {
      console.error('Error saving ratings:', err);
      setError(`Save failed: ${err.message}`);
    } finally {
      setSaveProgress({ current: 0, total: 0 });
      setOcrLoading(false);
    }
  };

  return (

    <div className="weekly-stats-admin-page">
      <div className="admin-container">
        <div className="portal-header">
          <h1>Cadesports Weekly Ratings Manager</h1>
          <p>Update player attributes derived from weekly Cadesports League tournaments. Updates will instantly sync with public leaderboards, comparisons, and profile radar charts.</p>
        </div>

        {/* Global Feedback Banners */}
        {error && (
          <div className="banner error-banner">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}
        {success && (
          <div className="banner success-banner">
            <i className="fas fa-check-circle"></i> {success}
          </div>
        )}

        {/* Section Wrapper: Upload Methods */}
        <div className="upload-methods-card glass-panel">
          <div className="methods-tabs">
            <button 
              className={`method-tab ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => { setActiveTab('manual'); setError(''); setSuccess(''); setOcrLoading(false); }}
            >
              <i className="fas fa-edit"></i> Manual Input
            </button>

            <button 
              className={`method-tab ${activeTab === 'ocr' ? 'active' : ''}`}
              onClick={() => { setActiveTab('ocr'); setError(''); setSuccess(''); setManualLoading(false); }}
            >
              <i className="fas fa-image"></i> Screenshot OCR Scanner
            </button>
          </div>

          <div className="tab-viewport">
            
            {/* MANUAL ENTRY TAB */}
            {activeTab === 'manual' && (
              <form onSubmit={handleSaveManual} className="manual-form">
                <h3>{isEditing ? `Edit Ratings for "${selectedTag}"` : 'Add/Update Player Ratings'}</h3>
                
                <div className="form-row">
                  <div className="form-group tag-group">
                    <label>Select Gamer Tag</label>
                    {!isEditing && (
                      <div className="custom-tag-toggle">
                        <label className="checkbox-container">
                          <input 
                            type="checkbox" 
                            checked={isCustomPlayer} 
                            onChange={(e) => setIsCustomPlayer(e.target.checked)} 
                          />
                          <span className="checkmark"></span>
                          Input custom gamer tag (not in registrations list)
                        </label>
                      </div>
                    )}
                    
                    {isCustomPlayer ? (
                      <input 
                        type="text" 
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Type gamer tag..."
                        required
                        className="custom-tag-input"
                      />
                    ) : (
                      <select 
                        value={selectedTag} 
                        onChange={(e) => setSelectedTag(e.target.value)}
                        disabled={isEditing}
                        required
                      >
                        <option value="">-- Choose registered player --</option>
                        {playersList.map(p => (
                          <option key={p.gamerTag} value={p.gamerTag}>
                            {p.gamerTag} ({p.name || 'No Name'} - {p.teamName})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="attributes-sliders-grid">
                  <div className="slider-item">
                    <div className="slider-meta">
                      <span>ATTACK (ATT)</span>
                      <span className="slider-val text-glow">{attack}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={attack} onChange={(e) => setAttack(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="slider-item">
                    <div className="slider-meta">
                      <span>DEFENSE (DEF)</span>
                      <span className="slider-val text-glow">{defense}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={defense} onChange={(e) => setDefense(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="slider-item">
                    <div className="slider-meta">
                      <span>PASSING (PAS)</span>
                      <span className="slider-val text-glow">{passing}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={passing} onChange={(e) => setPassing(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="slider-item">
                    <div className="slider-meta">
                      <span>CONSISTENCY (CON)</span>
                      <span className="slider-val text-glow">{consistency}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={consistency} onChange={(e) => setConsistency(parseInt(e.target.value))}
                    />
                  </div>

                  <div className="slider-item">
                    <div className="slider-meta">
                      <span>CLUTCH (CLU)</span>
                      <span className="slider-val text-glow">{clutch}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" 
                      value={clutch} onChange={(e) => setClutch(parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <h4 style={{ marginTop: '2rem', marginBottom: '0.75rem', color: '#fff', fontSize: '0.95rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                  Standings Performance (CNEL)
                </h4>
                <div className="standings-stats-grid" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="stat-input-group">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.5rem' }}>MP</label>
                    <input type="number" min="0" value={mp} onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setMp(val);
                      setLosses(Math.max(0, val - wins - draws));
                    }} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }} />
                  </div>
                  <div className="stat-input-group">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.5rem' }}>Wins</label>
                    <input type="number" min="0" value={wins} onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setWins(val);
                      setLosses(Math.max(0, mp - val - draws));
                      setPoints(val * 3 + draws);
                    }} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }} />
                  </div>
                  <div className="stat-input-group">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.5rem' }}>Draws</label>
                    <input type="number" min="0" value={draws} onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setDraws(val);
                      setLosses(Math.max(0, mp - wins - val));
                      setPoints(wins * 3 + val);
                    }} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }} />
                  </div>
                  <div className="stat-input-group">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.5rem' }}>Losses</label>
                    <input type="number" min="0" value={losses} onChange={(e) => setLosses(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }} />
                  </div>
                  <div className="stat-input-group">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.5rem' }}>Goals For</label>
                    <input type="number" min="0" value={goals} onChange={(e) => setGoals(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }} />
                  </div>
                  <div className="stat-input-group">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.5rem' }}>GD</label>
                    <input type="number" value={gd} onChange={(e) => setGd(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }} />
                  </div>
                  <div className="stat-input-group">
                    <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.5rem' }}>Points</label>
                    <input type="number" min="0" value={points} onChange={(e) => setPoints(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }} />
                  </div>
                </div>

                <div className="form-actions-row">
                  <button type="submit" className="btn btn-primary" disabled={manualLoading}>
                    {manualLoading ? <><i className="fas fa-spinner fa-spin" style={{marginRight:'0.5rem'}}></i>Saving...</> : 'Save Ratings'}
                  </button>
                  {(isEditing || selectedTag || customTag) && (
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}


            {/* SCREENSHOT OCR SCANNER TAB */}
            {activeTab === 'ocr' && (
              <div className="ocr-scanner-section">
                <h3>Optical Character Recognition (OCR) Rating Extractor</h3>
                <p className="instruction-text">Upload a screenshot of the weekly tournament standings or player performance profile. Tesseract.js will scan the image, locate the gamer tag, and extract their attributes automatically.</p>

                <div className="file-drop-zone ocr-zone">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleOcrFileChange}
                    ref={ocrInputRef}
                    id="ocr-file-input"
                  />
                  <label htmlFor="ocr-file-input" className="file-label">
                    <i className="fas fa-image"></i>
                    <span>Drop screenshot image here, or click to browse</span>
                  </label>
                </div>

                {ocrStatus && (
                  <div className="ocr-progress-container">
                    <span className="ocr-status-lbl">{ocrStatus}</span>
                    <div className="ocr-progress-bar-track">
                      <div className="ocr-progress-bar-fill" style={{ width: `${ocrProgress * 100}%` }}></div>
                    </div>
                  </div>
                )}

                {ocrRawText && (
                  <details className="ocr-raw-text-details" style={{ marginTop: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <summary style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600 }}>
                      View raw text extracted from image (Debug Panel)
                    </summary>
                    <textarea 
                      readOnly 
                      value={ocrRawText}
                      style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', padding: '0.5rem', fontSize: '0.85rem', fontFamily: 'monospace', borderRadius: '4px', marginTop: '0.75rem', resize: 'vertical' }}
                    />
                  </details>
                )}

                {ocrPreview.length > 0 && (
                  <div className="preview-container">
                    <h4>OCR Extracted Records - Verify & Edit Mismatches</h4>
                    <p className="instruction-text info-note"><i className="fas fa-info-circle"></i> Edit any standings number (MP, W, D, L, GF, GD, PTS) and the <span style={{color:'#f4a261',fontWeight:700}}>ratings (ATT–CLU)</span> will <strong>auto-recalculate</strong> instantly. You can also manually override a rating by typing directly in its cell.</p>
                    
                    <div className="table-responsive preview-table-wrapper">
                      <table className="preview-table editable-table">
                        <thead>
                          <tr>
                            <th>Gamer Tag</th>
                            <th style={{color:'#f4a261'}} title="Auto-calculated from standings">ATT ⟳</th>
                            <th style={{color:'#f4a261'}} title="Auto-calculated from standings">DEF ⟳</th>
                            <th style={{color:'#f4a261'}} title="Auto-calculated from standings">PAS ⟳</th>
                            <th style={{color:'#f4a261'}} title="Auto-calculated from standings">CON ⟳</th>
                            <th style={{color:'#f4a261'}} title="Auto-calculated from standings">CLU ⟳</th>
                            <th style={{color:'#7ecfff'}} title="Edit directly — recalculates ratings">MP</th>
                            <th style={{color:'#7ecfff'}} title="Edit directly — recalculates ratings">W</th>
                            <th style={{color:'#7ecfff'}} title="Edit directly — recalculates ratings">D</th>
                            <th style={{color:'#7ecfff'}} title="Edit directly — recalculates ratings">L</th>
                            <th style={{color:'#7ecfff'}} title="Edit directly — recalculates ratings">GF</th>
                            <th style={{color:'#7ecfff'}} title="Edit directly — recalculates ratings">GD</th>
                            <th style={{color:'#7ecfff'}} title="Edit directly — recalculates ratings">PTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ocrPreview.map((row, idx) => (
                            <tr key={idx}>
                              <td>
                                <input 
                                  type="text" 
                                  value={row.gamer_tag}
                                  onChange={(e) => handleOcrCellChange(idx, 'gamer_tag', e.target.value)}
                                  className="table-cell-input bold-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.attack}
                                  onChange={(e) => handleOcrCellChange(idx, 'attack', e.target.value)}
                                  className="table-cell-input auto-calc-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.defense}
                                  onChange={(e) => handleOcrCellChange(idx, 'defense', e.target.value)}
                                  className="table-cell-input auto-calc-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.passing}
                                  onChange={(e) => handleOcrCellChange(idx, 'passing', e.target.value)}
                                  className="table-cell-input auto-calc-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.consistency}
                                  onChange={(e) => handleOcrCellChange(idx, 'consistency', e.target.value)}
                                  className="table-cell-input auto-calc-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.clutch}
                                  onChange={(e) => handleOcrCellChange(idx, 'clutch', e.target.value)}
                                  className="table-cell-input auto-calc-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.mp}
                                  onChange={(e) => handleOcrCellChange(idx, 'mp', e.target.value)}
                                  className="table-cell-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.wins}
                                  onChange={(e) => handleOcrCellChange(idx, 'wins', e.target.value)}
                                  className="table-cell-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.draws}
                                  onChange={(e) => handleOcrCellChange(idx, 'draws', e.target.value)}
                                  className="table-cell-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.losses}
                                  onChange={(e) => handleOcrCellChange(idx, 'losses', e.target.value)}
                                  className="table-cell-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.goals}
                                  onChange={(e) => handleOcrCellChange(idx, 'goals', e.target.value)}
                                  className="table-cell-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.gd}
                                  onChange={(e) => handleOcrCellChange(idx, 'gd', e.target.value)}
                                  className="table-cell-input"
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  value={row.points}
                                  onChange={(e) => handleOcrCellChange(idx, 'points', e.target.value)}
                                  className="table-cell-input"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="submit-action-row">
                      <button 
                        onClick={handleSubmitOcr} 
                        className="btn btn-primary" 
                        disabled={ocrLoading}
                      >
                        {ocrLoading
                          ? <>
                              <i className="fas fa-spinner fa-spin" style={{marginRight:'0.5rem'}}></i>
                              {saveProgress.total > 0
                                ? `Saving ${saveProgress.current} / ${saveProgress.total}...`
                                : 'Saving...'
                              }
                            </>
                          : `Save Extracted Ratings (${ocrPreview.length} Players)`
                        }
                      </button>
                      <button 
                        onClick={() => { setOcrPreview([]); if (ocrInputRef.current) ocrInputRef.current.value = ''; }} 
                        className="btn btn-secondary"
                      >
                        Clear Scan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Section Wrapper: Current Database Ratings List */}
        <div className="ratings-list-card glass-panel" style={{ marginTop: '2rem' }}>
          <h3>Current Weekly Ratings in Database</h3>
          {loading ? (
            <div className="ratings-loading">
              <i className="fas fa-spinner fa-spin"></i> Loading database ratings...
            </div>
          ) : ratings.length === 0 ? (
            <div className="no-ratings-state">
              <i className="far fa-chart-bar"></i>
              <p>No custom weekly ratings stored. All players are currently evaluated on default tournament statistics.</p>
            </div>
          ) : (
            <div className="table-responsive ratings-table-wrapper">
              <table className="ratings-table">
                <thead>
                  <tr>
                    <th>Gamer Tag</th>
                    <th className="text-center">ATT</th>
                    <th className="text-center">DEF</th>
                    <th className="text-center">PAS</th>
                    <th className="text-center">CON</th>
                    <th className="text-center">CLU</th>
                    <th className="text-center">OVR</th>
                    <th className="text-center">MP</th>
                    <th className="text-center">W</th>
                    <th className="text-center">D</th>
                    <th className="text-center">L</th>
                    <th className="text-center">GF</th>
                    <th className="text-center">GD</th>
                    <th className="text-center">PTS</th>
                    <th>Last Updated</th>
                    <th className="text-center" style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ratings.map((row) => {
                    const ovr = Math.round((row.attack + row.defense + row.passing + row.consistency + row.clutch) / 5);
                    return (
                      <tr key={row.gamer_tag}>
                        <td><strong>{row.gamer_tag}</strong></td>
                        <td className="text-center">{row.attack}</td>
                        <td className="text-center">{row.defense}</td>
                        <td className="text-center">{row.passing}</td>
                        <td className="text-center">{row.consistency}</td>
                        <td className="text-center">{row.clutch}</td>
                        <td className="text-center"><span className="badge-ovr">{ovr}</span></td>
                        <td className="text-center">{row.mp || 0}</td>
                        <td className="text-center">{row.wins || 0}</td>
                        <td className="text-center">{row.draws || 0}</td>
                        <td className="text-center">{row.losses || 0}</td>
                        <td className="text-center">{row.goals || 0}</td>
                        <td className="text-center">{row.gd || 0}</td>
                        <td className="text-center">{row.points || 0}</td>
                        <td>{new Date(row.updated_at).toLocaleString()}</td>
                        <td className="text-center action-col">
                          <button onClick={() => handleEditClick(row)} className="btn-action btn-edit" title="Edit row">
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button onClick={() => handleDeleteClick(row.gamer_tag)} className="btn-action btn-delete" title="Delete row" disabled={manualLoading}>
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
