import {expect} from 'chai';
import {describe, it} from 'mocha';
import {BigInt, PrimeHolder} from "./BigInt";

describe('BigInt', () => {
  describe('from string', () => {
    it('works for zero', () => {
      const zero = BigInt.from('0');
      expect(zero.num).equals(0);
      expect(zero.str).equals('0');
      expect(zero.isNonZero).equals(false);
      expect(zero.isOne).equals(false);
      expect(zero.isZero).equals(true);
      expect(zero.digits).deep.equals([0]);
      expect(zero).equals(BigInt.ZERO);
    });
    it('works for 1', () => {
      const zero = BigInt.from('1');
      expect(zero.num).equals(1);
      expect(zero.str).equals('1');
      expect(zero.isNonZero).equals(true);
      expect(zero.isOne).equals(true);
      expect(zero.isZero).equals(false);
      expect(zero.digits).deep.equals([1]);
      expect(zero).equals(BigInt.ONE);
    });
    it('yields zero for empty string', () => {
      const zero = BigInt.from('');
      expect(zero.num).equals(0);
      expect(zero.str).equals('0');
      expect(zero.isNonZero).equals(false);
      expect(zero.isOne).equals(false);
      expect(zero.isZero).equals(true);
      expect(zero.digits).deep.equals([0]);
      expect(zero).equals(BigInt.ZERO);
    });
    it('throws for negative', () => {
      expect(() => BigInt.from('-5')).throws(/Not a digit/);
    });
    it('throws for decimal', () => {
      expect(() => BigInt.from('0.55')).throws(/Not a digit/);
    });
    it('throws for bogus', () => {
      expect(() => BigInt.from('1a1')).throws(/Not a digit/);
    });
    it('works for multi-digit numbers', () => {
      const num = BigInt.from('234');
      expect(num.num).equals(234);
      expect(num.str).equals('234');
      expect(num.isNonZero).equals(true);
      expect(num.digits).deep.equals([2, 3, 4]);
    });
    it('works for single-digit numbers', () => {
      const num = BigInt.from('7');
      expect(num.num).equals(7);
      expect(num.str).equals('7');
      expect(num.isNonZero).equals(true);
      expect(num.digits).deep.equals([7]);
    });
  });
  describe('from number', () => {
    it('works for multi-digit numbers', () => {
      const num = BigInt.from(234);
      expect(num.num).equals(234);
      expect(num.str).equals('234');
      expect(num.isNonZero).equals(true);
      expect(num.digits).deep.equals([2, 3, 4]);
    });
    it('works for single-digit numbers', () => {
      const num = BigInt.from(7);
      expect(num.num).equals(7);
      expect(num.str).equals('7');
      expect(num.isNonZero).equals(true);
      expect(num.digits).deep.equals([7]);
    });
    it('works for ZERO', () => {
      const zero = BigInt.ZERO;
      expect(zero.num).equals(0);
      expect(zero.str).equals('0');
      expect(zero.isNonZero).equals(false);
    });
    it('throws for negative', () => {
      expect(() => BigInt.from(-5)).throws(/Expected only positive/);
    });
    it('throws for decimal', () => {
      expect(() => BigInt.from(0.55)).throws(/Not an integer/);
    });
  });
  describe('div', () => {
    it('throws when the divisor is zero', () => {
      expect(() => BigInt.from(2).div(BigInt.ZERO)).throws(/Divide by zero/);
    });
    it('works for small numbers', () => {
      const [whole, remainder] = BigInt.from(37).div(12);
      expect(whole.num).equals(3, 'whole (num)');
      expect(whole.str).equals('3', 'whole (str)');
      expect(remainder.num).equals(1, 'remainder (num)');
      expect(remainder.str).equals('1', 'remainder (str)');
    });
    it('works for big numbers divided by small numbers', () => {
      const [whole, remainder] = BigInt.from(1234567890).div(12);
      expect(whole.num).equals(102880657, 'whole (num)');
      expect(whole.str).equals('102880657', 'whole (str)');
      expect(remainder.num).equals(6, 'remainder (num)');
      expect(remainder.str).equals('6', 'remainder (str)');
    });
    it('knows anything / 1', () => {
      const big = BigInt.from(19);
      const [whole, remainder] = big.div(1);
      expect(whole).equals(big);
      expect(remainder.isZero).equals(true);
    });
    it('knows anything / itself', () => {
      const [whole, remainder] = BigInt.from('1234567890').div('1234567890');
      expect(whole.isOne).equals(true);
      expect(remainder.isZero).equals(true);
    });
    it('knows small / big', () => {
      const big = BigInt.from(1234);
      const small = BigInt.from(56);
      const [whole, remainder] = small.div(big);
      expect(whole.isZero).equals(true);
      expect(remainder).equals(small);
    });
    it('can reduce', () => {
      const a = BigInt.from(0xc8945);
      const b = BigInt.from(0xc8963);
      const c = BigInt.from(0xc8989);
      const ab = a.times(b);
      expect(ab.str).equals('675006841519');
      expect(ab.factors).deep.equals([a.num, b.num]);
      const ac = a.times(c);
      expect(ac.str).equals('675038061293');
      expect(ac.factors).deep.equals([a.num, c.num]);
      const [whole, remainder] = ac.div(ab);
      const [reducedWhole, reducedRemainder] = c.div(b);
      expect(whole.digits).deep.equals(reducedWhole.digits);
      expect(whole.isOne).equals(true);
      expect(remainder.digits).deep.equals(reducedRemainder.digits);
    });
    it('throws for big / big', () => {
      expect(() => BigInt.from('1234567890').div('987654321')).throws(/Long division not implemented/);
    });
  });
  describe('plus', () => {
    it('0 + 0', () => expect(BigInt.ZERO.plus(0).num).equals(0));
    it('5 + 0', () => expect(BigInt.from(5).plus(0).num).equals(5));
    it('0 + 5', () => expect(BigInt.ZERO.plus(5).num).equals(5));
    it('13 + 5', () => expect(BigInt.from(13).plus(5).num).equals(18));
    it('8 + 95', () => expect(BigInt.from(8).plus(95).num).equals(103));
    it('92 + 9', () => expect(BigInt.from(92).plus(9).num).equals(101));
  });
  describe('mul', () => {
    it('0 * 0', () => expect(BigInt.ZERO.times(0).num).equals(0));
    it('5 * 0', () => expect(BigInt.from(5).times(0).num).equals(0));
    it('0 * 5', () => expect(BigInt.ZERO.times(5).num).equals(0));
    it('0 * 1', () => expect(BigInt.ZERO.times(0).num).equals(0));
    it('1 * 0', () => expect(BigInt.from(5).times(0).num).equals(0));
    it('1 * 1', () => expect(BigInt.ONE.times(1).num).equals(1));
    it('1 * 6', () => expect(BigInt.ONE.times(6).num).equals(6));
    it('6 * 1', () => expect(BigInt.from(6).times(1).num).equals(6));
    it('13 * 5', () => expect(BigInt.from(13).times(5).num).equals(65));
    it('8 * 95', () => expect(BigInt.from(8).times(95).num).equals(760));
    it('92 * 9', () => expect(BigInt.from(92).times(9).num).equals(828));
  });
  describe('toString', () => {
    const val = '1234567890';
    expect(BigInt.from(val).toString()).equals(val);
  });
  describe('factors', () => {
    it('handles 0', () => {
      expect(BigInt.ZERO.factors).deep.equals([]);
    });
    it('handles 1', () => {
      expect(BigInt.ONE.factors).deep.equals([]);
    });
    it('handles 2', () => {
      expect(BigInt.from(2).factors).deep.equals([2]);
    });
    it('handles 4', () => {
      expect(BigInt.from(4).factors).deep.equals([2, 2]);
    });
    it('handles 6', () => {
      expect(BigInt.from(6).factors).deep.equals([2, 3]);
    });
    it('handles 8', () => {
      expect(BigInt.from(8).factors).deep.equals([2, 2, 2]);
    });
    it('throws when it runs out of primes', () => {
      expect(() => BigInt.from(PrimeHolder.LARGEST).plus(6).factors).throws(/Ran out of primes/);
    });
  });
  describe('isPrime', () => {
    it('shortcuts if known', () => {
      expect(PrimeHolder.isPrime(PrimeHolder.get(4))).equals(true);
    });
  });
  describe('eq', () => {
    it('works for numeric zero', () => expect(BigInt.ZERO.eq(0)).equals(true));
    it('works for string zero', () => expect(BigInt.ZERO.eq('0')).equals(true));
    it('works for BigInt zero', () => expect(BigInt.ZERO.eq(BigInt.ZERO)).equals(true));
    it('ONE == 1', () => expect(BigInt.ONE.eq(1)).equals(true));
    it('ONE == "1"', () => expect(BigInt.ONE.eq('1')).equals(true));
    it('ONE == ONE', () => expect(BigInt.ONE.eq(BigInt.ONE)).equals(true));
    it('ZERO !== 1', () => expect(BigInt.ZERO.eq(1)).equals(false));
    it('ZERO !== "1"', () => expect(BigInt.ZERO.eq('1')).equals(false));
    it('ZERO !== ONE', () => expect(BigInt.ZERO.eq(BigInt.ONE)).equals(false));
    it('big(456) == 456', () => expect(BigInt.from(456).eq(456)).equals(true));
    it('big(456) == "456"', () => expect(BigInt.from(456).eq('456')).equals(true));
    it('big(456) !== 654', () => expect(BigInt.from(456).eq(654)).equals(false));
    it('big(456) !== "654"', () => expect(BigInt.from(456).eq('654')).equals(false));
    it('big(456) !== "65"', () => expect(BigInt.from(456).eq('65')).equals(false));
  });
});
