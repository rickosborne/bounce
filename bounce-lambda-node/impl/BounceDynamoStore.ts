import {AWSError, DynamoDB, Request} from "aws-sdk";
import {AttributeValue, PutItemInputAttributeMap} from "aws-sdk/clients/dynamodb";
import {BounceDynamoStoreConfig} from "../api/BounceConfig";
import {BounceDataStore} from "../api/BounceDataStore";
import {BounceLink} from "../api/BounceLink";
import {BounceLogger} from "../api/BounceLogger";
import {BounceUser} from "../api/BounceUser";
import {DateTimeProvider} from "../api/DateTimeProvider";
import {Deserializer, DynamoParser} from "./DynamoParser";

export interface DynamoLike {
  getItem(
    params: DynamoDB.Types.GetItemInput,
    callback?: (err: AWSError, data: DynamoDB.Types.GetItemOutput) => void,
  ): Request<DynamoDB.Types.GetItemOutput, AWSError>;

  putItem(
    params: DynamoDB.Types.PutItemInput,
    callback?: (err: AWSError, data: DynamoDB.Types.PutItemOutput) => void,
  ): Request<DynamoDB.Types.PutItemOutput, AWSError>;

  updateItem(
    params: DynamoDB.Types.UpdateItemInput,
    callback?: (err: AWSError, data: DynamoDB.Types.UpdateItemOutput) => void,
  ): Request<DynamoDB.Types.UpdateItemOutput, AWSError>;
}

export interface DynamoLink extends PutItemInputAttributeMap {
  created: AttributeValue;
  hits: AttributeValue;
  href: AttributeValue;
  id: AttributeValue;
  name: AttributeValue;
  peeks: AttributeValue;
  title: AttributeValue;
}

export class BounceDynamoStore implements BounceDataStore {
  public static readonly LINK_TABLE = 'link';
  public static readonly USER_TABLE = 'user';

  private readonly linkDeserializer: Deserializer<BounceLink> = new DynamoParser<BounceLink>('BounceLink')
    .requiredString("name")
    .requiredString("href")
    .requiredString("title")
    .optionalString("id")
    .optionalDate("created")
    .optionalInt("hits")
    .optionalInt("peeks")
    .parser()
  ;
  private readonly userDeserializer: Deserializer<BounceUser> = new DynamoParser<BounceUser>('BounceUser')
    .requiredString("email")
    .parser()
  ;

  constructor(
    private readonly config: BounceDynamoStoreConfig,
    private readonly logger: BounceLogger,
    protected readonly dateTimeProvider: DateTimeProvider,
    private readonly db: DynamoLike = new DynamoDB({
      accessKeyId: config.awsAccessKey,
      region: config.region,
      secretAccessKey: config.awsAccessSecret,
    }),
  ) {
  }

  public createLink(link: BounceLink): Promise<BounceLink> {
    /* istanbul ignore next */
    const peekCount = String(link.peeks || 0);
    /* istanbul ignore next */
    const hitCount = String(link.hits || 0);
    const item: DynamoLink = {
      created: {N: String((link.created || this.dateTimeProvider.dateNow()).valueOf())},
      hits: {N: hitCount},
      href: {S: link.href},
      id: {S: link.id},
      name: {S: link.name},
      peeks: {N: peekCount},
      title: {S: link.title},
    };
    return new Promise((resolve, reject) => this.db.putItem({
      Item: item,
      TableName: BounceDynamoStore.LINK_TABLE,
    }, (err) => {
      if (err != null) {
        this.logger.error(`Could not DynamoDB.putItem`, err);
        reject(err);
      } else {
        resolve(link);
      }
    }));
  }

  public linkFromName(name: string): Promise<BounceLink | null> {
    return this.load(BounceDynamoStore.LINK_TABLE, {
      name: {
        S: name === '' ? ' ' : name,  // because Dynamo does not allow empty string in a key
      },
    }).then((item) => this.linkDeserializer.deserialize(item));
  }

  protected load(type: string, key: DynamoDB.Key): Promise<DynamoDB.AttributeMap | null> {
    return new Promise((resolve, reject) => this.db.getItem({
      Key: key,
      TableName: type,
    }, (err, data) => {
      if (err != null) {
        this.logger.error(`DynamoDB.getItem(${type}, ${JSON.stringify(key)}) error`, err);
        reject(err);
      } else {
        /* istanbul ignore next */
        const item = data.Item == null ? null : data.Item;
        resolve(item);
      }
    }));
  }

  public track(link: BounceLink, peek: boolean): void {
    if (link == null || link.name == null) {
      /* istanbul ignore next */
      return;
    }
    const field = peek ? 'peeks' : 'hits';
    this.db.updateItem({
      ExpressionAttributeValues: {
        ':count': {
          N: "1",
        },
      },
      Key: {
        name: {
          S: link.name,
        },
      },
      TableName: BounceDynamoStore.LINK_TABLE,
      UpdateExpression: `ADD ${field} :count`,
    }, (err) => {
      if (err != null) {
        this.logger.error(`Could not track ${link.name} ${field}`, err);
      }
    });
  }

  public userFromEmail(email: string): Promise<BounceUser | null> {
    return this.load(BounceDynamoStore.USER_TABLE, {
      email: {
        S: email,
      },
    }).then((item) => this.userDeserializer.deserialize(item));
  }
}
