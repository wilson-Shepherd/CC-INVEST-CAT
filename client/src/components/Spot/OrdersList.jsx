import PropTypes from "prop-types";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Card,
  CardContent,
  Box,
  IconButton,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const SpotOrdersList = ({ orders, onOrderClick }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const handleClickNext = () => {
    setPage(page + 1);
  };

  const handleClickPrev = () => {
    setPage(page - 1);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const displayedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const canGoNext = startIndex + displayedOrders.length < orders.length;
  const canGoPrev = page > 1;

  return (
    <Card sx={{ margin: "auto", mt: 4, boxShadow: 0 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          所有訂單
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>名稱</TableCell>
              <TableCell>訂單類型</TableCell>
              <TableCell>數量</TableCell>
              <TableCell>訂單狀態</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedOrders.map((order) => (
              <TableRow
                key={order._id}
                hover
                onClick={() => onOrderClick(order)}
              >
                <TableCell>{order.symbol}</TableCell>
                <TableCell>{order.orderType}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            mt: 2,
          }}
        >
          <IconButton onClick={handleClickPrev} disabled={!canGoPrev}>
            <NavigateBeforeIcon color={canGoPrev ? "primary" : "disabled"} />
          </IconButton>
          <IconButton onClick={handleClickNext} disabled={!canGoNext}>
            <NavigateNextIcon color={canGoNext ? "primary" : "disabled"} />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

SpotOrdersList.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      symbol: PropTypes.string.isRequired,
      orderType: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onOrderClick: PropTypes.func.isRequired,
};

export default SpotOrdersList;