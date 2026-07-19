/**
 * Money is always represented internally as an integer number of the
 * currency's minor unit (e.g. paise for INR, cents for USD). This class
 * is the ONLY place arithmetic on money happens, so rounding bugs can't
 * creep in anywhere else in the codebase.
 *
 * Never use `number`/`float` for money outside of display formatting.
 */
export class Money {
  private constructor(
    private readonly minorUnits: number,
    private readonly currency: string,
  ) {
    if (!Number.isInteger(minorUnits)) {
      throw new Error('Money must be constructed from an integer minor-unit amount.');
    }
  }

  static fromMinorUnits(amount: number, currency = 'INR'): Money {
    return new Money(amount, currency);
  }

  /** Convenience for constructing from a user-facing decimal input, e.g. 149.99 -> 14999 */
  static fromDecimal(amount: number, currency = 'INR'): Money {
    return new Money(Math.round(amount * 100), currency);
  }

  static zero(currency = 'INR'): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.minorUnits + other.minorUnits, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.minorUnits - other.minorUnits, this.currency);
  }

  percentageOf(other: Money): number {
    this.assertSameCurrency(other);
    if (other.minorUnits === 0) return 0;
    return (this.minorUnits / other.minorUnits) * 100;
  }

  isNegative(): boolean {
    return this.minorUnits < 0;
  }

  toMinorUnits(): number {
    return this.minorUnits;
  }

  toDecimal(): number {
    return this.minorUnits / 100;
  }

  /** Locale-aware display string, e.g. "₹1,499.99" */
  format(locale = 'en-IN'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: this.currency }).format(
      this.toDecimal(),
    );
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
