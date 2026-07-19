import { describe, it, expect } from 'vitest';
import { formatMoney, formatPercent } from '../utils';

describe('formatMoney', () => {
  it('formats minor units as a currency string', () => {
    expect(formatMoney(149999, 'INR')).toContain('1,499.99');
  });

  it('handles zero correctly', () => {
    expect(formatMoney(0, 'INR')).toContain('0.00');
  });

  it('handles negative amounts', () => {
    expect(formatMoney(-50000, 'INR')).toContain('500.00');
  });
});

describe('formatPercent', () => {
  it('prefixes positive deltas with a plus sign', () => {
    expect(formatPercent(12.34)).toBe('+12.3%');
  });

  it('does not prefix negative deltas with an extra sign', () => {
    expect(formatPercent(-8.1)).toBe('-8.1%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('+0.0%');
  });
});
