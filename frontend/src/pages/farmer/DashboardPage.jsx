import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { farmerApi } from '../../services/farmerApi.js';
import {
  Sprout, ArrowRight, ClipboardCheck, Clock, MapPin,
  Users, Bell, ChevronRight, CheckCircle2, Circle, Loader2
} from 'lucide-react';

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

function getJourneyIndex(status, booking) {
  switch (status) {
    case 'PENDING_ADMIN_REVIEW': return 1;
    case 'REJECTED': return 1;
    case 'ACCEPTED':
    case 'AUTO_ACCEPTED':
    case 'CONFIRMED': return 2;
    default: return 0;
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { farmer } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    farmerApi.getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading...</p></div>;
  if (error) return <div className="error-banner">{error}</div>;
  if (!data) return null;

  const activeBooking = (data.bookings || []).find(
    b => ['PENDING_ADMIN_REVIEW', 'ACCEPTED', 'AUTO_ACCEPTED', 'CONFIRMED'].includes(b.booking_status)
  );
  const notifications = data.notifications || [];
  const journeyIdx = activeBooking ? getJourneyIndex(activeBooking.booking_status, activeBooking) : -1;

  return (
    <div className="animate-fadeIn">
      {/* Welcome header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <p style={{
          fontSize: '0.78rem', fontWeight: 500, color: 'var(--gray-400)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4,
        }}>
          {getGreeting()}
        </p>
        <h1 style={{ fontSize: '2rem' }}>{data.farmer?.farmer_name || 'Farmer'}</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 4 }}>
          {data.farmer?.passbook_number}
        </p>
      </div>

      {/* Primary action */}
      <Link
        to="/sell"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--black)',
          color: 'var(--white)',
          padding: '20px 24px',
          borderRadius: 6,
          textDecoration: 'none',
          marginBottom: 24,
          transition: 'all .15s var(--ease)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Sprout size={22} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Sell Your Crop</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: 2 }}>
              Book a procurement slot and sell to the government
            </div>
          </div>
        </div>
        <ArrowRight size={20} />
      </Link>

      {/* Current Booking */}
      {activeBooking ? (
        <div className="card animate-slideUp" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h3>Current Booking</h3>
            <Link to="/my-booking" style={{
              fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-500)',
              display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none',
            }}>
              View Details <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
                Booking ID
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {activeBooking.booking_number}
              </div>
            </div>
            {activeBooking.cultivation && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
                  Crop
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {activeBooking.cultivation.crop}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
                Quantity
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {Number(activeBooking.quantity_to_sell_quintals)} Quintals
              </div>
            </div>
            {activeBooking.centre && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
                  Centre
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {activeBooking.centre.centre_name}
                </div>
              </div>
            )}
            {activeBooking.slot && (
              <>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
                    Date
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {activeBooking.slot.slot_date}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>
                    Time
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {activeBooking.slot.start_time} — {activeBooking.slot.end_time}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Token & Queue */}
          {activeBooking.token && (
            <div style={{
              marginTop: 16,
              padding: 16,
              background: 'var(--gray-100)',
              borderRadius: 6,
              display: 'flex',
              gap: 24,
              alignItems: 'center',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
                  {activeBooking.token.token_number}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Token
                </div>
              </div>
              <div style={{ width: 1, height: 40, background: 'var(--gray-300)' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {Math.max(0, (activeBooking.token.position || 1) - 1)} farmers ahead
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                  ~{Math.max(0, (activeBooking.token.position || 1) - 1) * 15} min wait
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge ${
              activeBooking.booking_status === 'PENDING_ADMIN_REVIEW' ? 'badge-pending' :
              activeBooking.booking_status === 'ACCEPTED' ? 'badge-accepted' :
              activeBooking.booking_status === 'CONFIRMED' ? 'badge-confirmed' :
              'badge-processing'
            }`}>
              {activeBooking.booking_status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="empty-state" style={{ padding: '32px 24px' }}>
            <ClipboardCheck size={32} style={{ opacity: 0.3 }} />
            <h3>No Active Booking</h3>
            <p>Start selling your crops to create a procurement booking.</p>
          </div>
        </div>
      )}

      {/* Procurement Journey */}
      {activeBooking && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h3>Procurement Journey</h3>
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
                  opacity: isDone || isCurrent ? 1 : 0.4,
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
                  {isDone && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginLeft: 'auto' }}>Done</span>
                  )}
                  {isCurrent && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginLeft: 'auto', fontWeight: 600 }}>
                      In Progress
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Updates */}
      {notifications.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <h3>Recent Updates</h3>
          </div>
          {notifications.slice(0, 3).map((n) => (
            <div key={n.notification_id} style={{
              padding: '10px 0',
              borderBottom: '1px solid var(--gray-100)',
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-800)' }}>{n.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 2 }}>{n.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
