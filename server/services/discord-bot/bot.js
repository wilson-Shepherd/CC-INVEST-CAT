import dcClient from './dcApp.js';

export async function sendNotification(channelId, message) {
  const channel = await dcClient.channels.fetch(channelId);
  if (channel) {
    await channel.send(message);
  } else {
    console.error('Channel not found');
  }
}
