import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats an integer minor-unit amount (paise/cents) as a currency string. */
export function formatMoney(minorUnits: number, currency = 'INR', locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(minorUnits / 100);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
