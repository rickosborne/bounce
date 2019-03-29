import {DynamoDB} from "aws-sdk";
import {BounceDynamoStoreConfig} from "../api/BounceConfig";
import {BounceLogger} from "../api/BounceLogger";
import {DateTimeProvider} from "../api/DateTimeProvider";
import {BounceDynamoStore, DynamoLike} from "./BounceDynamoStore";
import {TestableDateTimeProvider} from "./TestableDateTimeProvider";

export class TestableBounceDynamoStore extends BounceDynamoStore {
  public get dateTime(): DateTimeProvider {
    return this.dateTimeProvider;
  }

  constructor(
    config: BounceDynamoStoreConfig,
    logger: BounceLogger,
    db: DynamoLike,
  ) {
    super(config, logger, new TestableDateTimeProvider(), db);
  }

  public load(type: string, key: DynamoDB.Key): Promise<DynamoDB.AttributeMap | null> {
    return super.load(type, key);
  }
}
