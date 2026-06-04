import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import './Videos.css';

const Videos = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [filter, setFilter] = useState('all');

  const videos = {
    all: [
      {
        id: 1,
        title: t.eventHighlights,
        src: '/tournament-media/videos/event_highlight.mp4',
        category: 'highlights',
        thumbnail: '/tournament-media/photos/IMG_4596.JPEG',
        description: t.eventHighlightsDesc
      },
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
    ],
    highlights: [
      {
        id: 1,
        title: t.eventHighlights,
        src: '/tournament-media/videos/event_highlight.mp4',
        category: 'highlights',
        thumbnail: '/tournament-media/photos/IMG_4596.JPEG',
        description: t.eventHighlightsDesc
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

  const filteredVideos = filter === 'all' ? videos.all : videos[filter] || [];

  const openVideo = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="videos-page">
      {/* Hero Section */}
      <section className="videos-hero">
        <div className="videos-hero-overlay"></div>
        <div className="container">
          <h1>{t.videos}</h1>
          <p>{t.videosDesc}</p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="videos-filter">
        <div className="container">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t.all}
            </button>
            <button 
              className={`filter-btn ${filter === 'highlights' ? 'active' : ''}`}
              onClick={() => setFilter('highlights')}
            >
              {t.highlights}
            </button>
            <button 
              className={`filter-btn ${filter === 'interviews' ? 'active' : ''}`}
              onClick={() => setFilter('interviews')}
            >
              {t.interviews}
            </button>
          </div>
        </div>
      </section>

      {/* Videos Grid */}
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
                  <img src={video.thumbnail} alt={video.title} />
                  <div className="video-play-overlay">
                    <i className="fas fa-play"></i>
                  </div>
                  <div className="video-duration">▶</div>
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

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={closeVideo}>
          <button className="video-modal-close" onClick={closeVideo}>
            <i className="fas fa-times"></i>
          </button>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <video 
              controls 
              autoPlay
              src={selectedVideo.src}
              className="video-player"
            >
              Your browser does not support the video tag.
            </video>
            <div className="video-modal-info">
              <h3>{selectedVideo.title}</h3>
              <p>{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
