import PropTypes from "prop-types";
import {
  Typography,
  Box,
} from "@mui/material";

const AccountInfo = ({ account }) => {
  if (!account) {
    return null;
  }

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
        期貨賬戶信息
      </Typography>
      <Typography variant="h5" gutterBottom>
        餘額 ${account.balance.toFixed(2)}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        總保證金: ${account.totalMarginBalance.toFixed(2)}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        維持保證金: ${account.maintenanceMargin.toFixed(2)}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        更新時間:{" "}
        {new Date(account.updatedAt).toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
          hour12: false,
        })}
      </Typography>
    </Box>
  );
};

AccountInfo.propTypes = {
  account: PropTypes.shape({
    balance: PropTypes.number.isRequired,
    totalMarginBalance: PropTypes.number.isRequired,
    maintenanceMargin: PropTypes.number.isRequired,
    marginRatio: PropTypes.number.isRequired,
    updatedAt: PropTypes.string.isRequired,
    contracts: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default AccountInfo;
