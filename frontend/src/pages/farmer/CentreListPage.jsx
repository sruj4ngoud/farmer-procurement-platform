import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { centreApi } from '../../services/centreApi.js';
import BookingProgress from '../../components/farmer/BookingProgress.jsx';

const SELL_STEPS = [
  { label: 'Crop' },
  { label: 'Quantity' },
  { label: 'Centre' },
  { label: 'Slot' },
  { label: 'Confirm' },
  { label: 'Queue' },
];

export default function CentreListPage() {
  const { farmer } = useAuth();
  const navigate = useNavigate();
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!farmer?.passbook_number) return;
    centreApi.nearby(farmer.passbook_number)
      .then(setCentres)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [farmer]);

  const handleSelectCentre = (centre) => {
    setSelectedId(centre.centre_id);
    localStorage.setItem('fp_selected_centre', JSON.stringify(centre));
    navigate(`/centres/${centre.centre_id}/slots`);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Finding nearby procurement centres...</p></div>;

  return (
    <div>
      <BookingProgress steps={SELL_STEPS} current={2} />

      <div className="page-header">
        <h1>📍 Nearby Procurement Centres</h1>
        <p>Select a procurement centre near you</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {centres.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📍</div>
          <h3>No centres found nearby</h3>
          <p>Ensure your location is registered in your profile. Contact your agricultural office for assistance.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {centres.map((c) => {
            const dist = c.distance_km != null ? Number(c.distance_km).toFixed(1) : null;
            const isFull = c.current_status === 'FULL';
            const isLimited = c.current_status === 'LIMITED';
            const isSelected = selectedId === c.centre_id;
            return (
              <div
                className={`centre-card ${isSelected ? 'selected' : ''}`}
                key={c.centre_id}
                style={{ opacity: isFull ? 0.55 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}
                onClick={() => !isFull && handleSelectCentre(c)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="centre-name">{c.centre_name}</div>
                    <div className="centre-location">{c.village}, {c.mandal}, {c.district}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--gray-500)', marginTop: 4 }}>Agency: {c.agency}</div>
                    {dist != null && (
                      <div className="centre-distance">📍 {dist} km away</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className={`badge ${isFull ? 'badge-full' : isLimited ? 'badge-limited' : 'badge-active'}`}>
                      {isFull ? 'FULL' : isLimited ? 'LIMITED' : 'ACTIVE'}
                    </span>
                    {!isFull && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleSelectCentre(c); }}
                      >
                        Select →
                      </button>
                    )}
                    {isFull && (
                      <span style={{ fontSize: '.8rem', color: 'var(--red-500)', fontWeight: 500 }}>
                        Centre unavailable or full
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={() => navigate('/sell/summary')}>
          ← Back to Summary
        </button>
      </div>
    </div>
  );
}
