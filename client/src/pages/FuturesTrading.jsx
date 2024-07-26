import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import AccountInfo from "../components/Futures/AccountInfo";
import FuturesTradingForm from "../components/Futures/TradingForm";
import FuturesOrdersList from "../components/Futures/OrdersList";
import FuturesOrderDetail from "../components/Futures/OrderDetail";
import FuturesContractDetail from "../components/Futures/ContractDetail";
import KlineChart from "../components/KLineChart";
import { Box, Container, Typography, Grid, List, ListItem, ListItemText } from "@mui/material";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const FuturesTrading = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAccountData();
      fetchOrders();
      fetchContracts();
    }
  }, [user]);

  const fetchAccountData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/futures/users/${user._id}/account`
      );
      setAccount(response.data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/futures/users/${user._id}/orders`
      );
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchContracts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/futures/users/${user._id}/contracts`
      );
      setContracts(response.data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  const handleOrderSubmit = (newOrder) => {
    console.log("New order placed:", newOrder);
    fetchAccountData();
    fetchOrders();
    fetchContracts();
  };

  const handleOrderUpdate = (updatedOrder) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
    );
  };

  const handleContractClick = (contractId) => {
    setSelectedContractId(contractId);
  };

  const handleContractClosed = () => {
    fetchAccountData();
    fetchContracts();
  };

  if (!user) {
    return (
      <Typography variant="h6" align="center">
        請先登錄
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: "center", marginTop: "1rem", marginBottom: "3rem" }}></Box>
      <KlineChart />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {account ? (
            <AccountInfo account={account} />
          ) : (
            <Typography variant="h6">加載賬戶信息...</Typography>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <FuturesTradingForm userId={user._id} onSubmit={handleOrderSubmit} />
        </Grid>
      </Grid>
      <FuturesOrdersList orders={orders} onOrderClick={setSelectedOrder} />
      {selectedOrder && (
        <FuturesOrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleOrderUpdate}
        />
      )}
      {contracts.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              合約列表
            </Typography>
            <List>
              {contracts.map((contract) => (
                <ListItem button key={contract._id} onClick={() => handleContractClick(contract._id)}>
                  <ListItemText
                    primary={`合約 ${contract.symbol}`}
                    secondary={`槓桿: ${contract.leverage}x | 進場價格: ${contract.entryPrice.toFixed(2)} | 持倉大小: ${contract.positionSize}`}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      )}
      {selectedContractId && (
        <FuturesContractDetail
          userId={user._id}
          contractId={selectedContractId}
          onClose={() => setSelectedContractId(null)}
          onContractClosed={handleContractClosed}
        />
      )}
    </Container>
  );
};

export default FuturesTrading;
