import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d"];
const API_BASE_URL = import.meta.env.API_BASE_URL;

const Admin = () => {
  const [orderFees, setOrderFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [accountBalance, setAccountBalance] = useState(null);

  const fetchAccountBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching account balance with token:", token);
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/account-balance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("Account balance response:", response.data);
      setAccountBalance(response.data);
    } catch (err) {
      console.error("Failed to fetch account balance:", err);
      if (err.response) {
        console.error("Error response:", err.response.data);
        console.error("Error status:", err.response.status);
      }
      setSnackbar({
        open: true,
        message: "Failed to fetch account balance",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const fetchOrderFees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/order-fees`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setOrderFees(response.data);
      } catch (err) {
        if (err.response) {
          if (err.response.status === 403) {
            setUnauthorized(true);
          } else if (err.response.status === 404) {
            setNotFound(true);
          } else if (err.response.status === 500) {
            setServerError(true);
          } else {
            setError(err.message);
          }
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderFees();
    fetchAccountBalance();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: "", severity: "info" });
  };

  const handleBotControl = async (action) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/control-trading-bot`,
        { action },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to control trading bot",
        severity: "error",
      });
    }
  };

  const handleClickNext = () => {
    setPage(page + 1);
  };

  const handleClickPrev = () => {
    setPage(page - 1);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const displayedFees = orderFees.slice(startIndex, startIndex + itemsPerPage);

  const canGoNext = startIndex + displayedFees.length < orderFees.length;
  const canGoPrev = page > 1;

  const chartData = [
    {
      name: "現貨訂單手續費",
      value: orderFees.reduce((acc, fee) => acc + fee.spotOrderFees, 0),
    },
    {
      name: "期貨訂單手續費",
      value: orderFees.reduce((acc, fee) => acc + fee.futuresOrderFees, 0),
    },
  ];

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (unauthorized) return <div>You do not have admin privileges.</div>;
  if (notFound) return <div>User not found.</div>;
  if (serverError) return <div>Internal server error.</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        管理員，您好
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">所有用戶費用</Typography>
        <Box>
          <IconButton onClick={handleClickPrev} disabled={!canGoPrev}>
            <NavigateBeforeIcon color={canGoPrev ? "primary" : "disabled"} />
          </IconButton>
          <IconButton onClick={handleClickNext} disabled={!canGoNext}>
            <NavigateNextIcon color={canGoNext ? "primary" : "disabled"} />
          </IconButton>
        </Box>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>用戶名</TableCell>
            <TableCell>用戶電郵</TableCell>
            <TableCell>現貨訂單手續費</TableCell>
            <TableCell>期貨訂單手續費</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedFees.map((fee, index) => (
            <TableRow key={index}>
              <TableCell>{fee.username}</TableCell>
              <TableCell>{fee.email}</TableCell>
              <TableCell>{fee.spotOrderFees}</TableCell>
              <TableCell>{fee.futuresOrderFees}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 4,
        }}
      >
        <Box sx={{ width: "50%", maxWidth: 500, mr: 8 }}>
          <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
            營收圖表
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        <Box
          sx={{
            width: "40%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
            後台交易機器人
          </Typography>
          {accountBalance && (
            <Box
              sx={{
                mt: 3,
                width: "100%",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ borderBottom: "1px solid #ddd", pb: 1, mb: 2 }}
              >
                用戶資產
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  BTC:
                </Typography>
                <Typography variant="body1">
                  {accountBalance.BTC.toFixed(8)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  USDT:
                </Typography>
                <Typography variant="body1">
                  {accountBalance.USDT.toFixed(2)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleBotControl("start")}
                sx={{ my: 1, width: "100%" }}
              >
                啟動自動交易
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleBotControl("stop")}
                sx={{ my: 1, width: "100%" }}
              >
                終止自動交易
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Admin;
