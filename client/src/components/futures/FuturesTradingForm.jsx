import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Tabs,
  Tab,
  Container,
  Snackbar,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  InputAdornment,
  Typography,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const FuturesTradingForm = ({ userId, onSubmit }) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [symbols, setSymbols] = useState([]);
  const [orderType, setOrderType] = useState("buy");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/futuresTrading/availableCryptos",
        );
        setSymbols(response.data);
      } catch (err) {
        console.error("Error fetching symbols:", err.message);
        handleSnackbar("無法獲取可用的加密貨幣列表", "error");
      }
    };

    fetchSymbols();
  }, []);

  const handleSnackbar = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (quantity <= 0) {
      handleSnackbar("數量必須是正數", "error");
      return;
    }

    try {
      const fullOrderType = `${orderType}-market`;
      const orderData = {
        symbol,
        quantity: parseFloat(quantity),
        orderType: fullOrderType,
        leverage: parseInt(leverage, 10),
      };

      const response = await axios.post(
        `http://localhost:3000/api/futuresTrading/users/${userId}/orders`,
        orderData,
      );
      onSubmit(response.data);
      handleSnackbar("訂單提交成功", "success");

      setSymbol("");
      setQuantity("");
      setLeverage(1);
    } catch (err) {
      console.error("Error placing order:", err.message);
      handleSnackbar("訂單提交失敗", "error");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ borderRadius: 2, border: "1px solid #e0e0e0", p: 3, mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Tabs
            value="market"
            sx={{
              "& .MuiTab-root.Mui-selected": {
                color: "#FFDC35",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#FFDC35",
              },
            }}
          >
            <Tab label="市價" value="market" />
          </Tabs>
          <RadioGroup
            row
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <FormControlLabel
              value="buy"
              control={
                <Radio
                  sx={{
                    color: "#FFDC35",
                    "&.Mui-checked": { color: "#FFDC35" },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.875rem", color: "gray" }}>
                  做多
                </Typography>
              }
            />
            <FormControlLabel
              value="sell"
              control={
                <Radio
                  sx={{
                    color: "#FFDC35",
                    "&.Mui-checked": { color: "#FFDC35" },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: "0.875rem", color: "gray" }}>
                  做空
                </Typography>
              }
            />
            <Tooltip
              title={
                <Box>
                  <Typography>市價：按當前市場價格進行交易。</Typography>
                  <Box sx={{ my: 1 }} />
                  <Typography>
                    選擇交易類型：做多或做空，選擇加密貨幣、數量和槓桿。
                  </Typography>
                </Box>
              }
            >
              <IconButton>
                <HelpOutlineIcon sx={{ color: "#FFDC35" }} />
              </IconButton>
            </Tooltip>
          </RadioGroup>
        </Box>

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>交易幣種</InputLabel>
            <Select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              label="交易幣種"
            >
              {symbols.map((sym) => (
                <MenuItem key={sym} value={sym}>
                  {sym}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="數量"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            required
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">{symbol}</InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>槓桿</InputLabel>
            <Select
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              label="槓桿"
            >
              <MenuItem value={1}>1x</MenuItem>
              <MenuItem value={3}>3x</MenuItem>
              <MenuItem value={5}>5x</MenuItem>
              <MenuItem value={10}>10x</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: "#FFDC35",
              color: "black",
              "&:hover": {
                backgroundColor: "#FFDC35",
              },
            }}
          >
            下單
          </Button>
        </form>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

FuturesTradingForm.propTypes = {
  userId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default FuturesTradingForm;
