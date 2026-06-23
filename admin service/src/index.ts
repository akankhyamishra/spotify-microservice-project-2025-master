import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import adminRoutes from "./route.js";
import cloudinary from "cloudinary";
import redis from "redis";
import cors from "cors";
import { connectPublisher } from "./config/rabbitmq.js";

dotenv.config();

export const redisClient = redis.createClient({
  password: process.env.Redis_Password,
  socket: {
    host: process.env.Redis_Host,
    port: Number(process.env.Redis_Port),
  },
});

redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);

connectPublisher();

cloudinary.v2.config({
  cloud_name: process.env.Cloud_Name,
  api_key: process.env.Cloud_Api_Key,
  api_secret: process.env.Cloud_Api_Secret,
});

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  })
);

app.use(express.json());

async function initDB() {
  try {
    await sql`
        CREATE TABLE IF NOT EXISTS albums(
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description VARCHAR(255) NOT NULL,
          thumbnail VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `;

    await sql`
        CREATE TABLE IF NOT EXISTS songs(
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description VARCHAR(255) NOT NULL,
          thumbnail VARCHAR(255),
          audio VARCHAR(255) NOT NULL,
          album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initDb", error);
  }
}

app.use("/api/v1", adminRoutes);

const port = process.env.PORT;

initDB().then(() => {
  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
});
