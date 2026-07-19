'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, Check, X } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/hooks/useTransactions';
import { useQueryClient } from '@tanstack/react-query';

interface ExtractedReceipt {
  id: string;
  extractedData: {
    merchant: string | null;
    amountMinor: number | null;
    date: string | null;
    suggestedCategoryId: string | null;
  };
  confidenceScore: number;
}

/**
 * Implements the human-in-the-loop flow: upload -> OCR draft -> user
 * reviews/edits every field -> explicit confirm creates the transaction.
 * Nothing is saved as a real transaction until the user confirms.
 */
export function ReceiptUploader() {
  const [receipt, setReceipt] = useState<ExtractedReceipt | null>(null);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: categories } = useCategories();
  const queryClient = useQueryClient();

  const expenseCategories = categories?.filter((c) => c.type === 'EXPENSE') ?? [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.post<ExtractedReceipt>('/receipts', formData);
      setReceipt(result);
      setAmount(result.extractedData.amountMinor ? (result.extractedData.amountMinor / 100).toString() : '');
      setMerchant(result.extractedData.merchant ?? '');
      setDate(result.extractedData.date ?? new Date().toISOString().slice(0, 10));
      setCategoryId(result.extractedData.suggestedCategoryId ?? '');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!receipt) return;
    await apiClient.post(`/receipts/${receipt.id}/confirm`, {
      categoryId,
      amountMinor: Math.round(Number(amount) * 100),
      occurredOn: date,
      merchant,
    });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    setReceipt(null);
  };

  const handleDiscard = async () => {
    if (receipt) await apiClient.post(`/receipts/${receipt.id}/reject`);
    setReceipt(null);
  };

  if (!receipt) {
    return (
      <div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Reading receipt…' : 'Scan a receipt'}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brass-500/40 bg-brass-500/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">Review extracted details</p>
        <span className="text-xs text-ink-400">
          Confidence: {Math.round(receipt.confidenceScore * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="r-merchant">Merchant</Label>
          <Input id="r-merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="r-amount">Amount</Label>
          <Input id="r-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="r-date">Date</Label>
          <Input id="r-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="r-category">Category</Label>
          <select
            id="r-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-600 dark:bg-ink-800"
          >
            <option value="">Select a category</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={handleConfirm} disabled={!amount || !categoryId}>
          <Check className="h-4 w-4" /> Confirm & Save
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDiscard}>
          <X className="h-4 w-4" /> Discard
        </Button>
      </div>
    </div>
  );
}
