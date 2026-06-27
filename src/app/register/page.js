"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../translations/translations';
import { saveRegistration, supabase } from '../../supabaseClient';
import { useRegistrationCount } from '../../hooks/useRegistrationCount';
import { getEntryFee, formatPrice, resetPriceToDefault } from '../../utils/priceManager';
import { uploadPlayerPhoto, createImagePreview } from '../../utils/imageUpload';
import {
  initializePayment,
  initializePaymentGateways,
  getAvailableGateways,
  PAYMENT_GATEWAYS,
  getGatewayDisplayName,
  getGatewayIcon,
} from '../../services/paymentService';
import './Register.css';

const Register = () => {
  const router = useRouter();
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
    player1Photo: null,
    player1PhotoUrl: '',
    
    // Player 2 Information
    player2Name: '',
    player2Email: '',
    player2Phone: '',
    player2GamerTag: '',
    player2Platform: 'PlayStation',
    player2Photo: null,
    player2PhotoUrl: '',
    
    // Additional Information
    experience: 'beginner',
    agreeTerms: false,
    agreeRules: false,
  });

  const [errors, setErrors] = useState({});
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState(null);
  const [availableGateways, setAvailableGateways] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState({
    player1: null,
    player2: null
  });
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [registrationData, setRegistrationData] = useState(null); // holds team info for success screen

  // Initialize payment gateways on mount
  useEffect(() => {
    const loadPaymentGateways = async () => {
      await initializePaymentGateways(supabase);
      const gateways = getAvailableGateways();
      setAvailableGateways(gateways);
      setSelectedPaymentGateway(gateways[0] || PAYMENT_GATEWAYS.KORA);
      
      // Check and reset price if old value detected
      const currentPrice = await getEntryFee();
      // If somehow we got the old wrong price (₦100 = 10000 kobo), reset to default (₦50,000)
      if (currentPrice === 10000) {
        console.log('Detected wrong price (₦100), resetting to default (₦50,000)');
        resetPriceToDefault();
      }
    };
    loadPaymentGateways();
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

    // Prevent duplicate processing (React.StrictMode runs effects twice in dev)
    const processedKey = `kora_callback_processed_${paymentRef}`;
    if (sessionStorage.getItem(processedKey)) {
      console.log('Callback already processed, skipping:', paymentRef);
      return;
    }

    const handleCallback = async () => {
      console.log('Kora Pay callback detected:', { paymentRef, paymentGateway });
      
      // Mark as processing immediately to prevent duplicate calls
      sessionStorage.setItem(processedKey, 'true');
      
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
        let parsedFormData = null;
        try {
          parsedFormData = JSON.parse(pendingData);
          console.log('Processing registration save for:', parsedFormData.teamName);
          
          const entryFee = await getEntryFee();
          await saveRegistration(paymentRef, parsedFormData, PAYMENT_GATEWAYS.KORA, entryFee);
          
          console.log('Registration saved successfully to database!');
          setRegistrationData(parsedFormData); // store for success screen
          refresh();
          setCurrentStep(5);
          
          // Clean up session storage
          sessionStorage.removeItem('pending_registration');
          sessionStorage.removeItem('kora_payment_reference');
          sessionStorage.removeItem('kora_payment_redirect');
          sessionStorage.removeItem(processedKey);
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          // Remove processed flag on error so it can be retried if needed
          sessionStorage.removeItem(processedKey);
          
          // Log error once with structured data
          const errorInfo = {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            paymentRef,
            teamName: parsedFormData?.teamName
          };
          console.error('Error saving registration:', errorInfo);
          
          // Show detailed error to user
          const errorMsg = error.message || 'Unknown error occurred';
          alert(`Payment successful but registration save failed.\n\nError: ${errorMsg}\n\nPlease contact support with reference: ${paymentRef}\n\nTeam: ${parsedFormData?.teamName || 'Unknown'}`);
        }
      } else {
        // SessionStorage was cleared or reference mismatch
        sessionStorage.removeItem(processedKey);
        console.warn('SessionStorage mismatch or missing data:', {
          hasPendingData: !!pendingData,
          storedRef,
          paymentRef
        });
        
        // Show warning to user
        alert(`Payment callback detected but registration data not found.\n\nThis can happen if:\n- Browser session was cleared\n- Payment was completed in a different tab\n\nPayment Reference: ${paymentRef}\n\nPlease contact support with this reference to manually complete your registration.`);
      }
    };

    handleCallback();
  }, [refresh]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files && files[0]) {
      const file = files[0];
      
      // Maximum file size of 5MB (5 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; 
      if (file.size > MAX_FILE_SIZE) {
        alert(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload an image smaller than 5MB.`);
        e.target.value = ''; // Reset the file input
        return;
      }

      const playerNum = name.includes('player1') ? 'player1' : 'player2';
      
      // Create preview
      createImagePreview(file).then(preview => {
        setPhotoPreviews(prev => ({
          ...prev,
          [playerNum]: preview
        }));
      });
      
      setFormData({
        ...formData,
        [name]: file,
        [`${playerNum}PhotoUrl`]: '' // Will be set after upload
      });
      
      // Clear error for this field
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
      // Clear error for this field
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
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
      if (!formData.player1Photo && !formData.player1PhotoUrl) {
        newErrors.player1Photo = 'Professional photo is required for player profile';
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
      if (!formData.player2Photo && !formData.player2PhotoUrl) {
        newErrors.player2Photo = 'Professional photo is required for player profile';
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
      setUploadingPhotos(true);
      
      let finalFormData = { ...formData };
      
      try {
        // Upload photos before payment
        let player1PhotoUrl = formData.player1PhotoUrl;
        let player2PhotoUrl = formData.player2PhotoUrl;
        
        if (formData.player1Photo && !player1PhotoUrl) {
          console.log('Uploading Player 1 photo...');
          player1PhotoUrl = await uploadPlayerPhoto(
            formData.player1Photo,
            formData.teamName,
            'player1'
          );
          finalFormData.player1PhotoUrl = player1PhotoUrl;
        }
        
        if (formData.player2Photo && !player2PhotoUrl) {
          console.log('Uploading Player 2 photo...');
          player2PhotoUrl = await uploadPlayerPhoto(
            formData.player2Photo,
            formData.teamName,
            'player2'
          );
          finalFormData.player2PhotoUrl = player2PhotoUrl;
        }
        
        setFormData(finalFormData);
        setUploadingPhotos(false);
      } catch (error) {
        setUploadingPhotos(false);
        setPaymentLoading(false);
        alert(`Failed to upload photos: ${error.message}. Please try again.`);
        return;
      }
      
      console.log('Form validated, initializing payment...');
      console.log('Player 1 Email:', formData.player1Email);
      console.log('Team Name:', formData.teamName);
      console.log('Selected Gateway:', selectedPaymentGateway);
      
      let publicKey;
      if (selectedPaymentGateway === PAYMENT_GATEWAYS.KORA) {
        publicKey = process.env.NEXT_PUBLIC_KORA_PUBLIC_KEY;
      }

      const entryFee = await getEntryFee();
      const paymentConfig = {
        reference: `SP-${Date.now()}`,
        email: formData.player1Email,
        amount: entryFee,
        publicKey: publicKey || '',
        metadata: {
          teamName: formData.teamName,
          player1Name: formData.player1Name,
          player1Phone: formData.player1Phone,
          player2Name: formData.player2Name,
          player2Phone: formData.player2Phone,
        }
      };

      try {
        sessionStorage.setItem('pending_registration', JSON.stringify(finalFormData));
        sessionStorage.setItem('selected_gateway', selectedPaymentGateway);
        
        await initializePayment(paymentConfig, selectedPaymentGateway);
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
        <button type="button" className="btn btn-secondary" onClick={() => router.push('/events')}>
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

      <div className="form-group">
        <label htmlFor="player1Photo">
          Professional Photo <span className="required">*</span>
        </label>
        <p className="field-description">
          Upload a professional photo for your player profile. This will be used in tournament materials and player profiles.
        </p>
        <div className="photo-upload-wrapper">
          <input
            type="file"
            id="player1Photo"
            name="player1Photo"
            accept="image/*"
            onChange={handleChange}
            className={errors.player1Photo ? 'error' : ''}
          />
          {photoPreviews.player1 && (
            <div className="photo-preview">
              <img src={photoPreviews.player1} alt="Player 1 preview" />
              <button
                type="button"
                className="remove-photo"
                onClick={() => {
                  setPhotoPreviews(prev => ({ ...prev, player1: null }));
                  setFormData(prev => ({ ...prev, player1Photo: null, player1PhotoUrl: '' }));
                }}
              >
                <i className="fas fa-times"></i> Remove
              </button>
            </div>
          )}
        </div>
        {errors.player1Photo && <span className="error-message">{errors.player1Photo}</span>}
        <small>Accepted formats: JPG, PNG. Max size: 10MB</small>
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

      <div className="form-group">
        <label htmlFor="player2Photo">
          Professional Photo <span className="required">*</span>
        </label>
        <p className="field-description">
          Upload a professional photo for your player profile. This will be used in tournament materials and player profiles.
        </p>
        <div className="photo-upload-wrapper">
          <input
            type="file"
            id="player2Photo"
            name="player2Photo"
            accept="image/*"
            onChange={handleChange}
            className={errors.player2Photo ? 'error' : ''}
          />
          {photoPreviews.player2 && (
            <div className="photo-preview">
              <img src={photoPreviews.player2} alt="Player 2 preview" />
              <button
                type="button"
                className="remove-photo"
                onClick={() => {
                  setPhotoPreviews(prev => ({ ...prev, player2: null }));
                  setFormData(prev => ({ ...prev, player2Photo: null, player2PhotoUrl: '' }));
                }}
              >
                <i className="fas fa-times"></i> Remove
              </button>
            </div>
          )}
        </div>
        {errors.player2Photo && <span className="error-message">{errors.player2Photo}</span>}
        <small>Accepted formats: JPG, PNG. Max size: 10MB</small>
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
        {(photoPreviews.player1 || formData.player1PhotoUrl) && (
          <div className="review-photo">
            <img 
              src={photoPreviews.player1 || formData.player1PhotoUrl} 
              alt="Player 1" 
            />
          </div>
        )}
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
        {(photoPreviews.player2 || formData.player2PhotoUrl) && (
          <div className="review-photo">
            <img 
              src={photoPreviews.player2 || formData.player2PhotoUrl} 
              alt="Player 2" 
            />
          </div>
        )}
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
              {uploadingPhotos ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Uploading Photos...
                </>
              ) : (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing Payment...
                </>
              )}
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

      {/* Team summary */}
      {registrationData && (
        <div className="team-summary-card">
          <h3><i className="fas fa-users"></i> {registrationData.teamName}</h3>
          <div className="team-players-row">
            <div className="team-player">
              <i className="fas fa-gamepad"></i>
              <div>
                <strong>{registrationData.player1Name}</strong>
                <span>{registrationData.player1GamerTag} &middot; {registrationData.player1Platform}</span>
                <span className="player-email">{registrationData.player1Email}</span>
              </div>
            </div>
            <div className="team-player player2">
              <i className="fas fa-gamepad"></i>
              <div>
                <strong>{registrationData.player2Name}</strong>
                <span>{registrationData.player2GamerTag} &middot; {registrationData.player2Platform}</span>
                <span className="player-email">{registrationData.player2Email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="success-details">
        <div className="detail-card">
          <i className="fas fa-calendar"></i>
          <div>
            <strong>Tournament Date</strong>
            <span>Thursday, July 30, 2026</span>
          </div>
        </div>
        <div className="detail-card">
          <i className="fas fa-map-marker-alt"></i>
          <div>
            <strong>Venue</strong>
            <span>Rufus and Bee&apos;s, Twinwaters Lagos</span>
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
            <span>Check your email (both players)</span>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <h3>{t.whatNext}</h3>
        <ul>
          <li><i className="fas fa-check"></i> Both players will receive a confirmation email with team details</li>
          <li><i className="fas fa-check"></i> Player 2 ({registrationData?.player2Name || 'your teammate'}) should check their email for their copy</li>
          <li><i className="fas fa-check"></i> {t.discordInvite}</li>
          <li><i className="fas fa-check"></i> Match schedule &amp; bracket announced 1 week before tournament (July 23)</li>
          <li><i className="fas fa-check"></i> Arrive at Rufus and Bee&apos;s by 10:00 AM on July 30 for check-in</li>
          <li><i className="fas fa-gamepad"></i> Players are encouraged to bring their own controllers/pads if possible — venue controllers will be available but personal pads are recommended</li>
          <li><i className="fas fa-check"></i> {t.stayConnected}</li>
        </ul>
      </div>

      {/* Social Share */}
      <div className="social-share-section">
        <p className="share-label"><i className="fas fa-share-alt"></i> Share your registration</p>
        <div className="share-buttons">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`🎮 Just registered for the Syncplay 2v2 EA Sports FC 26 Tournament on July 30! Team: ${registrationData?.teamName || 'We are in!'}. Join us 👉 https://syncplay.co/register`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn whatsapp"
          >
            <i className="fab fa-whatsapp"></i> WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎮 Just registered for the @syncplay_co 2v2 EA FC 26 Tournament on July 30! Team ${registrationData?.teamName || ''} is coming 🔥 #Syncplay #eFootball #EAFC26`)}&url=${encodeURIComponent('https://syncplay.co/register')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn twitter"
          >
            <i className="fab fa-x-twitter"></i> Post on X
          </a>
          <button
            className="share-btn copy-link"
            onClick={() => {
              navigator.clipboard.writeText('https://syncplay.co/register');
              const btn = document.getElementById('copy-link-btn');
              if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '🔗 Copy Link'; }, 2000); }
            }}
          >
            <span id="copy-link-btn">🔗 Copy Link</span>
          </button>
        </div>
        <p className="share-instagram-hint">
          <i className="fab fa-instagram"></i> For Instagram — screenshot this page and share to your story!
        </p>
      </div>

      <div className="success-actions">
        <button className="btn btn-primary" onClick={() => router.push('/events')}>
          {t.viewAllEvents}
        </button>
        <button className="btn btn-secondary" onClick={() => router.push('/')}>
          {t.backToHome}
        </button>
      </div>
    </div>
  );

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

  if (isFull) {
    return (
      <div className="register-page">
        <section className="register-hero">
          <div className="register-hero-overlay"></div>
          <div className="container">
            <h1>{t.tournamentRegistration}</h1>
            <p>EA Sports FC 26 - 2v2 {t.tournaments} - Second Edition</p>
          </div>
        </section>
        
        <section className="register-form-section">
          <div className="container">
            <div className="registration-full-message">
              <div className="full-icon">
                <i className="fas fa-users-slash"></i>
              </div>
              <h2>Registration Full!</h2>
              <p>All {totalSlots} team slots have been filled for our Second Edition tournament on Thursday, July 30, 2026.</p>
              <p className="full-subtitle">
                Thank you for your interest! Join our waiting list to be notified about future tournaments and upcoming editions.
              </p>
              <div className="full-actions">
                <button className="btn btn-primary" onClick={() => router.push('/events')}>
                  View Tournament Details
                </button>
                <button className="btn btn-secondary" onClick={() => router.push('/contact')}>
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
      <section className="register-hero">
        <div className="register-hero-overlay"></div>
        <div className="container">
          <h1>{t.tournamentRegistration}</h1>
          <p>EA Sports FC 26 - 2v2 {t.tournaments} - Second Edition</p>
          <div className="tournament-details-hero">
            <span><i className="fas fa-calendar"></i> Thursday, July 30, 2026</span>
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

      <section className="register-form-section">
        <div className="container">
          <div className="register-form-container">
            {currentStep < 5 && renderProgressBar()}
            
            <form className="registration-form" onSubmit={(e) => e.preventDefault()}>
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
