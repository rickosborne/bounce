import {Context} from "aws-lambda";
import {expect} from "chai";
import {afterEach, beforeEach, describe, it} from "mocha";
import * as tslint from "ts-lint/lib/error";
import {BounceLink} from "../../api/BounceLink";
import {BounceAppImpl} from "../../impl/BounceApp.impl";
import * as index from "../index";
import {TestableDataStore} from "./TestableDataStore";

// noinspection JSUnusedLocalSymbols
const context: Context = {
  awsRequestId: "requestId",
  callbackWaitsForEmptyEventLoop: true,
  clientContext: {
    client: {
      appPackageName: "appPackageName",
      appTitle: "appTitle",
      appVersionCode: "appVersionCode",
      appVersionName: "appVersionName",
      installationId: "installationId",
    },
    custom: false,
    env: {
      locale: "en-us",
      make: "make",
      model: "model",
      platform: "platform",
      platformVersion: "platformVersion",
    },
  },
  done(error?: Error, result?: any): void {
    throw new tslint.Error(`Unexpected call to Context.done`);
  },
  functionName: "functionName",
  functionVersion: "version",
  identity: {
    cognitoIdentityId: "cognitoIdentityId",
    cognitoIdentityPoolId: "cognitoIdentityPoolId",
  },
  invokedFunctionArn: "arn:invoked:function",
  logGroupName: "logGroupName",
  logStreamName: "logStreamName",
  memoryLimitInMB: 128,
  fail(error: Error | string): void {
    throw new tslint.Error(`Unexpected call to Context.fail`);
  },
  getRemainingTimeInMillis(): number {
    return 100;
  },
  succeed(messageOrObject: any): void {
    throw new tslint.Error(`Unexpected call to Context.succeed`);
  },
};

describe("index.ts", () => {
  let dataStore: TestableDataStore | undefined = undefined;
  beforeEach(() => {
    dataStore = new TestableDataStore();
    Object.assign(index, {app: new BounceAppImpl(dataStore)});
  });
  afterEach(() => {
    Object.assign(index, {app: undefined});
  });
  describe("handler", () => {
    it("redirects for GET", async () => {
        if (dataStore == null) {
          throw new Error('Missing dataStore — check beforeEach');
        }
        const link: BounceLink = {
          href: 'https://github.com/rickosborne',
          name: 'github',
          title: 'GitHub',
        };
        dataStore.onLinkFromName = (name) => {
          expect(name).equals(link.name);
          return Promise.resolve(link);
        };
        dataStore.onTrack = (trackLink, peek) => {
          expect(peek).equals(false);
          expect(trackLink).equals(link);
        };
        const result = await index.handleBounceRequest({
          httpMethod: 'GET',
          path: '/github',
        }, context);
        expect(result).not.eq(null);
        expect(result.statusCode).equals(302);
        expect(result.body).not.eq(null);
        expect(result.headers).to.haveOwnProperty('Location').eq(link.href);
        expect(result.headers).to.haveOwnProperty('Content-Type').contains("text/html");
      },
    );

    it("peeks for HEAD", async () => {
        if (dataStore == null) {
          throw new Error('Missing dataStore — check beforeEach');
        }
        const link: BounceLink = {
          href: 'https://github.com/rickosborne',
          name: 'github',
          title: 'GitHub',
        };
        dataStore.onLinkFromName = (name) => {
          expect(name).equals(link.name);
          return Promise.resolve(link);
        };
        dataStore.onTrack = (trackLink, peek) => {
          expect(trackLink).equals(link);
          expect(peek).equals(true);
        };
        const result = await index.handleBounceRequest({
          httpMethod: 'HEAD',
          path: '/github',
        }, context);
        expect(result).not.eq(null);
        expect(result.statusCode).equals(200);
        expect(result.body).not.eq(null);
        expect(result.headers).to.haveOwnProperty('Location').eq(link.href);
        expect(result.headers).to.haveOwnProperty('Content-Type').contains("text/plain");
      },
    );

    it('returns the default link for no path', async () => {
      if (dataStore == null) {
        throw new Error('Missing dataStore — check beforeEach');
      }
      dataStore.onLinkFromName = (name) => {
        expect(name).equals('');
        return Promise.resolve(null);
      };
      dataStore.onTrack = (trackLink, peek) => {
        expect(trackLink).deep.equals(BounceAppImpl.LINK_DEFAULT);
        expect(peek).equals(false);
      };
      const result = await index.handleBounceRequest({
        httpMethod: 'GET',
        path: '/',
      }, context);
      expect(result).not.eq(null);
      expect(result.statusCode).equals(302);
      expect(result.body).not.eq(null);
      expect(result.headers).to.haveOwnProperty('Location').eq(BounceAppImpl.LINK_DEFAULT.href);
      expect(result.headers).to.haveOwnProperty('Content-Type').contains("text/html");
    });

    it('returns 404 for not found', async () => {
      if (dataStore == null) {
        throw new Error('Missing dataStore — check beforeEach');
      }
      dataStore.onLinkFromName = (name) => {
        expect(name).equals('foobar');
        return Promise.resolve(null);
      };
      const result = await index.handleBounceRequest({
        httpMethod: 'GET',
        path: '/foobar',
        pathParameters: {
          linkId: 'foobar',
        },
      }, context);
      expect(result).not.eq(null);
      expect(result.statusCode).equals(404);
      expect(result.body).equals('Not Found');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains("text/plain");
    });

    it('returns 500 for malformed request', async () => {
      const result = await index.handleBounceRequest(null as any, context);
      expect(result).not.eq(null);
      expect(result.statusCode).equals(500);
      expect(result.body).equals('');
    });

    it('returns 500 for malformed context', async () => {
      const result = await index.handleBounceRequest({
        httpMethod: 'GET',
        path: '/',
      }, null as any);
      expect(result).not.eq(null);
      expect(result.statusCode).equals(500);
      expect(result.body).equals('');
    });
  });
});
