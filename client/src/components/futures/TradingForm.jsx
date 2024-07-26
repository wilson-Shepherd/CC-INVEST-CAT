import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Container,
  Snackbar,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const FuturesTradingForm = ({ userId, onSubmit }) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [availableCryptos, setAvailableCryptos] = useState([]);
  const [side, setSide] = useState("buy");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    const fetchAvailableCryptos = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/futures/availableCryptos`
        );
        setAvailableCryptos(
          response.data.filter((symbol) => symbol.endsWith("USDT"))
        );
      } catch (error) {
        console.error(
          "Error fetching available cryptos:",
          error.response ? error.response.data : error.message
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

    if (quantity <= 0) {
      handleSnackbar("數量必須是正數", "error");
      return;
    }

    if (stopLoss && isNaN(stopLoss)) {
      handleSnackbar("止損價格必須是數字", "error");
      return;
    }

    if (takeProfit && isNaN(takeProfit)) {
      handleSnackbar("止盈價格必須是數字", "error");
      return;
    }

    try {
      const orderData = {
        symbol: fullSymbol,
        quantity: parseFloat(quantity),
        leverage: parseFloat(leverage),
        orderType: "market",
        side,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/futures/users/${userId}/orders`,
        orderData
      );
      onSubmit(response.data);
      handleSnackbar("訂單提交成功", "success");

      setSymbol("");
      setQuantity("");
      setLeverage(1);
      setStopLoss("");
      setTakeProfit("");
    } catch (error) {
      console.error(
        "Error placing order:",
        error.response ? error.response.data : error.message
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
          <RadioGroup
            row
            value={side}
            onChange={(e) => setSide(e.target.value)}
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
                    選擇交易類型：做多或做空，填寫加密貨幣（輸入加密貨幣代號，系統固定兌
                    USDT）、數量和槓桿。
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
            inputProps={{ maxLength: 20 }}
            sx={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
          />
          <TextField
            label="數量"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            required
            margin="normal"
            inputProps={{ maxLength: 10 }}
            sx={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="leverage-label">槓桿</InputLabel>
            <Select
              labelId="leverage-label"
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
          <TextField
            label="止損價格"
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 20 }}
            sx={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
          />
          <TextField
            label="止盈價格"
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 20 }}
            sx={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
          />
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
            {side === "buy" ? "確認" : "確認"} {symbol}
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
