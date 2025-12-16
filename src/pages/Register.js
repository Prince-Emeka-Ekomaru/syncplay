import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations/translations';
import { saveRegistration, supabase } from '../supabaseClient';
import { useRegistrationCount } from '../hooks/useRegistrationCount';
import { getEntryFee, formatPrice } from '../utils/priceManager';
import {
  initializePayment,
  initializePaymentGateways,
  getAvailableGateways,
  getActiveGateway,
  PAYMENT_GATEWAYS,
  getGatewayDisplayName,
  getGatewayIcon,
} from '../services/paymentService';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];

  const [currentStep, setCurrentStep] = useState(1);
  const { slotsRemaining, totalSlots, isFull, loading: isLoading, refresh } = useRegistrationCount(true, 10000); // Poll every 10 seconds
  const [formData, setFormData] = useState({
    // Team Information
    teamName: '',
    
    // Player 1 Information
    player1Name: '',
    player1Email: '',
    player1Phone: '',
    player1GamerTag: '',
    player1Platform: 'PlayStation',
    
    // Player 2 Information
    player2Name: '',
    player2Email: '',
    player2Phone: '',
    player2GamerTag: '',
    player2Platform: 'PlayStation',
    
    // Additional Information
    experience: 'beginner',
    agreeTerms: false,
    agreeRules: false,
  });

  const [errors, setErrors] = useState({});
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState(null);
  const [availableGateways, setAvailableGateways] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Initialize payment gateways on mount
  useEffect(() => {
    const loadPaymentGateways = async () => {
      await initializePaymentGateways(supabase);
      const gateways = getAvailableGateways();
      setAvailableGateways(gateways);
      setSelectedPaymentGateway(gateways[0] || PAYMENT_GATEWAYS.KORA);
    };
    loadPaymentGateways();
  }, []);

  // Handle Kora Pay callback after redirect
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentRef = urlParams.get('ref');
      const paymentGateway = urlParams.get('payment');

      if (paymentGateway === 'kora' && paymentRef) {
        console.log('Kora Pay callback detected:', { paymentRef, paymentGateway });
        
        // Check if we have pending registration data
        const pendingData = sessionStorage.getItem('pending_registration');
        const storedRef = sessionStorage.getItem('kora_payment_reference');

        console.log('SessionStorage check:', {
          hasPendingData: !!pendingData,
          storedRef,
          paymentRef,
          match: storedRef === paymentRef
        });

        if (pendingData && storedRef === paymentRef) {
          try {
            const formData = JSON.parse(pendingData);
            console.log('Processing registration save for:', formData.teamName);
            
            // Verify payment with Kora (you should verify on backend)
            // For now, we'll assume payment was successful if we got redirected back
            // In production, verify payment status via Kora API
            
            const entryFee = await getEntryFee();
            saveRegistration(paymentRef, formData, PAYMENT_GATEWAYS.KORA, entryFee)
            .then((result) => {
              console.log('Registration saved successfully to database!', result);
              refresh();
              setCurrentStep(5);
              
              // Clean up session storage
              sessionStorage.removeItem('pending_registration');
              sessionStorage.removeItem('kora_payment_reference');
              sessionStorage.removeItem('kora_payment_redirect');
              
              // Clean URL
              window.history.replaceState({}, document.title, window.location.pathname);
            })
            .catch((error) => {
              console.error('Error saving registration:', error);
              console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
              });
              
              // Show detailed error to user
              const errorMsg = error.message || 'Unknown error occurred';
              alert(`Payment successful but registration save failed.\n\nError: ${errorMsg}\n\nPlease contact support with reference: ${paymentRef}\n\nTeam: ${formData.teamName}`);
            });
          } catch (error) {
            console.error('Error processing Kora callback:', error);
            alert('Error processing payment callback. Please contact support with reference: ' + paymentRef);
          }
        } else {
          // SessionStorage was cleared or reference mismatch
          console.warn('SessionStorage mismatch or missing data:', {
            hasPendingData: !!pendingData,
            storedRef,
            paymentRef
          });
          
          // Show warning to user
          alert(`Payment callback detected but registration data not found.\n\nThis can happen if:\n- Browser session was cleared\n- Payment was completed in a different tab\n\nPayment Reference: ${paymentRef}\n\nPlease contact support with this reference to manually complete your registration.`);
        }
      }
    };

    handleCallback();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.teamName.trim()) {
        newErrors.teamName = 'Team name is required';
      }
    }

    if (step === 2) {
      if (!formData.player1Name.trim()) {
        newErrors.player1Name = 'Player name is required';
      }
      if (!formData.player1Email.trim()) {
        newErrors.player1Email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.player1Email)) {
        newErrors.player1Email = 'Email is invalid';
      }
      if (!formData.player1Phone.trim()) {
        newErrors.player1Phone = 'Phone number is required';
      }
      if (!formData.player1GamerTag.trim()) {
        newErrors.player1GamerTag = 'Gamer tag is required';
      }
    }

    if (step === 3) {
      if (!formData.player2Name.trim()) {
        newErrors.player2Name = 'Player name is required';
      }
      if (!formData.player2Email.trim()) {
        newErrors.player2Email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.player2Email)) {
        newErrors.player2Email = 'Email is invalid';
      }
      if (!formData.player2Phone.trim()) {
        newErrors.player2Phone = 'Phone number is required';
      }
      if (!formData.player2GamerTag.trim()) {
        newErrors.player2GamerTag = 'Gamer tag is required';
      }
    }

    if (step === 4) {
      if (!formData.agreeTerms) {
        newErrors.agreeTerms = 'You must agree to the terms and conditions';
      }
      if (!formData.agreeRules) {
        newErrors.agreeRules = 'You must agree to the tournament rules';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(4)) {
      if (!selectedPaymentGateway) {
        alert('Please select a payment method');
        return;
      }

      setPaymentLoading(true);
      console.log('Form validated, initializing payment...');
      console.log('Player 1 Email:', formData.player1Email);
      console.log('Team Name:', formData.teamName);
      console.log('Selected Gateway:', selectedPaymentGateway);
      
      // Get the appropriate public key based on selected gateway
      // Note: Kora Pay uses backend API, so public key is optional
      let publicKey;
      if (selectedPaymentGateway === PAYMENT_GATEWAYS.KORA) {
        publicKey = process.env.REACT_APP_KORA_PUBLIC_KEY;
        // Kora Pay uses backend API, so we don't need public key check
        // But we'll still pass it if available for future use
      }

      // Only check for public key if gateway requires it (not needed for Kora Pay backend API)
      // if (!publicKey && selectedPaymentGateway !== PAYMENT_GATEWAYS.KORA) {
      //   alert(`Payment gateway not configured. Please contact support.`);
      //   setPaymentLoading(false);
      //   return;
      // }

      // Create payment configuration
      // Get entry fee asynchronously
      const entryFee = await getEntryFee();
      const paymentConfig = {
        reference: `SP-${Date.now()}`,
        email: formData.player1Email,
        amount: entryFee, // Dynamic entry fee in kobo
        publicKey: publicKey || '', // Optional for Kora Pay
        metadata: {
          teamName: formData.teamName,
          player1Name: formData.player1Name,
          player1Phone: formData.player1Phone,
          player2Name: formData.player2Name,
          player2Phone: formData.player2Phone,
        }
      };

      try {
        // For Kora Pay, it redirects, so we handle it differently
        // Store form data in sessionStorage for after redirect
        sessionStorage.setItem('pending_registration', JSON.stringify(formData));
        sessionStorage.setItem('selected_gateway', selectedPaymentGateway);
        
        // Initialize payment using the payment service
        // This will redirect to Kora Pay checkout
        await initializePayment(paymentConfig, selectedPaymentGateway);
        
        // Note: For Kora Pay, redirect happens, so we don't reach here
        // The callback will be handled when user returns via URL params
      } catch (error) {
        console.error('Payment error:', error);
        if (error.message !== 'Payment window closed') {
          alert(`Payment failed: ${error.message}. Please try again.`);
        }
        setPaymentLoading(false);
      }
    }
  };

  const renderProgressBar = () => (
    <div className="registration-progress">
      <div className="progress-steps">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`progress-step ${currentStep >= step ? 'active' : ''} ${
              currentStep > step ? 'completed' : ''
            }`}
          >
            <div className="step-circle">
              {currentStep > step ? <i className="fas fa-check"></i> : step}
            </div>
            <div className="step-label">
              {step === 1 && t.teamInfo}
              {step === 2 && t.player1}
              {step === 3 && t.player2}
              {step === 4 && t.review}
            </div>
          </div>
        ))}
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="registration-step">
      <h2>{t.teamInformation}</h2>
      <p className="step-description">{t.chooseTeamName}</p>

      <div className="form-group">
        <label htmlFor="teamName">
          {t.teamName} <span className="required">*</span>
        </label>
        <input
          type="text"
          id="teamName"
          name="teamName"
          value={formData.teamName}
          onChange={handleChange}
          placeholder={t.enterTeamName}
          className={errors.teamName ? 'error' : ''}
        />
        {errors.teamName && <span className="error-message">{errors.teamName}</span>}
        <small>{t.teamDisplayName}</small>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/events')}>
          {t.cancel}
        </button>
        <button type="button" className="btn btn-primary" onClick={nextStep}>
          {t.next} <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="registration-step">
      <h2>{t.playerInformation} 1</h2>
      <p className="step-description">{t.enterPlayer1Details}</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="player1Name">
            {t.fullName} <span className="required">*</span>
          </label>
          <input
            type="text"
            id="player1Name"
            name="player1Name"
            value={formData.player1Name}
            onChange={handleChange}
            placeholder={t.enterFullName}
            className={errors.player1Name ? 'error' : ''}
          />
          {errors.player1Name && <span className="error-message">{errors.player1Name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="player1GamerTag">
            {t.gamerTag} / PSN ID <span className="required">*</span>
          </label>
          <input
            type="text"
            id="player1GamerTag"
            name="player1GamerTag"
            value={formData.player1GamerTag}
            onChange={handleChange}
            placeholder={t.enterGamerTag}
            className={errors.player1GamerTag ? 'error' : ''}
          />
          {errors.player1GamerTag && <span className="error-message">{errors.player1GamerTag}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="player1Email">
            {t.emailAddress} <span className="required">*</span>
          </label>
          <input
            type="email"
            id="player1Email"
            name="player1Email"
            value={formData.player1Email}
            onChange={handleChange}
            placeholder={t.enterEmail}
            className={errors.player1Email ? 'error' : ''}
          />
          {errors.player1Email && <span className="error-message">{errors.player1Email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="player1Phone">
            {t.phone} <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="player1Phone"
            name="player1Phone"
            value={formData.player1Phone}
            onChange={handleChange}
            placeholder={t.enterPhone}
            className={errors.player1Phone ? 'error' : ''}
          />
          {errors.player1Phone && <span className="error-message">{errors.player1Phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="player1Platform">
          {t.platform} <span className="required">*</span>
        </label>
        <div className="platform-display">
          <i className="fab fa-playstation"></i>
          <span>PlayStation</span>
        </div>
        <input
          type="hidden"
          id="player1Platform"
          name="player1Platform"
          value="PlayStation"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={prevStep}>
          <i className="fas fa-arrow-left"></i> {t.back}
        </button>
        <button type="button" className="btn btn-primary" onClick={nextStep}>
          {t.next} <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="registration-step">
      <h2>{t.playerInformation} 2</h2>
      <p className="step-description">{t.enterPlayer2Details}</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="player2Name">
            {t.fullName} <span className="required">*</span>
          </label>
          <input
            type="text"
            id="player2Name"
            name="player2Name"
            value={formData.player2Name}
            onChange={handleChange}
            placeholder={t.enterFullName}
            className={errors.player2Name ? 'error' : ''}
          />
          {errors.player2Name && <span className="error-message">{errors.player2Name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="player2GamerTag">
            {t.gamerTag} / PSN ID <span className="required">*</span>
          </label>
          <input
            type="text"
            id="player2GamerTag"
            name="player2GamerTag"
            value={formData.player2GamerTag}
            onChange={handleChange}
            placeholder={t.enterGamerTag}
            className={errors.player2GamerTag ? 'error' : ''}
          />
          {errors.player2GamerTag && <span className="error-message">{errors.player2GamerTag}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="player2Email">
            {t.emailAddress} <span className="required">*</span>
          </label>
          <input
            type="email"
            id="player2Email"
            name="player2Email"
            value={formData.player2Email}
            onChange={handleChange}
            placeholder={t.enterEmail}
            className={errors.player2Email ? 'error' : ''}
          />
          {errors.player2Email && <span className="error-message">{errors.player2Email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="player2Phone">
            {t.phone} <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="player2Phone"
            name="player2Phone"
            value={formData.player2Phone}
            onChange={handleChange}
            placeholder={t.enterPhone}
            className={errors.player2Phone ? 'error' : ''}
          />
          {errors.player2Phone && <span className="error-message">{errors.player2Phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="player2Platform">
          {t.platform} <span className="required">*</span>
        </label>
        <div className="platform-display">
          <i className="fab fa-playstation"></i>
          <span>PlayStation</span>
        </div>
        <input
          type="hidden"
          id="player2Platform"
          name="player2Platform"
          value="PlayStation"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={prevStep}>
          <i className="fas fa-arrow-left"></i> {t.back}
        </button>
        <button type="button" className="btn btn-primary" onClick={nextStep}>
          {t.next} <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="registration-step">
      <h2>{t.reviewRegistration}</h2>
      <p className="step-description">{t.confirmDetails}</p>

      <div className="review-section">
        <h3><i className="fas fa-users"></i> {t.teamDetails}</h3>
        <div className="review-item">
          <span className="review-label">{t.teamName}:</span>
          <span className="review-value">{formData.teamName}</span>
        </div>
      </div>

      <div className="review-section">
        <h3><i className="fas fa-user"></i> {t.player1Details}</h3>
        <div className="review-item">
          <span className="review-label">{t.fullName}:</span>
          <span className="review-value">{formData.player1Name}</span>
        </div>
        <div className="review-item">
          <span className="review-label">{t.gamerTag}:</span>
          <span className="review-value">{formData.player1GamerTag}</span>
        </div>
        <div className="review-item">
          <span className="review-label">{t.emailAddress}:</span>
          <span className="review-value">{formData.player1Email}</span>
        </div>
        <div className="review-item">
          <span className="review-label">{t.phone}:</span>
          <span className="review-value">{formData.player1Phone}</span>
        </div>
        <div className="review-item">
          <span className="review-label">{t.platform}:</span>
          <span className="review-value">{formData.player1Platform}</span>
        </div>
      </div>

      <div className="review-section">
        <h3><i className="fas fa-user"></i> {t.player2Details}</h3>
        <div className="review-item">
          <span className="review-label">{t.fullName}:</span>
          <span className="review-value">{formData.player2Name}</span>
        </div>
        <div className="review-item">
          <span className="review-label">{t.gamerTag}:</span>
          <span className="review-value">{formData.player2GamerTag}</span>
        </div>
        <div className="review-item">
          <span className="review-label">{t.emailAddress}:</span>
          <span className="review-value">{formData.player2Email}</span>
        </div>
        <div className="review-item">
          <span className="review-label">{t.phone}:</span>
          <span className="review-value">{formData.player2Phone}</span>
        </div>
        <div className="review-item">
          <span className="review-label">{t.platform}:</span>
          <span className="review-value">{formData.player2Platform}</span>
        </div>
      </div>

      <div className="payment-info">
        <h3><i className="fas fa-money-bill-wave"></i> Payment Information</h3>
        <div className="payment-details">
          <div className="payment-item">
            <span className="payment-label">{t.entryFee}:</span>
            <span className="payment-value">{formatPrice()} <span className="subsidized-badge">(Subsidized)</span></span>
          </div>
          
          {/* Payment Gateway Selection */}
          {availableGateways.length > 1 && (
            <div className="payment-gateway-selector">
              <label className="payment-gateway-label">
                <i className="fas fa-credit-card"></i> Select Payment Method:
              </label>
              <div className="gateway-options">
                {availableGateways.map((gateway) => (
                  <div
                    key={gateway}
                    className={`gateway-option ${
                      selectedPaymentGateway === gateway ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedPaymentGateway(gateway)}
                  >
                    <i className={getGatewayIcon(gateway)}></i>
                    <span>{getGatewayDisplayName(gateway)}</span>
                    {selectedPaymentGateway === gateway && (
                      <i className="fas fa-check-circle check-icon"></i>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <p className="payment-note">
            <strong>Note:</strong> You will be redirected to {selectedPaymentGateway ? getGatewayDisplayName(selectedPaymentGateway) : 'the payment gateway'} to complete your payment securely. 
            Your spot will be confirmed immediately after successful payment.
          </p>
        </div>
      </div>

      <div className="terms-section">
        <div className="form-group checkbox-group">
          <label className={errors.agreeTerms ? 'error' : ''}>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
            />
            <span>{t.iAgree} <a href="/terms" target="_blank">{t.termsAndConditions}</a></span>
          </label>
          {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
        </div>

        <div className="form-group checkbox-group">
          <label className={errors.agreeRules ? 'error' : ''}>
            <input
              type="checkbox"
              name="agreeRules"
              checked={formData.agreeRules}
              onChange={handleChange}
            />
            <span>{t.iAgree} <a href="/tournament-rules" target="_blank">{t.tournamentRules}</a></span>
          </label>
          {errors.agreeRules && <span className="error-message">{errors.agreeRules}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={prevStep}>
          <i className="fas fa-arrow-left"></i> {t.back}
        </button>
        <button 
          type="submit" 
          className="btn btn-primary btn-large" 
          onClick={handleSubmit}
          disabled={paymentLoading}
        >
          {paymentLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Processing Payment...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i> {t.submitRegistration}
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="registration-success">
      <div className="success-icon">
        <i className="fas fa-check-circle"></i>
      </div>
      <h2>{t.registrationSuccessful}</h2>
      <p className="success-message">
        {t.thankYou}
      </p>
      
      <div className="success-details">
        <div className="detail-card">
          <i className="fas fa-calendar"></i>
          <div>
            <strong>Tournament Date</strong>
            <span>December 20, 2025</span>
          </div>
        </div>
        <div className="detail-card">
          <i className="fas fa-trophy"></i>
            <div>
              <strong>{t.prizePoolLabel}</strong>
              <span>{t.exclusivePrizePoolShort}</span>
            </div>
        </div>
        <div className="detail-card">
          <i className="fas fa-check-circle"></i>
          <div>
            <strong>{t.paymentCompleted}</strong>
            <span>{formatPrice()} <span className="subsidized-badge">(Subsidized)</span></span>
          </div>
        </div>
        <div className="detail-card">
          <i className="fas fa-envelope"></i>
          <div>
            <strong>Confirmation Sent</strong>
            <span>Check your email</span>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <h3>{t.whatNext}</h3>
        <ul>
          <li><i className="fas fa-check"></i> {t.confirmationEmail}</li>
          <li><i className="fas fa-check"></i> {t.discordInvite}</li>
          <li><i className="fas fa-check"></i> {t.scheduleAnnouncement}</li>
          <li><i className="fas fa-check"></i> {t.stayConnected}</li>
        </ul>
      </div>

      <div className="success-actions">
        <button className="btn btn-primary" onClick={() => navigate('/events')}>
          {t.viewAllEvents}
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          {t.backToHome}
        </button>
      </div>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="register-page">
        <section className="register-hero">
          <div className="register-hero-overlay"></div>
          <div className="container">
            <h1>Loading...</h1>
            <p><i className="fas fa-spinner fa-spin"></i> Checking available slots...</p>
          </div>
        </section>
      </div>
    );
  }

  // Show full message if registration is full
  if (isFull) {
    return (
      <div className="register-page">
        <section className="register-hero">
          <div className="register-hero-overlay"></div>
          <div className="container">
            <h1>{t.tournamentRegistration}</h1>
            <p>EA Sports FC 26 - 2v2 {t.tournaments}</p>
          </div>
        </section>
        
        <section className="register-form-section">
          <div className="container">
            <div className="registration-full-message">
              <div className="full-icon">
                <i className="fas fa-users-slash"></i>
              </div>
              <h2>Registration Full!</h2>
              <p>All {totalSlots} team slots have been filled for our inaugural tournament.</p>
              <p className="full-subtitle">
                Thank you for your interest! Join our waiting list to be notified about future tournaments.
              </p>
              <div className="full-actions">
                <button className="btn btn-primary" onClick={() => navigate('/events')}>
                  View Tournament Details
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/contact')}>
                  Join Waiting List
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="register-page">
      {/* Hero Section */}
      <section className="register-hero">
        <div className="register-hero-overlay"></div>
        <div className="container">
          <h1>{t.tournamentRegistration}</h1>
          <p>EA Sports FC 26 - 2v2 {t.tournaments}</p>
          <div className="tournament-details-hero">
            <span><i className="fas fa-calendar"></i> December 20, 2025</span>
            <span><i className="fas fa-trophy"></i> {t.exclusivePrizePoolShort}</span>
            <span><i className="fas fa-money-bill-wave"></i> {formatPrice()} {t.entryFee} <span className="subsidized-badge">(Subsidized)</span></span>
            <span className={slotsRemaining <= 5 ? 'slots-warning' : ''}>
              <i className="fas fa-users"></i> {slotsRemaining === 0 ? t.slotsUrgencyFull : t.slotsUrgencyMessage}
            </span>
          </div>
          {slotsRemaining > 0 && (
            <div className="slots-alert">
              <i className="fas fa-exclamation-triangle"></i> {t.slotsUrgencyAlert}
            </div>
          )}
        </div>
      </section>

      {/* Registration Form */}
      <section className="register-form-section">
        <div className="container">
          <div className="register-form-container">
            {currentStep < 5 && renderProgressBar()}
            
            <form className="registration-form">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderSuccess()}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;

