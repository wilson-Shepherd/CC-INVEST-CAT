import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const FuturesTradingForm = ({ userId, onSubmit }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('buy-market');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [availableCryptos, setAvailableCryptos] = useState([]);

  useEffect(() => {
    const fetchAvailableCryptos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/futuresTrading/availableCryptos');
        setAvailableCryptos(response.data);
      } catch (error) {
        console.error('Error fetching available cryptos:', error);
      }
    };

    fetchAvailableCryptos();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(`http://localhost:3000/api/futuresTrading/users/${userId}/orders`, {
        symbol,
        quantity: parseFloat(quantity),
        orderType,
        price: orderType.includes('limit') ? parseFloat(price) : undefined,
        leverage: parseInt(leverage, 10),
      });
      onSubmit(response.data);
      setSymbol('');
      setQuantity('');
      setPrice('');
      setLeverage(1);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Symbol:</label>
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)} required>
          <option value="" disabled>Select a symbol</option>
          {availableCryptos.map((crypto) => (
            <option key={crypto} value={crypto}>{crypto}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Order Type:</label>
        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          <option value="buy-market">Buy Market</option>
          <option value="sell-market">Sell Market</option>
          <option value="buy-limit">Buy Limit</option>
          <option value="sell-limit">Sell Limit</option>
        </select>
      </div>
      {orderType.includes('limit') && (
        <div>
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required={orderType.includes('limit')}
          />
        </div>
      )}
      <div>
        <label>Leverage:</label>
        <input
          type="number"
          value={leverage}
          onChange={(e) => setLeverage(e.target.value)}
          min="1"
          required
        />
      </div>
      <button type="submit">Place Order</button>
    </form>
  );
};

FuturesTradingForm.propTypes = {
  userId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default FuturesTradingForm;
