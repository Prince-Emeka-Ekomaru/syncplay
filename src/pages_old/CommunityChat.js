import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './CommunityChat.css';

const CommunityChat = () => {
  const navigate = useNavigate();
  
  // Auth state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [platform, setPlatform] = useState('PlayStation');
  const [formErrors, setFormErrors] = useState({});
  
  // Chat states
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null); // null = Global Chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [profilesCache, setProfilesCache] = useState({});
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  
  // UI Loading/Status
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // 1. Check active session on mount
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch User Profile
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Fetch Rooms and Messages once authenticated
  useEffect(() => {
    if (!user) return;

    fetchRooms();
    fetchMessages();

    // Set up Realtime subscriptions for chat messages and chat rooms
    const messagesSubscription = supabase
      .channel('public-chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          const newMsg = payload.new;
          // Only append if it belongs to the current room
          if (newMsg.room_id === (activeRoom ? activeRoom.id : null)) {
            // Ensure sender profile is in cache
            await fetchSenderProfile(newMsg.sender_id);
            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    const roomsSubscription = supabase
      .channel('public-chat-rooms')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_rooms' },
        (payload) => {
          setRooms(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(roomsSubscription);
    };
  }, [user, activeRoom]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 4. Fetch Sender Profile helper (with cache)
  const fetchSenderProfile = async (senderId) => {
    if (profilesCache[senderId]) return profilesCache[senderId];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, gamer_tag, platform, avatar_url')
        .eq('id', senderId)
        .single();
      
      if (!error && data) {
        setProfilesCache(prev => ({
          ...prev,
          [senderId]: data
        }));
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return { username: 'Unknown Player', gamer_tag: 'Unknown', platform: 'PlayStation' };
  };

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setRooms(data);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    const roomId = activeRoom ? activeRoom.id : null;
    
    let query = supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (roomId) {
      query = query.eq('room_id', roomId);
    } else {
      query = query.is('room_id', null);
    }

    const { data, error } = await query;

    if (!error && data) {
      // Pre-fetch sender profiles for these messages
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      await Promise.all(senderIds.map(id => fetchSenderProfile(id)));
      setMessages(data);
    }
    setLoading(false);
  };

  // Change Active Room
  const handleRoomSelect = (room) => {
    setActiveRoom(room);
    setMessages([]);
  };

  // 5. Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFormErrors({});

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setFormErrors({ auth: error.message });
      setActionLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFormErrors({});

    // Simple validation
    const errors = {};
    if (!fullName.trim()) errors.fullName = 'Full Name is required';
    if (!gamerTag.trim()) errors.gamerTag = 'Gamer Tag is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!phone.trim()) errors.phone = 'Phone number is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setActionLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: fullName,
          phone: phone,
          gamer_tag: gamerTag,
          platform: platform
        }
      }
    });

    if (error) {
      setFormErrors({ auth: error.message });
      setActionLoading(false);
    } else {
      alert('Signup successful! Welcome to the syncplay eSports community.');
      // If email confirmation is enabled on Supabase, user may need to check email.
      // But typically signIn is auto-executed if disabled.
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // 6. Chat Handlers
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const roomId = activeRoom ? activeRoom.id : null;
    const messageText = newMessage;
    setNewMessage('');

    const { error } = await supabase
      .from('chat_messages')
      .insert([
        {
          room_id: roomId,
          sender_id: user.id,
          message: messageText
        }
      ]);

    if (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim() || !profile) return;

    setActionLoading(true);
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert([
        {
          name: newRoomName.trim(),
          created_by: profile.id
        }
      ])
      .select();

    setActionLoading(false);
    if (error) {
      alert('Error creating room: ' + error.message);
    } else if (data && data[0]) {
      setNewRoomName('');
      setShowCreateRoom(false);
      handleRoomSelect(data[0]);
    }
  };

  // Format message timestamps
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Platform Icon Helper
  const getPlatformIcon = (plt) => {
    switch (plt?.toLowerCase()) {
      case 'playstation':
      case 'ps5':
        return <i className="fab fa-playstation platform-chat-icon ps-color"></i>;
      case 'xbox':
        return <i className="fab fa-xbox platform-chat-icon xbox-color"></i>;
      case 'pc':
        return <i className="fas fa-desktop platform-chat-icon pc-color"></i>;
      default:
        return <i className="fas fa-gamepad platform-chat-icon"></i>;
    }
  };

  // Loader View
  if (loading && !user) {
    return (
      <div className="community-loading-screen">
        <div className="loader-box">
          <i className="fas fa-circle-notch fa-spin loader-spinner"></i>
          <p>Connecting to Syncplay Community Hub...</p>
        </div>
      </div>
    );
  }

  // Login / Signup Form View
  if (!user) {
    return (
      <div className="community-auth-page">
        <div className="auth-overlay"></div>
        <div className="auth-card-container">
          <div className="auth-branding">
            <h2 className="brand-title">Syncplay eSports</h2>
            <p className="brand-subtitle">V2 Player Community Hub</p>
            <div className="branding-highlight">
              <i className="fas fa-users-cog"></i>
              <span>Join groups, host matches, chat live, and stay updated!</span>
            </div>
          </div>
          
          <div className="auth-card">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthMode('signup')}
              >
                Create Account
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="auth-form">
                <h3>Welcome Back</h3>
                <p className="auth-desc">Sign in to join the active chats.</p>
                
                {formErrors.auth && <div className="auth-error-banner"><i className="fas fa-exclamation-triangle"></i> {formErrors.auth}</div>}

                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@syncplay.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={actionLoading}>
                  {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="auth-form">
                <h3>Join Community</h3>
                <p className="auth-desc">Create your player profile today.</p>

                {formErrors.auth && <div className="auth-error-banner"><i className="fas fa-exclamation-triangle"></i> {formErrors.auth}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className={formErrors.fullName ? 'error' : ''}
                      required
                    />
                    {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Gamer Tag <span className="required">*</span></label>
                    <input 
                      type="text" 
                      value={gamerTag}
                      onChange={(e) => setGamerTag(e.target.value)}
                      placeholder="e.g. ApexPredator"
                      className={formErrors.gamerTag ? 'error' : ''}
                      required
                    />
                    {formErrors.gamerTag && <span className="error-message">{formErrors.gamerTag}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address <span className="required">*</span></label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="player@syncplay.com"
                      className={formErrors.email ? 'error' : ''}
                      required
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label>Phone Number <span className="required">*</span></label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className={formErrors.phone ? 'error' : ''}
                      required
                    />
                    {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Primary Platform</label>
                    <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                      <option value="PlayStation">PlayStation</option>
                      <option value="Xbox">Xbox</option>
                      <option value="PC">PC</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Password (min. 6 chars) <span className="required">*</span></label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={formErrors.password ? 'error' : ''}
                      required
                    />
                    {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={actionLoading}>
                  {actionLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Chat Dashboard View
  return (
    <div className="community-chat-dashboard">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="user-profile-widget">
            <div className="user-avatar-placeholder">
              {profile?.gamer_tag?.substring(0, 2).toUpperCase() || 'P'}
            </div>
            <div className="user-info">
              <span className="user-gamer-tag">{profile?.gamer_tag || 'Player'}</span>
              <span className="user-platform">{getPlatformIcon(profile?.platform)} {profile?.platform}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>

        <div className="sidebar-rooms">
          <div className="rooms-title-section">
            <h4>CHAT ROOMS</h4>
            <button className="create-room-btn" onClick={() => setShowCreateRoom(true)} title="Create New Group Chat">
              <i className="fas fa-plus"></i>
            </button>
          </div>
          
          <ul className="rooms-list">
            <li 
              className={`room-item ${activeRoom === null ? 'active' : ''}`}
              onClick={() => handleRoomSelect(null)}
            >
              <i className="fas fa-globe-africa room-icon"></i>
              <span className="room-name">Global Chat</span>
            </li>

            {rooms.map(room => (
              <li 
                key={room.id}
                className={`room-item ${activeRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => handleRoomSelect(room)}
              >
                <i className="fas fa-hashtag room-icon"></i>
                <span className="room-name">{room.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chat Box Area */}
      <div className="chat-main">
        <div className="chat-header">
          <h3>
            {activeRoom ? (
              <>
                <i className="fas fa-hashtag"></i> {activeRoom.name}
              </>
            ) : (
              <>
                <i className="fas fa-globe-africa"></i> Global Chat room
              </>
            )}
          </h3>
          <span className="room-perk">Syncplay V2 Hub</span>
        </div>

        {/* Message History */}
        <div className="chat-messages-container">
          {loading ? (
            <div className="chat-inner-loading">
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty-state">
              <i className="far fa-comments"></i>
              <p>No messages in this channel yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="messages-scroller">
              {messages.map(msg => {
                const senderProfile = profilesCache[msg.sender_id] || {};
                const isOwnMessage = msg.sender_id === user.id;
                
                return (
                  <div key={msg.id} className={`message-bubble-wrapper ${isOwnMessage ? 'own-message' : ''}`}>
                    {!isOwnMessage && (
                      <div className="msg-avatar">
                        {senderProfile.gamer_tag?.substring(0, 2).toUpperCase() || 'P'}
                      </div>
                    )}
                    <div className="message-content-wrapper">
                      <div className="msg-meta-header">
                        <span className="msg-sender">{senderProfile.gamer_tag || 'Player'}</span>
                        <span className="msg-platform">{getPlatformIcon(senderProfile.platform)}</span>
                        <span className="msg-time">{formatTime(msg.created_at)}</span>
                      </div>
                      <div className="msg-bubble">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${activeRoom ? '#' + activeRoom.name : 'Global Chat'}`}
            required
            maxLength={1000}
          />
          <button type="submit" className="chat-send-btn">
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Create Group Chat</h3>
            <p>Define a new room name for direct matchmaking and discussions.</p>
            
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label>Room Name</label>
                <input 
                  type="text" 
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Warzone-Squads"
                  maxLength={30}
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateRoom(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityChat;
