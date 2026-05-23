import { S3Client } from "@aws-sdk/client-s3";

const s3Credentials = {
  accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
  secretAccessKey: process.env.S3_SECRET_KEY || "minioadmin",
};

const s3Region = process.env.S3_REGION || "us-east-1";

const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT?.trim();

export const s3 = new S3Client({
  region: s3Region,
  endpoint:
    publicEndpoint || process.env.S3_ENDPOINT || "http://localhost:9000",
  credentials: s3Credentials,
  forcePathStyle: true,
});
