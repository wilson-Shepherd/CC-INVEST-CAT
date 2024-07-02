import { useEffect } from "react";
import { Box, Container } from "@mui/material";

const KlineChart = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => initWidget();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initWidget = () => {
    if (window.TradingView) {
      new window.TradingView.widget({
        autosize: true,
        symbol: "BINANCE:BTCUSDT",
        interval: "1H",
        container_id: "tradingview_chart",
        theme: "light",
        locale: "zh_TW",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
      });
    }
  };

  return (
    <Container>
      <Box sx={{ height: "600px", marginBottom: 3 }} id="tradingview_chart" />
    </Container>
  );
};

export default KlineChart;
