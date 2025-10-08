/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { s3Client } from './s3.config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private bucketName = process.env.AWS_S3_BUCKET_NAME!;

  async uploadFile(
    file: Express.Multer.File,
    folder = 'elders',
  ): Promise<string> {
    const key = `${folder}/${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // URL pública (se o bucket permitir acesso público)
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
