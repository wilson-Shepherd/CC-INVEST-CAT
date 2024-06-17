// client/src/components/KLineChart.jsx
import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js/auto';
import { CandlestickController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial';
import { TimeScale, LinearScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(CandlestickController, CandlestickElement, OhlcElement, TimeScale, LinearScale, Tooltip);

const KLineChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: [{
          label: 'BTC/USDT',
          data: data,
          borderColor: 'rgba(0, 0, 255, 0.8)',
          backgroundColor: 'rgba(0, 0, 255, 0.3)',
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              tooltipFormat: 'Pp',
              displayFormats: {
                day: 'MMM dd',
              },
            },
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Price',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <canvas ref={chartRef} />
  );
};

KLineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.instanceOf(Date).isRequired,
    o: PropTypes.number.isRequired,
    h: PropTypes.number.isRequired,
    l: PropTypes.number.isRequired,
    c: PropTypes.number.isRequired,
  })).isRequired,
};

export default KLineChart;
