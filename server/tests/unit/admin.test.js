import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserOrderFees } from "../../controllers/admin";
import User from "../../models/User";
import SpotOrder from "../../models/Spot/Order";
import FuturesOrder from "../../models/Futures/Order";
import { logError } from "../../utils/tradeUtils";

vi.mock("../../models/User", () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock("../../models/Spot/Order", () => ({
  default: {
    aggregate: vi.fn(),
  },
}));

vi.mock("../../models/Futures/Order", () => ({
  default: {
    aggregate: vi.fn(),
  },
}));

vi.mock("../../utils/tradeUtils", () => ({
  logError: vi.fn(),
}));

describe("getUserOrderFees", () => {
  const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user fees when users exist", async () => {
    const mockUsers = [
      { _id: "1", username: "user1", email: "user1@example.com" },
      { _id: "2", username: "user2", email: "user2@example.com" },
    ];

    const mockSpotOrderFees = [[{ totalFees: 100 }], [{ totalFees: 200 }]];

    const mockFuturesOrderFees = [[{ totalFees: 150 }], [{ totalFees: 250 }]];

    User.find.mockResolvedValue(mockUsers);
    SpotOrder.aggregate
      .mockResolvedValueOnce(mockSpotOrderFees[0])
      .mockResolvedValueOnce(mockSpotOrderFees[1]);
    FuturesOrder.aggregate
      .mockResolvedValueOnce(mockFuturesOrderFees[0])
      .mockResolvedValueOnce(mockFuturesOrderFees[1]);

    const req = {};
    const res = mockResponse();

    await getUserOrderFees(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        username: "user1",
        email: "user1@example.com",
        spotOrderFees: 100,
        futuresOrderFees: 150,
      },
      {
        username: "user2",
        email: "user2@example.com",
        spotOrderFees: 200,
        futuresOrderFees: 250,
      },
    ]);
  });

  it("should return empty array when no users exist", async () => {
    User.find.mockResolvedValue([]);

    const req = {};
    const res = mockResponse();

    await getUserOrderFees(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("should handle users with no orders", async () => {
    const mockUsers = [
      { _id: "1", username: "user1", email: "user1@example.com" },
    ];

    User.find.mockResolvedValue(mockUsers);
    SpotOrder.aggregate.mockResolvedValue([]);
    FuturesOrder.aggregate.mockResolvedValue([]);

    const req = {};
    const res = mockResponse();

    await getUserOrderFees(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        username: "user1",
        email: "user1@example.com",
        spotOrderFees: 0,
        futuresOrderFees: 0,
      },
    ]);
  });

  it("should return 500 status on internal error", async () => {
    User.find.mockRejectedValue(new Error("Database error"));

    const req = {};
    const res = mockResponse();

    await getUserOrderFees(req, res);

    expect(logError).toHaveBeenCalledWith(
      expect.any(Error),
      "getUserOrderFees",
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});
