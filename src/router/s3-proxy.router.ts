import { Router, Request, Response } from "express";
import http from "http";

const router = Router();
const MINIO_BASE = process.env.S3_ENDPOINT || "http://127.0.0.1:9000";

router.get("/:bucket/*key", (req: Request, res: Response) => {
  const bucket = req.params.bucket;
  const key = req.params.key || "";
  const query = req.originalUrl.includes("?")
    ? "?" + req.originalUrl.split("?")[1]
    : "";

  if (!bucket || !key) {
    res.status(400).json({ message: "bucket and key required" });
    return;
  }

  const targetUrl = `${MINIO_BASE}/${bucket}/${key}${query}`;

  const proxyReq = http.get(targetUrl, (proxyRes) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");
    const contentType = proxyRes.headers["content-type"];
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    const contentLength = proxyRes.headers["content-length"];
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }
    res.status(proxyRes.statusCode || 200);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("[s3-proxy] error", err.message, targetUrl);
    if (!res.headersSent) {
      res.status(502).json({
        message: "Proxy to MinIO failed",
        error: err.message,
      });
    }
  });

  req.on("aborted", () => {
    proxyReq.destroy();
  });
});

export default router;
