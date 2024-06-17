import { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';

const HistoricalData = () => {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1d');
  const [startTime, setStartTime] = useState('2021-01-01');
  const [endTime, setEndTime] = useState(new Date().toISOString().split('T')[0]);
  const [candleData, setCandleData] = useState([]);
  const [backtestData, setBacktestData] = useState([]);
  const chartRef = useRef();

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ticker/klines', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, interval, startTime: new Date(startTime).getTime(), endTime: new Date(endTime).getTime() }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      const formattedData = result.map(d => ({
        date: new Date(d[0]),
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5])
      }));
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

  useEffect(() => {
    if (candleData.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 40 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(candleData.map(d => d.date))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([d3.min(candleData, d => d.low), d3.max(candleData, d => d.high)])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('.candle')
      .data(candleData)
      .enter()
      .append('rect')
      .attr('class', 'candle')
      .attr('x', d => x(d.date))
      .attr('y', d => y(Math.max(d.open, d.close)))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.abs(y(d.open) - y(d.close)))
      .attr('fill', d => d.close > d.open ? 'green' : 'red');

    svg.selectAll('.wick')
      .data(candleData)
      .enter()
      .append('rect')
      .attr('class', 'wick')
      .attr('x', d => x(d.date) + x.bandwidth() / 2)
      .attr('y', d => y(d.high))
      .attr('width', 1)
      .attr('height', d => Math.abs(y(d.high) - y(d.low)))
      .attr('fill', d => d.close > d.open ? 'green' : 'red');

  }, [candleData]);

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
      <div ref={chartRef}></div>
      {backtestData.length > 0 && (
        <div>
          <h2>Backtest Results:</h2>
          <pre>{JSON.stringify(backtestData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HistoricalData;
