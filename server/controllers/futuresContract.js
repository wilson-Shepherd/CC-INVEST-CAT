import FuturesContract from "../models/FuturesContract.js";
import { logError } from "../utils/tradeUtils.js";

export const getFuturesContracts = async (req, res) => {
  const { userId } = req.params;
  try {
    const contracts = await FuturesContract.find({ userId }).lean();
    res.status(200).json(contracts);
  } catch (error) {
    logError(error, "getFuturesContracts");
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the contracts" });
  }
};

export const getFuturesContract = async (req, res) => {
  const { userId, contractId } = req.params;
  try {
    const contract = await FuturesContract.findOne({
      _id: contractId,
      userId,
    }).lean();
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json(contract);
  } catch (error) {
    logError(error, "getFuturesContract");
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the contract" });
  }
};

export const createFuturesContract = async (contractData, session) => {
  try {
    const contract = new FuturesContract(contractData);
    await contract.save({ session });
    return contract;
  } catch (error) {
    logError(error, "createFuturesContract");
    throw new Error("An error occurred while creating the contract");
  }
};

export const updateFuturesContract = async (req, res) => {
  const { userId, contractId } = req.params;
  const updateData = req.body;
  try {
    const contract = await FuturesContract.findOneAndUpdate(
      { _id: contractId, userId },
      updateData,
      { new: true },
    ).lean();
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    res.status(200).json(contract);
  } catch (error) {
    logError(error, "updateFuturesContract");
    res
      .status(500)
      .json({ error: "An error occurred while updating the contract" });
  }
};
