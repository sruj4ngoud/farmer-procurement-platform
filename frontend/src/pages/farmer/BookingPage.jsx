import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { bookingApi } from '../../services/bookingApi.js';
import BookingProgress from '../../components/farmer/BookingProgress.jsx';

const SELL_STEPS = [
  { label: 'Crop' },
  { label: 'Quantity' },
  { label: 'Centre' },
  { label: 'Slot' },
  { label: 'Confirm' },
  { label: 'Queue' },
];

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${((hr - 1) % 12) + 1}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

export default function BookingPage() {
  const { setError: setAuthError } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const cultivation = JSON.parse(localStorage.getItem('fp_selected_cultivation') || 'null');
  const centre = JSON.parse(localStorage.getItem('fp_selected_centre') || 'null');
  const slot = JSON.parse(localStorage.getItem('fp_selected_slot') || 'null');

  useEffect(() => {
    if (!cultivation || !centre || !slot) navigate('/sell', { replace: true });
  }, [cultivation, centre, slot, navigate]);

  if (!cultivation || !centre || !slot) return null;

  const handleConfirm = async () => {
    setSubmitting(true); setError(null);
    try {
      const booking = await bookingApi.create({
        cultivation_id: cultivation.cultivation_id,
        centre_id: centre.centre_id,
        slot_id: slot.slot_id,
        quantity_to_sell_quintals: Number(cultivation.quantity_to_sell_quintals),
      });
      localStorage.setItem('fp_last_booking', JSON.stringify(booking));
      localStorage.removeItem('fp_selected_cultivation');
      localStorage.removeItem('fp_selected_centre');
      localStorage.removeItem('fp_selected_slot');
      navigate('/booking-success');
    } catch (e) {
      if (e.status === 401) {
        setAuthError('Session expired');
        navigate('/login', { replace: true });
      } else if (e.status === 409) {
        setError('This slot is already full. Please go back and select another slot.');
      } else if (e.status === 403) {
        setError('You do not have permission to make this booking.');
      } else {
        setError(e.message || 'Something went wrong. Please try again.');
      }
    }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <BookingProgress steps={SELL_STEPS} current={4} />

      <div className="page-header">
        <h1>✅ Confirm Booking</h1>
        <p>Review your booking details before confirming</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Crop & Quantity */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>🌾 Crop Details</h3>
        <div className="summary-row-detail">
          <span className="label">Crop</span>
          <span className="value">{cultivation.crop}</span>
        </div>
        <div className="summary-row-detail">
          <span className="label">Season</span>
          <span className="value">{cultivation.season}</span>
        </div>
        <div className="summary-row-detail">
          <span className="label">Quantity to Sell</span>
          <span className="value highlight">{Number(cultivation.quantity_to_sell_quintals)} Quintals</span>
        </div>
      </div>

      {/* Centre */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>📍 Procurement Centre</h3>
        <div className="summary-row-detail">
          <span className="label">Centre</span>
          <span className="value">{centre.centre_name}</span>
        </div>
        <div className="summary-row-detail">
          <span className="label">Location</span>
          <span className="value">{centre.village}, {centre.mandal}</span>
        </div>
        {centre.distance_km != null && (
          <div className="summary-row-detail">
            <span className="label">Distance</span>
            <span className="value">{Number(centre.distance_km).toFixed(1)} km</span>
          </div>
        )}
      </div>

      {/* Slot */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>🕐 Slot Details</h3>
        <div className="summary-row-detail">
          <span className="label">Date</span>
          <span className="value">{slot.slot_date}</span>
        </div>
        <div className="summary-row-detail">
          <span className="label">Time</span>
          <span className="value">{formatTime(slot.start_time)} — {formatTime(slot.end_time)}</span>
        </div>
        <div className="summary-row-detail">
          <span className="label">Available Spots</span>
          <span className="value">{slot.maximum_farmers - slot.booked_farmers}</span>
        </div>
      </div>

      {/* Government note */}
      <div className="info-banner" style={{ marginBottom: 24 }}>
        This is a government procurement booking. There is <strong>no payment required</strong> from you. The government will pay you after procurement is completed.
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button
          className="btn btn-primary btn-lg"
          style={{ flex: 1 }}
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? 'Creating Booking...' : '✅ Confirm Booking'}
        </button>
      </div>
    </div>
  );
}
