import express from "express";
import https from "https";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import router from "./router";
import S3Service from "./service/s3.service";
import {
  getSSLConfig,
  validateSSLConfig,
  getHTTPSOptions,
} from "./config/ssl.config";
import { createProxyMiddleware } from "http-proxy-middleware";

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

app.use(
  createProxyMiddleware({
    target: "http://localhost:3000",
    changeOrigin: true,
    ws: true,
    pathFilter: (pathname) => !pathname.startsWith("/api"),
  })
);

const startServer = async () => {
  try {
    try {
      await S3Service.initializeBucket();
    } catch (s3Error) {
      console.error("S3 initialization failed:", s3Error);
      console.warn(
        "Server will start without S3. File operations will fail until S3 is available."
      );
    }

    const sslConfig = getSSLConfig();
    validateSSLConfig(sslConfig);

    if (sslConfig.enabled) {
      const httpsOptions = getHTTPSOptions(sslConfig);

      if (!httpsOptions) {
        throw new Error("Failed to load HTTPS options");
      }

      https
        .createServer(httpsOptions, app)
        .listen(sslConfig.httpsPort, "0.0.0.0", () => {
          console.log(`HTTPS server is running on port ${sslConfig.httpsPort}`);
        });

      http
        .createServer((req, res) => {
          res.writeHead(301, {
            Location: "https://" + req.headers.host + req.url,
          });
          res.end();
        })
        .listen(sslConfig.httpPort, () => {
          console.log(
            `HTTP redirect server is running on port ${sslConfig.httpPort}`
          );
        });
    } else {
      app.listen(port, () => {
        console.log(`HTTP server is running on port ${port}`);
      });
    }
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();
