import {AWSError, Request} from "aws-sdk";
import {S3Like} from "./BounceS3Store";
import S3 = require("aws-sdk/clients/s3");

export class TestableS3Like implements S3Like {
  public onGetObject: ((
    params: S3.GetObjectRequest,
    callback?: (err: AWSError, data: S3.GetObjectOutput) => void,
  ) => Request<S3.GetObjectOutput, AWSError>) | undefined = undefined;

  public onPutObject: ((
    params: S3.PutObjectRequest,
    callback?: (err: AWSError, data: S3.PutObjectOutput) => void,
  ) => Request<S3.PutObjectOutput, AWSError>) | undefined = undefined;

  public getObject(
    params: S3.GetObjectRequest,
    callback?: (err: AWSError, data: S3.GetObjectOutput) => void,
  ): Request<S3.GetObjectOutput, AWSError> {
    if (this.onGetObject == null) {
      /* istanbul ignore next */
      throw new Error(`Unexpected call to getObject(${JSON.stringify(params)})`);
    }
    return this.onGetObject(params, callback);
  }

  public putObject(
    params: S3.PutObjectRequest,
    callback?: (err: AWSError, data: S3.PutObjectOutput) => void,
  ): Request<S3.PutObjectOutput, AWSError> {
    if (this.onPutObject == null) {
      /* istanbul ignore next */
      throw new Error(`Unexpected call to putObject(${JSON.stringify(params)})`);
    }
    return this.onPutObject(params, callback);
  }
}
