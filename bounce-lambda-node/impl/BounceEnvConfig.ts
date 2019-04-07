import fs from 'fs';
import process from 'process';
import {BounceConfig, BounceDynamoStoreConfig, BounceS3StoreConfig, BounceStoreConfig} from "../api/BounceConfig";

const fsModule = fs;

export interface Env {
  [key: string]: string | undefined;
}

export interface FSLike {
  readFileSync(path: fs.PathLike | number, options: { encoding: string; flag?: string; } | string): string;
}

export class BounceEnvConfig {
  protected static get fs() {
    return fsModule;
  }

  @BounceConfig.supplier
  public static configFromEnv(
    /* istanbul ignore next */
    env: Env = process.env,
  ): BounceConfig {
    const credentialsFile = this.optional(env, 'AWS_CREDENTIALS_FILE');
    const credentialsProfile = this.optional(env, 'AWS_CREDENTIALS_PROFILE');
    const awsCredentials: { key: string | undefined, secret: string | undefined } = {key: '', secret: ''};
    if (credentialsFile != null && credentialsProfile != null) {
      const creds = this.fs.readFileSync(credentialsFile, {encoding: 'utf-8'});
      const matches = new RegExp(`(?:^|\n)\\[${credentialsProfile}]\\s+` +
        `(aws_access_key_id|aws_secret_access_key)\\s*=\\s*(\\S+)\\s+` +
        `(?:aws_access_key_id|aws_secret_access_key)\\s*=\\s*(\\S+)`, 's')
        .exec(creds);
      if (matches) {
        if (matches[1] === 'aws_access_key_id') {
          awsCredentials.key = matches[2];
          awsCredentials.secret = matches[3];
        } else {
          awsCredentials.key = matches[3];
          awsCredentials.secret = matches[2];
        }
      } else {
        throw new Error(`Could not extract credentials profile: ${credentialsFile} : ${credentialsProfile}`);
      }
    } else {
      awsCredentials.key = this.optional(env, 'AWS_ACCESS_KEY') || undefined;
      awsCredentials.secret = this.optional(env, 'AWS_ACCESS_SECRET') || undefined;
    }
    let store: BounceStoreConfig;
    const storeType = this.required(env, 'BOUNCE_STORE_TYPE');
    switch (storeType) {
      case 's3':
        const s3store: BounceS3StoreConfig = {
          awsAccessKey: awsCredentials.key,
          awsAccessSecret: awsCredentials.secret,
          bucketName: this.required(env, 'S3_BUCKET'),
          type: 's3',
        };
        store = s3store;
        break;
      case 'dynamo':
        const dynamoStore: BounceDynamoStoreConfig = {
          awsAccessKey: awsCredentials.key,
          awsAccessSecret: awsCredentials.secret,
          region: this.required(env, 'AWS_REGION'),
          type: 'dynamo',
        };
        store = dynamoStore;
        break;
      default:
        throw new Error(`Unknown store type: "${storeType}"`);
    }
    return {
      store,
    };
  }

  protected static optional(env: Env, key: string): string | null {
    const value = env[key];
    return value == null ? null : value;
  }

  protected static required(env: Env, key: string): string {
    const value = env[key];
    if (value == null) {
      throw new Error(`Missing required environment config: ${key}`);
    }
    return value;
  }
}
