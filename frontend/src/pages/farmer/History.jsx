import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { farmerApi } from '../../services/farmerApi.js';
import { History as HistoryIcon, ChevronRight, ClipboardCheck } from 'lucide-react';

export default function History() {
  const { farmer } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    farmerApi.getDashboard()
      .then((d) => setBookings(d.bookings || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading history...</p></div>;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>History</h1>
        <p>Your previous bookings and procurement records</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {bookings.length === 0 ? (
        <div className="card empty-state" style={{ padding: '48px 24px' }}>
          <ClipboardCheck size={32} style={{ opacity: 0.3 }} />
          <h3>No History Yet</h3>
          <p>Your previous bookings will appear here.</p>
          <Link to="/sell" className="btn btn-primary" style={{ marginTop: 16 }}>Sell Crop</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Centre</th>
                <th>Status</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.booking_id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {b.cultivation?.crop || '—'}
                  </td>
                  <td>{Number(b.quantity_to_sell_quintals)} Q</td>
                  <td>{b.centre?.centre_name || '—'}</td>
                  <td>
                    <span className={`badge ${
                      b.booking_status === 'COMPLETED' ? 'badge-completed' :
                      b.booking_status === 'ACCEPTED' || b.booking_status === 'CONFIRMED' ? 'badge-confirmed' :
                      b.booking_status === 'REJECTED' ? 'badge-rejected' :
                      'badge-pending'
                    }`}>
                      {b.booking_status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    {b.payment ? (
                      <span className={`badge ${b.payment.payment_status === 'COMPLETED' ? 'badge-completed' : 'badge-pending'}`}>
                        ₹{Number(b.payment.amount_payable).toLocaleString()}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <Link to={`/booking-detail/${b.booking_id}`} style={{
                      color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 2,
                    }}>
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
