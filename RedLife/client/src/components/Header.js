import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';
import './Header.css';

function Header({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get('/api/auth/logout');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>🎮 RedLife Romania</h1>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          {user && <Link to="/shop" className="nav-link">Shop</Link>}
          <a href="#features" className="nav-link">Features</a>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-menu">
              <Link to="/account" className="user-profile">
                <FaUser /> {user.username}
              </Link>
              <Link to="/checkout" className="cart-icon">
                <FaShoppingCart />
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
