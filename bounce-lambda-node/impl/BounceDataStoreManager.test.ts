import {expect} from 'chai';
import * as console from 'console';
import {describe, it} from 'mocha';
import {BounceLogger} from "../api/BounceLogger";
import {BounceDataStoreManager} from "./BounceDataStoreManager";
import {BounceDynamoStore} from "./BounceDynamoStore";
import {BounceS3Store} from "./BounceS3Store";
import {TestableDateTimeProvider} from "./TestableDateTimeProvider";

const logger: BounceLogger = console;
const dateTimeProvider = new TestableDateTimeProvider();
const accessKey = 'some-key';
const accessSecret = 'some-secret';

describe('BounceDataStoreManager', () => {
  describe('buildDataStore', () => {
    it('yields s3 when given s3', () => {
      const store = BounceDataStoreManager.buildDataStore({
        store: {
          awsAccessKey: accessKey,
          awsAccessSecret: accessSecret,
          type: 's3',
        },
      }, logger, dateTimeProvider);
      expect(store).instanceOf(BounceS3Store);
    });
    it('yields dynamo when given dynamo', () => {
      const store = BounceDataStoreManager.buildDataStore({
        store: {
          awsAccessKey: accessKey,
          awsAccessSecret: accessSecret,
          type: 'dynamo',
        },
      }, logger, dateTimeProvider);
      expect(store).instanceOf(BounceDynamoStore);
    });
    it('throws when given garbage', () => {
      expect(() => BounceDataStoreManager.buildDataStore({
        store: {
          awsAccessKey: accessKey,
          awsAccessSecret: accessSecret,
          type: 'garbage',
        },
      }, logger, dateTimeProvider)).throws(/Unknown store type: garbage/);
    });
  });
});
