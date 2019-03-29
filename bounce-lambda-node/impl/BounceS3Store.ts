import {AWSError, Request, S3} from 'aws-sdk';
import {BounceS3StoreConfig} from "../api/BounceConfig";
import {BounceDataStore} from "../api/BounceDataStore";
import {BounceLink} from "../api/BounceLink";
import {BounceLogger} from "../api/BounceLogger";
import {BounceUser} from "../api/BounceUser";
import {DateTimeProvider} from "../api/DateTimeProvider";

export interface S3Like {
  getObject(
    params: S3.Types.GetObjectRequest,
    callback?: (err: AWSError, data: S3.Types.GetObjectOutput) => void,
  ): Request<S3.Types.GetObjectOutput, AWSError>;

  putObject(
    params: S3.Types.PutObjectRequest,
    callback?: (err: AWSError, data: S3.Types.PutObjectOutput) => void,
  ): Request<S3.Types.PutObjectOutput, AWSError>;
}

export class BounceS3Store implements BounceDataStore {
  public static readonly JSON_SUFFIX = '.json';
  public static readonly LINK_PREFIX = 'link/';
  public static readonly SIGNATURE_VERSION = 'v4';
  public static readonly USER_PREFIX = 'user/';

  constructor(
    protected readonly config: BounceS3StoreConfig,
    protected readonly log: BounceLogger,
    protected readonly dateTimeProvider: DateTimeProvider,
    protected readonly s3: S3Like = new S3({
      accessKeyId: config.awsAccessKey,
      secretAccessKey: config.awsAccessSecret,
      signatureVersion: BounceS3Store.SIGNATURE_VERSION,
    }),
  ) {
  }

  public createLink(link: BounceLink): Promise<BounceLink> {
    const objectName: string = this.pathForLink(link);
    const objectBody: string = JSON.stringify(link, null, 2);
    return this.save(objectName, objectBody)
      .then((putResult) => {
        return {
          created: new Date(),
          hits: link.hits,
          href: link.href,
          id: putResult.ETag,
          name: link.name,
          peeks: link.peeks,
          title: link.title,
        };
      });
  }

  protected encode(s: string): string {
    if (s == null) {
      /* istanbul ignore next */
      return '';
    }
    return s.replace(/[^-_A-Za-z0-9]/g, (c) => {
      return c.charCodeAt(0).toString(16).replace(/(\w\w)/g, '~$1');
    });
  }

  public linkFromName(name: string): Promise<BounceLink | null> {
    const path = this.pathForLink(name);
    return this.load(path)
      .then((getResult) => {
        if (getResult == null || getResult.Body == null) {
          return null;
        }
        try {
          return JSON.parse(String(getResult.Body)) as BounceLink;
        } catch (e) {
          this.log.error(`Failed to fetch link: ${path}`, e);
          return null;
        }
      });
  }

  protected load(path: string): Promise<S3.GetObjectOutput | null> {
    return new Promise<S3.GetObjectOutput | null>((resolve, reject) => {
      this.s3.getObject({
        Bucket: this.config.bucketName,
        Key: path,
      }, (err, data) => {
        if (err != null) {
          console.log(`S3.getObject(${path}) error`, err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  protected pathForLink(link: BounceLink | string): string {
    const name = typeof link === 'string' ? link : link.name;
    if (name.match(/[^-_a-zA-Z0-9]/)) {
      /* istanbul ignore next */
      throw new Error(`Bad link name`);
    }
    return `${BounceS3Store.LINK_PREFIX}${this.encode(name)}${BounceS3Store.JSON_SUFFIX}`;
  }

  protected pathForUser(user: BounceUser | string): string {
    const email = typeof user === 'string' ? user : user.email;
    return `${BounceS3Store.USER_PREFIX}${this.encode(email)}${BounceS3Store.JSON_SUFFIX}`;
  }

  protected save(path: string, body: string): Promise<S3.PutObjectOutput> {
    return new Promise<S3.PutObjectOutput>((resolve, reject) => {
      this.s3.putObject({
        Body: body,
        Bucket: this.config.bucketName,
        ContentType: 'application/json',
        Key: path,
      }, (err, data) => {
        if (err != null) {
          this.log.error(`S3.putObject(${path}) error`, err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public track(link: BounceLink, peek: boolean): void {
    // no-op
  }

  public userFromEmail(email: string): Promise<BounceUser | null> {
    const path = this.pathForUser(email);
    return this.load(path)
      .then((getResult) => {
        try {
          if (getResult != null && getResult.Body != null) {
            return JSON.parse(String(getResult.Body));
          }
        } catch (e) {
          this.log.error(`Could not load userFromEmail: ${path}`, e);
        }
        return null;
      });
  }
}
