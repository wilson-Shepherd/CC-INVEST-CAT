import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const SpotTradingForm = ({ userId, onSubmit }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('buy-limit');
  const [price, setPrice] = useState('');
  const [availableCryptos, setAvailableCryptos] = useState([]);

  useEffect(() => {
    const fetchAvailableCryptos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/spotTrading/availableCryptos');
        setAvailableCryptos(response.data.filter(symbol => symbol.endsWith('USDT')));
      } catch (error) {
        console.error('Error fetching available cryptos:', error);
      }
    };

    fetchAvailableCryptos();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const orderData = {
        symbol,
        quantity: parseFloat(quantity),
        orderType,
      };

      if (orderType.includes('limit')) {
        orderData.price = parseFloat(price);
      }

      const response = await axios.post(`http://localhost:3000/api/spotTrading/users/${userId}/orders`, orderData);
      onSubmit(response.data);
      setSymbol('');
      setQuantity('');
      setPrice('');
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
          <option value="buy-limit">Buy Limit</option>
          <option value="sell-limit">Sell Limit</option>
          <option value="buy-market">Buy Market</option>
          <option value="sell-market">Sell Market</option>
        </select>
      </div>
      {orderType.includes('limit') && (
        <div>
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      )}
      <button type="submit">Place Order</button>
    </form>
  );
};

SpotTradingForm.propTypes = {
  userId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default SpotTradingForm;
