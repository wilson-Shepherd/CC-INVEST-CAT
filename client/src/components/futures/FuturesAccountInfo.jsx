import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Typography, Box } from "@mui/material";

const FuturesAccountInfo = ({ userId }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/futuresTrading/users/${userId}/account`,
        );
        setAccount(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
      <Typography variant="h5" marginTop="1rem" gutterBottom>
        餘額 ${account.balance.toFixed(2)}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        更新時間:{" "}
        {new Date().toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
          hour12: false,
        })}
      </Typography>
      <Typography variant="h5" marginTop="2rem" gutterBottom>
        使用保證金: ${account.usedMargin.toFixed(2)}
      </Typography>
      <Typography variant="h5" marginTop="2rem" gutterBottom>
        保證金率: {((account.usedMargin / account.balance) * 100).toFixed(2)}%
      </Typography>
    </Box>
  );
};

FuturesAccountInfo.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default FuturesAccountInfo;
