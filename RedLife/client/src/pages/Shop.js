import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Shop.css';

function Shop() {
  const [category, setCategory] = useState('cars');
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/shop/items/${category}`);
        setItems(response.data.items);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category]);

  const addToCart = (item) => {
    setCart([...cart, item]);
    alert(`${item.name} added to cart!`);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/checkout', { state: { items: cart } });
  };

  return (
    <div className="shop">
      <div className="shop-header">
        <h1>🛍️ RedLife Shop</h1>
        <p>All prices in Lei (RON)</p>
      </div>

      <div className="shop-container">
        {/* Sidebar - Categories */}
        <aside className="shop-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            <button 
              className={`category-btn ${category === 'cars' ? 'active' : ''}`}
              onClick={() => setCategory('cars')}
            >
              🚗 Vehicles
            </button>
            <button 
              className={`category-btn ${category === 'items' ? 'active' : ''}`}
              onClick={() => setCategory('items')}
            >
              📦 Items
            </button>
            <button 
              className={`category-btn ${category === 'factions' ? 'active' : ''}`}
              onClick={() => setCategory('factions')}
            >
              🏢 Factions
            </button>
          </div>

          <div className="cart-summary">
            <h3>Cart ({cart.length})</h3>
            <div className="cart-total">
              <p>Total: {cart.reduce((sum, item) => sum + item.lei, 0)} Lei</p>
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Checkout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Items */}
        <main className="shop-content">
          {loading ? (
            <div className="loading">Loading items...</div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-image">
                    <img src={`/images/${item.image}`} alt={item.name} />
                  </div>
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    {item.description && <p className="description">{item.description}</p>}
                    <div className="item-price">
                      <span className="price">{item.lei} Lei</span>
                    </div>
                    <button 
                      className="add-cart-btn"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Shop;
