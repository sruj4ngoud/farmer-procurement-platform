import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Sprout, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { requestOtp, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [passbook, setPassbook] = useState('');
  const [mobile, setMobile] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await requestOtp(passbook.trim(), mobile.trim());
      navigate('/verify-otp');
    } catch {
      // error is set in AuthContext
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-icon">
          <Sprout size={20} />
        </div>
        <h1>Farmer Login</h1>
        <p>
          Sign in with your Pattadar Passbook Number and Linked Mobile Number
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <Lock size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="passbook">Passbook Number</label>
          <input
            id="passbook"
            className="form-input"
            type="text"
            placeholder="PB-2024-001"
            value={passbook}
            onChange={(e) => setPassbook(e.target.value)}
            required
            autoFocus
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobile">Mobile Number</label>
          <input
            id="mobile"
            className="form-input"
            type="tel"
            placeholder="9876543210"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            autoComplete="off"
            maxLength={10}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={loading || !passbook.trim() || !mobile.trim()}
        >
          {loading ? (
            'Sending OTP...'
          ) : (
            <>
              Continue
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <p style={{
        textAlign: 'center',
        marginTop: 20,
        fontSize: '0.78rem',
        color: 'var(--gray-400)'
      }}>
        <Lock size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
        Secured by Government of Telangana
      </p>
    </div>
  );
}
