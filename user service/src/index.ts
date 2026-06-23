import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./route.js";
import cors from "cors";

dotenv.config();

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Mongo Db Connected");
  } catch (error) {
    console.log("MongoDB connection failed, retrying in 5s...", error);
    setTimeout(connectDb, 5000);
  }
};

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  })
);

app.use(express.json());

app.use("/api/v1", userRoutes);

app.get("/", (_req, res) => {
  res.send("Server is working");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDb();
});
