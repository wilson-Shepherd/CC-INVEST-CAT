import PropTypes from "prop-types";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useState } from "react";

export default function SpotAccountInfo({ account }) {
  const holdings = Object.entries(account.holdings);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const handleClickNext = () => {
    setPage(page + 1);
  };

  const handleClickPrev = () => {
    setPage(page - 1);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const displayedHoldings = holdings.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const canGoNext = startIndex + displayedHoldings.length < holdings.length;
  const canGoPrev = page > 1;

  return (
    <Box
      sx={{
        marginTop: 5,
        marginLeft: 7.5,
        marginRight: "auto",
        maxWidth: "80%",
      }}
    >
      <Typography variant="h4" gutterBottom>
        現貨賬戶信息
      </Typography>
      <Typography variant="h5" gutterBottom>
        餘額 ${account.balance.toFixed(2)}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        更新時間:{" "}
        {new Date().toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
          hour12: false,
        })}
      </Typography>
      <Box sx={{ marginTop: "1.25rem" }}>
        <Typography variant="h6">持有加密貨幣</Typography>
        <List>
          {displayedHoldings.map(([key, value]) => (
            <ListItem key={key} disablePadding>
              <ListItemText primary={`${key} ${value}枚`} />
            </ListItem>
          ))}
        </List>
        {holdings.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            目前沒有持有資產
          </Typography>
        )}
      </Box>
      <Box sx={{ textAlign: "center", marginTop: 0 }}>
        <IconButton onClick={handleClickPrev} disabled={!canGoPrev}>
          <NavigateBeforeIcon
            sx={{ color: canGoPrev ? "#FFDC35" : "disabled" }}
          />
        </IconButton>
        <IconButton onClick={handleClickNext} disabled={!canGoNext}>
          <NavigateNextIcon
            sx={{ color: canGoNext ? "#FFDC35" : "disabled" }}
          />
        </IconButton>
      </Box>
    </Box>
  );
}

SpotAccountInfo.propTypes = {
  account: PropTypes.shape({
    balance: PropTypes.number.isRequired,
    holdings: PropTypes.objectOf(PropTypes.number).isRequired,
  }).isRequired,
};
