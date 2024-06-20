import { useState } from 'react';
import PropTypes from 'prop-types';

const MockTradingForm = ({ addTrade }) => {
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('buy');
  const [price, setPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTrade = {
      symbol,
      amount: parseFloat(amount),
      type,
      price: parseFloat(price)
    };
    addTrade(newTrade);
    setSymbol('');
    setAmount('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Symbol:
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Amount:
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Type:
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Price:
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

MockTradingForm.propTypes = {
  addTrade: PropTypes.func.isRequired,
};

export default MockTradingForm;
