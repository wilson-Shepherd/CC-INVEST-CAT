import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.API_BASE_URL;

const AccountInfo = ({ userId }) => {
  const [accountInfo, setAccountInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAccountInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/futures/users/${userId}/account`);
      setAccountInfo(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch account info:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
  }, [userId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!accountInfo) {
    return <Typography variant="body1">无法加载账户信息</Typography>;
  }

  return (
    <Paper>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          账户
        </Typography>
        <Typography variant="body1">保证金比率</Typography>
        <Typography variant="body2">账户风险率: {accountInfo.marginRatio}%</Typography>
        <Typography variant="body2">账户维持保证金: {accountInfo.maintenanceMargin} USD</Typography>
        <Typography variant="body2">账户总权益: {accountInfo.totalMarginBalance} USD</Typography>
        <Typography variant="body2">仓位估值: {accountInfo.totalUnrealizedPnl} USD</Typography>
        <Typography variant="body2">实际杠杆: {accountInfo.leverage}</Typography>
      </Box>
    </Paper>
  );
};

AccountInfo.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default AccountInfo;
