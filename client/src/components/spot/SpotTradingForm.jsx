import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Tab,
  Tabs,
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
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const SpotTradingForm = ({ userId, onSubmit }) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [availableCryptos, setAvailableCryptos] = useState([]);
  const [orderType, setOrderType] = useState("buy");
  const [priceType, setPriceType] = useState("limit");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    const fetchAvailableCryptos = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/spotTrading/availableCryptos",
        );
        setAvailableCryptos(
          response.data.filter((symbol) => symbol.endsWith("USDT")),
        );
      } catch (error) {
        console.error(
          "Error fetching available cryptos:",
          error.response ? error.response.data : error.message,
        );
        handleSnackbar("無法獲取可用的加密貨幣列表", "error");
      }
    };

    fetchAvailableCryptos();
  }, []);

  const handleSnackbar = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const fullSymbol = `${symbol.toUpperCase()}USDT`;

    if (!availableCryptos.includes(fullSymbol)) {
      handleSnackbar("這個輸入的加密貨幣不存在", "error");
      return;
    }

    if (quantity <= 0 || (priceType === "limit" && price <= 0)) {
      handleSnackbar("數量和價格必須是正數", "error");
      return;
    }

    try {
      const orderData = {
        symbol: fullSymbol,
        quantity: parseFloat(quantity),
        orderType: `${orderType}-${priceType}`,
      };

      if (priceType === "limit") {
        orderData.price = parseFloat(price);
      }

      const response = await axios.post(
        `http://localhost:3000/api/spotTrading/users/${userId}/orders`,
        orderData,
      );
      onSubmit(response.data);
      handleSnackbar("訂單提交成功", "success");

      setSymbol("");
      setQuantity("");
      setPrice("");
    } catch (error) {
      console.error(
        "Error placing order:",
        error.response ? error.response.data : error.message,
      );
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
            value={priceType}
            onChange={(_, newValue) => setPriceType(newValue)}
            sx={{
              "& .MuiTab-root.Mui-selected": {
                color: "#FFDC35",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#FFDC35",
              },
            }}
          >
            <Tab label="限價" value="limit" />
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
                  買入
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
                  賣出
                </Typography>
              }
            />
            <Tooltip
              title={
                <Box>
                  <Typography>限價：設置指定價格進行交易。</Typography>
                  <Typography>市價：按當前市場價格進行交易。</Typography>
                  <Box sx={{ my: 1 }} />
                  <Typography>
                    選擇交易類型：買入或賣出，填寫加密貨幣（輸入加密貨幣代號，系統固定兌
                    USDT）、數量和價格。
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
          <TextField
            label="交易幣種"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            fullWidth
            required
            margin="normal"
          />
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
          {priceType === "limit" && (
            <TextField
              label="價格"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              fullWidth
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">USDT</InputAdornment>
                ),
              }}
            />
          )}
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
            {orderType === "buy" ? "買入" : "賣出"} {symbol}
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

SpotTradingForm.propTypes = {
  userId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default SpotTradingForm;
