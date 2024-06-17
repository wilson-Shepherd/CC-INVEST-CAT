import { useState } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './KLineForm.css';

const KLineForm = ({ onFetchData }) => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1d');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Please enter both start and end dates.');
      return;
    }
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const timeZone = '0';
    onFetchData({ symbol, interval, startTime, endTime, timeZone });
  };

  return (
    <form onSubmit={handleSubmit} className="kline-form">
      <div>
        <label>Symbol:</label>
        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      </div>
      <div>
        <label>Interval:</label>
        <select value={interval} onChange={(e) => setInterval(e.target.value)}>
          <option value="1s">1 Second</option>
          <option value="15m">15 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
          <option value="1w">1 Week</option>
        </select>
      </div>
      <div>
        <label>Start Date:</label>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          showTimeSelect
          dateFormat="Pp"
        />
      </div>
      <div>
        <label>End Date:</label>
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          showTimeSelect
          dateFormat="Pp"
        />
      </div>
      <button type="submit">Fetch Data</button>
    </form>
  );
};

KLineForm.propTypes = {
  onFetchData: PropTypes.func.isRequired,
};

export default KLineForm;
