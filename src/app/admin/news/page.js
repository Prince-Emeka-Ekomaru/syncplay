"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { uploadPlayerPhoto } from '../../../utils/imageUpload';
import '../registrations/AdminRegistrations.css';
import './AdminNews.css';

const AdminNews = () => {
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
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);

  // Fetch articles on mount — auth is handled by layout.js
  useEffect(() => {
    fetchArticles();
  }, []);

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

  // Handle Image Upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage({ type: '', text: '' });

    try {
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

  // Save News Article
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Title and Content are required!');
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const articleData = {
        title: title.trim(),
        excerpt: excerpt.trim() || title.substring(0, 100) + '...',
        content: content.trim(),
        image_url: coverImageUrl || '/fc-26-1024x639.jpg',
        category: category,
        author: author.trim(),
        published: true
      };

      if (editingArticleId) {
        // UPDATE existing article
        const { error } = await supabase
          .from('news')
          .update(articleData)
          .eq('id', editingArticleId);

        if (error) throw error;
        setMessage({ type: 'success', text: 'News article updated successfully!' });
      } else {
        // INSERT new article
        const { error } = await supabase
          .from('news')
          .insert([articleData]);

        if (error) throw error;
        setMessage({ type: 'success', text: 'News article published successfully!' });
      }

      // Reset form fields
      setTitle('');
      setExcerpt('');
      setContent('');
      setCoverImageUrl('');
      setCategory('announcements');
      setAuthor('syncplay Team');
      setEditingArticleId(null);

      await fetchArticles();
    } catch (err) {
      console.error('Error saving news:', err);
      setMessage({ type: 'error', text: 'Failed to save news: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  // Edit handlers
  const handleStartEdit = (art) => {
    setTitle(art.title || '');
    setExcerpt(art.excerpt || '');
    setContent(art.content || '');
    setCategory(art.category || 'announcements');
    setAuthor(art.author || 'syncplay Team');
    setCoverImageUrl(art.image_url || '');
    setEditingArticleId(art.id);
    setMessage({ type: '', text: '' });
    
    // Scroll editor into view on mobile/smaller devices
    const editorEl = document.querySelector('.news-editor-card');
    if (editorEl) {
      editorEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setTitle('');
    setExcerpt('');
    setContent('');
    setCoverImageUrl('');
    setCategory('announcements');
    setAuthor('syncplay Team');
    setEditingArticleId(null);
    setMessage({ type: '', text: '' });
  };

  // Delete News Article
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

  return (
    <div className="admin-page news-admin-page" style={{ paddingTop: '90px' }}>
      <div className="admin-container">
        <div className="admin-header">
          <div className="header-content">
            <h1>News &amp; Announcement Portal</h1>
            <p className="subtitle">Publish, edit, and manage articles across the syncplay ecosystem.</p>
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`} style={{ margin: '1rem 0' }}>
            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{message.text}</span>
          </div>
        )}

        <div className="admin-news-grid">
          <div className="news-editor-card">
            <h3><i className="fas fa-edit"></i> {editingArticleId ? 'Edit Article' : 'Create New Article'}</h3>
            <form onSubmit={handleSaveArticle} className="editor-form">
              <div className="form-group">
                <label htmlFor="news-title">Article Title <span className="required">*</span></label>
                <input
                  type="text"
                  id="news-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Syncplay Second Edition Bracket Seeding Announced"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="news-excerpt">Brief Excerpt / Subtitle</label>
                <textarea
                  id="news-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Provide a short 1-2 sentence description..."
                  rows={2}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="news-category">Category</label>
                  <select id="news-category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="announcements">Announcements</option>
                    <option value="tournament-results">Tournament Results</option>
                    <option value="player-profiles">Player Profiles</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="news-author">Author</label>
                  <input
                    type="text"
                    id="news-author"
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
                    id="news-cover-image"
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
                <label htmlFor="news-content">Full Article Body (HTML Allowed) <span className="required">*</span></label>
                <textarea
                  id="news-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Use HTML tags for paragraphs (<p>), headers (<h3>), and lists (<ul>/<li>) to structure your article..."
                  rows={8}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving || uploadingImage}>
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> {editingArticleId ? 'Saving...' : 'Publishing...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> {editingArticleId ? 'Save Changes' : 'Publish Article'}
                    </>
                  )}
                </button>

                {editingArticleId && (
                  <button type="button" className="btn btn-cancel-edit" onClick={handleCancelEdit}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

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
                    <div className="art-actions">
                      <button 
                        className="btn-edit-art" 
                        onClick={() => handleStartEdit(art)}
                        title="Edit Article"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn-delete-art" 
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        title="Delete Article"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
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
