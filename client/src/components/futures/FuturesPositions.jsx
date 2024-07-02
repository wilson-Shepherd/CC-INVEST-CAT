import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar,
  TablePagination,
} from "@mui/material";

const FuturesPositions = ({ userId }) => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [page, setPage] = useState(0);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/futuresTrading/users/${userId}/positions`,
        );
        setPositions(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, [userId]);

  const closePosition = async (positionId) => {
    try {
      await axios.post(
        `http://localhost:3000/api/futuresTrading/users/${userId}/positions/${positionId}/close`,
      );
      setPositions(positions.filter((position) => position._id !== positionId));
      setSnackbar({
        open: true,
        message: "平倉成功",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "平倉失敗",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Card sx={{ margin: "auto", mt: 4, boxShadow: 0 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          期貨持倉
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>名稱</TableCell>
              <TableCell>數量</TableCell>
              <TableCell>進場價格</TableCell>
              <TableCell>槓桿</TableCell>
              <TableCell>持倉類型</TableCell>
              <TableCell>當前價格</TableCell>
              <TableCell>未實現盈虧</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((position) => (
                <TableRow key={position._id} hover>
                  <TableCell>{position.symbol}</TableCell>
                  <TableCell>{position.quantity}</TableCell>
                  <TableCell>${position.entryPrice}</TableCell>
                  <TableCell>{position.leverage}x</TableCell>
                  <TableCell>
                    {position.positionType === "long" ? "做多" : "做空"}
                  </TableCell>
                  <TableCell>${position.currentPrice}</TableCell>
                  <TableCell>${position.unrealizedPnL}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => closePosition(position._id)}
                    >
                      平倉
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[]}
          component="div"
          count={positions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
        />
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
      </CardContent>
    </Card>
  );
};

FuturesPositions.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default FuturesPositions;
