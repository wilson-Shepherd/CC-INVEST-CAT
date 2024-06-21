import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const MockTradingForm = ({ userId, onSubmit }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState('buy');
  const [availableCryptos, setAvailableCryptos] = useState([]);

  useEffect(() => {
    const fetchAvailableCryptos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/mockTrading/availableCryptos');
        const usdtCryptos = response.data.filter(crypto => crypto.includes('USDT'));
        setAvailableCryptos(usdtCryptos);
        if (usdtCryptos.length > 0) {
          setSymbol(usdtCryptos[0]);
        }
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
        orderType,
      });
      onSubmit(response.data);
      setQuantity('');
      setOrderType('buy');
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Symbol:
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {availableCryptos.map((crypto) => (
              <option key={crypto} value={crypto}>
                {crypto}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Quantity:
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Order Type:
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
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
