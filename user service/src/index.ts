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
    console.log(error);
    process.exit(1);
  }
};

const app = express();

app.use(cors());

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
