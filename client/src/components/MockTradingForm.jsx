import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import axios from 'axios';

const MockTradingForm = ({ userId, onSubmit }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('buy');
  const [availableCryptos, setAvailableCryptos] = useState([]);

  useEffect(() => {
    const fetchAvailableCryptos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/mockTrading/availableCryptos');
        const filteredCryptos = response.data.filter(crypto => crypto.endsWith('USDT'));
        setAvailableCryptos(filteredCryptos);
      } catch (error) {
        console.error('Error fetching available cryptos:', error);
      }
    };

    fetchAvailableCryptos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:3000/api/mockTrading/users/${userId}/mockOrders`, {
        symbol,
        quantity: parseFloat(quantity),
        orderType
      });
      onSubmit(response.data);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="symbol">Symbol:</label>
        <select
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          required
        >
          <option value="">Select a symbol</option>
          {availableCryptos.map(crypto => (
            <option key={crypto} value={crypto}>{crypto}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="quantity">Quantity:</label>
        <input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Order Type:</label>
        <label>
          <input
            type="radio"
            value="buy"
            checked={orderType === 'buy'}
            onChange={() => setOrderType('buy')}
          />
          Buy
        </label>
        <label>
          <input
            type="radio"
            value="sell"
            checked={orderType === 'sell'}
            onChange={() => setOrderType('sell')}
          />
          Sell
        </label>
      </div>
      <button type="submit">Place Order</button>
    </form>
  );
};

MockTradingForm.propTypes = {
  userId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default MockTradingForm;
