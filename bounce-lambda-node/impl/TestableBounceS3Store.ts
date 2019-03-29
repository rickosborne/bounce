import {BounceS3StoreConfig} from "../api/BounceConfig";
import {BounceLink} from "../api/BounceLink";
import {BounceUser} from "../api/BounceUser";
import {DateTimeProvider} from "../api/DateTimeProvider";
import {BounceS3Store} from "./BounceS3Store";
import {TestableDateTimeProvider} from "./TestableDateTimeProvider";
import {TestableS3Like} from "./TestableS3Like";
import S3 = require("aws-sdk/clients/s3");

export class TestableBounceS3Store extends BounceS3Store {
  public get dateTime(): DateTimeProvider {
    return this.dateTimeProvider;
  }

  public get testableConfig(): BounceS3StoreConfig {
    return this.config;
  }

  public get testableS3(): TestableS3Like {
    return this.s3 as TestableS3Like;
  }

  constructor() {
    super({
      awsAccessKey: 'accessKey',
      awsAccessSecret: 'accessSecret',
      bucketName: 'some-bucket',
      type: 's3',
    }, console, new TestableDateTimeProvider(), new TestableS3Like());
  }

  public load(path: string): Promise<S3.GetObjectOutput | null> {
    return super.load(path);
  }

  public pathForLink(link: BounceLink | string): string {
    return super.pathForLink(link);
  }

  public pathForUser(user: BounceUser | string): string {
    return super.pathForUser(user);
  }

  public save(path: string, body: string): Promise<S3.PutObjectOutput> {
    return super.save(path, body);
  }
}
