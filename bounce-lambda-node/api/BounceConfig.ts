import {injectableType} from "inclined-plane";

export interface BounceStoreConfig {
  awsAccessKey: string | undefined;
  awsAccessSecret: string | undefined;
  type: string;
}

export interface BounceS3StoreConfig extends BounceStoreConfig {
  bucketName: string;
  type: 's3';
}

export interface BounceDynamoStoreConfig extends BounceStoreConfig {
  region: string;
  type: 'dynamo';
}

export interface BounceConfig {
  store: BounceStoreConfig;
}

// tslint:disable-next-line:variable-name
export const BounceConfig = injectableType<BounceConfig>('BounceConfig');
