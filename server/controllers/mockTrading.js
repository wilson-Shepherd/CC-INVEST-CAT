import MockAccount from '../models/mockAccount.js';

export const getMockAccount = async (req, res) => {
  const { userId } = req.params;
  try {
    const account = await MockAccount.findOne({ userId }).lean();
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.status(200).json({
      cash: account.cash,
      holdings: account.holdings,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
