import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import { getMediaUrl } from '../supabaseClient';
import './Gallery.css';

const Gallery = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');

  // Organize photos by category
  const photos = {
    all: [
      { src: '/tournament-media/photos/winners ss.png', category: 'winners', alt: 'Tournament Winners' },
      { src: '/tournament-media/photos/second place.png', category: 'winners', alt: 'Second Place' },
      { src: '/tournament-media/photos/3RD PLACE.png', category: 'winners', alt: 'Third Place' },
      { src: '/tournament-media/photos/final match.png', category: 'matches', alt: 'Final Match' },
      { src: '/tournament-media/photos/temple boys and d fantastic 2.png', category: 'matches', alt: 'Temple Boys vs D Fantastic' },
      { src: '/tournament-media/photos/orbyters and get psyched.png', category: 'matches', alt: 'Orbyters vs Get Psyched' },
      { src: '/tournament-media/photos/prime time and dangerous twins.png', category: 'matches', alt: 'Prime Time vs Dangerous Twins' },
      { src: '/tournament-media/photos/l\'flames and century.png', category: 'matches', alt: 'L\'Flames vs Century' },
      { src: '/tournament-media/photos/titans and gameverxe.png', category: 'matches', alt: 'Titans vs Gameverxe' },
      { src: '/tournament-media/photos/IMG_4596.JPEG', category: 'highlights', alt: 'Tournament Highlights' },
      { src: '/tournament-media/photos/welcome baji jr.png', category: 'players', alt: 'Welcome Baji Jr' },
      { src: '/tournament-media/photos/welcome boyd.png', category: 'players', alt: 'Welcome Boyd' },
      { src: '/tournament-media/photos/welcome bright.png', category: 'players', alt: 'Welcome Bright' },
      { src: '/tournament-media/photos/welcome clinton tactical.png', category: 'players', alt: 'Welcome Clinton Tactical' },
      { src: '/tournament-media/photos/welcome ebuka.png', category: 'players', alt: 'Welcome Ebuka' },
      { src: '/tournament-media/photos/welcome eddy.png', category: 'players', alt: 'Welcome Eddy' },
      { src: '/tournament-media/photos/welcome game with josh.png', category: 'players', alt: 'Welcome Game with Josh' },
      { src: '/tournament-media/photos/welcome mitch.png', category: 'players', alt: 'Welcome Mitch' },
      { src: '/tournament-media/photos/welcome mr oga.png', category: 'players', alt: 'Welcome Mr Oga' },
      { src: '/tournament-media/photos/welcome wolevation.png', category: 'players', alt: 'Welcome Wolevation' }
    ],
    winners: [
      { src: '/tournament-media/photos/winners ss.png', category: 'winners', alt: 'Tournament Winners' },
      { src: '/tournament-media/photos/second place.png', category: 'winners', alt: 'Second Place' },
      { src: '/tournament-media/photos/3RD PLACE.png', category: 'winners', alt: 'Third Place' }
    ],
    matches: [
      { src: '/tournament-media/photos/final match.png', category: 'matches', alt: 'Final Match' },
      { src: '/tournament-media/photos/temple boys and d fantastic 2.png', category: 'matches', alt: 'Temple Boys vs D Fantastic' },
      { src: '/tournament-media/photos/orbyters and get psyched.png', category: 'matches', alt: 'Orbyters vs Get Psyched' },
      { src: '/tournament-media/photos/prime time and dangerous twins.png', category: 'matches', alt: 'Prime Time vs Dangerous Twins' },
      { src: '/tournament-media/photos/l\'flames and century.png', category: 'matches', alt: 'L\'Flames vs Century' },
      { src: '/tournament-media/photos/titans and gameverxe.png', category: 'matches', alt: 'Titans vs Gameverxe' }
    ],
    highlights: [
      { src: '/tournament-media/photos/IMG_4596.JPEG', category: 'highlights', alt: 'Tournament Highlights' },
      { src: '/tournament-media/photos/winners ss.png', category: 'winners', alt: 'Tournament Winners' },
      { src: '/tournament-media/photos/second place.png', category: 'winners', alt: 'Second Place' },
      { src: '/tournament-media/photos/3RD PLACE.png', category: 'winners', alt: 'Third Place' },
      { src: '/tournament-media/photos/final match.png', category: 'matches', alt: 'Final Match' }
    ],
    players: [
      { src: '/tournament-media/photos/welcome baji jr.png', category: 'players', alt: 'Welcome Baji Jr' },
      { src: '/tournament-media/photos/welcome boyd.png', category: 'players', alt: 'Welcome Boyd' },
      { src: '/tournament-media/photos/welcome bright.png', category: 'players', alt: 'Welcome Bright' },
      { src: '/tournament-media/photos/welcome clinton tactical.png', category: 'players', alt: 'Welcome Clinton Tactical' },
      { src: '/tournament-media/photos/welcome ebuka.png', category: 'players', alt: 'Welcome Ebuka' },
      { src: '/tournament-media/photos/welcome eddy.png', category: 'players', alt: 'Welcome Eddy' },
      { src: '/tournament-media/photos/welcome game with josh.png', category: 'players', alt: 'Welcome Game with Josh' },
      { src: '/tournament-media/photos/welcome mitch.png', category: 'players', alt: 'Welcome Mitch' },
      { src: '/tournament-media/photos/welcome mr oga.png', category: 'players', alt: 'Welcome Mr Oga' },
      { src: '/tournament-media/photos/welcome wolevation.png', category: 'players', alt: 'Welcome Wolevation' }
    ]
  };

  const filteredPhotos = filter === 'all' ? photos.all : photos[filter] || [];

  const openLightbox = (photo) => {
    setSelectedImage(photo);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const currentIndex = filteredPhotos.findIndex(p => p.src === selectedImage.src);
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % filteredPhotos.length;
    } else {
      newIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    }
    setSelectedImage(filteredPhotos[newIndex]);
  };

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="gallery-hero-overlay"></div>
        <div className="container">
          <h1>{t.gallery}</h1>
          <p>{t.galleryDesc}</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="gallery-filter">
        <div className="container">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t.all}
            </button>
            <button 
              className={`filter-btn ${filter === 'winners' ? 'active' : ''}`}
              onClick={() => setFilter('winners')}
            >
              {t.winners}
            </button>
            <button 
              className={`filter-btn ${filter === 'matches' ? 'active' : ''}`}
              onClick={() => setFilter('matches')}
            >
              {t.matches}
            </button>
            <button 
              className={`filter-btn ${filter === 'highlights' ? 'active' : ''}`}
              onClick={() => setFilter('highlights')}
            >
              {t.highlights}
            </button>
            <button 
              className={`filter-btn ${filter === 'players' ? 'active' : ''}`}
              onClick={() => setFilter('players')}
            >
              {t.players}
            </button>
          </div>
        </div>
      </section>

      {/* Videos Link Banner */}
      <div className="videos-banner-container container" style={{ marginBottom: '2rem' }}>
        <div className="videos-banner" style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>🎥 {t.watchVideos || 'Watch All Videos'}</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              Check out tournament highlights, match recordings, and exclusive player interviews.
            </p>
          </div>
          <Link to="/videos" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
            {t.watchVideos || 'Go to Videos'}
          </Link>
        </div>
      </div>

      {/* Gallery Grid */}
      <section className="gallery-content">
        <div className="container">
          <div className="gallery-grid">
            {filteredPhotos.map((photo, index) => (
              <div 
                key={index} 
                className="gallery-item"
                onClick={() => openLightbox(photo)}
              >
                <img 
                  src={getMediaUrl(photo.src)} 
                  alt={photo.alt}
                  loading="lazy"
                />
                <div className="gallery-overlay">
                  <i className="fas fa-search-plus"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <i className="fas fa-times"></i>
          </button>
          <button 
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={getMediaUrl(selectedImage.src)} alt={selectedImage.alt} />
            <p className="lightbox-caption">{selectedImage.alt}</p>
          </div>
          <button 
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
