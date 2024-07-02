import PropTypes from "prop-types";
import { Typography, Box, Paper, Grid } from "@mui/material";

const FuturesOrderDetail = ({ order }) => {
  return (
    <Paper sx={{ marginBottom: 5, mt: 2, p: 3, borderRadius: 5 }}>
      <Typography variant="h5" component="div" gutterBottom>
        訂單詳情
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="body2">
              <strong>交易對:</strong> {order.symbol}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              <strong>訂單類型:</strong> {order.orderType}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              <strong>數量:</strong> {order.quantity}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              <strong>狀態:</strong> {order.status}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            {order.orderType.includes("limit") && (
              <Typography variant="body2">
                <strong>限價:</strong> {order.price}
              </Typography>
            )}
            {order.orderType.includes("market") && (
              <Typography variant="body2">
                <strong>市價成交</strong>
              </Typography>
            )}
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              <strong>槓桿:</strong> {order.leverage}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              <strong>手續費:</strong> {order.fee}
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="body2">
              <strong>創建時間:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          {order.executedAt && (
            <Grid item xs={4}>
              <Typography variant="body2">
                <strong>成交時間:</strong>{" "}
                {new Date(order.executedAt).toLocaleString()}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
};

FuturesOrderDetail.propTypes = {
  order: PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    orderType: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    price: PropTypes.number,
    leverage: PropTypes.number.isRequired,
    fee: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
    executedAt: PropTypes.string,
  }).isRequired,
};

export default FuturesOrderDetail;
