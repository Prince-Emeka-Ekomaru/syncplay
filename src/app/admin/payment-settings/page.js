"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { PAYMENT_GATEWAYS } from '../../../services/paymentService';
import { clearPriceCache } from '../../../utils/priceManager';
import './AdminPaymentSettings.css';

const AdminPaymentSettings = () => {
  const [settings, setSettings] = useState({
    active_gateway: PAYMENT_GATEWAYS.KORA,
    kora_enabled: true,
  });

  const [entryFeeNaira, setEntryFeeNaira] = useState('');
  const [spectatorFeeNaira, setSpectatorFeeNaira] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
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
        if (data.entry_fee) setEntryFeeNaira((data.entry_fee / 100).toString());
        if (data.spectator_fee) setSpectatorFeeNaira((data.spectator_fee / 100).toString());
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGateway = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data: existingData } = await supabase
        .from('payment_settings')
        .select('id')
        .limit(1)
        .single();

      if (existingData) {
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
        const { error } = await supabase
          .from('payment_settings')
          .insert([{
            active_gateway: settings.active_gateway,
            kora_enabled: settings.kora_enabled,
          }]);
        if (error) throw error;
      }
      setMessage({ type: 'success', text: 'Gateway settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save gateway settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrices = async () => {
    const entryNum = parseFloat(entryFeeNaira);
    const spectatorNum = parseFloat(spectatorFeeNaira);

    if (isNaN(entryNum) || entryNum <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid registration fee.' });
      return;
    }
    if (isNaN(spectatorNum) || spectatorNum <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid spectator fee.' });
      return;
    }

    setSavingPrices(true);
    setMessage({ type: '', text: '' });

    try {
      const entryKobo = Math.round(entryNum * 100);
      const spectatorKobo = Math.round(spectatorNum * 100);

      const { data: existingData } = await supabase
        .from('payment_settings')
        .select('id')
        .limit(1)
        .single();

      if (existingData) {
        const { error } = await supabase
          .from('payment_settings')
          .update({
            entry_fee: entryKobo,
            spectator_fee: spectatorKobo,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payment_settings')
          .insert([{ entry_fee: entryKobo, spectator_fee: spectatorKobo }]);
        if (error) throw error;
      }

      // Clear price manager cache so pages reload fresh values
      clearPriceCache();

      setMessage({
        type: 'success',
        text: `Prices updated! Registration: ₦${entryNum.toLocaleString()} | Spectator: ₦${spectatorNum.toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error saving prices:', error);
      setMessage({ type: 'error', text: 'Failed to save prices: ' + error.message });
    } finally {
      setSavingPrices(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="admin-payment-settings" style={{ paddingTop: '90px' }}>
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-payment-settings" style={{ paddingTop: '90px' }}>
      <div className="admin-container">
        <div className="admin-header">
          <h1>Payment &amp; Pricing Settings</h1>
          <p className="subtitle">Set tournament fees and configure payment gateways</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{message.text}</span>
          </div>
        )}

        {/* ── Pricing Section ── */}
        <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
          <div className="setting-section">
            <h3><i className="fas fa-tag"></i> Tournament Fees</h3>
            <p className="section-description">
              Set the registration and spectator ticket prices (in Naira). Changes apply immediately to all registration pages.
            </p>

            <div className="price-inputs-grid">
              <div className="price-input-group">
                <label htmlFor="entry-fee">
                  <i className="fas fa-gamepad"></i> Registration Fee (₦)
                </label>
                <div className="price-input-wrapper">
                  <span className="currency-prefix">₦</span>
                  <input
                    id="entry-fee"
                    type="number"
                    min="1"
                    step="1"
                    value={entryFeeNaira}
                    onChange={(e) => setEntryFeeNaira(e.target.value)}
                    placeholder="e.g. 100"
                  />
                </div>
                <small>Per team (2 players) tournament entry</small>
              </div>

              <div className="price-input-group">
                <label htmlFor="spectator-fee">
                  <i className="fas fa-ticket-alt"></i> Spectator Ticket (₦)
                </label>
                <div className="price-input-wrapper">
                  <span className="currency-prefix">₦</span>
                  <input
                    id="spectator-fee"
                    type="number"
                    min="1"
                    step="1"
                    value={spectatorFeeNaira}
                    onChange={(e) => setSpectatorFeeNaira(e.target.value)}
                    placeholder="e.g. 50"
                  />
                </div>
                <small>Per spectator participation ticket</small>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSavePrices}
              disabled={savingPrices}
              style={{ marginTop: '1.25rem' }}
            >
              {savingPrices ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving Prices...</>
              ) : (
                <><i className="fas fa-save"></i> Save Prices</>
              )}
            </button>
          </div>
        </div>

        {/* ── Gateway Section ── */}
        <div className="settings-card">
          <div className="setting-section">
            <h3><i className="fas fa-toggle-on"></i> Payment Gateway</h3>
            <p className="section-description">Control which payment gateways are available</p>

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
                  <span className="toggle-description">Enable Kora Pay payment gateway</span>
                </div>
              </label>
            </div>
          </div>

          <div className="setting-section">
            <h3><i className="fas fa-info-circle"></i> Environment Variables Required</h3>
            <div className="env-vars-info">
              <div className="env-var">
                <code>NEXT_PUBLIC_KORA_PUBLIC_KEY</code>
                <span className={`status ${settings.kora_enabled ? 'required' : 'optional'}`}>
                  {settings.kora_enabled ? 'Required' : 'Optional'}
                </span>
              </div>
            </div>
            <p className="env-note">
              Make sure these are set in your <code>.env</code> file and Vercel environment variables.
            </p>
          </div>

          <div className="settings-actions">
            <button className="btn btn-primary" onClick={handleSaveGateway} disabled={saving}>
              {saving ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fas fa-save"></i> Save Gateway Settings</>
              )}
            </button>
            <button className="btn btn-secondary" onClick={loadSettings} disabled={saving}>
              <i className="fas fa-redo"></i> Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
