// tslint:disable-next-line:max-classes-per-file
import {AWSError, DynamoDB, Request} from "aws-sdk";
import {DynamoLike} from "./BounceDynamoStore";

export class TestableDynamoLike implements DynamoLike {
  public onGetItem: ((
    params: DynamoDB.GetItemInput,
    callback?: (err: AWSError, data: DynamoDB.GetItemOutput) => void,
  ) => Request<DynamoDB.GetItemOutput, AWSError>) | undefined = undefined;
  public onPutItem: ((
    params: DynamoDB.PutItemInput,
    callback?: (err: AWSError, data: DynamoDB.PutItemOutput) => void,
  ) => Request<DynamoDB.PutItemOutput, AWSError>) | undefined = undefined;
  public onUpdateItem: ((
    params: DynamoDB.UpdateItemInput,
    callback?: (err: AWSError, data: DynamoDB.UpdateItemOutput) => void,
  ) => Request<DynamoDB.UpdateItemOutput, AWSError>) | undefined = undefined;

  public getItem(
    params: DynamoDB.GetItemInput,
    callback?: (err: AWSError, data: DynamoDB.GetItemOutput) => void,
  ): Request<DynamoDB.GetItemOutput, AWSError> {
    if (this.onGetItem == null) {
      throw new Error(`Unexpected call to getItem(${JSON.stringify(params)}`);
    }
    return this.onGetItem(params, callback);
  }

  public putItem(
    params: DynamoDB.PutItemInput,
    callback?: (err: AWSError, data: DynamoDB.PutItemOutput) => void,
  ): Request<DynamoDB.PutItemOutput, AWSError> {
    if (this.onPutItem == null) {
      throw new Error(`Unexpected call to putItem(${JSON.stringify(params)}`);
    }
    return this.onPutItem(params, callback);
  }

  public updateItem(
    params: DynamoDB.UpdateItemInput,
    callback?: (err: AWSError, data: DynamoDB.UpdateItemOutput) => void,
  ): Request<DynamoDB.UpdateItemOutput, AWSError> {
    if (this.onUpdateItem == null) {
      throw new Error(`Unexpected call to updateItem(${JSON.stringify(params)}`);
    }
    return this.onUpdateItem(params, callback);
  }
}
