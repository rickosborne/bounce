import {BounceConfig, BounceDynamoStoreConfig, BounceS3StoreConfig} from "../api/BounceConfig";
import {BounceDataStore} from "../api/BounceDataStore";
import {BounceLogger} from "../api/BounceLogger";
import {DateTimeProvider} from "../api/DateTimeProvider";
import {BounceDynamoStore} from "./BounceDynamoStore";
import {BounceS3Store} from "./BounceS3Store";

export class BounceDataStoreManager {

  @BounceDataStore.supplier
  public static buildDataStore(
    @BounceConfig.required config: BounceConfig,
    @BounceLogger.required logger: BounceLogger,
    @DateTimeProvider.required dateTimeProvider: DateTimeProvider,
  ): BounceDataStore {
    switch (config.store.type) {
      case 's3':
        return new BounceS3Store(<BounceS3StoreConfig> config.store, logger, dateTimeProvider);
      case 'dynamo':
        return new BounceDynamoStore(<BounceDynamoStoreConfig> config.store, logger, dateTimeProvider);
      default:
        throw new Error(`Unknown store type: ${config.store.type}`);
    }
  }
}
