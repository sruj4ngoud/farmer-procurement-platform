import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingApi } from '../../services/bookingApi.js';

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    bookingApi.getById(bookingId)
      .then(setBooking)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading booking details...</p></div>;
  if (error) return (
    <div>
      <div className="error-banner">{error}</div>
      <Link to="/dashboard" className="btn btn-secondary">← Dashboard</Link>
    </div>
  );
  if (!booking) return null;

  const statusBadge = (s) => {
    const cls = { CONFIRMED: 'badge-confirmed', WAITING: 'badge-waiting', PROCESSING: 'badge-processing', COMPLETED: 'badge-completed', PENDING: 'badge-pending', CANCELLED: 'badge-cancelled' };
    return <span className={`badge ${cls[s] || 'badge-pending'}`}>{s}</span>;
  };

  // Build procurement status steps
  const procurementSteps = [
    { label: 'Booking Confirmed', done: true },
    { label: 'Slot Booked', done: true },
    { label: 'Waiting in Queue', done: !!booking.token && ['CALLED', 'PROCESSING', 'COMPLETED'].includes(booking.token?.queue_status) },
    { label: 'Called for Procurement', done: !!booking.token && ['PROCESSING', 'COMPLETED'].includes(booking.token?.queue_status) },
    { label: 'Crop Weighed', done: !!booking.procurement && ['QUALITY_CHECK', 'ACCEPTED', 'COMPLETED'].includes(booking.procurement?.procurement_status) },
    { label: 'Quality Verified', done: !!booking.procurement && ['ACCEPTED', 'COMPLETED'].includes(booking.procurement?.procurement_status) },
    { label: 'Procurement Completed', done: booking.procurement?.procurement_status === 'COMPLETED' },
  ];

  const currentStepIdx = procurementSteps.findIndex(s => !s.done);
  const activeStep = currentStepIdx === -1 ? procurementSteps.length - 1 : currentStepIdx;

  return (
    <div>
      <div className="page-header">
        <h1>📋 Booking Details</h1>
        <p>{booking.booking_number}</p>
      </div>

      {/* Status summary */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>Status</div>
          <div style={{ marginTop: 4 }}>{statusBadge(booking.booking_status)}</div>
        </div>
        <div>
          <div style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>Created</div>
          <div style={{ fontWeight: 600, fontSize: '.9rem', marginTop: 4 }}>{new Date(booking.created_at).toLocaleString()}</div>
        </div>
      </div>

      {/* Procurement Status Timeline */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 700 }}>📦 Procurement Status</h3>
        <div className="timeline">
          {procurementSteps.map((step, i) => (
            <div className="timeline-item" key={i}>
              <div className={`timeline-dot ${step.done ? 'done' : i === activeStep ? 'active' : ''}`} />
              <h4>{step.label}</h4>
              {step.done && <p>✓ Completed</p>}
              {!step.done && i === activeStep && <p>← In progress</p>}
              {!step.done && i !== activeStep && <p>Pending</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Cultivation */}
      {booking.cultivation && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>🌾 Cultivation</h3>
          <div className="summary-row-detail">
            <span className="label">Crop</span>
            <span className="value">{booking.cultivation.crop}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Season</span>
            <span className="value">{booking.cultivation.season}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Total Produced</span>
            <span className="value">{Number(booking.cultivation.quantity_produced_quintals)} Quintals</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Quantity to Sell</span>
            <span className="value highlight">{Number(booking.cultivation.quantity_to_sell_quintals)} Quintals</span>
          </div>
        </div>
      )}

      {/* Centre & Slot */}
      {booking.centre && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>📍 Procurement Centre</h3>
          <div className="summary-row-detail">
            <span className="label">Centre</span>
            <span className="value">{booking.centre.centre_name}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Location</span>
            <span className="value">{booking.centre.village}, {booking.centre.mandal}, {booking.centre.district}</span>
          </div>
        </div>
      )}

      {booking.slot && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>🕐 Slot</h3>
          <div className="summary-row-detail">
            <span className="label">Date</span>
            <span className="value">{booking.slot.slot_date}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Time</span>
            <span className="value">{booking.slot.start_time} — {booking.slot.end_time}</span>
          </div>
        </div>
      )}

      {/* Queue Token */}
      {booking.token && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>🎫 Queue Token</h3>
          <div className="summary-row-detail">
            <span className="label">Token Number</span>
            <span className="value" style={{ fontSize: '1.2rem' }}>#{booking.token.token_number}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Position</span>
            <span className="value">{booking.token.position != null ? booking.token.position : '—'}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Status</span>
            <span className="value">{statusBadge(booking.token.queue_status)}</span>
          </div>
        </div>
      )}

      {/* Procurement */}
      {booking.procurement && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>📦 Procurement</h3>
          <div className="summary-row-detail">
            <span className="label">Quantity Submitted</span>
            <span className="value">{Number(booking.procurement.quantity_submitted_quintals)} Quintals</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Quantity Accepted</span>
            <span className="value">{Number(booking.procurement.quantity_accepted_quintals)} Quintals</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Rate per Quintal</span>
            <span className="value">₹{Number(booking.procurement.price_per_quintal).toLocaleString()}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Status</span>
            <span className="value">{statusBadge(booking.procurement.procurement_status)}</span>
          </div>
        </div>
      )}

      {/* Government Payment */}
      {booking.payment && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 14, fontSize: '.95rem', fontWeight: 700 }}>💰 Government Payment</h3>
          <div className="summary-row-detail">
            <span className="label">Amount Payable</span>
            <span className="value highlight" style={{ fontSize: '1.15rem' }}>₹{Number(booking.payment.amount_payable).toLocaleString()}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Status</span>
            <span className="value">{statusBadge(booking.payment.payment_status)}</span>
          </div>
          {booking.payment.transaction_reference && (
            <div className="summary-row-detail">
              <span className="label">Transaction Reference</span>
              <span className="value" style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{booking.payment.transaction_reference}</span>
            </div>
          )}
          <div className="summary-row-detail">
            <span className="label">Payment Direction</span>
            <span className="value" style={{ color: 'var(--green-700)' }}>Government → Farmer</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {booking.token && (
          <Link to={`/queue/${bookingId}`} className="btn btn-primary">🎫 Queue Position</Link>
        )}
        {booking.payment && (
          <Link to={`/payment/${bookingId}`} className="btn btn-outline">💰 Payment Details</Link>
        )}
        <Link to="/dashboard" className="btn btn-secondary">← Dashboard</Link>
      </div>
    </div>
  );
}
