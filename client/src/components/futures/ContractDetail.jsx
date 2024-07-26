import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

const API_BASE_URL = import.meta.env.API_BASE_URL;

const FuturesContractDetail = ({ userId, contractId, onClose, onContractClosed }) => {
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    fetchContract();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/futures/users/${userId}/contracts/${contractId}`
      );
      setContract(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching contract:", error);
      setIsLoading(false);
    }
  };

  const handleCloseContract = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/futures/users/${userId}/contracts/${contractId}/close`
      );
      handleSnackbar("平倉成功", "success");
      onClose();
      onContractClosed();
    } catch (error) {
      console.error("Error closing contract:", error);
      handleSnackbar("平倉失敗", "error");
    }
  };

  const handleSnackbar = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Dialog open onClose={onClose}>
        <DialogTitle>合約詳情</DialogTitle>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (!contract) {
    return null;
  }

  return (
    <>
      <Dialog open onClose={onClose}>
        <DialogTitle>合約詳情</DialogTitle>
        <DialogContent>
          <Typography variant="body1">合約 ID: {contract._id}</Typography>
          <Typography variant="body1">標的: {contract.symbol}</Typography>
          <Typography variant="body1">槓桿: {contract.leverage}</Typography>
          <Typography variant="body1">進場價格: {contract.entryPrice}</Typography>
          <Typography variant="body1">持倉大小: {contract.positionSize}</Typography>
          <Typography variant="body1">保證金: {contract.margin}</Typography>
          <Typography variant="body1">維持保證金: {contract.maintenanceMargin}</Typography>
          <Typography variant="body1">
            創建時間: {new Date(contract.createdAt).toLocaleString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseContract}
            sx={{ backgroundColor: "#FFDC35", color: "#000" }}
            variant="contained"
          >
            平倉
          </Button>
          <Button
            onClick={onClose}
            sx={{ backgroundColor: "#FFDC35", color: "#000" }}
            variant="contained"
          >
            關閉
          </Button>
        </DialogActions>
      </Dialog>
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
    </>
  );
};

FuturesContractDetail.propTypes = {
  userId: PropTypes.string.isRequired,
  contractId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onContractClosed: PropTypes.func.isRequired,
};

export default FuturesContractDetail;
