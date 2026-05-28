import {
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../s3Client.ts/s3Client";
import { randomUUID } from "crypto";

class S3Service {
  private readonly BUCKET_NAME =
    process.env.S3_BUCKET_NAME || "mini-market-bucket";

  async initializeBucket(): Promise<void> {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: this.BUCKET_NAME }));
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404) {
        await s3.send(
          new CreateBucketCommand({
            Bucket: this.BUCKET_NAME,
          })
        );
      } else {
        throw error;
      }
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split(".").pop();
    const key = `products/${randomUUID()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await s3.send(command);
    } catch (error: any) {
      if (error?.$metadata?.httpStatusCode === 413) {
        const err = new Error(
          `Хранилище отклонило загрузку (слишком большой файл): ${file.originalname}`
        ) as Error & { statusCode?: number };
        err.statusCode = 413;
        throw err;
      }
      throw error;
    }

    return key;
  }

  async getFileUrl(key: string): Promise<string> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(s3, getObjectCommand, {
      expiresIn: 7 * 24 * 60 * 60,
    });
  }

  async deleteFile(key: string): Promise<void> {
    if (!key) return;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: this.BUCKET_NAME,
        Key: key,
      })
    );
  }

  async deleteFiles(keys: string[]): Promise<void> {
    const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
    await Promise.all(uniqueKeys.map((key) => this.deleteFile(key)));
  }

  async getFileBuffer(key: string): Promise<Buffer> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.BUCKET_NAME,
      Key: key,
    });

    const response = await s3.send(getObjectCommand);
    const stream = response.Body as any;

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }
}

export default new S3Service();
