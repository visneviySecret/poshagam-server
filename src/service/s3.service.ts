import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../s3Client.ts/s3Client";
import { randomUUID } from "crypto";

class S3Service {
  private readonly BUCKET_NAME =
    process.env.S3_BUCKET_NAME || "mini-market-bucket";

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split(".").pop();
    const key = `products/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    const fileUrl = `${process.env.S3_URL || "http://localhost:4566"}/${
      this.BUCKET_NAME
    }/${key}`;
    return fileUrl;
  }
}

export default new S3Service();
