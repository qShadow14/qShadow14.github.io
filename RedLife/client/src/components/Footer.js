import React from 'react';
import { FaFacebook, FaTwitter, FaDiscord, FaTwitch } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>RedLife Romania</h3>
          <p>A premier FiveM roleplay experience</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#/">Home</a></li>
            <li><a href="#/shop">Shop</a></li>
            <li><a href="#/">About</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaDiscord /></a>
            <a href="#"><FaTwitch /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li><a href="#/">Contact</a></li>
            <li><a href="#/">Terms</a></li>
            <li><a href="#/">Privacy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 RedLife Romania. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
