// client/src/pages/Kline.jsx
import { useState } from 'react';
import axios from 'axios';
import KlineForm from '../components/KLineForm';
import KLineChart from '../components/KLineChart';

const Kline = () => {
  const [klineData, setKlineData] = useState([]);

  const fetchKlineData = async ({ symbol, interval, startTime, endTime, limit, timeZone }) => {
    try {
      const response = await axios.get('http://localhost:3000/api/ticker/klines', {
        params: {
          symbol,
          interval,
          startTime,
          endTime,
          limit,
          timeZone,
        },
      });

      const formattedData = response.data.map(d => ({
        x: new Date(d[0]),
        o: parseFloat(d[1]),
        h: parseFloat(d[2]),
        l: parseFloat(d[3]),
        c: parseFloat(d[4]),
      }));

      setKlineData(formattedData);
    } catch (error) {
      console.error('Error fetching Klines data:', error);
    }
  };

  return (
    <div>
      <h1>BTC/USDT K线图</h1>
      <KlineForm onFetchData={fetchKlineData} />
      <KLineChart data={klineData} />
    </div>
  );
};

export default Kline;
