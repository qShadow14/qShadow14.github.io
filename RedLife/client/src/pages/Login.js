import React from 'react';
import { FaSteam, FaDiscord, FaGoogle } from 'react-icons/fa';
import './Login.css';

function Login({ setUser }) {
  const handleOAuth = (provider) => {
    // Redirect to backend OAuth endpoint
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎮 RedLife Romania</h1>
          <p>Enter the game with your favorite platform</p>
        </div>

        <div className="oauth-buttons">
          <button 
            className="oauth-btn steam"
            onClick={() => handleOAuth('steam')}
          >
            <FaSteam /> Login with Steam
          </button>

          <button 
            className="oauth-btn discord"
            onClick={() => handleOAuth('discord')}
          >
            <FaDiscord /> Login with Discord
          </button>

          <button 
            className="oauth-btn google"
            onClick={() => handleOAuth('google')}
          >
            <FaGoogle /> Login with Google
          </button>

          <button 
            className="oauth-btn cfx"
            onClick={() => handleOAuth('cfx')}
          >
            <span>🎭</span> Login with CFX
          </button>
        </div>

        <div className="login-footer">
          <p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>

      <div className="server-info">
        <h2>Welcome to RedLife Romania</h2>
        <p>
          A premier FiveM roleplay server with immersive gameplay, custom features, 
          and an active community. Join us for thrilling adventures and unlimited possibilities!
        </p>
        <div className="features">
          <div className="feature">
            <span>🚗</span>
            <h4>Ultimate Vehicles</h4>
            <p>Drive premium cars and customizations</p>
          </div>
          <div className="feature">
            <span>💼</span>
            <h4>Jobs & Careers</h4>
            <p>Multiple ways to earn money</p>
          </div>
          <div className="feature">
            <span>🏘️</span>
            <h4>Properties</h4>
            <p>Own homes, businesses & more</p>
          </div>
          <div className="feature">
            <span>👥</span>
            <h4>Active Community</h4>
            <p>Play with thousands of players</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
