import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { bankDetailsApi } from '../../services/bankDetailsApi.js';
import { Landmark, ShieldCheck, Lock } from 'lucide-react';

export default function BankDetails() {
  const { farmer } = useAuth();
  const [bankData, setBankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [saving, setSaving] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);

  useEffect(() => {
    bankDetailsApi.get()
      .then((d) => {
        setBankData(d);
        if (d) {
          setAccountHolder(d.account_holder_name || '');
          setAccountNumber('');
          setIfscCode('');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError(null); setSuccess('');
    if (!accountHolder.trim()) { setError('Please enter account holder name'); return; }
    if (!accountNumber.trim()) { setError('Please enter account number'); return; }
    if (accountNumber !== confirmAccount) { setError('Account numbers do not match'); return; }
    if (!ifscCode.trim()) { setError('Please enter IFSC code'); return; }

    setSaving(true);
    try {
      await bankDetailsApi.save({
        account_holder_name: accountHolder.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifscCode.trim(),
      });
      const otpRes = await bankDetailsApi.requestOtp();
      setDemoOtp(otpRes.demo_otp);
      setShowOtp(true);
    } catch (e) {
      setError(e.message || 'Failed to save bank details');
    }
    finally { setSaving(false); }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter the complete OTP'); return; }
    setError(null);
    setOtpLoading(true);
    try {
      const verified = await bankDetailsApi.verifyOtp(code);
      setBankData(verified);
      setShowOtp(false);
      setSuccess('Bank details verified successfully');
      setAccountNumber('');
      setConfirmAccount('');
      setIfscCode('');
    } catch (e) {
      setError(e.message || 'Invalid OTP. Please try again.');
    }
    finally { setOtpLoading(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1>Bank Details</h1>
        <p>Submit your bank account for receiving government procurement payments</p>
      </div>

      {error && <div className="error-banner"><Lock size={16} />{error}</div>}
      {success && <div className="success-banner"><ShieldCheck size={16} />{success}</div>}

      {/* Verified state */}
      {bankData && bankData.is_verified && (
        <div className="card" style={{ marginBottom: 20, borderLeft: '3px solid var(--black)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-800)' }}>
              Bank Account Verified
            </span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Account Holder</span>
            <span className="value">{bankData.account_holder_name}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">Account Number</span>
            <span className="value font-mono">{bankData.account_number_masked}</span>
          </div>
          <div className="summary-row-detail">
            <span className="label">IFSC Code</span>
            <span className="value font-mono">{bankData.ifsc_code_masked}</span>
          </div>
        </div>
      )}

      {/* OTP Verification */}
      {showOtp && (
        <div className="card" style={{ marginBottom: 20, borderLeft: '3px solid var(--black)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Lock size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Verify Mobile Number</span>
          </div>
          {demoOtp && (
            <div className="success-banner" style={{ marginBottom: 12 }}>
              <strong style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                {demoOtp}
              </strong>
              <small style={{ opacity: 0.8 }}> — Demo mode</small>
            </div>
          )}
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 12 }}>
            Enter the 6-digit OTP sent to {farmer?.mobile_number}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  if (!/^\d*$/.test(e.target.value)) return;
                  const newOtp = [...otp];
                  newOtp[i] = e.target.value.slice(-1);
                  setOtp(newOtp);
                  if (e.target.value && i < 5) {
                    document.getElementById(`otp-${i+1}`)?.focus();
                  }
                }}
                id={`otp-${i}`}
                className="form-input"
                style={{
                  width: 48, height: 56, textAlign: 'center',
                  fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', padding: 0,
                }}
                autoFocus={i === 0}
              />
            ))}
          </div>
          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={handleVerifyOtp}
            disabled={otpLoading || otp.join('').length !== 6}
          >
            {otpLoading ? 'Verifying...' : 'Verify & Save'}
          </button>
        </div>
      )}

      {/* Bank Form */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Landmark size={18} />
          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
            {bankData?.is_verified ? 'Update Bank Details' : 'Submit Bank Account'}
          </span>
        </div>

        <div className="form-group">
          <label>Account Holder Name</label>
          <input
            className="form-input"
            type="text"
            placeholder="Ramesh Kumar"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Account Number</label>
          <input
            className="form-input"
            type="text"
            placeholder="Enter your bank account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Confirm Account Number</label>
          <input
            className="form-input"
            type="text"
            placeholder="Re-enter account number"
            value={confirmAccount}
            onChange={(e) => setConfirmAccount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>IFSC Code</label>
          <input
            className="form-input"
            type="text"
            placeholder="SBIN0001234"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
          />
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handleSave}
          disabled={saving || showOtp}
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
