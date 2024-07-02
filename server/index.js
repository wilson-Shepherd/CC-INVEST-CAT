import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import connectDB from "./config/database.js";
import tickerRoutes, { initWebSocketRoutes } from "./routes/ticker.js";
import userRoutes from "./routes/user.js";
import notificationRoutes from "./routes/dcNotification.js";
import spotTradingRoutes from "./routes/spotTrading.js";
import futuresTradingRoutes from "./routes/futuresTrading.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler } from "./utils/errorHandler.js";
import dcClient from "./services/discordBot/app.js";
import "./utils/orderScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const server = initWebSocketRoutes(app);

connectDB();
app.use(express.json());
app.use(errorHandler);

const STATIC_FILES_PATH = process.env.STATIC_FILES_PATH || path.join(__dirname, '../client/dist');
app.use(express.static(STATIC_FILES_PATH));

app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_FILES_PATH, 'index.html'));
});

app.use("/api/tickers", tickerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/spotTrading", spotTradingRoutes);
app.use("/api/futuresTrading", futuresTradingRoutes);
app.use("/api/admin", adminRoutes);

if (dcClient) {
  console.log("Discord client initialized");
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
