import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { farmerApi } from '../../services/farmerApi.js';
import { cultivationApi } from '../../services/cultivationApi.js';
import { mspApi } from '../../services/mspApi.js';
import { cropApi } from '../../services/cropApi.js';

import BookingProgress from '../../components/farmer/BookingProgress.jsx';

const SELL_STEPS = [
  { label: 'Land' },
  { label: 'Crop' },
  { label: 'Quantity' },
  { label: 'Centre' },
  { label: 'Slot' },
  { label: 'Confirm' },
];

export default function SellCrop() {
  const { farmer } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Farmer data
  const [totalLand, setTotalLand] = useState(0);
  const [farmerData, setFarmerData] = useState(null);

  // Crops from API
  const [allCrops, setAllCrops] = useState([]);
  const [cropCategories, setCropCategories] = useState([]);

  // Step 1: Land
  const [cultivatedArea, setCultivatedArea] = useState('');

  // Step 2: Crop
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);

  // Step 3: Quantity + MSP
  const [quantityToSell, setQuantityToSell] = useState('');
  const [msp, setMsp] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load farmer data + crops from API
  useEffect(() => {
    Promise.all([
      farmerApi.getDashboard(),
      cropApi.getActiveCrops(),
      cropApi.getCategories(),
    ])
      .then(([dashData, cropsData, catsData]) => {
        setFarmerData(dashData);
        setTotalLand(Number(dashData.farmer?.total_land_acres || 0));
        setAllCrops(cropsData);
        setCropCategories(catsData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Load MSP from crop data when selected
  useEffect(() => {
    if (selectedCrop) {
      setMsp(selectedCrop.msp_per_quintal || null);
    }
  }, [selectedCrop]);

  const filteredCrops = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allCrops.filter((c) => {
      if (selectedCategory && c.category !== selectedCategory) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
    });
  }, [searchQuery, selectedCategory, allCrops]);

  const estimatedPayment = msp && quantityToSell ? (parseFloat(quantityToSell) * msp) : 0;

  if (loading) return <div className="loading-spinner"><div className="spinner" /><p>Loading...</p></div>;

  // Step 1: Land
  if (step === 1) {
    return (
      <div>
        <BookingProgress steps={SELL_STEPS} current={0} />
        <div className="page-header">
          <h1>Step 1: Land Details</h1>
          <p>Enter the area of land you cultivated for this crop</p>
        </div>
        {error && <div className="error-banner">{error}</div>}

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="summary-row-detail">
            <span className="label">Your Total Land</span>
            <span className="value highlight">{totalLand} Acres</span>
          </div>
        </div>

        <div className="form-group">
          <label>How many acres have you cultivated this crop on?</label>
          <div className="quantity-input-group">
            <input
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              max={totalLand}
              placeholder="0"
              value={cultivatedArea}
              onChange={(e) => setCultivatedArea(e.target.value)}
            />
            <span className="unit">Acres</span>
          </div>

        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>← Cancel</button>
          <button
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            onClick={() => {
              const area = parseFloat(cultivatedArea);
              if (isNaN(area) || area <= 0) { setError('Please enter a valid area'); return; }
              if (area > totalLand) { setError(`You cannot enter more than your total land of ${totalLand} acres`); return; }
              setError(null);
              setStep(2);
            }}
            disabled={!cultivatedArea}
          >
            Next: Select Crop →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Crop Selection
  if (step === 2) {
    return (
      <div>
        <BookingProgress steps={SELL_STEPS} current={1} />
        <div className="page-header">
          <h1>Step 2: Select Crop</h1>
          <p>Which crop did you cultivate on {cultivatedArea} acres?</p>
        </div>
        {error && <div className="error-banner">{error}</div>}

        {!selectedCrop ? (
          <>
            <div className="form-group">
              <label>Search Crop</label>
              <input
                className="form-input"
                type="text"
                placeholder="Search by crop name (e.g. Paddy, Tomato, Cotton...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <button
                className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory('')}
              >
                All ({allCrops.length})
              </button>
              {cropCategories.map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="card-grid card-grid-3">
              {filteredCrops.map((crop) => {
                const cat = crop.category;
                
                return (
                  <div className="crop-card" key={crop.name} onClick={() => setSelectedCrop(crop)}>
                    
                    <div className="crop-name">{crop.name}</div>
                    <div className="crop-area">{crop.category}</div>
                  </div>
                );
              })}
            </div>

            {filteredCrops.length === 0 && (
              <div className="card empty-state">
                <div className="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></div>
                <h3>No crops found</h3>
                <p>Try a different search term.</p>
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedCrop.name}</div>
                <div style={{ fontSize: '.85rem', color: 'var(--gray-500)' }}>{selectedCrop.category}</div>
              </div>
              <button className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => setSelectedCrop(null)}>Change</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
          <button
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            onClick={() => {
              if (!selectedCrop) { setError('Please select a crop'); return; }
              setError(null);
              setStep(3);
            }}
            disabled={!selectedCrop}
          >
            Next: Enter Quantity →
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Quantity + MSP
  if (step === 3) {
    return (
      <div>
        <BookingProgress steps={SELL_STEPS} current={2} />
        <div className="page-header">
          <h1>Step 3: Quantity to Sell</h1>
          <p>How many quintals of {selectedCrop.name} do you want to sell?</p>
        </div>
        {error && <div className="error-banner">{error}</div>}

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="summary-row-detail">
            <span className="label">Crop</span>
            <span className="value">{selectedCrop.name}</span>
          </div>
        </div>

        <div className="form-group">
          <label>How many quintals do you want to sell?</label>
          <div className="quantity-input-group">
            <input
              className="form-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0"
              value={quantityToSell}
              onChange={(e) => setQuantityToSell(e.target.value)}
            />
            <span className="unit">Quintals</span>
          </div>
        </div>

        {msp && quantityToSell && parseFloat(quantityToSell) > 0 && (
          <div className="card" style={{ marginBottom: 20, background: 'var(--green-50)', border: '1px solid var(--green-200)' }}>
            <div className="summary-row-detail">
              <span className="label">MSP</span>
              <span className="value">₹{msp.toLocaleString()} / Quintal</span>
            </div>
            <div className="summary-row-detail">
              <span className="label">Estimated Government Payment</span>
              <span className="value highlight" style={{ fontSize: '1.15rem' }}>
                {parseFloat(quantityToSell)} Quintals × ₹{msp.toLocaleString()} = ₹{estimatedPayment.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
          <button
            className="btn btn-primary btn-lg"
            style={{ flex: 1 }}
            onClick={() => {
              const qty = parseFloat(quantityToSell);
              if (isNaN(qty) || qty <= 0) { setError('Please enter a valid quantity'); return; }
              setError(null);
              // Save cultivation and proceed
              handleSaveAndProceed(qty);
            }}
            disabled={!quantityToSell || saving}
          >
            {saving ? 'Saving...' : 'Next: Select Centre →'}
          </button>
        </div>
      </div>
    );
  }

  async function handleSaveAndProceed(qty) {
    setSaving(true); setError(null);
    try {
      // Create cultivation record
      const cult = await cultivationApi.create({
        crop: selectedCrop.name,
        season: 'Kharif-2025',
        cultivated_area_acres: parseFloat(cultivatedArea),
        quantity_produced_quintals: qty,
      });
      // Update quantity to sell
      await cultivationApi.updateQuantityToSell(cult.cultivation_id, qty);
      // Store for booking flow
      localStorage.setItem('fp_selected_cultivation', JSON.stringify({
        ...cult,
        quantity_to_sell_quintals: qty,
        quantity_produced_quintals: qty,
      }));
      localStorage.setItem('fp_sell_msp', String(msp || ''));
      navigate('/centres');
    } catch (e) {
      setError(e.message || 'Failed to save. Please try again.');
    }
    finally { setSaving(false); }
  }

  return null;
}
