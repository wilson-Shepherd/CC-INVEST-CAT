import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [tickers, setTickers] = useState({});

  useEffect(() => {
    socket.on('tickerData', (data) => {
      setTickers((prevTickers) => ({
        ...prevTickers,
        [data.s]: data,
      }));
    });

    return () => {
      socket.off('tickerData');
    };
  }, []);

  const sortedTickers = Object.values(tickers)
    .sort((a, b) => parseFloat(b.q) - parseFloat(a.q))
    .slice(0, 15);

  return (
    <div>
      <h1>市場總覽</h1>
      <div className="tickers">
        {sortedTickers.map((ticker) => (
          <div key={ticker.s} className="ticker">
            <h2>{ticker.s}</h2>
            <p>最後價格: {ticker.c}</p>
            <p>24h變動百分比: {ticker.P}%</p>
            <p>成交量: {ticker.q}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
