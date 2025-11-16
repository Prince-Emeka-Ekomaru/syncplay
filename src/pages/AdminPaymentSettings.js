import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PAYMENT_GATEWAYS } from '../services/paymentService';
import './AdminPaymentSettings.css';

const AdminPaymentSettings = () => {
  const [settings, setSettings] = useState({
    active_gateway: PAYMENT_GATEWAYS.KORA,
    kora_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } else if (data) {
        setSettings({
          active_gateway: data.active_gateway || PAYMENT_GATEWAYS.KORA,
          kora_enabled: data.kora_enabled !== false,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // First, try to update existing settings
      const { data: existingData } = await supabase
        .from('payment_settings')
        .select('id')
        .limit(1)
        .single();

      if (existingData) {
        // Update existing
        const { error } = await supabase
          .from('payment_settings')
          .update({
            active_gateway: settings.active_gateway,
            kora_enabled: settings.kora_enabled,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('payment_settings')
          .insert([
            {
              active_gateway: settings.active_gateway,
              kora_enabled: settings.kora_enabled,
            },
          ]);

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save settings. Please check your Supabase permissions.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  if (loading) {
    return (
      <div className="admin-payment-settings">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-payment-settings">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Payment Gateway Settings</h1>
          <p className="subtitle">Configure which payment methods are available to users</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            <i
              className={`fas ${
                message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'
              }`}
            ></i>
            <span>{message.text}</span>
          </div>
        )}

        <div className="settings-card">
          <div className="setting-section">
            <h3>
              <i className="fas fa-toggle-on"></i> Enable/Disable Payment Gateways
            </h3>
            <p className="section-description">
              Control which payment gateways users can see and use
            </p>

            <div className="gateway-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.kora_enabled}
                  onChange={(e) => handleChange('kora_enabled', e.target.checked)}
                />
                <div className="toggle-content">
                  <div className="toggle-header">
                    <i className="fas fa-credit-card"></i>
                    <span className="toggle-name">Kora Pay</span>
                  </div>
                  <span className="toggle-description">
                    Enable Kora Pay payment gateway
                  </span>
                </div>
              </label>
            </div>

          </div>

          <div className="setting-section">
            <h3>
              <i className="fas fa-star"></i> Default Payment Gateway
            </h3>
            <p className="section-description">
              Kora Pay is the only payment gateway available
            </p>

            <div className="default-gateway-selector">
              <label className="radio-option">
                <input
                  type="radio"
                  name="active_gateway"
                  value={PAYMENT_GATEWAYS.KORA}
                  checked={settings.active_gateway === PAYMENT_GATEWAYS.KORA}
                  onChange={(e) => handleChange('active_gateway', e.target.value)}
                  disabled={!settings.kora_enabled}
                />
                <div className="radio-content">
                  <i className="fas fa-credit-card"></i>
                  <span>Kora Pay</span>
                </div>
              </label>
            </div>
          </div>

          <div className="setting-section">
            <h3>
              <i className="fas fa-info-circle"></i> Environment Variables Required
            </h3>
            <div className="env-vars-info">
              <div className="env-var">
                <code>REACT_APP_KORA_PUBLIC_KEY</code>
                <span className={`status ${settings.kora_enabled ? 'required' : 'optional'}`}>
                  {settings.kora_enabled ? 'Required' : 'Optional'}
                </span>
              </div>
            </div>
            <p className="env-note">
              Make sure these are set in your <code>.env</code> file and Vercel environment
              variables.
            </p>
          </div>

          <div className="settings-actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Settings
                </>
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={loadSettings}
              disabled={saving}
            >
              <i className="fas fa-redo"></i> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;

