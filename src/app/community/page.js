"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import './CommunityChat.css';
import { SEED_REGISTRATIONS } from '../../utils/playerStats';

const CommunityChat = () => {
  const router = useRouter();
  
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

  // Profile editing state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editGamerTag, setEditGamerTag] = useState('');
  const [editPlatform, setEditPlatform] = useState('PlayStation');
  const [editPhone, setEditPhone] = useState('');
  
  // Chat states
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null); // null = Global Chat
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [profilesCache, setProfilesCache] = useState({});
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [allProfiles, setAllProfiles] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownRoomId, setActiveDropdownRoomId] = useState(null);
  const [chatFilter, setChatFilter] = useState('all');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Chat features states
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [reactionsMap, setReactionsMap] = useState({});
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // Pagination & Unread
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageOffset, setPageOffset] = useState(0);
  const PAGE_SIZE = 50;
  const messagesContainerRef = useRef(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutRef = useRef(null);

  // UI Loading/Status
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // 1. Check active session on mount
  useEffect(() => {
    if (!supabase) {
      setFormErrors({ auth: 'Supabase client is not initialized. Please check your .env file and ensure environment variables are loaded.' });
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Helper to find registrations by email or phone number
  const findRegistrationByEmailOrPhone = async (emailVal, phoneVal) => {
    if (!emailVal && !phoneVal) return null;
    
    // 1. Search database registrations
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('payment_status', 'completed');
          
        if (!error && data) {
          const match = data.find(r => 
            (r.player1_email && r.player1_email.toLowerCase() === emailVal?.toLowerCase()) ||
            (r.player2_email && r.player2_email.toLowerCase() === emailVal?.toLowerCase()) ||
            (phoneVal && r.player1_phone === phoneVal) ||
            (phoneVal && r.player2_phone === phoneVal)
          );
          
          if (match) {
            const isPlayer1 = (match.player1_email && match.player1_email.toLowerCase() === emailVal?.toLowerCase()) || (phoneVal && match.player1_phone === phoneVal);
            return {
              gamer_tag: isPlayer1 ? match.player1_gamer_tag : match.player2_gamer_tag,
              username: isPlayer1 ? match.player1_name : match.player2_name,
              phone: isPlayer1 ? match.player1_phone : match.player2_phone,
              platform: isPlayer1 ? match.player1_platform : match.player2_platform
            };
          }
        }
      } catch (err) {
        console.error('Error searching database registrations:', err);
      }
    }
    
    // 2. Search SEED_REGISTRATIONS fallback (for note transcibed players)
    const match = SEED_REGISTRATIONS.find(r => 
      (r.player1_email && r.player1_email.toLowerCase() === emailVal?.toLowerCase()) ||
      (r.player2_email && r.player2_email.toLowerCase() === emailVal?.toLowerCase()) ||
      (phoneVal && r.player1_phone === phoneVal) ||
      (phoneVal && r.player2_phone === phoneVal)
    );
    
    if (match) {
      const isPlayer1 = (match.player1_email && match.player1_email.toLowerCase() === emailVal?.toLowerCase()) || (phoneVal && match.player1_phone === phoneVal);
      return {
        gamer_tag: isPlayer1 ? match.player1_gamer_tag : match.player2_gamer_tag,
        username: isPlayer1 ? match.player1_name : match.player2_name,
        phone: isPlayer1 ? match.player1_phone : match.player2_phone,
        platform: isPlayer1 ? match.player1_platform : match.player2_platform
      };
    }
    
    return null;
  };

  // 2. Fetch User Profile (with auto-creation if missing and registration matching)
  const fetchProfile = async (userId, userEmail = '') => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          console.log('Profile not found in database, searching matching registrations...');
          
          const regMatch = await findRegistrationByEmailOrPhone(userEmail, null);
          
          const defaultUsername = regMatch?.username || (userEmail ? userEmail.split('@')[0] : `Player_${userId.substring(0, 8)}`);
          const defaultGamerTag = regMatch?.gamer_tag || defaultUsername;
          const defaultPlatform = regMatch?.platform || 'PlayStation';
          const defaultPhone = regMatch?.phone || null;
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                username: defaultUsername,
                gamer_tag: defaultGamerTag,
                platform: defaultPlatform,
                phone: defaultPhone
              }
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Failed to create default profile:', insertError);
          } else {
            console.log('Default profile created successfully:', newProfile);
            setProfile(newProfile);
          }
        }
      } else {
        // Profile exists! Let's check if it has fallback/default values and auto-sync with registration details
        const isDefault = data.gamer_tag?.startsWith('Player_') || !data.phone || data.gamer_tag === data.username;
        if (isDefault) {
          const regMatch = await findRegistrationByEmailOrPhone(userEmail, data.phone);
          if (regMatch && (data.gamer_tag !== regMatch.gamer_tag || !data.phone)) {
            console.log('Found matching registration, auto-updating default profile...');
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({
                username: data.username === data.gamer_tag ? regMatch.username : data.username,
                gamer_tag: regMatch.gamer_tag,
                platform: regMatch.platform,
                phone: data.phone || regMatch.phone
              })
              .eq('id', userId)
              .select()
              .single();
              
            if (!updateError && updatedProfile) {
              setProfile(updatedProfile);
              return;
            }
          }
        }
        setProfile(data);
      }
    } catch (e) {
      console.error('Exception in fetchProfile:', e);
    }
  };

  // Open Edit Profile Modal
  const openEditProfile = () => {
    if (!profile) return;
    setEditUsername(profile.username || '');
    setEditGamerTag(profile.gamer_tag || '');
    setEditPlatform(profile.platform || 'PlayStation');
    setEditPhone(profile.phone || '');
    setShowEditProfile(true);
  };

  // Handle Profile Update Submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editUsername.trim() || !editGamerTag.trim()) {
      alert('Username and Gamer Tag are required.');
      return;
    }
    
    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: editUsername.trim(),
          gamer_tag: editGamerTag.trim(),
          platform: editPlatform,
          phone: editPhone.trim() || null
        })
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        
        // Update local profiles cache
        setProfilesCache(prev => ({
          ...prev,
          [user.id]: {
            username: data.username,
            gamer_tag: data.gamer_tag,
            platform: data.platform,
            avatar_url: data.avatar_url
          }
        }));
        
        // Refresh all profiles list
        setAllProfiles(prev => prev.map(p => p.id === user.id ? data : p));
        
        setShowEditProfile(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Fetch Rooms, Messages, and Profiles once authenticated
  useEffect(() => {
    if (!user) return;

    fetchRooms();
    fetchMessages();
    fetchAllProfiles();

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
            if (activeRoom && newMsg.room_id === activeRoom.id) updateLastRead(activeRoom.id);
            else if (newMsg.room_id) setUnreadCounts(prev => ({ ...prev, [newMsg.room_id]: (prev[newMsg.room_id] || 0) + 1 }));
          }
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
      })
      .subscribe();

    const reactionsSubscription = supabase
      .channel('public-reactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_message_reactions' }, (payload) => {
        setReactionsMap(prev => { const msgId = payload.new.message_id; const current = prev[msgId] || []; return { ...prev, [msgId]: [...current, payload.new] }; });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_message_reactions' }, (payload) => {
        setReactionsMap(prev => { const newMap = {}; Object.keys(prev).forEach(key => { newMap[key] = prev[key].filter(r => r.id !== payload.old.id); }); return newMap; });
      })
      .subscribe();

    const roomsSubscription = supabase
      .channel('public-chat-rooms')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_rooms' },
        async (payload) => {
          // If it's private, we ignore this channel. We will get notified via membershipsSubscription.
          if (payload.new.is_private) return;
          
          const { data: newRoom, error } = await supabase
            .from('chat_rooms')
            .select('*, chat_room_members(*)')
            .eq('id', payload.new.id)
            .single();

          if (!error && newRoom) {
            setRooms(prev => {
              if (prev.some(r => r.id === newRoom.id)) return prev;
              return [...prev, newRoom];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_rooms' },
        (payload) => {
          setRooms(prev => prev.map(r => r.id === payload.new.id ? { ...r, last_message_at: payload.new.last_message_at, last_message_preview: payload.new.last_message_preview, last_message_sender_id: payload.new.last_message_sender_id } : r));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_rooms' },
        (payload) => {
          console.log('Room deleted from server:', payload.old);
          setRooms(prev => prev.filter(r => r.id !== payload.old.id));
          setActiveRoom(prev => {
            if (prev?.id === payload.old.id) {
              return null; // switch to Global
            }
            return prev;
          });
        }
      )
      .subscribe();

    const profilesSubscription = supabase
      .channel('public-profiles')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAllProfiles(prev => {
              if (prev.some(p => p.id === payload.new.id)) return prev;
              return [...prev, payload.new].sort((a, b) => (a.gamer_tag || a.username || '').localeCompare(b.gamer_tag || b.username || ''));
            });
          } else if (payload.eventType === 'UPDATE') {
            setAllProfiles(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
          } else if (payload.eventType === 'DELETE') {
            setAllProfiles(prev => prev.filter(p => p.id === payload.old.id));
          }
        }
      )
      .subscribe();

    // Listen to memberships additions for this user
    const membershipsSubscription = supabase
      .channel('my-memberships')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_room_members', filter: `user_id=eq.${user.id}` },
        async (payload) => {
          console.log('Added to room membership:', payload.new);
          if (payload.new.user_id !== user.id) return;
          const { data: newRoom, error } = await supabase
            .from('chat_rooms')
            .select('*, chat_room_members(*)')
            .eq('id', payload.new.room_id)
            .single();
          
          if (!error && newRoom) {
            setRooms(prev => {
              if (prev.some(r => r.id === newRoom.id)) return prev;
              return [...prev, newRoom];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(reactionsSubscription);
      supabase.removeChannel(roomsSubscription);
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(membershipsSubscription);
    };
  }, [user, activeRoom]);

  // Realtime Presence tracking Effect
  useEffect(() => {
    if (!user || !supabase) return;

    const presenceChannel = supabase.channel('online-players', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineMap = {};
        Object.keys(state).forEach((key) => {
          const userPresences = state[key];
          if (userPresences && userPresences.length > 0) {
            onlineMap[key] = userPresences[0];
          }
        });
        setOnlineUsers(onlineMap);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            gamer_tag: profile?.gamer_tag || 'Player',
            platform: profile?.platform || 'PlayStation',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user, profile]);

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownRoomId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const fetchAllProfiles = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, gamer_tag, platform, avatar_url')
        .order('username', { ascending: true });
      
      if (!error && data) {
        setAllProfiles(data);
      }
    } catch (e) {
      console.error('Error fetching all profiles:', e);
    }
  };

  // Scroll to bottom when messages list updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const updateLastRead = async (roomId) => {
    if (!user || !roomId) return;
    try {
      await supabase.from('chat_room_members').update({ last_read_at: new Date().toISOString() }).eq('room_id', roomId).eq('user_id', user.id);
      setUnreadCounts(prev => ({ ...prev, [roomId]: 0 }));
    } catch (e) { console.error('Error updating read status', e); }
  };
  
  const handleTyping = () => {
    if (!activeRoom || !user || !supabase) return;
    const channelName = `typing-${activeRoom.id}`;
    let channel = supabase.getChannels().find(c => c.topic === `realtime:${channelName}`);
    if (!channel) {
      channel = supabase.channel(channelName, { config: { presence: { key: user.id } } });
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typingNames = Object.keys(state).filter(k => k !== user.id).map(k => state[k][0]?.gamer_tag).filter(Boolean);
        setTypingUsers(prev => ({ ...prev, [activeRoom.id]: typingNames }));
      }).subscribe();
    }
    channel.track({ gamer_tag: profile?.gamer_tag || 'Player', typing_at: new Date().toISOString() });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { channel.untrack(); }, 3000);
  };

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
      .select('*, chat_room_members(*)')
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setRooms(data);
    }
  };

  const fetchMessages = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true); else setLoadingMore(true);
      const currentOffset = isLoadMore ? pageOffset + PAGE_SIZE : 0;
      const roomId = activeRoom ? activeRoom.id : null;
      
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + PAGE_SIZE - 1);
      
      if (roomId) {
        query = query.eq('room_id', roomId);
      } else {
        query = query.is('room_id', null);
      }

      const { data, error } = await query;

      if (!error && data) {
        const reversedData = [...data].reverse();
        if (data.length < PAGE_SIZE) setHasMoreMessages(false); else setHasMoreMessages(true);
        if (!isLoadMore) setPageOffset(0); else setPageOffset(currentOffset);

        // Fetch reactions for these messages
        const msgIds = reversedData.map(m => m.id);
        if (msgIds.length > 0) {
          const { data: reactionsData } = await supabase.from('chat_message_reactions').select('*').in('message_id', msgIds);
          if (reactionsData) {
            const rMap = {};
            reactionsData.forEach(r => { if (!rMap[r.message_id]) rMap[r.message_id] = []; rMap[r.message_id].push(r); });
            setReactionsMap(prev => isLoadMore ? { ...prev, ...rMap } : rMap);
          }
        }

        // Pre-fetch sender profiles for these messages
        const senderIds = [...new Set(data.map(m => m.sender_id))];
        await Promise.all(senderIds.map(id => fetchSenderProfile(id)));
        
        const container = messagesContainerRef.current;
        const prevScrollHeight = container ? container.scrollHeight : 0;

        setMessages(prev => isLoadMore ? [...reversedData, ...prev] : reversedData);
        
        if (isLoadMore) {
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight - prevScrollHeight;
            }
          }, 0);
        }
      } else if (error) {
        console.error('Fetch messages error:', error);
      }
    } catch (err) {
      console.error('Fetch messages exception:', err);
    } finally {
      if (!isLoadMore) setLoading(false); else setLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && !loadingMore && hasMoreMessages && messages.length > 0) {
      fetchMessages(true);
    }
  };


  // Sort and filter rooms for WhatsApp UI
  const getSortedRooms = () => {
    let sorted = [...rooms];
    
    // Sort by last_message_at descending (or created_at if null)
    sorted.sort((a, b) => {
      const timeA = new Date(a.last_message_at || a.created_at).getTime();
      const timeB = new Date(b.last_message_at || b.created_at).getTime();
      return timeB - timeA;
    });

    if (chatFilter === 'unread') {
      sorted = sorted.filter(r => unreadCounts[r.id] > 0);
    } else if (chatFilter === 'groups') {
      sorted = sorted.filter(r => r.room_type === 'group');
    }

    return sorted;
  };

  const sortedRooms = getSortedRooms();

  // Change Active Room

  const handleRoomSelect = (room) => {
    setActiveRoom(room);
    setMessages([]);
    setPageOffset(0);
    setHasMoreMessages(true);
    setMobileSidebarOpen(false);
    if (room) updateLastRead(room.id);
  };

  // 5. Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setFormErrors({});

    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please verify your environment variables.');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setFormErrors({ auth: error.message });
      }
    } catch (err) {
      console.error('Login exception:', err);
      setFormErrors({ auth: err.message || 'An unexpected error occurred.' });
    } finally {
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

    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized. Please verify your environment variables.');
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
      } else {
        alert('Signup successful! Welcome to the syncplay eSports community. If email verification is enabled, please check your inbox to confirm your account.');
        // Reset form fields
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
        setGamerTag('');
        // Switch to login tab so they can sign in
        setAuthMode('login');
      }
    } catch (err) {
      console.error('Signup exception:', err);
      setFormErrors({ auth: err.message || 'An unexpected error occurred.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // 6. Chat Handlers

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return; }
    setMediaPreview({ file, url: URL.createObjectURL(file) });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !mediaPreview) return;
    if (!user) return;
    
    setUploadingMedia(true);
    let attachmentUrl = null;
    let attachmentType = null;
    
    if (mediaPreview) {
      const fileExt = mediaPreview.file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('chat-attachments').upload(fileName, mediaPreview.file);
      if (error) { console.error('Upload error', error); alert('Failed to upload image.'); setUploadingMedia(false); return; }
      const { data: publicUrlData } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
      attachmentUrl = publicUrlData.publicUrl;
      attachmentType = 'image';
    }
    
    const roomId = activeRoom ? activeRoom.id : null;
    const messageText = newMessage;
    setNewMessage('');
    setMediaPreview(null);
    setUploadingMedia(false);

    const { error } = await supabase.from('chat_messages').insert([{
      room_id: roomId, sender_id: user.id, message: messageText, attachment_url: attachmentUrl, attachment_type: attachmentType
    }]);
    if (error) { console.error('Error sending:', error); alert('Failed to send message: ' + error.message); }
  };

  const handleEditMessage = async (e) => {
    e.preventDefault();
    if (!editMessageText.trim() || !editingMessageId) return;
    const { error } = await supabase.from('chat_messages').update({ message: editMessageText, is_edited: true }).eq('id', editingMessageId).eq('sender_id', user.id);
    if (!error) { setEditingMessageId(null); setEditMessageText(''); }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    await supabase.from('chat_messages').update({ is_deleted: true, message: 'This message was deleted.', attachment_url: null }).eq('id', msgId).eq('sender_id', user.id);
  };

  const handleReact = async (msgId, emoji) => {
    setShowEmojiPickerFor(null);
    const existing = (reactionsMap[msgId] || []).find(r => r.emoji === emoji && r.user_id === user.id);
    if (existing) {
      await supabase.from('chat_message_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('chat_message_reactions').insert([{ message_id: msgId, user_id: user.id, emoji }]);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    if (!profile) {
      alert('Your profile details could not be found. Please try logging out and logging back in, or reload the page.');
      return;
    }

    setActionLoading(true);
    try {
      const { data: roomsData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert([
          {
            name: newRoomName.trim(),
            created_by: profile.id,
            room_type: 'group',
            is_private: true
          }
        ])
        .select();

      if (roomError) throw roomError;

      if (roomsData && roomsData[0]) {
        const createdRoom = roomsData[0];
        
        const { error: memberError } = await supabase
          .from('chat_room_members')
          .insert([
            {
              room_id: createdRoom.id,
              user_id: user.id
            }
          ]);

        if (memberError) throw memberError;

        const { data: roomWithMembers, error: fetchError } = await supabase
          .from('chat_rooms')
          .select('*, chat_room_members(*)')
          .eq('id', createdRoom.id)
          .single();

        if (fetchError) throw fetchError;

        setNewRoomName('');
        setShowCreateRoom(false);
        
        setRooms(prev => [...prev, roomWithMembers]);
        handleRoomSelect(roomWithMembers);
      }
    } catch (error) {
      console.error('Error creating group chat:', error);
      alert('Error creating group chat: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getRoomDisplayName = (room) => {
    if (!room) return 'Global Chat';
    if (room.room_type === 'dm') {
      const otherMember = room.chat_room_members?.find(m => m.user_id !== user?.id);
      if (otherMember) {
        const otherProfile = allProfiles.find(p => p.id === otherMember.user_id);
        if (otherProfile) {
          return otherProfile.username || otherProfile.gamer_tag || 'Chat Partner';
        }
      }
      return 'Direct Message';
    }
    return room.name;
  };

  const handleStartDM = async (targetUserId, targetGamerTag) => {
    if (!user || !profile) return;
    
    setActionLoading(true);
    try {
      const { data: userMemberships, error: memError } = await supabase
        .from('chat_room_members')
        .select('room_id')
        .eq('user_id', user.id);

      if (memError) throw memError;

      const roomIds = userMemberships.map(m => m.room_id);
      let existingRoom = null;

      if (roomIds.length > 0) {
        const { data: commonDMs, error: commonError } = await supabase
          .from('chat_room_members')
          .select('room_id, chat_rooms!inner(id, room_type)')
          .in('room_id', roomIds)
          .eq('user_id', targetUserId)
          .eq('chat_rooms.room_type', 'dm');

        if (!commonError && commonDMs && commonDMs.length > 0) {
          const existingRoomId = commonDMs[0].room_id;
          
          const { data: roomDetails, error: fetchError } = await supabase
            .from('chat_rooms')
            .select('*, chat_room_members(*)')
            .eq('id', existingRoomId)
            .single();

          if (!fetchError && roomDetails) {
            existingRoom = roomDetails;
          }
        }
      }

      if (existingRoom) {
        setRooms(prev => {
          if (prev.some(r => r.id === existingRoom.id)) return prev;
          return [...prev, existingRoom];
        });
        handleRoomSelect(existingRoom);
      } else {
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert([
            {
              name: `DM-${profile.gamer_tag || 'Player'}-${targetGamerTag}`,
              room_type: 'dm',
              is_private: true,
              created_by: user.id
            }
          ])
          .select()
          .single();

        if (createError) throw createError;

        const { error: membersError } = await supabase
          .from('chat_room_members')
          .insert([
            { room_id: newRoom.id, user_id: user.id },
            { room_id: newRoom.id, user_id: targetUserId }
          ]);

        if (membersError) throw membersError;

        const { data: roomDetails, error: fetchError } = await supabase
          .from('chat_rooms')
          .select('*, chat_room_members(*)')
          .eq('id', newRoom.id)
          .single();

        if (fetchError) throw fetchError;

        setRooms(prev => [...prev, roomDetails]);
        handleRoomSelect(roomDetails);
      }
    } catch (err) {
      console.error('Error starting DM:', err);
      alert('Could not start DM: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (targetUserId) => {
    if (!activeRoom) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('chat_room_members')
        .insert([
          {
            room_id: activeRoom.id,
            user_id: targetUserId
          }
        ]);

      if (error) throw error;

      setRooms(prev => prev.map(r => {
        if (r.id === activeRoom.id) {
          const updatedMembers = [...(r.chat_room_members || []), { room_id: r.id, user_id: targetUserId }];
          return { ...r, chat_room_members: updatedMembers };
        }
        return r;
      }));

      setActiveRoom(prev => {
        const updatedMembers = [...(prev.chat_room_members || []), { room_id: prev.id, user_id: targetUserId }];
        return { ...prev, chat_room_members: updatedMembers };
      });
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const isPlayerInRoom = (playerId) => {
    if (!activeRoom || !activeRoom.chat_room_members) return false;
    return activeRoom.chat_room_members.some(m => m.user_id === playerId);
  };

  const handleDeleteRoom = async (room) => {
    if (!room) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete the room "${getRoomDisplayName(room)}"? This will permanently delete all messages and memberships.`);
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .delete()
        .eq('id', room.id);

      if (error) throw error;

      setActiveRoom(null);
      setRooms(prev => prev.filter(r => r.id !== room.id));
      alert('Room deleted successfully.');
    } catch (err) {
      console.error('Error deleting room:', err);
      alert('Could not delete room: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveRoom = async (room) => {
    if (!room || !user) return;
    
    const confirmLeave = window.confirm(`Are you sure you want to leave the group "${getRoomDisplayName(room)}"? You will no longer receive or view messages from this room.`);
    if (!confirmLeave) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('chat_room_members')
        .delete()
        .eq('room_id', room.id)
        .eq('user_id', user.id);

      if (error) throw error;

      if (activeRoom?.id === room.id) {
        setActiveRoom(null);
      }
      
      setRooms(prev => prev.filter(r => r.id !== room.id));
      alert('Left the group successfully.');
    } catch (err) {
      console.error('Error leaving room:', err);
      alert('Could not leave group: ' + err.message);
    } finally {
      setActionLoading(false);
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
                    autoComplete="current-password"
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
      <div className={`chat-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-profile-widget" onClick={openEditProfile} style={{ cursor: 'pointer' }} title="Edit Profile">
            <div className="user-avatar-placeholder">
              {profile?.gamer_tag?.substring(0, 2).toUpperCase() || 'P'}
            </div>
            <div className="user-info">
              <span className="user-gamer-tag">{profile?.gamer_tag || 'Player'}</span>
              <span className="user-platform">{getPlatformIcon(profile?.platform)} {profile?.platform}</span>
            </div>
          </div>
          <div className="header-actions-wrapper">
            {(user?.email === 'admin@syncplay.com' || user?.email?.endsWith('@syncplay.co') || user?.user_metadata?.is_admin === true || profile?.is_admin === true) && (
              <button 
                className="admin-portal-link-btn" 
                onClick={() => router.push('/admin/registrations')} 
                title="Admin Control Panel"
              >
                <i className="fas fa-shield-alt"></i>
              </button>
            )}
            <button className="edit-profile-btn" onClick={openEditProfile} title="Edit Profile">
              <i className="fas fa-cog"></i>
            </button>
            <button className="logout-btn" onClick={handleLogout} title="Sign Out">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>

        <div className="sidebar-rooms whatsapp-style-sidebar">
          {/* WhatsApp Style Chat Filters */}
          <div className="chat-filters">
            <button className={`filter-pill ${chatFilter === 'all' ? 'active' : ''}`} onClick={() => setChatFilter('all')}>All</button>
            <button className={`filter-pill ${chatFilter === 'unread' ? 'active' : ''}`} onClick={() => setChatFilter('unread')}>
              Unread {Object.values(unreadCounts).reduce((a,b)=>a+b, 0) > 0 && <span className="filter-count">{Object.values(unreadCounts).reduce((a,b)=>a+b, 0)}</span>}
            </button>
            <button className={`filter-pill ${chatFilter === 'groups' ? 'active' : ''}`} onClick={() => setChatFilter('groups')}>Groups</button>
          </div>
          
          <ul className="rooms-list unified-chat-list">
            {/* Global Chat Pinned to Top */}
            {chatFilter !== 'unread' && chatFilter !== 'groups' && (
              <li 
                className={`room-item whatsapp-chat-row ${activeRoom === null ? 'active' : ''}`}
                onClick={() => handleRoomSelect(null)}
              >
                <div className="chat-row-avatar global-avatar">
                  <i className="fas fa-globe-africa"></i>
                </div>
                <div className="chat-row-details">
                  <div className="chat-row-header">
                    <span className="room-name">Global Chat</span>
                  </div>
                  <div className="chat-row-preview">
                    <span>Public Community Hub</span>
                  </div>
                </div>
              </li>
            )}

            {sortedRooms.map(room => {
              const isCreator = room.created_by === user?.id;
              const isGroup = room.room_type !== 'dm';
              const otherMember = !isGroup ? room.chat_room_members?.find(m => m.user_id !== user?.id) : null;
              const isOnline = otherMember ? !!onlineUsers[otherMember.user_id] : false;
              const displayName = getRoomDisplayName(room);
              const unread = unreadCounts[room.id] > 0 ? unreadCounts[room.id] : 0;
              const timeDisplay = room.last_message_at ? formatTime(room.last_message_at) : formatTime(room.created_at);
              
              return (
                <li 
                  key={room.id}
                  className={`room-item whatsapp-chat-row ${activeRoom?.id === room.id ? 'active' : ''}`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="chat-row-avatar">
                    {isGroup ? (
                      <div className="group-avatar-placeholder">
                        <i className={room.is_private ? "fas fa-lock" : "fas fa-hashtag"}></i>
                      </div>
                    ) : (
                      <div className="dm-avatar-placeholder">
                        {displayName.substring(0, 2).toUpperCase()}
                        <span className={`status-badge-dot ${isOnline ? 'online' : 'offline'}`}></span>
                      </div>
                    )}
                  </div>
                  
                  <div className="chat-row-details">
                    <div className="chat-row-header">
                      <span className="room-name">{displayName}</span>
                      <span className={`chat-time ${unread > 0 ? 'unread-time' : ''}`}>{timeDisplay}</span>
                    </div>
                    <div className="chat-row-preview">
                      <span className="preview-text">
                        {room.last_message_preview || (isGroup ? 'Group created' : 'Direct Message created')}
                      </span>
                      {unread > 0 && <span className="whatsapp-unread-badge">{unread}</span>}
                    </div>
                  </div>

                  <div className="room-actions-wrapper">
                    <button 
                      type="button" 
                      className="room-action-btn" 
                      onClick={(e) => { e.stopPropagation(); setActiveDropdownRoomId(activeDropdownRoomId === room.id ? null : room.id); }}
                    >
                      <i className="fas fa-chevron-down"></i>
                    </button>
                    
                    {activeDropdownRoomId === room.id && (
                      <div className="room-dropdown-menu">
                        {isCreator ? (
                          <button type="button" className="dropdown-item delete" onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room); setActiveDropdownRoomId(null); }}>
                            <i className="fas fa-trash-alt"></i> Delete
                          </button>
                        ) : (
                          <button type="button" className="dropdown-item leave" onClick={(e) => { e.stopPropagation(); handleLeaveRoom(room); setActiveDropdownRoomId(null); }}>
                            <i className="fas fa-sign-out-alt"></i> Leave
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
            {sortedRooms.length === 0 && (
              <li className="no-dms-hint">No chats found in this category.</li>
            )}
          </ul>
        </div>
        
        {/* Floating New Chat Button */}
        <button className="new-chat-fab" onClick={() => setShowNewChatModal(true)} title="New Chat">
          <i className="fas fa-comment-dots"></i>
        </button>
      </div>

      <div className={`chat-main ${mobileSidebarOpen ? 'sidebar-open' : ''}`} onClick={() => setMobileSidebarOpen(false)}>
        <div className="chat-header">
          <h3>
            <button 
              className="mobile-sidebar-toggle" 
              onClick={(e) => { e.stopPropagation(); setMobileSidebarOpen(!mobileSidebarOpen); }}
            >
              <i className="fas fa-bars"></i>
            </button>
            {activeRoom ? (
              <>
                <i className={activeRoom.room_type === 'dm' ? "fas fa-user" : "fas fa-hashtag"}></i> {getRoomDisplayName(activeRoom)}
                {activeRoom.room_type === 'group' && activeRoom.is_private && (
                  <button type="button" className="add-member-icon-btn" onClick={() => setShowAddMembers(true)} title="Add Members">
                    <i className="fas fa-user-plus"></i>
                  </button>
                )}
              </>
            ) : (
              <>
                <i className="fas fa-globe-africa"></i> <span className="header-title-text">SyncPlay Lobby</span>
              </>
            )}
          </h3>
          <div className="chat-header-actions">
            <button type="button" className="admin-portal-link-btn" onClick={() => router.push('/admin')}>
              <i className="fas fa-shield-alt"></i> Admin Portal
            </button>
            <span className="room-perk">SP HUB</span>
          </div>
        </div>

        {/* Message History */}
        <div className="chat-messages-container" onScroll={handleScroll} ref={messagesContainerRef}>
          {loadingMore && <div className="loading-more"><i className="fas fa-spinner fa-spin"></i> Loading older messages...</div>}
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
                const isMyMessage = msg.sender_id === user?.id;
                const senderDisplayName = senderProfile.username || senderProfile.gamer_tag || 'Player';
                
                return (
                  <div key={msg.id} className={`message-row ${isMyMessage ? 'my-message' : 'their-message'}`}>
                    {!isMyMessage && (
                      <div className="msg-avatar">
                        {senderDisplayName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="message-bubble-wrapper" tabIndex="0">
                      {!isMyMessage && activeRoom?.room_type === 'group' && (
                        <div className="msg-sender-info">
                          <span className="msg-sender">{senderDisplayName}</span>
                          <span className="msg-platform">{getPlatformIcon(senderProfile.platform)}</span>
                        </div>
                      )}
                      <div className="msg-meta-header">
                        <span className="msg-sender">{senderDisplayName}</span>
                        <span className="msg-platform">{getPlatformIcon(senderProfile.platform)}</span>
                        <span className="msg-time">{formatTime(msg.created_at)}</span>
                      </div>
                      <div className="msg-bubble">
                        {editingMessageId === msg.id ? (
                          <form onSubmit={handleEditMessage} className="edit-message-form">
                            <input type="text" value={editMessageText} onChange={e => setEditMessageText(e.target.value)} autoFocus />
                            <button type="submit" className="btn-save-edit"><i className="fas fa-check"></i></button>
                            <button type="button" className="btn-cancel-edit" onClick={() => setEditingMessageId(null)}><i className="fas fa-times"></i></button>
                          </form>
                        ) : (
                          <>
                            {msg.is_deleted ? <em style={{opacity: 0.6}}><i className="fas fa-ban"></i> {msg.message}</em> : msg.message}
                            {msg.attachment_url && !msg.is_deleted && (
                              <div className="msg-attachment">
                                <img src={msg.attachment_url} alt="attachment" style={{maxWidth:'100%', borderRadius:'8px', marginTop:'8px', maxHeight:'300px', objectFit:'cover'}} />
                              </div>
                            )}
                            {msg.is_edited && !msg.is_deleted && <span style={{fontSize:'0.7rem', opacity:0.5, marginLeft:'5px'}}>(edited)</span>}
                          </>
                        )}
                        
                        {/* Reactions Display */}
                        {reactionsMap[msg.id] && reactionsMap[msg.id].length > 0 && (
                          <div className="msg-reactions">
                            {Array.from(new Set(reactionsMap[msg.id].map(r => r.emoji))).map(emoji => {
                              const count = reactionsMap[msg.id].filter(r => r.emoji === emoji).length;
                              const hasReacted = reactionsMap[msg.id].some(r => r.emoji === emoji && r.user_id === user.id);
                              return (
                                <button key={emoji} onClick={() => handleReact(msg.id, emoji)} className={`reaction-pill ${hasReacted ? 'active' : ''}`}>
                                  {emoji} {count}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Action Menu (Hover) */}
                        {!msg.is_deleted && (
                          <div className="msg-actions-hover">
                            <button onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)} title="Add Reaction"><i className="far fa-smile"></i></button>
                            {isMyMessage && (
                              <>
                                <button onClick={() => { setEditingMessageId(msg.id); setEditMessageText(msg.message); }} title="Edit Message"><i className="fas fa-pencil-alt"></i></button>
                                <button onClick={() => handleDeleteMessage(msg.id)} title="Delete Message"><i className="fas fa-trash"></i></button>
                              </>
                            )}
                          </div>
                        )}
                        
                        {/* Emoji Picker Popup */}
                        {showEmojiPickerFor === msg.id && (
                          <div className="emoji-picker-popup">
                            {['👍','❤️','🔥','😂','🎉','🎮','👀','💯'].map(emoji => (
                              <button key={emoji} onClick={() => handleReact(msg.id, emoji)}>{emoji}</button>
                            ))}
                          </div>
                        )}
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
        
        {typingUsers[activeRoom?.id] && typingUsers[activeRoom?.id].length > 0 && (
          <div className="typing-indicator" style={{padding: '0 2rem', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem'}}>
            <i className="fas fa-keyboard"></i> {typingUsers[activeRoom.id].join(', ')} {typingUsers[activeRoom.id].length > 1 ? 'are' : 'is'} typing...
          </div>
        )}
        
        {mediaPreview && (
          <div className="media-preview-bar" style={{padding: '1rem 2rem', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <img src={mediaPreview.url} alt="preview" style={{height: '60px', borderRadius: '4px'}} />
            <button type="button" onClick={() => setMediaPreview(null)} className="btn btn-secondary btn-sm"><i className="fas fa-times"></i> Cancel Attachment</button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{display: 'none'}} />
          <button type="button" className="chat-attach-btn" onClick={() => fileInputRef.current.click()} disabled={uploadingMedia} style={{background: 'none', border: 'none', color: '#a1a1aa', fontSize: '1.2rem', cursor: 'pointer', padding: '0 0.5rem'}}>
            <i className="fas fa-paperclip"></i>
          </button>
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            placeholder={`Message ${activeRoom ? getRoomDisplayName(activeRoom) : 'Global Chat'}`}
            required
            maxLength={1000}
          />
          <button type="submit" className="chat-send-btn">
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>


      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-backdrop">
          <div className="modal-content new-chat-modal">
            <div className="modal-header-flex">
              <h3>New Chat</h3>
              <button type="button" className="close-modal-btn" onClick={() => setShowNewChatModal(false)}><i className="fas fa-times"></i></button>
            </div>
            
            <button className="create-group-row-btn" onClick={() => { setShowNewChatModal(false); setShowCreateRoom(true); }}>
              <div className="group-icon-circle"><i className="fas fa-users"></i></div>
              <span>New Group</span>
            </button>

            <div className="community-contacts-list">
              <h4>CONTACTS ON SYNCPLAY</h4>
              <div className="search-players-box" style={{marginBottom: '1rem'}}>
                <input type="text" placeholder="Search gamers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="search-input" />
                <i className="fas fa-search search-icon"></i>
              </div>

              <ul className="players-list">
                {allProfiles
                  .filter(p => p.id !== user?.id)
                  .filter(p => {
                    if (!searchQuery) return true;
                    const tag = p.username || p.gamer_tag || '';
                    return tag.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map(player => {
                    const isOnline = !!onlineUsers[player.id];
                    const displayName = player.username || player.gamer_tag || 'Player';
                    return (
                      <li 
                        key={player.id} 
                        className="player-item whatsapp-contact-row"
                        onClick={() => { setShowNewChatModal(false); handleStartDM(player.id, displayName); }}
                      >
                        <div className="player-avatar-wrapper">
                          <div className="player-avatar">
                            {displayName.substring(0, 2).toUpperCase()}
                          </div>
                          <span className={`status-badge-dot ${isOnline ? 'online' : 'offline'}`}></span>
                        </div>
                        <div className="player-item-info">
                          <span className="player-item-tag">{displayName}</span>
                          <span className="player-item-platform">{getPlatformIcon(player.platform)} {player.platform}</span>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>
      )}

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

      {/* Add Members Modal */}
      {showAddMembers && activeRoom && (
        <div className="modal-backdrop">
          <div className="modal-content add-members-modal">
            <h3>Add Members to Group</h3>
            <p>Invite players to join #{getRoomDisplayName(activeRoom)}. Only members can read or post messages.</p>
            
            <div className="search-players-box">
              <input 
                type="text" 
                placeholder="Search by gamer tag..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <i className="fas fa-search search-icon"></i>
            </div>

            <div className="players-list-scroll">
              {allProfiles
                .filter(p => p.id !== user?.id)
                .filter(p => {
                  if (!searchQuery) return true;
                  const tag = p.gamer_tag || '';
                  const name = p.username || '';
                  return tag.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         name.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map(player => {
                  const isAlreadyMember = isPlayerInRoom(player.id);
                  const isOnline = !!onlineUsers[player.id];
                  
                  return (
                    <div key={player.id} className="player-invite-item">
                      <div className="player-invite-info">
                        <div className="player-avatar-mini">
                          {player.gamer_tag?.substring(0, 2).toUpperCase() || 'P'}
                          <span className={`status-badge-dot ${isOnline ? 'online' : 'offline'}`}></span>
                        </div>
                        <div className="player-invite-details">
                          <span className="player-invite-tag">{player.gamer_tag || 'Player'}</span>
                          <span className="player-invite-name">{player.username}</span>
                        </div>
                      </div>
                      
                      {isAlreadyMember ? (
                        <span className="already-member-badge">
                          <i className="fas fa-check-circle"></i> Member
                        </span>
                      ) : (
                        <button 
                          type="button" 
                          className="btn btn-add-player"
                          onClick={() => handleAddMember(player.id)}
                          disabled={actionLoading}
                        >
                          <i className="fas fa-user-plus"></i> Add
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowAddMembers(false); setSearchQuery(''); }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-backdrop">
          <div className="modal-content edit-profile-modal">
            <h3>Edit Player Profile</h3>
            <p>Update your gaming handle and preferences shown to the community.</p>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Gamer Tag</label>
                <input 
                  type="text" 
                  value={editGamerTag}
                  onChange={(e) => setEditGamerTag(e.target.value)}
                  placeholder="Gamer Tag"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Primary Platform</label>
                  <select value={editPlatform} onChange={(e) => setEditPlatform(e.target.value)}>
                    <option value="PlayStation">PlayStation</option>
                    <option value="Xbox">Xbox</option>
                    <option value="PC">PC</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditProfile(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Context Menu */}
    </div>
  );
};

export default CommunityChat;
