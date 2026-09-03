import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { queueApi } from '../../services/queueApi.js';

export default function QueuePage() {
  const { bookingId } = useParams();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      const data = await queueApi.getStatus(bookingId);
      setQueue(data);
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [bookingId]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading queue status...</p></div>;
  if (error) return (
    <div>
      <div className="error-banner">{error}</div>
      <Link to="/dashboard" className="btn btn-secondary">← Dashboard</Link>
    </div>
  );
  if (!queue) return null;

  const position = queue.position;
  const tokenNumber = queue.token_number;
  const farmersAhead = position != null ? Math.max(0, position - 1) : null;
  const isActive = ['WAITING', 'CALLED', 'PROCESSING'].includes(queue.queue_status);
  const isCompleted = queue.queue_status === 'COMPLETED';

  // Estimate: ~10 min per farmer ahead
  const estimatedWait = farmersAhead != null ? farmersAhead * 10 : null;

  return (
    <div>
      <div className="page-header">
        <h1>🎫 Queue Status</h1>
        <p>Your position in the procurement queue</p>
      </div>

      {/* Token display */}
      <div className="token-display" style={{ marginBottom: 24 }}>
        <div className="token-number">#{tokenNumber}</div>
        <div className="token-label">Your Queue Token</div>
        <div className="position-display">
          <div className="position-item">
            <div className="pos-value">{position != null ? position : '—'}</div>
            <div className="pos-label">Your Position</div>
          </div>
          <div className="position-item">
            <div className="pos-value" style={{ textTransform: 'capitalize' }}>
              {queue.queue_status?.toLowerCase()}
            </div>
            <div className="pos-label">Status</div>
          </div>
          {estimatedWait != null && (
            <div className="position-item">
              <div className="pos-value">~{estimatedWait}m</div>
              <div className="pos-label">Est. Wait</div>
            </div>
          )}
        </div>
      </div>

      {/* Queue progress */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 700 }}>📋 Queue Progress</h3>
        <div className="timeline">
          {['WAITING', 'CALLED', 'PROCESSING', 'COMPLETED'].map((step, i) => {
            const statusOrder = ['WAITING', 'CALLED', 'PROCESSING', 'COMPLETED'];
            const currentIdx = statusOrder.indexOf(queue.queue_status);
            const isDone = i < currentIdx || queue.queue_status === 'COMPLETED';
            const isActiveStep = statusOrder[i] === queue.queue_status && queue.queue_status !== 'COMPLETED';
            const labels = {
              WAITING: 'Waiting in Queue',
              CALLED: 'Called for Procurement',
              PROCESSING: 'Crop Weighing & Quality Check',
              COMPLETED: 'Procurement Completed',
            };
            return (
              <div className="timeline-item" key={step}>
                <div className={`timeline-dot ${isDone ? 'done' : isActiveStep ? 'active' : ''}`} />
                <h4>{labels[step]}</h4>
                {isDone && <p>✓ Completed</p>}
                {isActiveStep && <p>← Currently here</p>}
                {!isDone && !isActiveStep && <p>Pending</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Waiting notice */}
      {isActive && (
        <div className="info-banner" style={{ marginBottom: 20 }}>
          Please wait at the procurement centre. You will be called when it's your turn.
        </div>
      )}

      {isCompleted && (
        <div className="success-banner" style={{ marginBottom: 20 }}>
          Your procurement has been completed! Check your payment status.
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {isActive && (
          <button className="btn btn-primary" onClick={fetchQueue}>
            🔄 Refresh Position
          </button>
        )}
        <Link to={`/booking-detail/${bookingId}`} className="btn btn-outline">
          📋 Booking Details
        </Link>
        <Link to="/dashboard" className="btn btn-secondary">
          🏠 Dashboard
        </Link>
      </div>
    </div>
  );
}
