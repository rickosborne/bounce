import {expect} from 'chai';
import {describe, it} from 'mocha';
import {buildParser} from "./JsonParser.impl";
import {MegaCombo, OneOptionalDate, OneOptionalInt, OneOptionalString, OneRequiredString} from "./ParserTest";

describe('JsonParser', () => {
  describe('optionalDate', () => {
    const pedanticParser = buildParser<OneOptionalDate>('OneOptionalDate')
      .optionalDate('opt')
      .parser();
    const indifferentParser = buildParser<OneOptionalDate>('OneOptionalDate')
      .optionalDate('opt', false)
      .parser();
    expect(pedanticParser).not.eq(null);
    expect(indifferentParser).not.eq(null);
    const date = new Date();

    it('finds a date if given', () => {
      expect(pedanticParser.parse({opt: date, ignored: true})).to.deep.eq({opt: date});
    });
    it('converts a number if given', () => {
      expect(pedanticParser.parse({opt: date.valueOf(), ignored: true})).to.deep.eq({opt: date});
    });
    it('converts a string if given', () => {
      expect(pedanticParser.parse({opt: date.valueOf(), ignored: true})).to.deep.eq({opt: date});
    });
    it('ignores a missing date', () => {
      expect(pedanticParser.parse({ignored: true})).to.deep.eq({});
    });
    it('throws if not a date', () => {
      expect(() => pedanticParser.parse({opt: /foo/, ignored: true})).throws(/Cannot convert "object" to Date/);
    });
    it('returns undefined (skips) if not a date', () => {
      expect(indifferentParser.parse({opt: /foo/, ignored: true})).to.deep.eq({});
    });
    it('returns undefined (skips) if null', () => {
      expect(pedanticParser.parse({opt: null, ignored: true})).to.deep.eq({});
    });
  });
  describe('optionalInt', () => {
    const pedanticParser = buildParser<OneOptionalInt>('OneOptionalInt')
      .optionalInt('opt')
      .parser();
    const indifferentParser = buildParser<OneOptionalInt>('OneOptionalInt')
      .optionalInt('opt', false)
      .parser();
    expect(pedanticParser).not.eq(null);
    expect(indifferentParser).not.eq(null);
    const int = 12345;

    it('finds an int if given', () => {
      expect(pedanticParser.parse({opt: int, ignored: true})).to.deep.eq({opt: int});
    });
    it('throws if given a float', () => {
      expect(() => pedanticParser.parse({opt: 12.34, ignored: true})).throws(/Not an integer:/);
    });
    it('skips if given a float', () => {
      expect(indifferentParser.parse({opt: 12.34, ignored: true})).to.deep.eq({});
    });
    it('converts a string if given', () => {
      expect(pedanticParser.parse({opt: String(int), ignored: true})).to.deep.eq({opt: int})
        .and.to.haveOwnProperty('opt').equals(int);
    });
    it('ignores a missing int', () => {
      expect(pedanticParser.parse({ignored: true})).to.deep.eq({});
    });
    it('throws if not an int', () => {
      expect(() => pedanticParser.parse({opt: /foo/, ignored: true})).throws(/Cannot convert "object" to integer/);
    });
    it('returns undefined (skips) if not an int', () => {
      expect(indifferentParser.parse({opt: /foo/, ignored: true})).to.deep.eq({});
    });
    it('returns undefined (skips) if null', () => {
      expect(pedanticParser.parse({opt: null, ignored: true})).to.deep.eq({});
    });
  });
  describe('optionalString', () => {
    const pedanticParser = buildParser<OneOptionalString>('OneOptionalString')
      .optionalString('opt')
      .parser();
    const indifferentParser = buildParser<OneOptionalString>('OneOptionalString')
      .optionalString('opt', false)
      .parser();
    expect(pedanticParser).not.eq(null);
    expect(indifferentParser).not.eq(null);
    const str = "abc123";

    it('finds a string if given', () => {
      expect(pedanticParser.parse({opt: str, ignored: true})).to.deep.eq({opt: str});
    });
    it('throws if given a number', () => {
      expect(() => pedanticParser.parse({opt: 123, ignored: true})).throws(/Cannot convert "number" to string/);
    });
    it('skips if given a number', () => {
      expect(indifferentParser.parse({opt: 123, ignored: true})).to.deep.eq({});
    });
    it('ignores a missing string', () => {
      expect(pedanticParser.parse({ignored: true})).to.deep.eq({});
    });
    it('throws if not a string', () => {
      expect(() => pedanticParser.parse({opt: /foo/, ignored: true})).throws(/Cannot convert "object" to string/);
    });
    it('returns undefined (skips) if not a string', () => {
      expect(indifferentParser.parse({opt: /foo/, ignored: true})).to.deep.eq({});
    });
    it('returns undefined (skips) if null', () => {
      expect(pedanticParser.parse({opt: null, ignored: true})).to.deep.eq({});
    });
  });
  describe('requiredString', () => {
    const pedanticParser = buildParser<OneRequiredString>('OneRequiredString')
      .requiredString('req')
      .parser();
    expect(pedanticParser).not.eq(null);
    const indifferentParser = buildParser<OneRequiredString>('OneRequiredString')
      .requiredString('req', false)
      .parser();
    expect(indifferentParser).not.eq(null);
    const str = "abc123";

    it('finds a string if given', () => {
      expect(pedanticParser.parse({req: str, ignored: true})).to.deep.eq({req: str});
    });
    it('throws if given a number', () => {
      expect(() => pedanticParser.parse({req: 123, ignored: true})).throws(/Cannot convert "number" to string/);
    });
    it('returns null if given non-string', () => {
      expect(indifferentParser.parse({req: 123, ignored: true})).equals(null);
    });
    it('returns null for missing string', () => {
      expect(pedanticParser.parse({ignored: true})).equals(null);
    });
    it('returns null for null', () => {
      expect(pedanticParser.parse({req: null, ignored: true})).equals(null);
    });
    it('throws if not a string', () => {
      expect(() => pedanticParser.parse({req: /foo/, ignored: true})).throws(/Cannot convert "object" to string/);
    });
  });
  describe('parser', () => {
    const pedanticParser = buildParser<MegaCombo>('MegaCombo')
      .requiredString('reqString')
      .optionalString('optString')
      .optionalDate('optDate')
      .optionalInt('optInt')
      .parser();
    const indifferentParser = buildParser<MegaCombo>('MegaCombo')
      .requiredString('reqString', false)
      .optionalString('optString', false)
      .optionalDate('optDate', false)
      .optionalInt('optInt', false)
      .parser();
    expect(pedanticParser).not.eq(null);
    expect(indifferentParser).not.eq(null);
    const reqString = "reqString";
    const optString = "optString";
    const optDate = new Date();
    const optInt = 123;

    it('works for combinations of all', () => {
      expect(pedanticParser.parse({
        optDate,
        optInt,
        optString,
        reqString,
      })).deep.eq({
        optDate,
        optInt,
        optString,
        reqString,
      });
    });
    it('returns null for null', () => {
      expect(pedanticParser.parse(null)).equals(null);
      expect(indifferentParser.parse(null)).equals(null);
    });
  });
  describe('toString', () => {
    it('does what it says on the tin', () => {
      const parser = buildParser<MegaCombo>('MegaCombo')
        .requiredString('reqString')
        .optionalString('optString')
        .optionalDate('optDate')
        .optionalInt('optInt')
        .parser();
      expect(parser.toString()).equals(`
interface MegaCombo {
  reqString: string;
  optString?: string;
  optDate?: Date;
  optInt?: number;
}
      `.replace(/^\s+|\s+$/g, ''));
    });
  });
});
