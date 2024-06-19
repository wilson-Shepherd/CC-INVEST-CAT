import { useState } from 'react';
import PropTypes from 'prop-types';

const MockTradingForm = ({ addTrade }) => {
  const [form, setForm] = useState({ symbol: '', amount: '', type: 'buy' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('/api/mockTrading/mockTrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    .then(response => response.json())
    .then(data => addTrade(data))
    .catch(error => console.error(error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="symbol" value={form.symbol} onChange={handleChange} placeholder="Symbol" required />
      <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" required />
      <select name="type" value={form.type} onChange={handleChange}>
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  );
};

MockTradingForm.propTypes = {
  addTrade: PropTypes.func.isRequired,
};

export default MockTradingForm;
