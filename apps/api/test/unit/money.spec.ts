import { Money } from '../../src/common/money/money';

describe('Money', () => {
  it('constructs from minor units without precision loss', () => {
    const m = Money.fromMinorUnits(149999, 'INR');
    expect(m.toMinorUnits()).toBe(149999);
    expect(m.toDecimal()).toBeCloseTo(1499.99, 2);
  });

  it('constructs from a decimal amount correctly rounded to minor units', () => {
    const m = Money.fromDecimal(19.999, 'INR');
    expect(m.toMinorUnits()).toBe(2000); // rounds 1999.9 -> 2000 paise
  });

  it('adds and subtracts within the same currency', () => {
    const a = Money.fromDecimal(100, 'INR');
    const b = Money.fromDecimal(30, 'INR');
    expect(a.add(b).toDecimal()).toBeCloseTo(130);
    expect(a.subtract(b).toDecimal()).toBeCloseTo(70);
  });

  it('throws on cross-currency arithmetic instead of silently producing a wrong number', () => {
    const inr = Money.fromDecimal(100, 'INR');
    const usd = Money.fromDecimal(100, 'USD');
    expect(() => inr.add(usd)).toThrow(/Currency mismatch/);
  });

  it('computes percentageOf correctly, including a zero-denominator edge case', () => {
    const spent = Money.fromDecimal(750, 'INR');
    const budget = Money.fromDecimal(1000, 'INR');
    expect(spent.percentageOf(budget)).toBeCloseTo(75);

    const zeroBudget = Money.zero('INR');
    expect(spent.percentageOf(zeroBudget)).toBe(0);
  });

  it('rejects non-integer minor-unit construction', () => {
    expect(() => Money.fromMinorUnits(19.5, 'INR')).toThrow();
  });
});
