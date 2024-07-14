import dcClient from "./app.js";

export async function sendNotification(channelId, message) {
  try {
    const channel = await dcClient.channels.fetch(channelId);
    if (channel) {
      await channel.send(message);
    } else {
      console.error(`Channel not found for channelId: ${channelId}`);
    }
  } catch (error) {
    console.error(
      `Error sending notification to Discord channel ${channelId}:`,
      error,
    );
  }
}
