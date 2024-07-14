import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import tickerRoutes, { initWebSocketRoutes } from "./routes/ticker.js";
import userRoutes from "./routes/user.js";
import spotTradingRoutes from "./routes/spotTrading.js";
import futuresTradingRoutes from "./routes/futuresTrading.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler } from "./utils/errorHandler.js";
import dcClient from "./services/discordBot/app.js";
import "./utils/orderScheduler.js";

const app = express();
const PORT = process.env.PORT || 3000;
const server = initWebSocketRoutes(app);

connectDB();

app.use(
  cors({
    origin: "https://app.cc-invest-cat.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(errorHandler);

app.use("/api/tickers", tickerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spot", spotTradingRoutes);
app.use("/api/futures", futuresTradingRoutes);
app.use("/api/admin", adminRoutes);

if (dcClient) {
  console.log("Discord client initialized");
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
