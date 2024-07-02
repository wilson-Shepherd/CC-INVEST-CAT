import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import {
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import { SiBinance, SiSolana } from "react-icons/si";

const socket = io("http://localhost:3000");

const Home = () => {
  const initialCryptos = [
    { symbol: "BTCUSDT", name: "Bitcoin", icon: <FaBitcoin size={32} /> },
    { symbol: "ETHUSDT", name: "Ethereum", icon: <FaEthereum size={32} /> },
    { symbol: "BNBUSDT", name: "BNB", icon: <SiBinance size={32} /> },
    { symbol: "SOLUSDT", name: "Solana", icon: <SiSolana size={32} /> },
  ];

  const [cryptos, setCryptos] = useState(initialCryptos);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on("tickerData", (data) => {
      setCryptos((prevCryptos) => {
        const updatedCryptos = prevCryptos.map((crypto) =>
          crypto.symbol === data.s
            ? {
                ...crypto,
                price: `$${parseFloat(data.c).toFixed(2)}`,
                change: `${parseFloat(data.P).toFixed(2)}%`,
              }
            : crypto,
        );
        setLoading(false);
        return updatedCryptos;
      });
    });

    return () => {
      socket.off("tickerData");
    };
  }, []);

  const formatSymbol = (symbol) => symbol.replace("USDT", "");

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: "center", padding: "50px 0" }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold", marginTop: "20px" }}
        >
          從今天就開始無痛練習交易
        </Typography>
        <Button
          variant="contained"
          component={RouterLink}
          to="/register"
          sx={{
            backgroundColor: "#FFDC35",
            color: "#000000",
            "&:hover": { backgroundColor: "#F7C400" },
            padding: "10px 30px",
            fontSize: "24px",
            borderRadius: "30px",
          }}
        >
          立即註冊
        </Button>
      </Container>
      <Container maxWidth="lg" sx={{ textAlign: "center", padding: "50px 0" }}>
        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#000000", marginBottom: "20px" }}
        >
          熱門加密貨幣
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {cryptos.map((crypto) => (
              <Grid item xs={12} sm={6} md={3} key={crypto.symbol}>
                <Card
                  variant="outlined"
                  sx={{
                    minWidth: 275,
                    borderRadius: "10px",
                    backgroundColor: "#F9FAFB",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 2,
                      }}
                    >
                      {crypto.icon}
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", marginLeft: 1 }}
                      >
                        {formatSymbol(crypto.symbol)}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ color: "#888888", marginLeft: 1 }}
                      >
                        {crypto.name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: "bold", marginTop: 1 }}
                    >
                      {crypto.price || "Loading..."}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          crypto.change && parseFloat(crypto.change) > 0
                            ? "green"
                            : "red",
                        marginTop: 1,
                      }}
                    >
                      漲跌:{" "}
                      {crypto.change && parseFloat(crypto.change) > 0
                        ? `+${crypto.change}`
                        : crypto.change || ""}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Button
          component={RouterLink}
          to="/live-data"
          sx={{
            marginTop: "20px",
            textTransform: "none",
            fontSize: "22px",
            color: "#FFDC35",
            textShadow: "0.75px 0.75px rgba(0, 0, 0, 0.25)",
            "&:hover": {
              color: "#F7C400",
            },
          }}
        >
          查看全部 350+ 代幣
        </Button>
      </Container>
    </Box>
  );
};

export default Home;
