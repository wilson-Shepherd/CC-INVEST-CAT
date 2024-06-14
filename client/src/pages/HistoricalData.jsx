import { useState } from 'react';

const HistoricalData = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1d');
  const [startTime, setStartTime] = useState('2020-01-01');
  const [endTime, setEndTime] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/historical-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, interval, startTime, endTime }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  return (
    <div>
      <h1>Fetch Binance Data</h1>
      <div>
        <label>
          Symbol:
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Interval:
          <input type="text" value={interval} onChange={(e) => setInterval(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          Start Time:
          <input type="date" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>
      </div>
      <div>
        <label>
          End Time:
          <input type="date" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </label>
      </div>
      <button onClick={fetchData}>Fetch Data</button>
      {data && (
        <div>
          <h2>Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HistoricalData;
