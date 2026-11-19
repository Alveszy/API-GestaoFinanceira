import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  StreamableFile,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

@Injectable()
export class TransactionReceiptsService {
  private readonly bucket: string;
  private readonly client?: S3Client;

  constructor(config: ConfigService) {
    this.bucket = config.get('R2_BUCKET', '');
    const endpoint = config.get('R2_ENDPOINT', '').match(
      /^(https:\/\/[a-f\d]{32}(?:\.[a-z]+)?\.r2\.cloudflarestorage\.com)(?:\/([a-z\d-]+)?)?$/i,
    );
    const accessKeyId = config.get('R2_ACCESS_KEY_ID', '');
    const secretAccessKey = config.get('R2_SECRET_ACCESS_KEY', '');
    if (this.bucket && accessKeyId && secretAccessKey && endpoint &&
      (!endpoint[2] || endpoint[2] === this.bucket)) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: endpoint[1],
        forcePathStyle: true,
        credentials: { accessKeyId, secretAccessKey },
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
      });
    }
  }

  async put(userId: string, transactionId: string, bytes?: Buffer) {
    if (!bytes?.length) throw new BadRequestException('Selecione um comprovante PDF ou JPG.');
    let type: 'application/pdf' | 'image/jpeg';
    if (bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
      type = 'application/pdf';
    } else if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
      type = 'image/jpeg';
    } else {
      throw new BadRequestException('Envie um comprovante PDF ou JPG.');
    }
    await this.send(client => client.send(new PutObjectCommand({
      Bucket: this.bucket, Key: this.key(userId, transactionId),
      Body: bytes, ContentType: type,
    }), { abortSignal: AbortSignal.timeout(10000) }));
    return { contentType: type, size: bytes.length };
  }

  async get(userId: string, transactionId: string, preview = false) {
    const object = await this.send(client => client.send(new GetObjectCommand({
      Bucket: this.bucket, Key: this.key(userId, transactionId),
    }), { abortSignal: AbortSignal.timeout(10000) }));
    const type = object.ContentType;
    if (!(object.Body instanceof Readable) || (type !== 'application/pdf' && type !== 'image/jpeg')) {
      if (object.Body instanceof Readable) object.Body.destroy();
      throw new ServiceUnavailableException('Comprovante indisponível.');
    }
    if (preview && type !== 'image/jpeg') {
      object.Body.destroy();
      throw new UnsupportedMediaTypeException('A visualização é para JPG. Use a rota de download para PDF.');
    }
    const extension = type === 'application/pdf' ? 'pdf' : 'jpg';
    return new StreamableFile(object.Body, {
      type,
      length: object.ContentLength,
      disposition: `${preview ? 'inline' : 'attachment'}; filename="comprovante.${extension}"`,
    });
  }

  async deleteForTransaction(userId: string, transactionId: string) {
    if (!this.bucket) return;
    await this.send(client => client.send(new DeleteObjectCommand({
      Bucket: this.bucket, Key: this.key(userId, transactionId),
    }), { abortSignal: AbortSignal.timeout(10000) }));
  }

  private key(userId: string, transactionId: string) {
    return `receipts/${userId}/${transactionId}`;
  }

  private async send<T>(operation: (client: S3Client) => Promise<T>) {
    if (!this.client) {
      throw new ServiceUnavailableException('Armazenamento de comprovantes não configurado.');
    }
    try {
      return await operation(this.client);
    } catch (error) {
      if (error instanceof Error && error.name === 'NoSuchKey') {
        throw new NotFoundException('Comprovante não encontrado.');
      }
      throw new ServiceUnavailableException('Armazenamento de comprovantes indisponível.');
    }
  }
}
