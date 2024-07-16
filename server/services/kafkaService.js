import { Kafka } from 'kafkajs';
import "dotenv/config";

const KAFKA_BROKER = process.env.KAFKA_BROKER;
let producer = null;

export async function initKafkaProducer() {
  const kafka = new Kafka({
    clientId: 'price-notification-server',
    brokers: [KAFKA_BROKER],
  });

  producer = kafka.producer();
  await producer.connect();
  console.log('Kafka Producer is connected and ready.');

  return producer;
}

export function getKafkaProducer() {
  if (!producer) {
    throw new Error('Kafka producer not initialized');
  }
  return producer;
}

export async function closeKafkaProducer() {
  if (producer) {
    await producer.disconnect();
    console.log('Kafka producer closed.');
    producer = null;
  }
}

export async function sendKafkaMessage(topic, message) {
  const kafkaProducer = getKafkaProducer();
  try {
    await kafkaProducer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (err) {
    console.error('Error sending message to Kafka:', err);
    throw err;
  }
}
