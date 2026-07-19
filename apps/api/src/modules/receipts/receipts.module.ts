import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { TesseractOcrProvider } from './ocr/tesseract-ocr.provider';
import { OCR_PROVIDER } from './ocr/ocr-provider.interface';
import { S3StorageProvider } from './storage/s3-storage.provider';
import { STORAGE_PROVIDER } from './storage/storage-provider.interface';

@Module({
  controllers: [ReceiptsController],
  providers: [
    ReceiptsService,
    { provide: OCR_PROVIDER, useClass: TesseractOcrProvider },
    { provide: STORAGE_PROVIDER, useClass: S3StorageProvider },
  ],
})
export class ReceiptsModule {}
