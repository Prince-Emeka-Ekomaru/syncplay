"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations/translations';
import { saveSpectatorTicket, supabase } from '../../supabaseClient';
import { initializePayment, PAYMENT_GATEWAYS } from '../../services/paymentService';
import { getSpectatorFee } from '../../utils/priceManager';
import '../register/Register.css'; // Leverage existing form styles
import './SpectatorRegister.css';

const SpectatorRegister = () => {
  const router = useRouter();
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];

  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    ticketQuantity: 1,
  });

  const [errors, setErrors] = useState({});
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [ticketPriceKobo, setTicketPriceKobo] = useState(5000); // default ₦50

  // Load spectator fee dynamically from Supabase / priceManager
  useEffect(() => {
    getSpectatorFee().then(price => setTicketPriceKobo(price));
  }, []);

  // Handle Kora Pay callback after redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentRef = urlParams.get('ref');
    const paymentGateway = urlParams.get('payment');

    // Only process if this is a Kora callback
    if (paymentGateway !== 'kora' || !paymentRef) {
      return;
    }

    // Prevent duplicate processing
    const processedKey = `kora_spectator_processed_${paymentRef}`;
    if (sessionStorage.getItem(processedKey)) {
      console.log('Spectator callback already processed, skipping:', paymentRef);
      return;
    }

    const handleCallback = async () => {
      console.log('Spectator callback detected:', { paymentRef, paymentGateway });
      
      // Mark as processing immediately
      sessionStorage.setItem(processedKey, 'true');
      
      const pendingData = sessionStorage.getItem('pending_spectator_registration');
      const storedRef = sessionStorage.getItem('kora_payment_reference');
      const paymentType = sessionStorage.getItem('payment_type');

      if (paymentType === 'spectator' && pendingData && storedRef === paymentRef) {
        let parsedFormData = null;
        try {
          parsedFormData = JSON.parse(pendingData);
          console.log('Processing spectator ticket save for:', parsedFormData.buyerName);
          
          const totalAmount = ticketPriceKobo * parseInt(parsedFormData.ticketQuantity, 10);
          const savedData = await saveSpectatorTicket(paymentRef, parsedFormData, totalAmount);
          
          console.log('Spectator ticket saved successfully!');
          setSuccessData({
            reference: paymentRef,
            buyerName: parsedFormData.buyerName,
            buyerEmail: parsedFormData.buyerEmail,
            ticketQuantity: parsedFormData.ticketQuantity,
            amount: totalAmount,
          });
          
          // Clean up session storage
          sessionStorage.removeItem('pending_spectator_registration');
          sessionStorage.removeItem('kora_payment_reference');
          sessionStorage.removeItem('kora_payment_redirect');
          sessionStorage.removeItem('payment_type');
          sessionStorage.removeItem(processedKey);
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          sessionStorage.removeItem(processedKey);
          console.error('Error saving spectator ticket:', error);
          alert(`Payment successful but ticket registration failed.\n\nError: ${error.message || 'Unknown error'}\n\nPlease contact support with reference: ${paymentRef}`);
        }
      } else {
        sessionStorage.removeItem(processedKey);
        console.warn('SessionStorage mismatch or missing data for spectator payment.');
      }
    };

    handleCallback();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.buyerName.trim()) {
      newErrors.buyerName = 'Full Name is required';
    }
    if (!formData.buyerEmail.trim()) {
      newErrors.buyerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = 'Email is invalid';
    }
    if (!formData.buyerPhone.trim()) {
      newErrors.buyerPhone = 'Phone number is required';
    }
    const qty = parseInt(formData.ticketQuantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 10) {
      newErrors.ticketQuantity = 'You can purchase between 1 and 10 tickets';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setPaymentLoading(true);
      const totalAmount = ticketPriceKobo * parseInt(formData.ticketQuantity, 10);
      const paymentRef = `SPEC-${Date.now()}`;

      const paymentConfig = {
        reference: paymentRef,
        email: formData.buyerEmail,
        amount: totalAmount,
        publicKey: process.env.NEXT_PUBLIC_KORA_PUBLIC_KEY || process.env.REACT_APP_KORA_PUBLIC_KEY || '',
        metadata: {
          teamName: formData.buyerName, // Passed to backend mapping
        }
      };

      try {
        // Store spectator details in session storage
        sessionStorage.setItem('pending_spectator_registration', JSON.stringify(formData));
        sessionStorage.setItem('kora_payment_reference', paymentRef);
        sessionStorage.setItem('payment_type', 'spectator');

        // Redirect to Kora Pay
        await initializePayment(paymentConfig, PAYMENT_GATEWAYS.KORA);
      } catch (error) {
        console.error('Payment initialization failed:', error);
        alert(`Failed to initialize payment: ${error.message}. Please try again.`);
        setPaymentLoading(false);
      }
    }
  };

  const formatPriceNaira = (kobo) => {
    return `₦${(kobo / 100).toLocaleString()}`;
  };

  if (successData) {
    return (
      <div className="register-page">
        <div className="register-hero">
          <div className="register-hero-overlay"></div>
          <div className="container">
            <h1>Ticket Confirmed!</h1>
            <p>We are excited to see you at the tournament!</p>
          </div>
        </div>
        <div className="register-form-section">
          <div className="register-form-container">
            <div className="registration-success">
              <i className="fas fa-check-circle success-icon"></i>
              <h2>Spectator Ticket Confirmed</h2>
              <p className="success-message">
                Thank you for your purchase, <strong>{successData.buyerName}</strong>! Your spectator tickets have been secured for the tournament.
              </p>

              <div className="payment-reference">
                <p>Payment Reference: <strong>{successData.reference}</strong></p>
                <p>Tickets Purchased: <strong>{successData.ticketQuantity} Ticket(s)</strong></p>
                <p>Total Paid: <strong>{formatPriceNaira(successData.amount)}</strong></p>
                <p className="reference-note">Please present this reference number or your purchase email confirmation at the venue entrance.</p>
              </div>

              <div className="detail-card ticket-bonus-card">
                <i className="fas fa-gift"></i>
                <div>
                  <strong>Rufus & Bee's Special Perk</strong>
                  <p>Each spectator ticket includes 1 loaded <strong>Rufus & Bee's Buzz Card</strong> filled with gaming credits/chips. Collect your Buzz Cards at the venue front desk using your payment reference!</p>
                </div>
              </div>

              <div className="success-actions">
                <button className="btn btn-primary" onClick={() => router.push('/events')}>
                  Back to Events
                </button>
                <button className="btn btn-secondary" onClick={() => router.push('/')}>
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-hero animate-hero">
        <div className="register-hero-overlay"></div>
        <div className="container">
          <h1>Spectator Tickets</h1>
          <p>Join us at Rufus and Bee's, Lagos on July 29, 2026</p>
          <div className="tournament-details-hero">
            <span><i className="fas fa-calendar-alt"></i> July 29, 2026</span>
            <span><i className="fas fa-map-marker-alt"></i> Rufus and Bee's, Twinwaters Lagos</span>
            <span><i className="fas fa-ticket-alt"></i> ₦{(ticketPriceKobo / 100).toLocaleString()} / Ticket</span>
          </div>
        </div>
      </div>

      <div className="register-form-section">
        <div className="register-form-container">
          <div className="registration-step">
            <h2>Get Your Spectator Pass</h2>
            <p className="step-description">
              Experience elite gaming action, networking, and direct spectator perks including a loaded Rufus & Bee's Buzz Card.
            </p>

            <form onSubmit={handleSubmit} className="registration-form">
              <div className="form-group">
                <label htmlFor="buyerName">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="buyerName"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.buyerName ? 'error' : ''}
                  required
                />
                {errors.buyerName && <span className="error-message">{errors.buyerName}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="buyerEmail">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    id="buyerEmail"
                    name="buyerEmail"
                    value={formData.buyerEmail}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={errors.buyerEmail ? 'error' : ''}
                    required
                  />
                  {errors.buyerEmail && <span className="error-message">{errors.buyerEmail}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="buyerPhone">Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="buyerPhone"
                    name="buyerPhone"
                    value={formData.buyerPhone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={errors.buyerPhone ? 'error' : ''}
                    required
                  />
                  {errors.buyerPhone && <span className="error-message">{errors.buyerPhone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ticketQuantity">Number of Tickets <span className="required">*</span></label>
                <select
                  id="ticketQuantity"
                  name="ticketQuantity"
                  value={formData.ticketQuantity}
                  onChange={handleChange}
                  className={errors.ticketQuantity ? 'error' : ''}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n} Pass(es) - {formatPriceNaira(ticketPriceKobo * n)}</option>
                  ))}
                </select>
                {errors.ticketQuantity && <span className="error-message">{errors.ticketQuantity}</span>}
              </div>

              <div className="payment-info spec-payment-info">
                <h3><i className="fas fa-credit-card"></i> Payment Information</h3>
                <div className="payment-details">
                  <div className="payment-item">
                    <span className="payment-label">Total Amount</span>
                    <span className="payment-value">{formatPriceNaira(ticketPriceKobo * formData.ticketQuantity)}</span>
                  </div>
                  <div className="spectator-perk-badge">
                    <i className="fas fa-award"></i> Includes Rufus & Bee's Buzz Card (loaded with gaming credits) per ticket!
                  </div>
                  <p className="payment-note">
                    Payments are securely processed via <strong>Kora Pay</strong>. You will be redirected to complete the payment.
                  </p>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => router.push('/events')}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={paymentLoading}>
                  {paymentLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout <i className="fas fa-chevron-right"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectatorRegister;
