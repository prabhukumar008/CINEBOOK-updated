import React, { useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { CITIES } from '../utils/constants';

export default function AdminSettings() {
  const { settings, updateSettings } = useBooking();

  const [formData, setFormData] = useState({
    siteName: settings.siteName || 'CINEBOOK',
    tagline: settings.tagline || 'Luxury Cinema & Box Office Discovery',
    contactEmail: settings.contactEmail || 'concierge@cinebook.demo',
    supportInfo:
      settings.supportInfo || 'Available daily from 9:00 AM to 11:00 PM IST',
    defaultCity: settings.defaultCity || 'Mumbai',
    convenienceFee: settings.convenienceFee ?? 35,
    themeAccent: settings.themeAccent || 'gold-orange',
  });
  const [savedNotice, setSavedNotice] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.siteName.trim()) {
      return;
    }
    updateSettings(formData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-1">Site Settings</h1>
        <p className="text-secondary small mb-0">
          Configure CineBook brand title, default city, support details, and
          convenience fees in LocalStorage.
        </p>
      </div>

      {savedNotice && (
        <div className="alert alert-success d-flex align-items-center gap-2 small py-2 mb-3">
          <CheckCircle2 size={16} />
          <span>Site settings updated across the storefront.</span>
        </div>
      )}

      <div className="cb-card p-4 p-md-5" style={{ maxWidth: '760px' }}>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small text-secondary">
                Website Name
              </label>
              <input
                type="text"
                className="form-control cb-input"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">
                Default City
              </label>
              <select
                className="form-select cb-select"
                value={formData.defaultCity}
                onChange={(e) =>
                  setFormData({ ...formData, defaultCity: e.target.value })
                }
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label small text-secondary">
                Brand Tagline
              </label>
              <input
                type="text"
                className="form-control cb-input"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">
                Contact Email
              </label>
              <input
                type="email"
                className="form-control cb-input"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">
                Convenience Fee per Ticket (₹)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                className="form-control cb-input"
                value={formData.convenienceFee}
                onChange={(e) =>
                  setFormData({ ...formData, convenienceFee: e.target.value })
                }
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label small text-secondary">
                Support Information
              </label>
              <input
                type="text"
                className="form-control cb-input"
                value={formData.supportInfo}
                onChange={(e) =>
                  setFormData({ ...formData, supportInfo: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small text-secondary">
                Theme Preference
              </label>
              <select
                className="form-select cb-select"
                value={formData.themeAccent}
                onChange={(e) =>
                  setFormData({ ...formData, themeAccent: e.target.value })
                }
              >
                <option value="gold-orange">
                  Midnight Navy · Champagne Gold &amp; Orange
                </option>
                <option value="classic-cinema">
                  Obsidian Charcoal · Classic Cinema
                </option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="btn cb-btn-primary d-inline-flex align-items-center gap-2 px-4"
            >
              <Save size={16} />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
