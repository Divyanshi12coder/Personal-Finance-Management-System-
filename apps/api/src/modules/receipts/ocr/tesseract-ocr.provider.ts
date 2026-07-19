import { Injectable, Logger } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import { ExtractedReceiptData, IOcrProvider } from './ocr-provider.interface';

/**
 * Local, free OCR using Tesseract.js. Runs raw text recognition, then
 * applies lightweight structured-extraction heuristics (regex for
 * amounts/dates, first non-numeric line as merchant). This keeps the
 * default setup dependency-free and runnable entirely offline; a cloud
 * Vision provider can be swapped in via OCR_PROVIDER=cloud-vision for
 * meaningfully higher accuracy in production.
 */
@Injectable()
export class TesseractOcrProvider implements IOcrProvider {
  private readonly logger = new Logger(TesseractOcrProvider.name);

  async extract(imageBuffer: Buffer): Promise<ExtractedReceiptData> {
    const worker = await createWorker('eng');
    try {
      const { data } = await worker.recognize(imageBuffer);
      const rawText = data.text;
      return {
        merchant: this.extractMerchant(rawText),
        amountMinor: this.extractAmountMinor(rawText),
        date: this.extractDate(rawText),
        suggestedCategoryName: this.guessCategory(rawText),
        confidenceScore: Math.min(1, (data.confidence ?? 0) / 100),
        rawText,
      };
    } catch (err) {
      this.logger.error('OCR extraction failed', err as Error);
      throw err;
    } finally {
      await worker.terminate();
    }
  }

  private extractMerchant(text: string): string | null {
    const firstLine = text.split('\n').map((l) => l.trim()).find((l) => l.length > 2 && !/^\d/.test(l));
    return firstLine ?? null;
  }

  private extractAmountMinor(text: string): number | null {
    // Looks for the largest currency-like figure on the receipt — typically the total.
    const matches = [...text.matchAll(/(?:₹|Rs\.?|INR|\$)?\s?(\d{1,3}(?:[,.]\d{3})*(?:\.\d{1,2})?)/g)];
    const amounts = matches
      .map((m) => Number(m[1].replace(/,/g, '')))
      .filter((n) => !Number.isNaN(n) && n > 0);
    if (amounts.length === 0) return null;
    return Math.round(Math.max(...amounts) * 100);
  }

  private extractDate(text: string): string | null {
    const match = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/.exec(text);
    if (!match) return null;
    const parsed = new Date(match[1]);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
  }

  private guessCategory(text: string): string | null {
    const lower = text.toLowerCase();
    const rules: [RegExp, string][] = [
      [/restaurant|cafe|coffee|diner|food/, 'Dining'],
      [/mart|grocery|supermarket|store/, 'Groceries'],
      [/uber|ola|taxi|fuel|petrol|gas station/, 'Transportation'],
      [/pharmacy|clinic|hospital|medical/, 'Healthcare'],
      [/cinema|movie|theatre/, 'Entertainment'],
    ];
    for (const [pattern, category] of rules) {
      if (pattern.test(lower)) return category;
    }
    return null;
  }
}
