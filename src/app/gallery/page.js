"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations/translations';
import { getMediaUrl } from '../../supabaseClient';
import './Gallery.css';

const Gallery = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];

  // Tab State
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' or 'videos'
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [photoFilter, setPhotoFilter] = useState('all');
  const [videoFilter, setVideoFilter] = useState('all');

  // Extract YouTube video ID from any YouTube URL format
  const getYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    // If it looks like a raw ID already (11 chars)
    if (/^[\w-]{11}$/.test(url)) return url;
    return null;
  };

  // Get thumbnail — YouTube CDN if youtubeId, else local/Supabase
  const getVideoThumbnail = (video) => {
    if (video.youtubeId) {
      return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
    }
    return getMediaUrl(video.thumbnail);
  };

  // Read URL query param for tab selection on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'videos' || tabParam === 'photos') {
        setActiveTab(tabParam);
      }
    }
  }, []);

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

  const videos = {
    all: [
      {
        id: 1,
        title: t.eventHighlights || 'Event Highlights',
        youtubeId: 'g6Eyf-0lOLM',
        category: 'highlights',
        description: t.eventHighlightsDesc || 'Highlights from the inaugural Syncplay 2v2 Tournament'
      },
      {
        id: 2,
        title: 'Tournament Winner Interview',
        src: '/tournament-media/videos/interviews/Turnament_winner.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/winners ss.png',
        description: 'Exclusive interview with the tournament champions — CENTURY'
      },
      {
        id: 3,
        title: 'Banter FC Interview',
        src: '/tournament-media/videos/interviews/Banter_FC.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/welcome baji jr.png',
        description: 'Pre-tournament interview with Banter FC'
      },
      {
        id: 4,
        title: 'Bukas Post-Event Interview',
        src: '/tournament-media/videos/interviews/Bukas_PostEvent.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/welcome boyd.png',
        description: 'Post-event interview with Bukas'
      },
      {
        id: 5,
        title: 'Orbyters Pre-Event Interview',
        src: '/tournament-media/videos/interviews/orbyters_pre-event.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/orbyters and get psyched.png',
        description: 'Pre-tournament interview with Orbyters'
      },
      {
        id: 6,
        title: 'Temple Boys Pre-Interview',
        src: '/tournament-media/videos/interviews/TempleBoys Pre interview.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/temple boys and d fantastic 2.png',
        description: 'Pre-tournament interview with Temple Boys'
      }
    ],
    highlights: [
      {
        id: 1,
        title: t.eventHighlights || 'Event Highlights',
        youtubeId: 'g6Eyf-0lOLM',
        category: 'highlights',
        description: t.eventHighlightsDesc || 'Highlights of the tournament'
      }
    ],
    interviews: [
      {
        id: 2,
        title: 'Tournament Winner Interview',
        src: '/tournament-media/videos/interviews/Turnament_winner.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/winners ss.png',
        description: 'Exclusive interview with the tournament champions'
      },
      {
        id: 3,
        title: 'Banter FC Interview',
        src: '/tournament-media/videos/interviews/Banter_FC.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/welcome baji jr.png',
        description: 'Pre-tournament interview with Banter FC'
      },
      {
        id: 4,
        title: 'Bukas Post-Event Interview',
        src: '/tournament-media/videos/interviews/Bukas_PostEvent.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/welcome boyd.png',
        description: 'Post-event interview with Bukas'
      },
      {
        id: 5,
        title: 'Orbyters Pre-Event Interview',
        src: '/tournament-media/videos/interviews/orbyters_pre-event.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/orbyters and get psyched.png',
        description: 'Pre-tournament interview with Orbyters'
      },
      {
        id: 6,
        title: 'Temple Boys Pre-Interview',
        src: '/tournament-media/videos/interviews/TempleBoys Pre interview.MP4',
        category: 'interviews',
        thumbnail: '/tournament-media/photos/temple boys and d fantastic 2.png',
        description: 'Pre-tournament interview with Temple Boys'
      }
    ]
  };

  const filteredPhotos = photoFilter === 'all' ? photos.all : photos[photoFilter] || [];
  const filteredVideos = videoFilter === 'all' ? videos.all : videos[videoFilter] || [];

  // Photo handlers
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

  // Video handlers
  const openVideo = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <section className="gallery-hero">
        <div className="gallery-hero-overlay"></div>
        <div className="container">
          <h1>{t.gallery || 'MEDIA HUB'}</h1>
          <p>{t.galleryDesc || 'Relive the highlights and best moments of our tournaments.'}</p>
        </div>
      </section>

      {/* Main Tab Navigation */}
      <section className="media-tabs-section">
        <div className="container">
          <div className="media-tabs">
            <button 
              className={`tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('photos');
                window.history.pushState(null, '', '?tab=photos');
              }}
            >
              <i className="fas fa-images"></i> {t.photos || 'PHOTOS'}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('videos');
                window.history.pushState(null, '', '?tab=videos');
              }}
            >
              <i className="fas fa-video"></i> {t.videos || 'VIDEOS'}
            </button>
          </div>
        </div>
      </section>

      {/* Photos Tab Content */}
      {activeTab === 'photos' && (
        <>
          {/* Photo Category Filter */}
          <section className="gallery-filter">
            <div className="container">
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${photoFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPhotoFilter('all')}
                >
                  {t.all}
                </button>
                <button 
                  className={`filter-btn ${photoFilter === 'winners' ? 'active' : ''}`}
                  onClick={() => setPhotoFilter('winners')}
                >
                  {t.winners}
                </button>
                <button 
                  className={`filter-btn ${photoFilter === 'matches' ? 'active' : ''}`}
                  onClick={() => setPhotoFilter('matches')}
                >
                  {t.matches}
                </button>
                <button 
                  className={`filter-btn ${photoFilter === 'highlights' ? 'active' : ''}`}
                  onClick={() => setPhotoFilter('highlights')}
                >
                  {t.highlights}
                </button>
                <button 
                  className={`filter-btn ${photoFilter === 'players' ? 'active' : ''}`}
                  onClick={() => setPhotoFilter('players')}
                >
                  {t.players}
                </button>
              </div>
            </div>
          </section>

          {/* Photo Gallery Grid */}
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
        </>
      )}

      {/* Videos Tab Content */}
      {activeTab === 'videos' && (
        <>
          {/* Video Category Filter */}
          <section className="videos-filter">
            <div className="container">
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${videoFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setVideoFilter('all')}
                >
                  {t.all}
                </button>
                <button 
                  className={`filter-btn ${videoFilter === 'highlights' ? 'active' : ''}`}
                  onClick={() => setVideoFilter('highlights')}
                >
                  {t.highlights}
                </button>
                <button 
                  className={`filter-btn ${videoFilter === 'interviews' ? 'active' : ''}`}
                  onClick={() => setVideoFilter('interviews')}
                >
                  {t.interviews}
                </button>
              </div>
            </div>
          </section>

          {/* Video Grid */}
          <section className="videos-content">
            <div className="container">
              <div className="videos-grid">
                {filteredVideos.map(video => (
                  <div 
                    key={video.id} 
                    className="video-card"
                    onClick={() => openVideo(video)}
                  >
                    <div className="video-thumbnail">
                      <img src={getVideoThumbnail(video)} alt={video.title} />
                      <div className="video-play-overlay">
                        <i className={video.youtubeId ? 'fab fa-youtube' : 'fas fa-play'}></i>
                      </div>
                      {video.youtubeId && <div className="youtube-badge"><i className="fab fa-youtube"></i> YouTube</div>}
                    </div>
                    <div className="video-info">
                      <h3>{video.title}</h3>
                      <p>{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Photo Lightbox */}
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

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={closeVideo}>
          <button className="video-modal-close" onClick={closeVideo}>
            <i className="fas fa-times"></i>
          </button>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedVideo.youtubeId ? (
              <div className="youtube-embed-wrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="youtube-iframe"
                />
              </div>
            ) : (
              <video
                controls
                autoPlay
                src={getMediaUrl(selectedVideo.src)}
                className="video-player"
              >
                Your browser does not support the video tag.
              </video>
            )}
            <div className="video-modal-info">
              <h3>{selectedVideo.title}</h3>
              <p>{selectedVideo.description}</p>
              {selectedVideo.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="youtube-link-btn"
                >
                  <i className="fab fa-youtube"></i> Watch on YouTube
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
