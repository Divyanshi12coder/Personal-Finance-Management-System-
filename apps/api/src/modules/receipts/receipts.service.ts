import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { IOcrProvider, OCR_PROVIDER } from './ocr/ocr-provider.interface';
import { IStorageProvider, STORAGE_PROVIDER } from './storage/storage-provider.interface';
import { ConfirmReceiptDto } from './dto/confirm-receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(OCR_PROVIDER) private readonly ocr: IOcrProvider,
    @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
  ) {}

  /**
   * Step 1 of the human-in-the-loop flow: store the image, run OCR
   * extraction, and persist a PENDING receipt with the raw extraction.
   * No Transaction exists yet — that only happens on explicit confirm.
   */
  async uploadAndExtract(userId: string, file: Express.Multer.File) {
    const key = `${userId}/${crypto.randomUUID()}-${file.originalname}`;
    const imageUrl = await this.storage.upload(key, file.buffer, file.mimetype);
    const extracted = await this.ocr.extract(file.buffer);

    // Try to resolve the suggested category name to a real category id
    // the user can use (system or their own) — best-effort, non-blocking.
    let suggestedCategoryId: string | null = null;
    if (extracted.suggestedCategoryName) {
      const match = await this.prisma.category.findFirst({
        where: { name: extracted.suggestedCategoryName, OR: [{ userId }, { userId: null }] },
      });
      suggestedCategoryId = match?.id ?? null;
    }

    const receipt = await this.prisma.receipt.create({
      data: {
        userId,
        imageUrl,
        extractedData: { ...extracted, suggestedCategoryId } as never,
        confidenceScore: extracted.confidenceScore,
        status: 'PENDING',
      },
    });

    return receipt;
  }

  /**
   * Step 2: the user reviews/edits the extracted fields in the UI and
   * confirms — only then is a real Transaction created and linked back
   * to the receipt.
   */
  async confirm(userId: string, receiptId: string, dto: ConfirmReceiptDto) {
    const receipt = await this.prisma.receipt.findUnique({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundException({ code: 'RECEIPT_NOT_FOUND', message: 'Receipt not found.' });
    if (receipt.userId !== userId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your receipt.' });

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const extracted = (receipt.extractedData as { merchant?: string } | null) ?? {};

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          categoryId: dto.categoryId,
          type: 'EXPENSE',
          amountMinor: dto.amountMinor,
          currency: user.currency,
          occurredOn: new Date(dto.occurredOn),
          merchant: dto.merchant ?? extracted.merchant,
          source: 'RECEIPT_SCAN',
        },
      });

      await tx.receipt.update({
        where: { id: receiptId },
        data: { status: 'CONFIRMED', transactionId: transaction.id },
      });

      return transaction;
    });
  }

  async reject(userId: string, receiptId: string) {
    const receipt = await this.prisma.receipt.findUnique({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundException({ code: 'RECEIPT_NOT_FOUND', message: 'Receipt not found.' });
    if (receipt.userId !== userId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your receipt.' });

    return this.prisma.receipt.update({ where: { id: receiptId }, data: { status: 'REJECTED' } });
  }
}
