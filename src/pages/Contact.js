import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import './Contact.css';

const Contact = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Static form - just shows alert
    alert('Thank you for your message! The syncplay team will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: 'fa-envelope',
      title: 'Email Us',
      content: 'info@syncplay.co',
      link: 'mailto:info@syncplay.co'
    },
    {
      icon: 'fa-discord',
      title: 'Discord',
      content: 'Join our community',
      link: 'https://discord.com'
    },
    {
      icon: 'fa-map-marker-alt',
      title: 'Location',
      content: 'Global - Online Platform',
      link: null
    }
  ];

  const socialLinks = [
    { icon: 'fa-instagram', url: 'https://instagram.com', name: 'Instagram' },
    { icon: 'fa-tiktok', url: 'https://tiktok.com', name: 'TikTok' },
    { icon: 'fa-discord', url: 'https://discord.com', name: 'Discord' },
    { icon: 'fa-youtube', url: 'https://youtube.com', name: 'YouTube' },
    { icon: 'fa-facebook', url: 'https://facebook.com', name: 'Facebook' },
    { icon: 'fa-telegram', url: 'https://telegram.org', name: 'Telegram' }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="container">
          <h1>GET IN TOUCH</h1>
          <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-wrapper">
            {/* Contact Form */}
            <div className="contact-form-section">
              <div className="form-header">
                <h2>SEND US A MESSAGE</h2>
                <p>Fill out the form below and our team will get back to you within 24 hours.</p>
              </div>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What is this regarding?"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-large">
                  SEND MESSAGE
                </button>
              </form>
            </div>

            {/* Contact Info Sidebar */}
            <div className="contact-info-section">
              <div className="info-card">
                <h3>CONTACT INFORMATION</h3>
                <p>Reach out to us through any of these channels</p>

                <div className="contact-methods">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="contact-method">
                      <div className="method-icon">
                        <i className={`fas ${info.icon}`}></i>
                      </div>
                      <div className="method-content">
                        <h4>{info.title}</h4>
                        {info.link ? (
                          <a href={info.link} target={info.link.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer">
                            {info.content}
                          </a>
                        ) : (
                          <p>{info.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="info-card social-card">
                <h3>FOLLOW US</h3>
                <p>Stay connected on social media</p>
                <div className="social-grid">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label={social.name}
                    >
                      <i className={`fab ${social.icon}`}></i>
                    </a>
                  ))}
                </div>
              </div>

              <div className="info-card hours-card">
                <h3>RESPONSE TIME</h3>
                <div className="hours-info">
                  <div className="hours-item">
                    <span className="hours-label">General Inquiries:</span>
                    <span className="hours-value">24-48 hours</span>
                  </div>
                  <div className="hours-item">
                    <span className="hours-label">Tournament Support:</span>
                    <span className="hours-value">12-24 hours</span>
                  </div>
                  <div className="hours-item">
                    <span className="hours-label">Urgent Issues:</span>
                    <span className="hours-value">Within 12 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2>FREQUENTLY ASKED QUESTIONS</h2>
            <p>Quick answers to common questions</p>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h4>How do I register for tournaments?</h4>
              <p>Visit our Events page, select the tournament you want to join, and click the "Register Now" button. You'll need to create an account first if you haven't already.</p>
            </div>

            <div className="faq-item">
              <h4>Are tournaments free to enter?</h4>
              <p>Most of our tournaments are free to enter. Some premium events may have entry fees, which are clearly indicated on the event page.</p>
            </div>

            <div className="faq-item">
              <h4>What games do you support?</h4>
              <p>Currently, we host eFootball tournaments. eBasketball competitions will be launching soon. Stay tuned for updates!</p>
            </div>

            <div className="faq-item">
              <h4>How are prizes distributed?</h4>
              <p>Prizes are distributed within 7-14 business days after tournament conclusion. Winners will be contacted via email with payment details.</p>
            </div>

            <div className="faq-item">
              <h4>Can I compete from any country?</h4>
              <p>Yes! syncplay is a global platform. However, some regional restrictions may apply based on local gaming regulations.</p>
            </div>

            <div className="faq-item">
              <h4>What if I have technical issues during a match?</h4>
              <p>Contact our support team immediately via Discord or email. We have dedicated tournament admins available during all events.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Still Got Questions Section */}
      <section className="still-questions-section">
        <div className="container">
          <div className="still-questions-content">
            <div className="still-questions-header">
              <h2>{t.stillQuestions}</h2>
              <div className="decorative-line">
                <div className="line-dot"></div>
                <div className="line"></div>
                <div className="line-dot"></div>
              </div>
              <p>{t.contactDesc}</p>
            </div>
            <Link to="/contact#hero" className="btn-get-in-touch">
              {t.getInTouch}
            </Link>
          </div>

          {/* Partner Logos */}
          <div className="partners-section-contact">
            <h3 className="partners-title">{t.mediaPartner}</h3>
            <div className="partner-logos">
              <div className="partner-logo partner-logo-featured">
                <img src="/the twelfth man.jpg" alt="The Twelfth Man" />
              </div>
            </div>
            <p className="partner-description">{t.mediaPartnerDesc}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

