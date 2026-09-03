import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { farmerApi } from '../../services/farmerApi.js';
import { queueApi } from '../../services/queueApi.js';
import {
  ClipboardCheck, CheckCircle2, Circle, Loader2, Clock,
  AlertTriangle, XCircle, RefreshCw
} from 'lucide-react';

const STATUS_CONFIG = {
  PENDING_ADMIN_REVIEW: { icon: Clock, label: 'Pending Admin Review', color: 'var(--warning)' },
  ACCEPTED: { icon: CheckCircle2, label: 'Accepted', color: 'var(--success)' },
  REJECTED: { icon: XCircle, label: 'Rejected', color: 'var(--error)' },
  AUTO_ACCEPTED: { icon: CheckCircle2, label: 'Auto-Accepted', color: 'var(--gray-600)' },
  CONFIRMED: { icon: CheckCircle2, label: 'Confirmed', color: 'var(--gray-800)' },
  CANCELLED: { icon: XCircle, label: 'Cancelled', color: 'var(--gray-400)' },
  COMPLETED: { icon: CheckCircle2, label: 'Completed', color: 'var(--success)' },
};

const JOURNEY_STEPS = [
  'Booking Submitted',
  'Admin Review',
  'Booking Accepted',
  'Queue',
  'Crop Verification',
  'Weighing',
  'Procurement Complete',
  'Government Payment',
];

function getJourneyIndex(status) {
  switch (status) {
    case 'PENDING_ADMIN_REVIEW': return 1;
    case 'REJECTED': return 1;
    case 'ACCEPTED':
    case 'AUTO_ACCEPTED':
    case 'CONFIRMED': return 2;
    default: return 0;
  }
}

export default function MyBooking() {
  const { farmer } = useAuth();
  const [data, setData] = useState(null);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const d = await farmerApi.getDashboard();
      setData(d);
      const active = (d.bookings || []).find(
        b => ['ACCEPTED', 'AUTO_ACCEPTED', 'CONFIRMED'].includes(b.booking_status) && b.token
      );
      if (active) {
        const q = await queueApi.getStatus(active.booking_id);
        setQueue(q);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading...</p></div>;
  if (error) return <div className="error-banner">{error}</div>;

  const activeBooking = (data?.bookings || []).find(
    b => ['PENDING_ADMIN_REVIEW', 'ACCEPTED', 'AUTO_ACCEPTED', 'CONFIRMED'].includes(b.booking_status)
  );

  if (!activeBooking) {
    return (
      <div className="animate-fadeIn">
        <div className="page-header"><h1>My Booking</h1></div>
        <div className="card empty-state" style={{ padding: '48px 24px' }}>
          <ClipboardCheck size={32} style={{ opacity: 0.3 }} />
          <h3>No Active Booking</h3>
          <p>Start selling your crops to create a booking.</p>
          <Link to="/sell" className="btn btn-primary" style={{ marginTop: 16 }}>Sell Crop</Link>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[activeBooking.booking_status] || STATUS_CONFIG.CONFIRMED;
  const StatusIcon = statusInfo.icon;
  const isRejected = activeBooking.booking_status === 'REJECTED';
  const isAcceptedOrAuto = ['ACCEPTED', 'AUTO_ACCEPTED', 'CONFIRMED'].includes(activeBooking.booking_status);
  const journeyIdx = getJourneyIndex(activeBooking.booking_status);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>My Booking</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{activeBooking.booking_number}</p>
      </div>

      {/* Status banner */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 6,
        background: 'var(--gray-100)',
        border: '1px solid var(--gray-200)',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <StatusIcon size={18} style={{ color: statusInfo.color, flexShrink: 0 }} />
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-800)' }}>
          {statusInfo.label}
        </div>
      </div>

      {/* Rejection comment */}
      {isRejected && activeBooking.admin_comment && (
        <div className="error-banner" style={{ marginBottom: 16 }}>
          <AlertTriangle size={16} />
          <div>
            <div style={{ fontWeight: 700 }}>Rejection Reason</div>
            <div style={{ marginTop: 2 }}>{activeBooking.admin_comment}</div>
          </div>
        </div>
      )}

      {/* Booking Details */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h3>Booking Details</h3>
        </div>
        <div className="summary-row-detail">
          <span className="label">Booking ID</span>
          <span className="value font-mono">{activeBooking.booking_number}</span>
        </div>
        {activeBooking.centre && (
          <div className="summary-row-detail">
            <span className="label">Centre</span>
            <span className="value">{activeBooking.centre.centre_name}</span>
          </div>
        )}
        {activeBooking.slot && (
          <>
            <div className="summary-row-detail">
              <span className="label">Date</span>
              <span className="value">{activeBooking.slot.slot_date}</span>
            </div>
            <div className="summary-row-detail">
              <span className="label">Time</span>
              <span className="value">{activeBooking.slot.start_time} — {activeBooking.slot.end_time}</span>
            </div>
          </>
        )}
        {activeBooking.cultivation && (
          <div className="summary-row-detail">
            <span className="label">Crop & Quantity</span>
            <span className="value">{activeBooking.cultivation.crop} — {Number(activeBooking.quantity_to_sell_quintals)} Quintals</span>
          </div>
        )}
        {activeBooking.token && (
          <>
            <div className="summary-row-detail">
              <span className="label">Token</span>
              <span className="value" style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                #{activeBooking.token.token_number}
              </span>
            </div>
            {activeBooking.token.position != null && (
              <div className="summary-row-detail">
                <span className="label">Farmers Ahead</span>
                <span className="value">{Math.max(0, activeBooking.token.position - 1)}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Queue Display */}
      {queue && isAcceptedOrAuto && (
        <div className="token-display" style={{ marginBottom: 16 }}>
          <div className="token-number">#{queue.token_number}</div>
          <div className="token-label">Your Queue Token</div>
          <div className="position-display">
            <div className="position-item">
              <div className="pos-value">{queue.position != null ? queue.position : '—'}</div>
              <div className="pos-label">Position</div>
            </div>
            <div className="position-item">
              <div className="pos-value" style={{ textTransform: 'capitalize' }}>{queue.queue_status?.toLowerCase()}</div>
              <div className="pos-label">Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Journey Timeline */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <h3>Journey Progress</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {JOURNEY_STEPS.map((step, i) => {
            const isDone = i < journeyIdx;
            const isCurrent = i === journeyIdx;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < JOURNEY_STEPS.length - 1 ? '1px solid var(--gray-100)' : 'none',
                opacity: isDone || isCurrent ? 1 : 0.35,
              }}>
                {isDone ? (
                  <CheckCircle2 size={16} style={{ color: 'var(--black)', flexShrink: 0 }} />
                ) : isCurrent ? (
                  <Loader2 size={16} style={{ color: 'var(--black)', flexShrink: 0, animation: 'spin 2s linear infinite' }} />
                ) : (
                  <Circle size={16} style={{ color: 'var(--gray-300)', flexShrink: 0 }} />
                )}
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--black)' : isDone ? 'var(--gray-600)' : 'var(--gray-400)',
                }}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Status */}
      {activeBooking.payment && isAcceptedOrAuto && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h3>Government Payment</h3>
          </div>
          <div className="summary-row-detail">
            <span className="label">Amount</span>
            <span className="value highlight">₹{Number(activeBooking.payment.amount_payable).toLocaleString()}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Status</span>
            <span className="value">
              <span className={`badge ${activeBooking.payment.payment_status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}`}>
                {activeBooking.payment.payment_status}
              </span>
            </span>
          </div>
        </div>
      )}

      <button className="btn btn-secondary" onClick={fetchData}>
        <RefreshCw size={14} /> Refresh
      </button>
    </div>
  );
}
