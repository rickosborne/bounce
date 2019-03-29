import {expect} from 'chai';
import {describe, it} from 'mocha';
import {ClockDateTimeProvider} from "./ClockDateTimeProvider";

describe('ClockDateTimeProvider', () => {
  describe('dateNow', () => {
    it('returns a non-null value close to the current time', () => {
      const now = new ClockDateTimeProvider().dateNow();
      expect(now).not.eq(null);
      expect(Math.abs(Date.now() - now.valueOf())).gte(0).and.lte(1000);
    });
    it('moves forward with time', async () => {
      const provider = new ClockDateTimeProvider();
      const before = provider.dateNow();
      const after = await new Promise<Date>((resolve) => setTimeout(() => resolve(provider.dateNow()), 250));
      expect(after.valueOf() - before.valueOf()).gt(0).and.lte(1000);
    });
  });
});
