import { useState } from 'react';
import axios from 'axios';
import KLineForm from '../components/KLineForm';
import KLineChart from '../components/KLineChart';

const Kline = () => {
  const [data, setData] = useState(null);

  const fetchKlineData = async ({ symbol, interval, startTime, endTime, timeZone }) => {
    try {
      const response = await axios.get('http://localhost:3000/api/ticker/klines', {
        params: { symbol, interval, startTime, endTime, timeZone },
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching Klines data:', error);
    }
  };

  return (
    <div>
      <h1>K线图</h1>
      <KLineForm onFetchData={fetchKlineData} />
      {data ? <KLineChart data={data} /> : <p>Loading...</p>}
    </div>
  );
};

export default Kline;
