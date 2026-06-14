"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import './AdminLayout.css';

const ADMIN_ACCESS_CODE = 'SYNCPLAY-ADMIN-2026';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Auth states
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Login/Signup form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [adminCode, setAdminCode] = useState('');
  
  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 4000);
    } else {
      setShowTimeoutMessage(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const checkUserSession = async () => {
      setLoading(true);
      try {
        if (supabase) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          await handleUserSession(currentSession);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error checking user session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();

    let subscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        await handleUserSession(currentSession);
      });
      subscription = data?.subscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleUserSession = async (currentSession) => {
    if (currentSession?.user) {
      setSession(currentSession);
      setUser(currentSession.user);
      const emailVal = currentSession.user.email || '';
      const userMeta = currentSession.user.user_metadata || {};
      
      // Check if user is admin
      let userIsAdmin = emailVal === 'admin@syncplay.com' || userMeta.is_admin === true || emailVal.endsWith('@syncplay.co');
      
      if (userIsAdmin) {
        setIsAdmin(true);
        // Self-healing: Ensure database profile has is_admin set to true
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', currentSession.user.id)
            .single();

          if (profileData && !profileData.is_admin) {
            console.log('Self-healing admin sync: promoting database profile is_admin to true');
            await supabase
              .from('profiles')
              .update({ is_admin: true })
              .eq('id', currentSession.user.id);
          }
        } catch (err) {
          console.error('Error syncing admin status to database profile:', err);
        }
      } else {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', currentSession.user.id)
            .single();
          
          if (!error && data && data.is_admin === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.error('Error checking profile is_admin:', err);
          setIsAdmin(false);
        }
      }
    } else {
      setSession(null);
      setUser(null);
      setIsAdmin(false);
    }
  };

  // Sign In Handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase client is not connected.');
      return;
    }

    setAuthLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (sbError) {
        setError(sbError.message);
        setAuthLoading(false);
        return;
      }

      if (data?.user) {
        const userEmail = data.user.email || '';
        const userMeta = data.user.user_metadata || {};
        
        let userIsAdmin = userEmail === 'admin@syncplay.com' || userMeta.is_admin === true || userEmail.endsWith('@syncplay.co');
        
        if (!userIsAdmin) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', data.user.id)
              .single();
            
            if (!profileError && profileData && profileData.is_admin === true) {
              userIsAdmin = true;
            }
          } catch (err) {
            console.error('Error checking profile status during sign in:', err);
          }
        }

        if (userIsAdmin) {
          setSuccess('Access granted! Loading portal...');
        } else {
          await supabase.auth.signOut();
          setError('Access Denied: You do not have administrator permissions.');
        }
      }
    } catch (err) {
      setError('Authentication failed: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign Up (Create Account) Handler
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase client is not connected.');
      return;
    }

    setAuthLoading(true);
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setAuthLoading(false);
      return;
    }

    if (adminCode.trim() !== ADMIN_ACCESS_CODE) {
      setError('Invalid Admin Access Code. You are not authorized to create an admin account.');
      setAuthLoading(false);
      return;
    }

    try {
      const { data, sbError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            is_admin: true,
            username: username.trim(),
            gamer_tag: gamerTag.trim() || email.split('@')[0],
          }
        }
      });

      if (sbError) {
        setError(sbError.message);
        setAuthLoading(false);
        return;
      }

      setSuccess('Admin account created successfully! Signing in...');
      // Clear fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setUsername('');
      setGamerTag('');
      setAdminCode('');
    } catch (err) {
      setError('Registration failed: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/admin/registrations');
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="loader-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', width: '100%', maxWidth: '450px', padding: '2rem', textAlign: 'center' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: '#e63946' }}></i>
          <span style={{ fontSize: '1rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.8)' }}>VERIFYING ADMINISTRATOR ACCESS...</span>
          {showTimeoutMessage && (
            <div className="timeout-message" style={{ marginTop: '1.5rem', animation: 'fadeIn 0.5s ease', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', width: '100%' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                Taking longer than expected? If you do not have administrator permissions or need to sign in:
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%' }}>
                <Link href="/community" className="btn btn-primary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', textDecoration: 'none', textAlign: 'center', background: '#e63946', border: 'none', color: '#ffffff', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                  <i className="fas fa-comments"></i> Go to Login
                </Link>
                <Link href="/" className="btn btn-secondary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', textDecoration: 'none', textAlign: 'center', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#ffffff', borderRadius: '4px', cursor: 'pointer' }}>
                  <i className="fas fa-home"></i> Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Login / Signup form if not admin
  if (!isAdmin) {
    // Case 1: User is logged in but doesn't have admin permissions
    if (session?.user) {
      return (
        <div className="admin-login-page">
          <div className="login-overlay"></div>
          <div className="login-card-container">
            <div className="login-card glass-panel" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
              <div className="login-logo-container" style={{ marginBottom: '0.5rem' }}>
                <img src="/syncplay-nobg-1.png" alt="syncplay eSports" className="login-logo" style={{ maxHeight: '60px' }} />
              </div>
              
              <div className="login-header">
                <h2 style={{ color: '#e63946', fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <i className="fas fa-exclamation-triangle"></i> Access Denied
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.5', margin: '1rem 0' }}>
                  You are signed in as <strong>{user?.email}</strong>, but this account does not have administrator permissions.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                <button 
                  onClick={async () => {
                    setLoading(true);
                    if (supabase) await supabase.auth.signOut();
                    setLoading(false);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.75rem', background: '#e63946', border: 'none', color: '#ffffff', borderRadius: '4px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  <i className="fas fa-sign-out-alt"></i> Sign In with Another Account
                </button>
                
                <Link href="/community" className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#ffffff', borderRadius: '4px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box', display: 'inline-block', textAlign: 'center' }}>
                  <i className="fas fa-comments"></i> Go to Community Hub
                </Link>

                <Link href="/" className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box', display: 'inline-block', textAlign: 'center' }}>
                  <i className="fas fa-home"></i> Back to Homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Case 2: User is not logged in at all (Show Admin Sign In/Sign Up forms)
    return (
      <div className="admin-login-page">
        <div className="login-overlay"></div>
        <div className="login-card-container">
          <div className="login-card glass-panel">
            <div className="login-logo-container">
              <img src="/syncplay-nobg-1.png" alt="syncplay eSports" className="login-logo" />
            </div>
            
            <div className="login-header">
              <h2>{isSignUp ? 'Create Admin Account' : 'Admin Portal Sign In'}</h2>
              <p>
                {isSignUp 
                  ? 'Sign up with an authorized email and secret admin access code.' 
                  : 'Sign in with your credentials to manage news, registrations, and settings.'}
              </p>
            </div>
            
            {error && (
              <div className="auth-message-banner error-banner">
                <i className="fas fa-exclamation-triangle"></i> {error}
              </div>
            )}

            {success && (
              <div className="auth-message-banner success-banner">
                <i className="fas fa-check-circle"></i> {success}
              </div>
            )}

            {isSignUp ? (
              <form onSubmit={handleSignUp} className="login-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Clinton Clinton"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gamer Tag</label>
                  <input 
                    type="text" 
                    value={gamerTag}
                    onChange={(e) => setGamerTag(e.target.value)}
                    placeholder="e.g. Tactical"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@syncplay.com"
                    required
                  />
                </div>

                <div className="form-row">
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
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Admin Access Code</label>
                  <input 
                    type="password" 
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Authorized Invitation Code"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
                  {authLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Create Account'}
                </button>

                <div className="auth-toggle">
                  Already have an account?{' '}
                  <button type="button" className="btn-link" onClick={() => { setIsSignUp(false); setError(''); setSuccess(''); }}>
                    Sign In here
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="login-form">
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@syncplay.com"
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

                <button type="submit" className="btn btn-primary btn-block" disabled={authLoading}>
                  {authLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Sign In as Admin'}
                </button>

                <div className="auth-toggle">
                  Need to create an admin account?{' '}
                  <button type="button" className="btn-link" onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}>
                    Create Account
                  </button>
                </div>
              </form>
            )}

            {/* Refer user to other pages if they don't have access */}
            <div className="admin-login-referral" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>
                Not an administrator or need general login?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center' }}>
                <Link href="/community" className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', textDecoration: 'none', textAlign: 'center', background: 'rgba(255,255,255,0.05)', color: '#ffffff', borderRadius: '4px', display: 'inline-block' }}>
                  <i className="fas fa-comments"></i> Community Login
                </Link>
                <Link href="/" className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', textDecoration: 'none', textAlign: 'center', background: 'rgba(255,255,255,0.05)', color: '#ffffff', borderRadius: '4px', display: 'inline-block' }}>
                  <i className="fas fa-home"></i> Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the protected layout wrapper for validated admins
  return (
    <div className="admin-layout-wrapper">
      <header className="admin-header-bar">
        <div className="admin-header-container">
          <Link href="/admin/registrations" className="admin-brand-logo">
            <img src="/syncplay-nobg-1.png" alt="syncplay" />
            <span>Admin Control Panel</span>
          </Link>
          
          <nav className="admin-top-navigation">
            <Link 
              href="/admin/registrations" 
              className={`admin-nav-item ${pathname === '/admin/registrations' ? 'active' : ''}`}
            >
              <i className="fas fa-users"></i> <span>Registrations</span>
            </Link>
            <Link 
              href="/admin/manual-registration" 
              className={`admin-nav-item ${pathname === '/admin/manual-registration' ? 'active' : ''}`}
            >
              <i className="fas fa-user-plus"></i> <span>Manual Reg</span>
            </Link>
            <Link 
              href="/admin/news" 
              className={`admin-nav-item ${pathname === '/admin/news' ? 'active' : ''}`}
            >
              <i className="fas fa-newspaper"></i> <span>News Portal</span>
            </Link>
            <Link 
              href="/admin/weekly-stats" 
              className={`admin-nav-item ${pathname === '/admin/weekly-stats' ? 'active' : ''}`}
            >
              <i className="fas fa-chart-line"></i> <span>Weekly Stats</span>
            </Link>
            <Link 
              href="/admin/payment-settings" 
              className={`admin-nav-item ${pathname === '/admin/payment-settings' ? 'active' : ''}`}
            >
              <i className="fas fa-cog"></i> <span>Settings</span>
            </Link>
          </nav>
          
          <div className="admin-user-profile">
            <div className="admin-avatar">
              {user?.email?.substring(0, 2).toUpperCase()}
            </div>
            <span className="admin-email-tag" title={user?.email}>
              {user?.email?.split('@')[0]}
            </span>
            <button onClick={handleLogout} className="admin-logout-btn" title="Sign Out">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>
      
      <main className="admin-main-viewport">
        {children}
      </main>
    </div>
  );
}
