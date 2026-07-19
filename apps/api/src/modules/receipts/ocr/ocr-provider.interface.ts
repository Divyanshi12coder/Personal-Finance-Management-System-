export interface ExtractedReceiptData {
  merchant: string | null;
  amountMinor: number | null;
  date: string | null; // ISO date
  suggestedCategoryName: string | null;
  confidenceScore: number; // 0-1
  rawText: string;
}

export const OCR_PROVIDER = 'OCR_PROVIDER';

/**
 * Pluggable OCR boundary. Swapping Tesseract (free, local, lower accuracy)
 * for a cloud Vision API (paid, higher accuracy) is a one-file change —
 * nothing in the receipts service or controller needs to change.
 */
export interface IOcrProvider {
  extract(imageBuffer: Buffer): Promise<ExtractedReceiptData>;
}
