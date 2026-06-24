import amqp from "amqplib";

const EXCHANGE = "user_events";
let channel: amqp.Channel | null = null;

async function getChannel(): Promise<amqp.Channel | null> {
  if (!process.env.RABBIT_URI) return null;
  if (channel) return channel;
  try {
    const conn = await amqp.connect(process.env.RABBIT_URI);
    channel = await conn.createChannel();
    await channel.assertExchange(EXCHANGE, "topic", { durable: true });
    return channel;
  } catch {
    return null;
  }
}

export async function publishEvent(routingKey: string, payload: object): Promise<void> {
  try {
    const ch = await getChannel();
    if (!ch) return;
    ch.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), { persistent: true });
  } catch {}
}
