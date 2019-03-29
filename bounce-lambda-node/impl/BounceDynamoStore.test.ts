import {AWSError, DynamoDB} from "aws-sdk";
import {
  AttributeMap,
  GetItemOutput, PutItemOutput,
} from "aws-sdk/clients/dynamodb";
import {expect} from "chai";
import * as console from 'console';
import {describe, it} from "mocha";

import {BounceDynamoStoreConfig} from "../api/BounceConfig";
import {BounceLink} from "../api/BounceLink";
import {BounceLogger} from "../api/BounceLogger";
import {BounceUser} from "../api/BounceUser";
import {BounceDynamoStore, DynamoLink} from "./BounceDynamoStore";
import {TestableBounceDynamoStore} from "./TestableBounceDynamoStore";
import {TestableDynamoLike} from "./TestableDynamoLike";

const link: BounceLink = {
  hits: 1234,
  href: 'https://github.com/rickosborne',
  name: 'github',
  peeks: 56,
  title: 'GitHub',
};
const linkMap: AttributeMap = {
  hits: {N: String(link.hits)},
  href: {S: link.href},
  name: {S: link.name},
  peeks: {N: String(link.peeks)},
  title: {S: link.title},
};
const linkOut: GetItemOutput = {
  Item: linkMap,
};
const user: BounceUser = {
  email: 'some@example.com',
};
const userMap: AttributeMap = {
  email: {S: user.email},
};
const userOut: GetItemOutput = {
  Item: userMap,
};
const error: AWSError = {
  cfId: 'cf-id',
  code: 'some-error',
  extendedRequestId: 'some-extended-request-id',
  hostname: 'some-host',
  message: 'Some error',
  name: 'SomeError',
  region: 'some-region',
  requestId: 'some-request',
  retryDelay: 0,
  retryable: false,
  statusCode: 500,
  time: new Date(),
};
const logger: BounceLogger = console;
const storeConfig: BounceDynamoStoreConfig = {
  awsAccessKey: 'someKey',
  awsAccessSecret: 'someSecret',
  region: "some-region",
  type: 'dynamo',
};

const testReturnedError = async (
  functionName: string,
  tableName: string,
  key: DynamoDB.Key | undefined,
  exprAttr: [string, DynamoDB.AttributeValue] | undefined,
  shouldThrow: boolean,
  shouldReturn: boolean,
  block: (store: TestableBounceDynamoStore) => void,
) => {
  const dynamo = new TestableDynamoLike();
  if (exprAttr != null) {
    dynamo.onUpdateItem = (params, callback) => {
      expect(params.ExpressionAttributeValues).to.haveOwnProperty(exprAttr[0]).deep.equals(exprAttr[1]);
      expect(params.Key).deep.equals({name: {S: link.name}});
      expect(params.TableName).equals(BounceDynamoStore.LINK_TABLE);
      expect(params.UpdateExpression).equals(`ADD peeks ${exprAttr[0]}`);
      if (callback == null) {
        throw new Error('Expected callback in ${functionName}');
      }
      if (!shouldReturn) {
        throw new Error('Some error');
      }
      callback(error, undefined as any);
      return undefined as any;
    };
  } else if (key != null) {
    dynamo.onGetItem = (params, callback) => {
      expect(params.TableName).equals(tableName);
      expect(params.Key).deep.equals(key);
      if (callback == null) {
        throw new Error(`Expected callback for ${functionName}`);
      }
      if (!shouldReturn) {
        throw new Error('Some error');
      }
      callback(error, undefined as any);
      return undefined as any;
    };
  } else {
    dynamo.onPutItem = (params, callback) => {
      expect(params.TableName).equals(BounceDynamoStore.LINK_TABLE);
      const item: DynamoLink = params.Item as DynamoLink;
      expect(item.name.S).equals(link.name);
      expect(item.title.S).equals(link.title);
      expect(item.href.S).equals(link.href);
      expect(item.hits.N).equals(String(link.hits));
      expect(item.peeks.N).equals(String(link.peeks));
      expect(item.created.N).equals(String(store.dateTime.dateNow().valueOf()));
      if (callback == null) {
        throw new Error(`Expected callback for ${functionName}`);
      }
      if (!shouldReturn) {
        throw new Error('Some error');
      }
      callback(error, undefined as any);
      return undefined as any;
    };
  }
  const store = new TestableBounceDynamoStore(storeConfig, logger, dynamo);
  let didCatch = false;
  try {
    const result = await block(store);
    if (shouldThrow) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error(`Should have thrown but got: ${JSON.stringify(result)}`);
    } else {
      didCatch = true;
    }
  } catch (e) {
    if (shouldReturn) {
      expect(e).deep.equals(error);
    } else {
      expect(e.message).matches(/Some error/);
    }
    didCatch = true;
  }
  expect(didCatch).equals(true, 'Should have caught thrown error');
};

describe('BounceDynamoStore', () => {
  describe('createLink', () => {
    it('saves all the fields', async () => {
      const dynamo = new TestableDynamoLike();
      dynamo.onPutItem = (params, callback) => {
        expect(params.TableName).equals(BounceDynamoStore.LINK_TABLE);
        const item: DynamoLink = params.Item as DynamoLink;
        expect(item.name.S).equals(link.name);
        expect(item.title.S).equals(link.title);
        expect(item.href.S).equals(link.href);
        expect(item.hits.N).equals(String(link.hits));
        expect(item.peeks.N).equals(String(link.peeks));
        expect(item.created.N).equals(String(store.dateTime.dateNow().valueOf()));
        if (callback != null) {
          callback(undefined as any, params as PutItemOutput);
        }
        return undefined as any;
      };
      const store = new TestableBounceDynamoStore(storeConfig, logger, dynamo);
      const saved = await store.createLink(link);
      expect(saved).equals(link);
    });
    it('throws on thrown error', async () => {
      await testReturnedError('createLink', BounceDynamoStore.LINK_TABLE, undefined,
        undefined, true, false,
        async (store) => await store.createLink(link));
    });
    it('throws on returned error', async () => {
      await testReturnedError('createLink', BounceDynamoStore.LINK_TABLE, undefined,
        undefined, true, true,
        async (store) => await store.createLink(link));
    });
  });
  describe('linkFromName', () => {
    const linkKey: AttributeMap = {name: {S: link.name}};
    it('returns loaded data', async () => {
      const dynamo = new TestableDynamoLike();
      dynamo.onGetItem = (params, callback) => {
        expect(params.TableName).equals(BounceDynamoStore.LINK_TABLE);
        expect(params.Key).deep.equals(linkKey);
        if (callback != null) {
          callback(undefined as any, linkOut);
        }
        return undefined as any;
      };
      const store = new TestableBounceDynamoStore(storeConfig, logger, dynamo);
      expect(await store.linkFromName(link.name)).deep.equals(link);
    });
    it('throws on thrown error', async () => {
      await testReturnedError('linkFromName', BounceDynamoStore.LINK_TABLE, linkKey,
        undefined, true, false, (store) => store.linkFromName(link.name));
    });
    it('throws on returned error', async () => {
      await testReturnedError('linkFromName', BounceDynamoStore.LINK_TABLE, linkKey,
        undefined, true, true, (store) => store.linkFromName(link.name));
    });
  });
  describe('track', () => {
    it('updates hits', async () => {
      const dynamo = new TestableDynamoLike();
      dynamo.onUpdateItem = (params, callback) => {
        expect(params.ExpressionAttributeValues).to.haveOwnProperty(':count').deep.equals({N: '1'});
        expect(params.Key).deep.equals({name: {S: link.name}});
        expect(params.TableName).equals(BounceDynamoStore.LINK_TABLE);
        expect(params.UpdateExpression).equals('ADD hits :count');
        if (callback == null) {
          throw new Error('Expected callback in updateItem');
        }
        callback(undefined as any, undefined as any);
        return undefined as any;
      };
      const store = new TestableBounceDynamoStore(storeConfig, logger, dynamo);
      await store.track(link, false);
    });
    it('updates peeks', async () => {
      const dynamo = new TestableDynamoLike();
      dynamo.onUpdateItem = (params, callback) => {
        expect(params.ExpressionAttributeValues).to.haveOwnProperty(':count').deep.equals({N: '1'});
        expect(params.Key).deep.equals({name: {S: link.name}});
        expect(params.TableName).equals(BounceDynamoStore.LINK_TABLE);
        expect(params.UpdateExpression).equals('ADD peeks :count');
        if (callback == null) {
          throw new Error('Expected callback in updateItem');
        }
        callback(undefined as any, undefined as any);
        return undefined as any;
      };
      const store = new TestableBounceDynamoStore(storeConfig, logger, dynamo);
      await store.track(link, true);
    });
    it('throws on thrown error', async () => {
      await testReturnedError('track', BounceDynamoStore.LINK_TABLE, undefined,
        [':count', {N: '1'}], false, false, (store) => store.track(link, true));
    });
    it('throws on returned error', async () => {
      await testReturnedError('track', BounceDynamoStore.LINK_TABLE, undefined,
        [':count', {N: '1'}], false, true, (store) => store.track(link, true));
    });
  });
  describe('load', () => {
    const type = 'anything';
    const loadKey = {k: {S: 'val'}};
    it('returns loaded data', async () => {
      const dynamo = new TestableDynamoLike();
      const map: AttributeMap = {result: {S: 'value'}};
      const out: GetItemOutput = {Item: map};
      dynamo.onGetItem = (params, callback) => {
        expect(params.TableName).equals(type);
        expect(params.Key).deep.equals(loadKey);
        if (callback != null) {
          callback(undefined as any, out);
        }
        return undefined as any;
      };
      const store = new TestableBounceDynamoStore(storeConfig, logger, dynamo);
      expect(await store.load(type, loadKey)).deep.equals(map);
    });
    it('throws on thrown error', async () => {
      await testReturnedError('load', type, loadKey, undefined, true, false, (store) => store.load(type, loadKey));
    });
    it('throws on returned error', async () => {
      await testReturnedError('load', type, loadKey, undefined, true, true, (store) => store.load(type, loadKey));
    });
  });
  describe('userFromEmail', () => {
    it('returns loaded data', async () => {
      const dynamo = new TestableDynamoLike();
      dynamo.onGetItem = (params, callback) => {
        expect(params.TableName).equals(BounceDynamoStore.USER_TABLE);
        expect(params.Key).deep.equals({email: {S: user.email}});
        if (callback != null) {
          callback(undefined as any, userOut);
        }
        return undefined as any;
      };
      const store = new TestableBounceDynamoStore(storeConfig, logger, dynamo);
      expect(await store.userFromEmail(user.email)).deep.equals(user);
    });
    it('throws on thrown error', async () => {
      await testReturnedError('userFromEmail', BounceDynamoStore.USER_TABLE,
        {email: {S: user.email}}, undefined, true, false, (store) => store.userFromEmail(user.email));
    });
    it('throws on returned error', async () => {
      await testReturnedError('userFromEmail', BounceDynamoStore.USER_TABLE,
        {email: {S: user.email}}, undefined, true, true, (store) => store.userFromEmail(user.email));
    });
  });
});
