import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

const FuturesOrderDetail = ({ order, onClose }) => {
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>訂單詳情</DialogTitle>
      <DialogContent>
        <Typography variant="body1">訂單 ID: {order._id}</Typography>
        <Typography variant="body1">用戶 ID: {order.userId}</Typography>
        <Typography variant="body1">交易對: {order.symbol}</Typography>
        <Typography variant="body1">訂單類型: {order.orderType}</Typography>
        <Typography variant="body1">方向: {order.side}</Typography>
        <Typography variant="body1">槓桿: {order.leverage}x</Typography>
        <Typography variant="body1">數量: {order.quantity}</Typography>
        <Typography variant="body1">價格: {order.price}</Typography>
        <Typography variant="body1">狀態: {order.status}</Typography>
        <Typography variant="body1">止損價: {order.stopLoss}</Typography>
        <Typography variant="body1">止盈價: {order.takeProfit}</Typography>
        <Typography variant="body1">手續費: {order.fee}</Typography>
        <Typography variant="body1">
          創建時間: {new Date(order.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body1">
          更新時間: {new Date(order.updatedAt).toLocaleString()}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ borderColor: "#FFDC35", color: "#FFDC35" }} variant="outlined">
          關閉
        </Button>
      </DialogActions>
    </Dialog>
  );
};

FuturesOrderDetail.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
    orderType: PropTypes.string.isRequired,
    side: PropTypes.string.isRequired,
    leverage: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    status: PropTypes.string.isRequired,
    stopLoss: PropTypes.number,
    takeProfit: PropTypes.number,
    fee: PropTypes.number,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FuturesOrderDetail;
