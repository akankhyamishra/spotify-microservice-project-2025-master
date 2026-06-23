import amqplib, { Channel } from "amqplib";

export const QUEUE = "cache_invalidation";

let channel: Channel | null = null;

export async function connectPublisher(): Promise<void> {
  if (!process.env.RABBITMQ_URL) {
    console.log("RABBITMQ_URL not set — RabbitMQ publisher disabled");
    return;
  }
  try {
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertQueue(QUEUE, { durable: true });
    console.log("RabbitMQ publisher connected");

    conn.on("error", (err) => {
      console.error("RabbitMQ error:", err.message);
      channel = null;
    });
    conn.on("close", () => {
      console.warn("RabbitMQ connection closed — reconnecting in 5s");
      channel = null;
      setTimeout(connectPublisher, 5000);
    });
  } catch (err) {
    console.error("RabbitMQ publisher failed to connect:", err);
    setTimeout(connectPublisher, 5000);
  }
}

export function publishInvalidation(keys: string[]): void {
  if (!channel) {
    console.warn("RabbitMQ channel not ready — skipping invalidation publish");
    return;
  }
  channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify({ keys })), {
    persistent: true,
  });
  console.log("Published cache invalidation →", keys);
}
