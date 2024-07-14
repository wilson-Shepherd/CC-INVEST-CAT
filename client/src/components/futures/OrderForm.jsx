import React from 'react';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Grid } from '@mui/material';

const OrderForm = ({ account, orderData, handleInputChange, handleOrderSubmit }) => {
  return (
    <Box p={2} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        交易
      </Typography>

      <TextField
        fullWidth
        label="可用"
        variant="outlined"
        margin="normal"
        InputProps={{
          readOnly: true,
        }}
        value={account?.balance || '0.00 USDT'}
      />

      <TextField
        fullWidth
        label="数量"
        variant="outlined"
        margin="normal"
        name="quantity"
        value={orderData.quantity}
        onChange={handleInputChange}
      />

      <FormControlLabel
        control={<Checkbox name="takeProfit" />}
        label="止盈/止损"
      />

      <FormControlLabel
        control={<Checkbox name="reduceOnly" />}
        label="只减仓"
      />

      <Box sx={{ flexGrow: 1 }} />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button variant="contained" color="primary" fullWidth onClick={() => handleOrderSubmit('buy')}>
            买入/做多
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button variant="contained" color="secondary" fullWidth onClick={() => handleOrderSubmit('sell')}>
            卖出/做空
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderForm;