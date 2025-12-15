import React, { useState } from 'react';
import { saveRegistration } from '../supabaseClient';
import { getEntryFee, formatPrice } from '../utils/priceManager';
import { PAYMENT_GATEWAYS } from '../services/paymentService';
import './AdminManualRegistration.css';

const AdminManualRegistration = () => {
  const [formData, setFormData] = useState({
    teamName: '',
    player1Name: '',
    player1Email: '',
    player1Phone: '',
    player1GamerTag: '',
    player1Platform: 'PlayStation',
    player2Name: '',
    player2Email: '',
    player2Phone: '',
    player2GamerTag: '',
    player2Platform: 'PlayStation',
    paymentReference: `SP-MANUAL-${Date.now()}`,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.teamName || !formData.player1Name || !formData.player1Email || 
          !formData.player1Phone || !formData.player1GamerTag || !formData.player2Name || 
          !formData.player2Email || !formData.player2Phone || !formData.player2GamerTag) {
        throw new Error('Please fill in all required fields');
      }

      await saveRegistration(
        formData.paymentReference,
        formData,
        PAYMENT_GATEWAYS.KORA,
        getEntryFee()
      );

      setSuccess(true);
      // Reset form
      setFormData({
        teamName: '',
        player1Name: '',
        player1Email: '',
        player1Phone: '',
        player1GamerTag: '',
        player1Platform: 'PlayStation',
        player2Name: '',
        player2Email: '',
        player2Phone: '',
        player2GamerTag: '',
        player2Platform: 'PlayStation',
        paymentReference: `SP-MANUAL-${Date.now()}`,
      });

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      console.error('Manual registration error:', err);
      setError(err.message || 'Failed to save registration. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-manual-registration">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Manual Registration</h1>
          <p className="subtitle">Manually add a registration to the database</p>
          <p className="note">
            <i className="fas fa-info-circle"></i> Use this if a payment was successful but registration wasn't saved automatically.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i> Registration saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="manual-registration-form">
          <div className="form-section">
            <h3>Team Information</h3>
            <div className="form-group">
              <label>Team Name *</label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Payment Reference *</label>
              <input
                type="text"
                name="paymentReference"
                value={formData.paymentReference}
                onChange={handleChange}
                required
              />
              <small>Use the payment reference from Kora Pay or create a unique one</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Player 1 Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="player1Name"
                  value={formData.player1Name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="player1Email"
                  value={formData.player1Email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="player1Phone"
                  value={formData.player1Phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gamer Tag *</label>
                <input
                  type="text"
                  name="player1GamerTag"
                  value={formData.player1GamerTag}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Platform</label>
              <select
                name="player1Platform"
                value={formData.player1Platform}
                onChange={handleChange}
              >
                <option value="PlayStation">PlayStation</option>
                <option value="Xbox">Xbox</option>
                <option value="PC">PC</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Player 2 Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="player2Name"
                  value={formData.player2Name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="player2Email"
                  value={formData.player2Email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="player2Phone"
                  value={formData.player2Phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gamer Tag *</label>
                <input
                  type="text"
                  name="player2GamerTag"
                  value={formData.player2GamerTag}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Platform</label>
              <select
                name="player2Platform"
                value={formData.player2Platform}
                onChange={handleChange}
              >
                <option value="PlayStation">PlayStation</option>
                <option value="Xbox">Xbox</option>
                <option value="PC">PC</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminManualRegistration;

