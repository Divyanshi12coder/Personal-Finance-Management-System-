import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { IStorageProvider } from './storage-provider.interface';

/** Works against MinIO locally and any S3-compatible bucket in production. */
@Injectable()
export class S3StorageProvider implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private readonly config: ConfigService) {
    this.endpoint = this.config.get<string>('S3_ENDPOINT') ?? 'http://localhost:9000';
    this.bucket = this.config.get<string>('S3_BUCKET') ?? 'finpilot-receipts';
    this.client = new S3Client({
      endpoint: this.endpoint,
      region: this.config.get<string>('S3_REGION') ?? 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.get<string>('S3_ACCESS_KEY') ?? '',
        secretAccessKey: this.config.get<string>('S3_SECRET_KEY') ?? '',
      },
    });
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: contentType }),
    );
    return `${this.endpoint}/${this.bucket}/${key}`;
  }
}
