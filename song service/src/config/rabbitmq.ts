import amqplib from "amqplib";
import { redisClient } from "../index.js";

const QUEUE = "cache_invalidation";

export async function connectConsumer(): Promise<void> {
  if (!process.env.RABBITMQ_URL) {
    console.log("RABBITMQ_URL not set — RabbitMQ consumer disabled");
    return;
  }
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    channel.prefetch(1);

    console.log("RabbitMQ consumer connected — waiting for invalidation events");

    channel.consume(QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const { keys } = JSON.parse(msg.content.toString()) as {
          keys: string[];
        };
        if (redisClient.isReady) {
          for (const key of keys) {
            await redisClient.del(key);
            console.log(`Redis key invalidated via RabbitMQ: ${key}`);
          }
        }
        channel.ack(msg);
      } catch (err) {
        console.error("Failed to process RabbitMQ message:", err);
        channel.nack(msg, false, false);
      }
    });

    conn.on("error", (err) => {
      console.error("RabbitMQ error:", err.message);
    });
    conn.on("close", () => {
      console.warn("RabbitMQ connection closed — reconnecting in 5s");
      setTimeout(connectConsumer, 5000);
    });
  } catch (err) {
    console.error("RabbitMQ consumer failed to connect:", err);
    setTimeout(connectConsumer, 5000);
  }
}
