import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = location.state?.items || [];
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const total = cartItems.reduce((sum, item) => sum + item.lei, 0);

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (paymentMethod === 'stripe' && (!cardDetails.name || !cardDetails.cardNumber)) {
      alert('Please fill in card details!');
      return;
    }

    setLoading(true);
    try {
      // Create payment intent
      const response = await axios.post('/api/payment/create-payment', {
        items: cartItems,
        total,
        paymentMethod
      });

      if (paymentMethod === 'stripe' || paymentMethod === 'paysafe') {
        // Process Stripe payment
        alert('Processing payment... This is a demo, check your account in 10 seconds!');
        
        // Simulate payment confirmation
        setTimeout(async () => {
          try {
            await axios.post('/api/payment/confirm-payment', {
              paymentIntentId: response.data.paymentIntentId,
              items: cartItems
            });
            
            alert('Payment successful! Items have been delivered to your FiveM account!');
            navigate('/account');
          } catch (err) {
            alert('Payment confirmation failed: ' + err.message);
          }
        }, 2000);
      } else if (paymentMethod === 'paypal') {
        // Redirect to PayPal
        alert('Redirecting to PayPal...');
        // window.location.href = response.data.paypalUrl;
      }
    } catch (err) {
      alert('Payment error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add items from the shop first</p>
          <button className="back-btn" onClick={() => navigate('/shop')}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="checkout-container">
        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="cart-items">
            {cartItems.map((item, idx) => (
              <div key={idx} className="cart-item">
                <span>{item.name}</span>
                <span className="price">{item.lei} Lei</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <h3>Total: {total} Lei</h3>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-section">
          <h2>Payment Method</h2>
          
          <div className="payment-methods">
            <label className="payment-option">
              <input 
                type="radio"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => handlePaymentChange(e.target.value)}
              />
              <span>💳 Credit/Debit Card (Stripe)</span>
            </label>

            <label className="payment-option">
              <input 
                type="radio"
                value="paysafe"
                checked={paymentMethod === 'paysafe'}
                onChange={(e) => handlePaymentChange(e.target.value)}
              />
              <span>🎮 PaySafe Card</span>
            </label>

            <label className="payment-option">
              <input 
                type="radio"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => handlePaymentChange(e.target.value)}
              />
              <span>🛒 PayPal</span>
            </label>
          </div>

          {/* Card Details */}
          {(paymentMethod === 'stripe' || paymentMethod === 'paysafe') && (
            <div className="card-details">
              <h3>Card Information</h3>
              
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={handleCardChange}
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <input 
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  value={cardDetails.cardNumber}
                  onChange={handleCardChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input 
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    maxLength="5"
                    value={cardDetails.expiry}
                    onChange={handleCardChange}
                  />
                </div>
                <div className="form-group">
                  <label>CVC</label>
                  <input 
                    type="text"
                    name="cvc"
                    placeholder="123"
                    maxLength="3"
                    value={cardDetails.cvc}
                    onChange={handleCardChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Button */}
          <button 
            className="pay-btn"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay ${total} Lei`}
          </button>

          <p className="disclaimer">
            💡 This is a secure payment processing demo. Your payment will be processed instantly and items delivered to your FiveM account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
