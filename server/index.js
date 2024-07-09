import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import tickerRoutes, { initWebSocketRoutes } from "./routes/ticker.js";
import userRoutes from "./routes/user.js";
import notificationRoutes from "./routes/dcNotification.js";
import spotTradingRoutes from "./routes/spotTrading.js";
import futuresTradingRoutes from "./routes/futuresTrading.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler } from "./utils/errorHandler.js";
import dcClient from "./services/discordBot/app.js";

const app = express();
const PORT = process.env.PORT || 3000;
const server = initWebSocketRoutes(app);

connectDB();
app.use(express.json());

const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL;
app.use(cors({
  origin: [CLOUDFRONT_URL, "https://cc-invest-cat.com"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
}));

app.use("/api/tickers", tickerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/spotTrading", spotTradingRoutes);
app.use("/api/futuresTrading", futuresTradingRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

if (dcClient) {
  console.log("Discord client initialized");
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
