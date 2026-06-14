import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { uploadPlayerPhoto } from '../utils/imageUpload'; // Helper we updated for bucket upload
import './AdminRegistrations.css'; // Reuse table and basic layout styles
import './AdminNews.css';

const AdminNews = () => {
  const navigate = useNavigate();

  // Auth states
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // News states
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('announcements');
  const [author, setAuthor] = useState('syncplay Team');
  const [coverImage, setCoverImage] = useState(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // 1. Check user auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const emailVal = session.user.email || '';
        const userMeta = session.user.user_metadata || {};
        if (emailVal === 'admin@syncplay.com' || userMeta.is_admin === true || emailVal.endsWith('@syncplay.co')) {
          setIsAdmin(true);
          await fetchArticles();
        } else {
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // 2. Fetch news articles from database
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching news:', error);
      } else {
        setArticles(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        setAuthLoading(false);
        return;
      }

      if (data?.user) {
        const userEmail = data.user.email || '';
        const userMeta = data.user.user_metadata || {};
        
        // Check if user has admin privileges
        if (userEmail === 'admin@syncplay.com' || userMeta.is_admin === true || userEmail.endsWith('@syncplay.co')) {
          setUser(data.user);
          setIsAdmin(true);
          setAuthLoading(false);
          await fetchArticles();
        } else {
          // Sign out immediately if not admin
          await supabase.auth.signOut();
          setAuthError('Access Denied: You do not have administrator permissions.');
          setAuthLoading(false);
        }
      }
    } catch (err) {
      setAuthError('Authentication failed: ' + err.message);
      setAuthLoading(false);
    }
  };

  // 4. Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setArticles([]);
  };

  // 5. Handle Image Upload to player-photos bucket
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage({ type: '', text: '' });

    try {
      // Re-use our public image upload helper to save news banners to Supabase
      const publicUrl = await uploadPlayerPhoto(file, 'news-banners', 'cover');
      setCoverImageUrl(publicUrl);
      setMessage({ type: 'success', text: 'Cover image uploaded successfully!' });
    } catch (err) {
      console.error('Image upload failed:', err);
      setMessage({ type: 'error', text: 'Image upload failed: ' + err.message });
    } finally {
      setUploadingImage(false);
    }
  };

  // 6. Save News Article
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Title and Content are required!');
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { data, error } = await supabase
        .from('news')
        .insert([
          {
            title: title.trim(),
            excerpt: excerpt.trim() || title.substring(0, 100) + '...',
            content: content.trim(),
            image_url: coverImageUrl || '/fc-26-1024x639.jpg', // fallback image
            category: category,
            author: author.trim(),
            published: true
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'News article published successfully!' });
      
      // Reset form
      setTitle('');
      setExcerpt('');
      setContent('');
      setCoverImageUrl('');
      setCategory('announcements');

      // Refresh list
      await fetchArticles();
    } catch (err) {
      console.error('Error publishing news:', err);
      setMessage({ type: 'error', text: 'Failed to publish news: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  // 7. Delete News Article
  const handleDeleteArticle = async (id, titleText) => {
    if (!window.confirm(`Are you sure you want to delete "${titleText}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Article deleted successfully.' });
      await fetchArticles();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete article: ' + err.message);
    }
  };

  // Login View
  if (!isAdmin) {
    return (
      <div className="admin-login-page">
        <div className="login-overlay"></div>
        <div className="login-card-container">
          <div className="login-card">
            <div className="login-header">
              <h2>Syncplay Admin Portal</h2>
              <p>Sign in with your admin credentials to publish news and manage settings.</p>
            </div>
            
            {authError && (
              <div className="auth-error-banner">
                <i className="fas fa-exclamation-triangle"></i> {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="login-form">
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
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="admin-page news-admin-page" style={{ paddingTop: '90px' }}>
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <h1>News & Announcement Portal</h1>
            <p className="subtitle">Publish, edit, and manage articles across the syncplay ecosystem.</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {message.text && (
          <div className={`message ${message.type}`} style={{ margin: '1rem 0' }}>
            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{message.text}</span>
          </div>
        )}

        <div className="admin-news-grid">
          {/* Editor Form */}
          <div className="news-editor-card">
            <h3><i className="fas fa-edit"></i> Create New Article</h3>
            <form onSubmit={handleSaveArticle} className="editor-form">
              <div className="form-group">
                <label htmlFor="title">Article Title <span className="required">*</span></label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Syncplay Second Edition Bracket Seeding Announced"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="excerpt">Brief Excerpt / Subtitle</label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Provide a short 1-2 sentence description..."
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="announcements">Announcements</option>
                    <option value="tournament-results">Tournament Results</option>
                    <option value="player-profiles">Player Profiles</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="author">Author</label>
                  <input
                    type="text"
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Article Cover Banner</label>
                <div className="image-upload-controls">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <span><i className="fas fa-spinner fa-spin"></i> Uploading...</span>}
                </div>
                {coverImageUrl && (
                  <div className="cover-preview">
                    <img src={coverImageUrl} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="content">Full Article Body (HTML Allowed) <span className="required">*</span></label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Use HTML tags for paragraphs (<p>), headers (<h3>), and lists (<ul>/<li>) to structure your article..."
                  rows={8}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving || uploadingImage}>
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Publishing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Publish Article
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Existing Articles List */}
          <div className="articles-list-card">
            <h3><i className="fas fa-newspaper"></i> Published Articles ({articles.length})</h3>
            
            {loading ? (
              <div className="loading-articles">
                <i className="fas fa-spinner fa-spin"></i> Loading...
              </div>
            ) : articles.length === 0 ? (
              <div className="no-articles">
                <p>No custom articles found in the database. Historical hardcoded news are displayed on the frontend.</p>
              </div>
            ) : (
              <div className="articles-scroller">
                {articles.map((art) => (
                  <div key={art.id} className="admin-article-item">
                    <div className="art-img">
                      <img src={art.image_url} alt="" />
                    </div>
                    <div className="art-info">
                      <h4>{art.title}</h4>
                      <div className="art-meta">
                        <span className="badge-cat">{art.category}</span>
                        <span>{new Date(art.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      className="btn-delete-art" 
                      onClick={() => handleDeleteArticle(art.id, art.title)}
                      title="Delete Article"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNews;
