import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import router from "./router";
import S3Service from "./service/s3.service";

dotenv.config({ quiet: true });

const port = process.env.API_PORT || 5000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use("/api", router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, async () => {
  try {
    await S3Service.initializeBucket();
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
