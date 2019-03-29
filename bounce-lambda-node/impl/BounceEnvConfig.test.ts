import {expect} from 'chai';
import {PathLike} from "fs";
import {describe, it} from 'mocha';
import {BounceDynamoStoreConfig, BounceS3StoreConfig} from "../api/BounceConfig";
import {BounceEnvConfig, Env, FSLike} from "./BounceEnvConfig";

class TestableBounceEnvConfig extends BounceEnvConfig {

  public optional(env: Env, key: string): string | null {
    return super.optional(env, key);
  }

  public required(env: Env, key: string): string {
    return super.required(env, key);
  }
}

const configPath = 'path/to/config';
const profile = 'myApp';
const accessKey = 'someKey';
const accessSecret = 'someSecret';
const credsFile1 = `[${profile}]\naws_access_key_id = ${accessKey}\naws_secret_access_key=${accessSecret}\n`;
const credsFile2 = `[${profile}]\naws_secret_access_key=${accessSecret}\n\naws_access_key_id = ${accessKey}   `;
const bucketName = "mahBucket";
const region = 'some-region';

function testableFS(result: string = credsFile1): FSLike {
  return {
    readFileSync(path: PathLike | number, options: { encoding: string; flag?: string } | string): string {
      expect(path).equals(configPath);
      expect(options).deep.equals({encoding: 'utf-8'});
      return result;
    },
  };
}

describe('BounceEnvConfig', () => {
  describe('configFromEnv', () => {
    it('throws when missing AWS_CREDENTIALS_FILE', () => {
      expect(() => new TestableBounceEnvConfig().configFromEnv({}))
        .throws(/Missing required environment config: AWS_CREDENTIALS_FILE/);
    });
    it('throws when missing AWS_CREDENTIALS_PROFILE', () => {
      expect(() => new TestableBounceEnvConfig().configFromEnv({
        AWS_CREDENTIALS_FILE: 'creds',
      }))
        .throws(/Missing required environment config: AWS_CREDENTIALS_PROFILE/);
    });
    it('throws when missing credentials in file', () => {
      expect(() => new TestableBounceEnvConfig(testableFS('[other]')).configFromEnv({
        AWS_CREDENTIALS_FILE: configPath,
        AWS_CREDENTIALS_PROFILE: profile,
      })).throws(/Could not extract credentials profile/);
    });
    it('throws when bogus store type', () => {
      expect(() => new TestableBounceEnvConfig(testableFS()).configFromEnv({
        AWS_CREDENTIALS_FILE: configPath,
        AWS_CREDENTIALS_PROFILE: profile,
        BOUNCE_STORE_TYPE: 'bogus',
      })).throws(/Unknown store type: "bogus"/);
    });
    it('throws when missing S3_BUCKET', () => {
      expect(() => new TestableBounceEnvConfig(testableFS()).configFromEnv({
        AWS_CREDENTIALS_FILE: configPath,
        AWS_CREDENTIALS_PROFILE: profile,
        BOUNCE_STORE_TYPE: 's3',
      })).throws(/Missing required environment config: S3_BUCKET/);
    });
    it('returns s3 when configured', () => {
      const config = new TestableBounceEnvConfig(testableFS()).configFromEnv({
        AWS_CREDENTIALS_FILE: configPath,
        AWS_CREDENTIALS_PROFILE: profile,
        BOUNCE_STORE_TYPE: 's3',
        S3_BUCKET: bucketName,
      });
      expect(config.store.type).equals('s3');
      expect(config.store.awsAccessKey).equals(accessKey);
      expect(config.store.awsAccessSecret).equals(accessSecret);
      const s3store: BounceS3StoreConfig = <BounceS3StoreConfig> config.store;
      expect(s3store.bucketName).equals(bucketName);
    });
    it('returns s3 when configured secret-first', () => {
      const config = new TestableBounceEnvConfig(testableFS(credsFile2)).configFromEnv({
        AWS_CREDENTIALS_FILE: configPath,
        AWS_CREDENTIALS_PROFILE: profile,
        BOUNCE_STORE_TYPE: 's3',
        S3_BUCKET: bucketName,
      });
      expect(config.store.type).equals('s3');
      expect(config.store.awsAccessKey).equals(accessKey);
      expect(config.store.awsAccessSecret).equals(accessSecret);
      const s3store: BounceS3StoreConfig = <BounceS3StoreConfig> config.store;
      expect(s3store.bucketName).equals(bucketName);
    });
    it('throws when missing AWS_REGION', () => {
      expect(() => new TestableBounceEnvConfig(testableFS()).configFromEnv({
        AWS_CREDENTIALS_FILE: configPath,
        AWS_CREDENTIALS_PROFILE: profile,
        BOUNCE_STORE_TYPE: 'dynamo',
      })).throws(/Missing required environment config: AWS_REGION/);
    });
    it('returns dynamo when configured', () => {
      const config = new TestableBounceEnvConfig(testableFS()).configFromEnv({
        AWS_CREDENTIALS_FILE: configPath,
        AWS_CREDENTIALS_PROFILE: profile,
        AWS_REGION: region,
        BOUNCE_STORE_TYPE: 'dynamo',
      });
      expect(config.store.type).equals('dynamo');
      expect(config.store.awsAccessKey).equals(accessKey);
      expect(config.store.awsAccessSecret).equals(accessSecret);
      const dynamoConfig: BounceDynamoStoreConfig = <BounceDynamoStoreConfig> config.store;
      expect(dynamoConfig.region).equals(region);
    });  });
  describe('optional', () => {
    it('returns the value when found', () => {
      expect(new TestableBounceEnvConfig().optional({foo: 'bar'}, 'foo')).equals('bar');
    });
    it('returns null when missing', () => {
      expect(new TestableBounceEnvConfig().optional({}, 'foo')).equals(null);
    });
  });
  describe('required', () => {
    it('returns the value when found', () => {
      expect(new TestableBounceEnvConfig().required({foo: 'bar'}, 'foo')).equals('bar');
    });
    it('throws when missing', () => {
      expect(() => new TestableBounceEnvConfig().required({}, 'missing'))
        .throws(/Missing required environment config: missing/);
    });
  });
});
