import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Account.css';

function Account({ user }) {
  const [profile, setProfile] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, purchasesRes, vehiclesRes] = await Promise.all([
          axios.get('/api/user/profile'),
          axios.get('/api/user/purchases'),
          axios.get('/api/user/vehicles')
        ]);

        setProfile(profileRes.data.user);
        setPurchases(purchasesRes.data.purchases || []);
        setVehicles(vehiclesRes.data.vehicles || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="account-loading">Loading account...</div>;
  }

  return (
    <div className="account">
      <div className="account-header">
        <h1>👤 My Account</h1>
        <p>Welcome, {user?.username}!</p>
      </div>

      <div className="account-tabs">
        <button 
          className={`tab-btn ${tab === 'profile' ? 'active' : ''}`}
          onClick={() => setTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab-btn ${tab === 'purchases' ? 'active' : ''}`}
          onClick={() => setTab('purchases')}
        >
          Purchases ({purchases.length})
        </button>
        <button 
          className={`tab-btn ${tab === 'vehicles' ? 'active' : ''}`}
          onClick={() => setTab('vehicles')}
        >
          Vehicles ({vehicles.length})
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && profile && (
        <div className="tab-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="profile-info">
                <h2>{user?.username}</h2>
                <p className="level">Level: {profile.level || 1}</p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="label">Faction</span>
                <span className="value">{profile.faction || 'None'}</span>
              </div>
              <div className="stat">
                <span className="label">Admin Level</span>
                <span className="value">{profile.admin || 0}</span>
              </div>
              <div className="stat">
                <span className="label">Cash</span>
                <span className="value">${profile.money?.toLocaleString() || 0}</span>
              </div>
              <div className="stat">
                <span className="label">Bank</span>
                <span className="value">${profile.bank?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="total-wealth">
              <h3>Total Wealth</h3>
              <p className="wealth-value">${(profile.money + profile.bank)?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Purchases Tab */}
      {tab === 'purchases' && (
        <div className="tab-content">
          {purchases.length === 0 ? (
            <div className="empty-state">
              <p>No purchases yet</p>
              <small>Visit the shop to make your first purchase!</small>
            </div>
          ) : (
            <div className="purchases-list">
              {purchases.map((purchase, idx) => (
                <div key={idx} className="purchase-item">
                  <div className="purchase-header">
                    <span className="date">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </span>
                    <span className="amount">{purchase.total} Lei</span>
                  </div>
                  <div className="purchase-details">
                    <p>Payment: {purchase.payment_method}</p>
                    <p>Items: {purchase.items.split(',').length}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vehicles Tab */}
      {tab === 'vehicles' && (
        <div className="tab-content">
          {vehicles.length === 0 ? (
            <div className="empty-state">
              <p>No vehicles yet</p>
              <small>Purchase vehicles from the shop to add them here!</small>
            </div>
          ) : (
            <div className="vehicles-grid">
              {vehicles.map((vehicle, idx) => (
                <div key={idx} className="vehicle-card">
                  <div className="vehicle-info">
                    <h3>{vehicle.vehicle}</h3>
                    <p>Plate: <strong>{vehicle.plate}</strong></p>
                    <p>Status: <span className="status">Available</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Account;
