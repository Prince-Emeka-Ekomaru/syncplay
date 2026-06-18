"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './AdBanner.css';

const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the banner in this session
    const isDismissed = sessionStorage.getItem('syncplay_ad_banner_dismissed');
    if (!isDismissed) {
      // Show the banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('syncplay_ad_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="ad-banner">
      <div className="ad-banner-content container">
        <div className="ad-banner-text">
          <span className="ad-badge">NEW</span>
          <p>Registration is open for the upcoming July 30th 2v2 Tournament! Limited spots available.</p>
        </div>
        <div className="ad-banner-actions">
          <Link href="/register" className="btn-ad-register" onClick={handleClose}>
            Register Now
          </Link>
          <button className="ad-banner-close" onClick={handleClose} aria-label="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
