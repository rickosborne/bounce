import {expect} from 'chai';
import {describe, it} from 'mocha';
import {Base64IdentifierProvider} from "./Base64IdentifierProvider";

const instance = new Base64IdentifierProvider();

describe('Base64IdentifierProvider', () => {
  describe('fromText', () => {
    it('is deterministic', () => {
      expect(instance.fromText('', 1)).equals('');
      expect(instance.fromText('', 8)).equals('');
      expect(instance.fromText('foo')).equals('vvm');
      expect(instance.fromText('\0')).equals('A');
    });
    it('handles input text longer than output text', () => {
      expect(instance.fromText('ABCABC', 4)).equals('BDFD');
    });
  });
  describe('randomId', () => {
    it('is random', () => {
      expect(instance.randomId()).not.equals(instance.randomId());
    });
    it('defaults to 8 chars', () => {
      expect(instance.randomId().length).equals(8);
    });
    it('obeys short length', () => {
      expect(instance.randomId(5).length).equals(5);
    });
    it('obeys long length', () => {
      expect(instance.randomId(24).length).equals(24);
    });
  });
  describe('timeId', () => {
    it('provides a result without an arg', () => {
      const id = instance.timeId();
      expect(id).not.eq(null);
      expect(id.length).is.greaterThan(0);
    });
    it('truncates', () => {
      const id = instance.timeId(new Date(), 4);
      expect(id).not.eq(null);
      expect(id.length).equals(4);
    });
    it('is deterministic', () => {
      const d1 = Date.UTC(2019, 1, 2, 3, 4, 5, 6);
      const d2 = Date.UTC(2019, 1, 2, 3, 4, 5, 7);
      expect(instance.timeId(d1)).equals('WisKcSO');
      expect(instance.timeId(d2)).equals('WisKcSP');
      expect(instance.timeId(d1, 1)).equals('O');
      expect(instance.timeId(d2, 1)).equals('P');
      expect(instance.timeId(d2).substr(0, 6)).equals(instance.timeId(d1).substr(0, 6));
      expect(instance.timeId(d2)).not.equals(instance.timeId(d1));
    });
  });
});
