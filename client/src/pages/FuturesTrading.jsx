import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import AccountInfo from "../components/futures/AccountInfo";
import OrderForm from "../components/futures/OrderForm";
import KlineChart from "../components/KLineChart";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  Grid,
  Paper,
} from "@mui/material";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const FuturesTrading = () => {
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
        `${API_BASE_URL}/api/futures/users/${user._id}/account`,
      );
      setAccount(response.data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/futures/users/${user._id}/orders`,
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
      >
        <img
          src={tradingBanner}
          alt="Trading Banner"
          style={{ width: "100%", maxHeight: "100%", objectFit: "cover" }}
        />
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box>
            <KlineChart />
          </Box>
          <Box sx={{ marginTop: 2 }}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <OrdersList orders={orders} onOrderClick={setSelectedOrder} />
            </Paper>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
            <OrderForm userId={user._id} account={account} onSubmit={handleOrderSubmit} />
          </Paper>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <AccountInfo account={account} />
          </Paper>
        </Grid>
      </Grid>
      {selectedOrder && <OrderDetail order={selectedOrder} />}
    </Container>
  );
};

export default FuturesTrading;
