import {expect} from 'chai';
import {describe, it} from 'mocha';

import {Deserializer, DynamoParser} from './DynamoParser';
import {OneOptionalDate, OneOptionalInt, OneOptionalString, OneRequiredString} from "./ParserTest";

const oneRequiredStringDeserializer: Deserializer<OneRequiredString> = new DynamoParser<OneRequiredString>('OneRequiredString')
  .requiredString('req')
  .parser();

const oneOptionalStringDeserializer: Deserializer<OneOptionalString> = new DynamoParser<OneOptionalString>('OneOptionalString')
  .optionalString('opt')
  .parser();

const oneOptionalIntDeserializer: Deserializer<OneOptionalInt> = new DynamoParser<OneOptionalInt>('OneOptionalInt')
  .optionalInt('opt')
  .parser();

const oneOptionalDateDeserializer: Deserializer<OneOptionalDate> = new DynamoParser<OneOptionalDate>('OneOptionalDate')
  .optionalDate('opt')
  .parser();

describe('DynamoParser', () => {
  describe('requiredString', () => {
    it('returns correct value for good data', () => {
      expect(oneRequiredStringDeserializer.deserialize({
        req: {S: 'foo'},
        unused: {S: 'bar'},
      })).deep.equals({req: 'foo'});
    });
    it('returns null for missing string', () => {
      expect(oneRequiredStringDeserializer.deserialize({unused: {S: 'bar'}})).equals(null);
    });
    it('returns null for not-a-string', () => {
      expect(oneRequiredStringDeserializer.deserialize({req: {N: 'foo'}, unused: {S: 'bar'}})).equals(null);
    });
  });
  describe('optionalString', () => {
    it('returns correct value for valid present data', () => {
      expect(oneOptionalStringDeserializer.deserialize({
        opt: {S: 'foo'},
        unused: {S: 'bar'},
      })).deep.equals({opt: 'foo'});
    });
    it('returns empty for valid missing data', () => {
      expect(oneOptionalStringDeserializer.deserialize({unused: {S: 'foo'}})).deep.equals({});
    });
    it('returns empty for not-a-string', () => {
      expect(oneOptionalStringDeserializer.deserialize({opt: {N: 'foo'}, unused: {S: 'bar'}})).deep.equals({});
    });
  });
  describe('optionalInt', () => {
    it('returns correct value for valid present data', () => {
      expect(oneOptionalIntDeserializer.deserialize({opt: {N: '1234'}, unused: {S: 'bar'}})).deep.equals({opt: 1234});
    });
    it('returns empty for valid missing data', () => {
      expect(oneOptionalIntDeserializer.deserialize({unused: {S: 'foo'}})).deep.equals({});
    });
    it('returns empty for not-a-number', () => {
      expect(oneOptionalIntDeserializer.deserialize({opt: {S: 'foo'}, unused: {S: 'bar'}})).deep.equals({});
    });
  });
  describe('optionalDate', () => {
    it('returns correct value for valid present data', () => {
      expect(oneOptionalDateDeserializer.deserialize({opt: {N: '123456780000'}, unused: {S: 'bar'}}))
        .deep.equals({opt: new Date(Date.UTC(1973, 10, 29, 21, 33))});
    });
    it('returns empty for valid missing data', () => {
      expect(oneOptionalDateDeserializer.deserialize({unused: {S: 'foo'}})).deep.equals({});
    });
    it('returns empty for not-a-date', () => {
      expect(oneOptionalDateDeserializer.deserialize({opt: {S: 'foo'}, unused: {S: 'bar'}})).deep.equals({});
    });
  });
  describe('deserialize', () => {
    it('return null for null map', () => {
      expect(oneOptionalDateDeserializer.deserialize(null)).equals(null);
    });
  });
});
