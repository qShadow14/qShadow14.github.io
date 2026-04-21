import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
  const [serverInfo, setServerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServerInfo = async () => {
      try {
        const response = await axios.get('/api/server-info');
        setServerInfo(response.data.server);
      } catch (err) {
        console.error('Error fetching server info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServerInfo();
  }, []);

  if (loading) return <div>Loading server info...</div>;

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to RedLife Romania</h1>
          <p>{serverInfo?.description}</p>
          <div className="hero-stats">
            <div className="stat">
              <h3>{serverInfo?.players}</h3>
              <p>Players Online</p>
            </div>
            <div className="stat">
              <h3>{serverInfo?.maxPlayers}</h3>
              <p>Max Capacity</p>
            </div>
            <div className="stat">
              <h3>{serverInfo?.ping}</h3>
              <p>Average Ping</p>
            </div>
          </div>
          <Link to="/shop" className="cta-button">Explore Shop</Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <h2>Server Features</h2>
        <div className="features-grid">
          {serverInfo?.features?.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <h4>{feature}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Shop Preview */}
      <section className="shop-preview">
        <h2>Premium Shop</h2>
        <p>Buy vehicles, items, and more with secure payment options</p>
        <div className="payment-methods">
          <div className="payment-option">
            <span>💳</span>
            <p>Credit/Debit Card</p>
          </div>
          <div className="payment-option">
            <span>🎮</span>
            <p>PaySafe Card</p>
          </div>
          <div className="payment-option">
            <span>🛒</span>
            <p>PayPal</p>
          </div>
          <div className="payment-option">
            <span>🌍</span>
            <p>Bank Transfer</p>
          </div>
        </div>
        <Link to="/shop" className="cta-button">Shop Now</Link>
      </section>

      {/* Community Section */}
      <section className="community">
        <h2>Join Our Community</h2>
        <p>Connect with thousands of players worldwide</p>
        <div className="community-links">
          <a href="#" className="community-btn">Discord</a>
          <a href="#" className="community-btn">Facebook</a>
          <a href="#" className="community-btn">Twitter</a>
          <a href="#" className="community-btn">Twitch</a>
        </div>
      </section>
    </div>
  );
}

export default Home;
