import express from "express";
import doetnv from "dotenv";
import songRoutes from "./route.js";
import redis from "redis";
import cors from "cors";

doetnv.config();

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

const app = express();

app.use(cors());

app.use("/api/v1", songRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
