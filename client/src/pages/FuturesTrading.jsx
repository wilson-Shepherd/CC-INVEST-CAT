import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import FuturesAccountInfo from "../components/futures/FuturesAccountInfo";
import FuturesTradingForm from "../components/futures/FuturesTradingForm";
import FuturesOrdersList from "../components/futures/FuturesOrdersList";
import FuturesOrderDetail from "../components/futures/FuturesOrderDetail";
import FuturesPositions from "../components/futures/FuturesPositions";
import KlineChart from "../components/KLineChart";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Grid,
} from "@mui/material";
import tradingBanner from "../assets/trading_banner.png";

const FuturesTrading = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAccountData();
      fetchOrders();
      fetchPositions();
    }
  }, [user]);

  useEffect(() => {
    if (orders.length) {
      fetchPositions();
    }
  }, [orders]);

  const fetchAccountData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/futuresTrading/users/${user._id}/account`,
      );
      setAccount(response.data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/futuresTrading/users/${user._id}/orders`,
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/futuresTrading/users/${user._id}/positions`,
      );
      setPositions(response.data);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const handleOrderSubmit = (newOrder) => {
    console.log("New order placed:", newOrder);
    fetchAccountData();
    fetchOrders();
    // Fetch positions is now triggered automatically by the useEffect when orders change
  };

  if (!user) {
    return (
      <Typography variant="h6" align="center">
        Please log in to view your futures account.
      </Typography>
    );
  }

  if (!account) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{ textAlign: "center", marginTop: "1rem", marginBottom: "3rem" }}
      >
        <img
          src={tradingBanner}
          alt="Trading Banner"
          style={{ width: "100%", maxHeight: "100%", objectFit: "cover" }}
        />
      </Box>
      <KlineChart />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FuturesAccountInfo userId={user._id} account={account} />
        </Grid>
        <Grid item xs={12} md={6}>
          <FuturesTradingForm
            userId={user._id}
            account={account}
            onSubmit={handleOrderSubmit}
          />
        </Grid>
      </Grid>
      <FuturesPositions userId={user._id} positions={positions} />
      <FuturesOrdersList orders={orders} onOrderClick={setSelectedOrder} />
      {selectedOrder && <FuturesOrderDetail order={selectedOrder} />}
    </Container>
  );
};

export default FuturesTrading;
