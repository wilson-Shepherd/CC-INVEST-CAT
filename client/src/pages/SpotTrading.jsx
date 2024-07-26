import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import SpotAccountInfo from "../components/Spot/AccountInfo";
import SpotTradingForm from "../components/Spot/TradingForm";
import SpotOrdersList from "../components/Spot/OrdersList";
import SpotOrderDetail from "../components/Spot/OrderDetail";
import KlineChart from "../components/KLineChart";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Grid,
} from "@mui/material";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const SpotTrading = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAccountData();
      fetchOrders();
    }
  }, [user]);

  const fetchAccountData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/spot/users/${user._id}/account`,
      );
      setAccount(response.data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/spot/users/${user._id}/orders`,
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleOrderSubmit = (newOrder) => {
    console.log("New order placed:", newOrder);
    fetchAccountData();
    fetchOrders();
  };

  if (!user) {
    return (
      <Typography variant="h6" align="center">
        請先登入
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
      ></Box>
      <KlineChart />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SpotAccountInfo account={account} />
        </Grid>
        <Grid item xs={12} md={6}>
          <SpotTradingForm
            userId={user._id}
            account={account}
            onSubmit={handleOrderSubmit}
          />
        </Grid>
      </Grid>
      <SpotOrdersList orders={orders} onOrderClick={setSelectedOrder} />
      {selectedOrder && <SpotOrderDetail order={selectedOrder} />}
    </Container>
  );
};

export default SpotTrading;
