// import { sendNotification } from "../services/discordBot/bot.js";

// export const notify = async (req, res) => {
//   const { message } = req.body;
//   const channelId = process.env.DISCORD_CHANNEL_ID;

//   try {
//     await sendNotification(channelId, message);
//     res.status(200).send("Notification sent");
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     res.status(500).send("Failed to send notification");
//   }
// };
