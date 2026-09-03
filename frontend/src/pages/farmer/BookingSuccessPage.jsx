import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const booking = JSON.parse(localStorage.getItem('fp_last_booking') || 'null');
  const [generating, setGenerating] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState(false);
  const [tokenError, setTokenError] = useState(null);

  useEffect(() => {
    if (!booking) navigate('/dashboard', { replace: true });
  }, [booking, navigate]);

  if (!booking) return null;

  const handleGenerateToken = async () => {
    setGenerating(true); setTokenError(null);
    try {
      await bookingApi.generateToken(booking.booking_id);
      setTokenGenerated(true);
    } catch (e) {
      if (e.status === 409) setTokenGenerated(true);
      else setTokenError(e.message || 'Failed to generate token. Please try again.');
    }
    finally { setGenerating(false); }
  };

  return (
    <div>
      <BookingProgress steps={SELL_STEPS} current={5} />

      {/* Success card */}
      <div className="card" style={{ textAlign: 'center', padding: '40px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>✅</div>
        <h1 style={{ color: 'var(--green-700)', marginBottom: 8, fontSize: '1.4rem' }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: 28, fontSize: '.92rem' }}>
          Your procurement slot has been successfully booked.
        </p>

        <div className="summary-card" style={{ textAlign: 'left', maxWidth: 480, margin: '0 auto', border: 'none', padding: 0, background: 'transparent' }}>
          <div className="summary-row-detail">
            <span className="label">Booking Number</span>
            <span className="value" style={{ fontFamily: 'monospace' }}>{booking.booking_number}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Quantity</span>
            <span className="value">{Number(booking.quantity_to_sell_quintals)} Quintals</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Status</span>
            <span className="value"><span className="badge badge-confirmed">{booking.booking_status}</span></span>
          </div>
        </div>
      </div>

      {/* Queue Token */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14, fontSize: '1rem', fontWeight: 700 }}>🎫 Queue Token</h3>
        {tokenGenerated ? (
          <div className="success-banner">
            Queue token generated! You can track your position in the queue.
          </div>
        ) : (
          <>
            <p style={{ fontSize: '.88rem', color: 'var(--gray-600)', marginBottom: 14 }}>
              Generate a queue token to get your position in the procurement queue.
            </p>
            {tokenError && <div className="error-banner">{tokenError}</div>}
            <button className="btn btn-primary btn-lg btn-block" onClick={handleGenerateToken} disabled={generating}>
              {generating ? 'Generating...' : '🎫 Generate Queue Token'}
            </button>
          </>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {tokenGenerated && (
          <Link to={`/queue/${booking.booking_id}`} className="btn btn-primary" style={{ flex: 1 }}>
            🎫 View Queue Position
          </Link>
        )}
        <Link to={`/booking-detail/${booking.booking_id}`} className="btn btn-outline" style={{ flex: 1 }}>
          📋 Booking Details
        </Link>
        <Link to="/dashboard" className="btn btn-secondary" style={{ flex: 1 }}>
          🏠 Dashboard
        </Link>
      </div>
    </div>
  );
}
