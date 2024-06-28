import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const KLineChart = ({ data }) => {
  const chartRef = useRef();
  const tooltipRef = useRef();

  const calculateMA = (data, windowSize) => {
    return data.map((d, i) => {
      if (i < windowSize) return null;
      const slice = data.slice(i - windowSize, i);
      const sum = slice.reduce((acc, val) => acc + val[4], 0);
      return { date: new Date(d[0]), value: sum / windowSize };
    }).filter(d => d !== null);
  };

  const calculateSMA = (data, windowSize) => {
    return data.map((d, i) => {
      if (i < windowSize) return null;
      const slice = data.slice(i - windowSize, i);
      const sum = slice.reduce((acc, val) => acc + val[4], 0);
      return { date: new Date(d[0]), value: sum / windowSize };
    }).filter(d => d !== null);
  };

  useEffect(() => {
    d3.select(chartRef.current).selectAll('*').remove();

    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 50 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => new Date(d[0])))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d[3]), d3.max(data, d => d[2])])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickFormat(''))
      .select('.domain').remove();

    svg.append('g')
      .call(d3.axisLeft(y))
      .select('.domain').remove();

    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "#f9f9f9")
      .style("padding", "5px")
      .style("border", "1px solid #d3d3d3")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    svg.selectAll('.candle')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'candle')
      .attr('x', d => x(new Date(d[0])))
      .attr('y', d => y(Math.max(d[1], d[4])))
      .attr('width', x.bandwidth())
      .attr('height', d => Math.abs(y(d[1]) - y(d[4])))
      .attr('fill', d => d[4] > d[1] ? 'green' : 'red')
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(new Date(d[0]))}<br>Open: ${d[1]}<br>High: ${d[2]}<br>Low: ${d[3]}<br>Close: ${d[4]}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    svg.selectAll('.wick')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'wick')
      .attr('x1', d => x(new Date(d[0])) + x.bandwidth() / 2)
      .attr('x2', d => x(new Date(d[0])) + x.bandwidth() / 2)
      .attr('y1', d => y(d[2]))
      .attr('y2', d => y(d[3]))
      .attr('stroke', d => d[4] > d[1] ? 'green' : 'red')
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(new Date(d[0]))}<br>Open: ${d[1]}<br>High: ${d[2]}<br>Low: ${d[3]}<br>Close: ${d[4]}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });

    const maData = calculateMA(data, 5);
    const smaData = calculateSMA(data, 20);

    const line = d3.line()
      .x(d => x(d.date) + x.bandwidth() / 2)
      .y(d => y(d.value))
      .defined(d => !isNaN(d.value));

    svg.append('path')
      .datum(maData)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    svg.append('path')
      .datum(smaData)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 1.5)
      .attr('d', line);

  }, [data]);

  return (
    <div>
      <div ref={chartRef}></div>
      <div ref={tooltipRef}></div>
    </div>
  );
};

KLineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.array).isRequired,
};

export default KLineChart;
