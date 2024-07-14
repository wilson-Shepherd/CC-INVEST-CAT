import kafka from "kafka-node";
import "dotenv/config";

const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_HOST });
const Producer = kafka.Producer;
const producer = new Producer(client);

export function ensureTopicExists(topicName) {
  return new Promise((resolve, reject) => {
    const topicsToCreate = [
      {
        topic: topicName,
        partitions: 1,
        replicationFactor: 1,
      },
    ];

    client.createTopics(topicsToCreate, (error, result) => {
      if (error) {
        console.error("Error creating topic:", error);
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

producer.on("ready", () => {
  console.log("Kafka Producer is ready");
});

producer.on("error", (err) => {
  console.error("Kafka Producer error:", err);
});

export function sendKafkaMessage(topic, message) {
  return new Promise((resolve, reject) => {
    const payloads = [{ topic, messages: message }];

    producer.send(payloads, (err, data) => {
      if (err) {
        console.error("Error sending message to Kafka:", err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export default { ensureTopicExists, sendKafkaMessage };
