import {all as primes} from 'pregenerated-primes';

export class PrimeHolder {
  public static readonly LARGEST: number = primes[primes.length - 1];
  public static readonly LARGEST_LENGTH: number = String(PrimeHolder.LARGEST).length;
  private static readonly bigs: KnownPrime[] = [];

  public static get(index: number): KnownPrime {
    const big = this.bigs[index];
    if (big != null) {
      return big;
    }
    const calculated = new KnownPrime(primes[index]);
    this.bigs[index] = calculated;
    return calculated;
  }

  public static isPrime(big: BigInt): boolean | null {
    // noinspection SuspiciousTypeOfGuard
    if (big instanceof KnownPrime) {
      return true;
    }
    if (big.length <= this.LARGEST_LENGTH && big.num <= this.LARGEST) {
      return primes.indexOf(big.num) >= 0;
    }
    return null;
  }

  public static* iterator(): Iterator<KnownPrime> {
    let index = 0;
    while (index < primes.length) {
      yield this.get(index++);
    }
  }
}

/**
 * Probably the world's slowest implementation of BigInt.
 * Useful if you're on an old version of node/etc pre-es2018.
 */
// tslint:disable-next-line:max-classes-per-file
export class BigInt {
  public static readonly ONE = new BigInt([1], '1');
  public static readonly ZERO = new BigInt([0], '0');

  /**
   * "Do what I mean" abstractor.
   * @param something integer-like
   */
  public static from(something: string | number | BigInt): BigInt {
    if (something instanceof BigInt) {
      return something;
    } else if (typeof something === 'string') {
      return BigInt.fromString(something);
    }
    return BigInt.fromNumber(something);
  }

  /**
   * Builder from number
   * @param n integer
   */
  private static fromNumber(n: number): BigInt {
    if (Math.floor(n) !== n) {
      throw new Error(`Not an integer: ${n}`);
    }
    if (n < 0) {
      throw new Error(`Expected only positive: ${n}`);
    }
    if (n === 0) {
      return this.ZERO;
    } else if (n === 1) {
      return this.ONE;
    }
    const digits: number[] = [];
    let remaining = n;
    do {
      digits.unshift(remaining % 10);
      remaining = Math.floor(remaining / 10);
    } while (remaining > 0);
    return new BigInt(digits, String(n));
  }

  /**
   * Builder from string.
   * @param s integer-like
   */
  private static fromString(s: string): BigInt {
    if (s == null || s.length === 0 || s === '0') {
      return this.ZERO;
    } else if (s === '1') {
      return this.ONE;
    }
    const count = s.length;
    const digits: number[] = new Array(count);
    for (let i = count - 1; i >= 0; i--) {
      const digit = s.substring(i, i + 1);
      if (/\D/.test(digit)) {
        throw new Error(`Not a digit at ${digit} in ${s}`);
      }
      digits[i] = Number(digit);
    }
    return new BigInt(digits, s);
  }

  protected _factors: number[] | undefined = undefined;

  public get factors(): number[] {
    if (this._factors != null) {
      return this._factors;
    }
    if (this.isPrime) {
      this._factors = [this.num];
      return this._factors;
    }
    let remaining: BigInt = this;
    const facts: number[] = [];
    const primeIterator = PrimeHolder.iterator();
    let loopCount: number = 0;
    let prime = primeIterator.next().value;
    while (remaining.isNonZero && !remaining.isOne) {
      loopCount++;
      const [whole, remainder] = remaining.div(prime);
      if (remainder.isZero) {
        remaining = whole;
        facts.push(prime.num);
      } else if (prime.num >= PrimeHolder.LARGEST) {
        throw new Error('Ran out of primes');
      } else {
        prime = primeIterator.next().value;
      }
    }
    this._factors = facts;
    return facts;
  }

  protected _isPrime: boolean | null | undefined = undefined;

  public get isPrime(): boolean | null {
    if (this._isPrime === undefined) {
      this._isPrime = PrimeHolder.isPrime(this);
    }
    return this._isPrime;
  }

  /**
   * Inverse of {@link isZero}.
   */
  public get isNonZero(): boolean {
    return this.digits.length > 1 || this.digits[0] > 0;
  }

  /**
   * Is this equal to 1?
   */
  public get isOne(): boolean {
    return this.digits.length === 1 && this.digits[0] === 1;
  }

  /**
   * Is this equal to 0?
   */
  public get isZero(): boolean {
    return this.digits.length === 1 && this.digits[0] === 0;
  }

  /**
   * Number of digits in base-10.
   */
  public get length(): number {
    return this.digits.length;
  }

  /**
   * Try to represent this as a number.  May overflow, round, etc!
   */
  public get num(): number {
    return Number(this.str);
  }

  /**
   * Internal constructor
   * @param digits in big-endian order (ones at last index)
   * @param str cached string representation
   */
  protected constructor(
    public readonly digits: number[],
    public readonly str: string = digits.join(''),
  ) {
  }

  /**
   * Divide by the given number, where this number is the numerator.
   * @param divisorish integer-like
   * @return {[BigInt, BigInt]} whole and remainder
   */
  public div(divisorish: BigInt | number | string): [BigInt, BigInt] {
    const divisor = BigInt.from(divisorish);
    const dividend = this;
    if (divisor.isZero) {
      throw new Error(`Divide by zero: ${dividend.str}`);
    }
    if (divisor.isOne) {
      return [dividend, BigInt.ZERO];
    }
    if (divisor.digits.length > dividend.digits.length) {
      return [BigInt.ZERO, dividend];
    }
    if (divisor.str === dividend.str) {
      return [BigInt.ONE, BigInt.ZERO];
    }
    if (dividend.length <= 8 && divisor.length <= 8) {  // cheat
      const n = dividend.num;
      const d = divisor.num;
      const r = BigInt.fromNumber(n % d);
      const w = BigInt.fromNumber(Math.floor(n / d));
      return [w, r];
    }
    if (divisor.length <= 8) {  // also cheat
      const d = divisor.num;
      let n = Number(dividend.str.substring(0, divisor.length));
      let whole: BigInt = BigInt.ZERO;
      let remainder: number = 0;
      const places = dividend.length - divisor.length;
      for (let place = 0; place <= places; place++) {
        const times = Math.floor(n / d);
        const fill = times * d;
        n = n - fill;
        if (place < places) {
          n = n * 10 + Number(dividend.str.substr(divisor.length + place, 1));
        } else {
          remainder = n;
        }
        whole = whole.times(10).plus(times);
      }
      return [whole, BigInt.fromNumber(remainder)];
    }
    const factorMap: { [key: number]: number } = dividend.factors.reduce((map, factor) => {
      map[factor] = (map[factor] || 0) + 1;
      return map;
    }, <{ [key: number]: number }> {});
    let reducedDividend: BigInt = dividend;
    let reducedDivisor: BigInt = divisor;
    for (const factor of divisor.factors) {
      if (factor in factorMap && factorMap[factor] > 0) {
        let shouldBeZero: BigInt;
        [reducedDividend, shouldBeZero] = reducedDividend.div(factor);
        if (shouldBeZero.isNonZero) {
          /* istanbul ignore next */
          throw new Error(`Expected zero in dividend: ${shouldBeZero}`);
        }
        [reducedDivisor, shouldBeZero] = reducedDivisor.div(factor);
        if (shouldBeZero.isNonZero) {
          /* istanbul ignore next */
          throw new Error(`Expected zero in divisor: ${shouldBeZero}`);
        }
        factorMap[factor] = factorMap[factor] - 1;
      }
    }
    if (reducedDividend !== dividend) {
      return reducedDividend.div(reducedDivisor);
    }
    throw new Error(`Long division not implemented: ${dividend} / ${divisor}`);
  }

  public eq(other: number | string | BigInt): boolean {
    const right = BigInt.from(other);
    if (this === other) {
      return true;
    }
    if (this.length !== right.length) {
      return false;
    }
    return this.digits.filter((value, index) => right.digits[index] !== value).length === 0;
  }

  /**
   * Addition
   * @param other integer-like
   */
  public plus(other: number | string | BigInt): BigInt {
    const top = BigInt.from(other);
    if (this.isZero) {
      return top;
    }
    if (top.isZero) {
      return this;
    }
    const bottomDigits = this.reverse(this.digits);
    const topDigits = this.reverse(top.digits);
    const places = Math.max(bottomDigits.length, topDigits.length);
    for (let i = 0; i < places; i++) {
      const sum = (bottomDigits[i] || 0) + (topDigits[i] || 0);
      bottomDigits[i] = sum % 10;
      if (sum > 9) {
        bottomDigits[i + 1] = (bottomDigits[i + 1] || 0) + 1;
      }
    }
    return new BigInt(this.reverse(bottomDigits));
  }

  /**
   * Helper to reverse an array.
   * @param numbers Array
   * @see {Array.prototype.reverse}
   */
  private reverse(numbers: number[]): number[] {
    const rightMost = numbers.length - 1;
    return numbers.map((value, index, array) => array[rightMost - index]);
  }

  /**
   * Multiply
   * @param other integer-like
   */
  public times(other: number | string | BigInt): BigInt {
    if (this.isZero) {
      return this;
    }
    const top = BigInt.from(other);
    if (top.isZero || this.isOne) {
      return top;
    }
    if (top.isOne) {
      return this;
    }
    if (top.str === '10') {
      return new BigInt(this.digits.concat(0), this.str + '0');
    }
    let accumulator: BigInt = BigInt.ZERO;
    for (let bottomPlace = 0, bottomI = this.length - 1; bottomI >= 0; bottomI--, bottomPlace++) {
      const bottomN = this.digits[bottomI];
      const multiplied = this.reverse(top.digits.map((topN) => topN * bottomN));
      for (let i = 0; i < multiplied.length; i++) {
        const value = multiplied[i];
        if (value > 9) {
          const tens = Math.floor(value / 10);
          multiplied[i] = value % 10;
          multiplied[i + 1] = (multiplied[i + 1] || 0) + tens;
        }
      }
      for (let zero = 0; zero < bottomPlace; zero++) {
        multiplied.unshift(0);
      }
      const round = new BigInt(this.reverse(multiplied));
      accumulator = accumulator.plus(round);
    }
    // noinspection JSPrimitiveTypeWrapperUsage
    accumulator._factors = top.factors.concat(this.factors).sort();
    // noinspection JSPrimitiveTypeWrapperUsage
    accumulator._isPrime = false;
    return accumulator;
  }

  /**
   * Because why not?
   */
  public toString(): string {
    return this.str;
  }
}

// tslint:disable-next-line:max-classes-per-file
class KnownPrime extends BigInt {

  constructor(num: number) {
    super([num], String(num));
    this._isPrime = true;
    this._factors = [num];
  }
}
