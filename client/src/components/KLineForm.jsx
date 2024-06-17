// client/src/components/KlineForm.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';

const KlineForm = ({ onFetchData }) => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1d');
  const [startTime, setStartTime] = useState('1625097600000'); // 默认开始时间戳
  const [endTime, setEndTime] = useState('1627689600000'); // 默认结束时间戳
  const [limit, setLimit] = useState('100');
  const [timeZone, setTimeZone] = useState('0');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFetchData({ symbol, interval, startTime, endTime, limit, timeZone });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Symbol:</label>
        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
      </div>
      <div>
        <label>Interval:</label>
        <input type="text" value={interval} onChange={(e) => setInterval(e.target.value)} />
      </div>
      <div>
        <label>Start Time (timestamp):</label>
        <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>
      <div>
        <label>End Time (timestamp):</label>
        <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>
      <div>
        <label>Limit:</label>
        <input type="text" value={limit} onChange={(e) => setLimit(e.target.value)} />
      </div>
      <div>
        <label>Time Zone:</label>
        <input type="text" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
      </div>
      <button type="submit">Fetch Data</button>
    </form>
  );
};

KlineForm.propTypes = {
  onFetchData: PropTypes.func.isRequired,
};

export default KlineForm;
