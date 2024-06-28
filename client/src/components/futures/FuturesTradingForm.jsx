import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const FuturesTradingForm = ({ userId }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('market');
  // eslint-disable-next-line no-unused-vars
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [symbols, setSymbols] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/futuresTrading/availableCryptos');
        setSymbols(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchSymbols();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`http://localhost:3000/api/futuresTrading/users/${userId}/orders`, {
        symbol,
        quantity,
        orderType,
        leverage
      });
      console.log('Order created:', response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Place a Futures Order</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Symbol:</label>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} required>
            <option value="" disabled>Select a symbol</option>
            {symbols.map((sym) => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Quantity:</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div>
          <label>Order Type:</label>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)} disabled>
            <option value="market">Market</option>
          </select>
        </div>
        <div>
          <label>Leverage:</label>
          <select value={leverage} onChange={(e) => setLeverage(e.target.value)}>
            <option value={1}>1x</option>
            <option value={3}>3x</option>
            <option value={5}>5x</option>
            <option value={10}>10x</option>
          </select>
        </div>
        {error && <div>Error: {error}</div>}
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
};

FuturesTradingForm.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default FuturesTradingForm;
