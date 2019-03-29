import {expect} from 'chai';
import {describe, it} from 'mocha';
import {BounceConsoleLogger} from "./BounceConsoleLogger";
import {TestableLogger} from "./TestableLogger.test";

const args: any[] = ['abc', 123, {def: new Date()}];

describe('BounceConsoleLogger', () => {
  describe('debug', () => {
    it('logs', () => {
      let didCall = false;
      new BounceConsoleLogger(new TestableLogger(
        (...calledArgs) => {
          expect(calledArgs).deep.equals(args);
          didCall = true;
        },
        null,
        null,
      )).debug(...args);
      expect(didCall).equals(true, 'Called debug');
    });
  });
  describe('error', () => {
    it('logs', () => {
      let didCall = false;
      new BounceConsoleLogger(new TestableLogger(
        null,
        (...calledArgs) => {
          expect(calledArgs).deep.equals(args);
          didCall = true;
        },
        null,
      )).error(...args);
      expect(didCall).equals(true, 'Called error');
    });
  });
  describe('info', () => {
    it('logs', () => {
      let didCall = false;
      new BounceConsoleLogger(new TestableLogger(
        null,
        null,
        (...calledArgs) => {
          expect(calledArgs).deep.equals(args);
          didCall = true;
        },
      )).info(...args);
      expect(didCall).equals(true, 'Called info');
    });
  });
});
