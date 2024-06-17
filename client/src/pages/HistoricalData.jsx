import { useState } from 'react';
import Plot from 'react-plotly.js';

const HistoricalData = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1d');
  const [startTime, setStartTime] = useState('2021-01-01');
  const [endTime, setEndTime] = useState(new Date().toISOString().split('T')[0]);
  const [candleData, setCandleData] = useState(null);
  const [backtestData, setBacktestData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ticker/uiKlines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, interval, startTime: new Date(startTime).getTime(), endTime: new Date(endTime).getTime() }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      const formattedData = {
        x: result.map(d => new Date(d[0]).toISOString()),
        open: result.map(d => parseFloat(d[1])),
        high: result.map(d => parseFloat(d[2])),
        low: result.map(d => parseFloat(d[3])),
        close: result.map(d => parseFloat(d[4]))
      };
      setCandleData(formattedData);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const runBacktest = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ticker/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, interval, startTime: new Date(startTime).getTime(), endTime: new Date(endTime).getTime() }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setBacktestData(result);
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
      <button onClick={runBacktest}>Run Backtest</button>
      {candleData && (
        <div>
          <h2>K线图:</h2>
          <Plot
            data={[
              {
                x: candleData.x,
                close: candleData.close,
                decreasing: { line: { color: 'red' } },
                high: candleData.high,
                increasing: { line: { color: 'green' } },
                low: candleData.low,
                open: candleData.open,
                type: 'candlestick',
                xaxis: 'x',
                yaxis: 'y'
              }
            ]}
            layout={{
              title: 'K线图',
              xaxis: {
                title: 'Date',
                type: 'date'
              },
              yaxis: {
                title: 'Price'
              }
            }}
          />
        </div>
      )}
      {backtestData && (
        <div>
          <h2>Backtest Results:</h2>
          <Plot
            data={[
              {
                x: backtestData.map(item => item.exit_time),
                y: backtestData.map(item => item.balance),
                type: 'scatter',
                mode: 'lines+points',
                marker: { color: 'red' },
              },
            ]}
            layout={{ title: 'Backtest Balance Over Time' }}
          />
          <pre>{JSON.stringify(backtestData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HistoricalData;
