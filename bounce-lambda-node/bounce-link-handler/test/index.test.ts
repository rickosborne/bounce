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

const newLink: BounceLink = {
  href: 'http://example.com/new-link',
  name: 'newLink',
  title: 'New Link',
};
const newLinkJson = JSON.stringify(newLink);
const newLinkPost = {
  body: newLinkJson,
  headers: {
    'Content-Length': String(newLinkJson.length),
    'Content-Type': 'application/json',
  },
  httpMethod: 'POST',
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
  describe("handleBounceRequest", () => {
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
      expect(result.body).equals('Internal Server Error');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains("text/plain");
    });

    it('returns 500 for malformed context', async () => {
      const result = await index.handleBounceRequest({
        httpMethod: 'GET',
        path: '/',
      }, null as any);
      expect(result).not.eq(null);
      expect(result.statusCode).equals(500);
      expect(result.body).equals('Internal Server Error');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains("text/plain");
    });
  });
  describe('handleBounceCreate', () => {
    it('returns 500 for missing request', async () => {
      const result = await index.handleBounceCreate(undefined as any, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.body).equals('Internal Server Error', 'result body');
      expect(result.statusCode).equals(500, 'status code');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 500 for missing context', async () => {
      const result = await index.handleBounceCreate({httpMethod: 'POST'}, undefined as any);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.body).equals('Internal Server Error', 'result body');
      expect(result.statusCode).equals(500, 'status code');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 405 for GET', async () => {
      const result = await index.handleBounceCreate({
        httpMethod: 'GET',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(405, 'status code');
      expect(result.body).equals('Method Not Allowed', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 405 for DELETE', async () => {
      const result = await index.handleBounceCreate({
        httpMethod: 'DELETE',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(405, 'status code');
      expect(result.body).equals('Method Not Allowed', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 405 for PATCH', async () => {
      const result = await index.handleBounceCreate({
        httpMethod: 'PATCH',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(405, 'status code');
      expect(result.body).equals('Method Not Allowed', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 405 for HEAD', async () => {
      const result = await index.handleBounceCreate({
        httpMethod: 'HEAD',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(405, 'status code');
      expect(result.body).equals('Method Not Allowed', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 405 for OPTIONS', async () => {
      const result = await index.handleBounceCreate({
        httpMethod: 'OPTIONS',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(405, 'status code');
      expect(result.body).equals('Method Not Allowed', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 400 for missing headers', async () => {
      const result = await index.handleBounceCreate({
        httpMethod: 'POST',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(400, 'status code');
      expect(result.body).equals('Bad Request', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 400 for missing content-length', async () => {
      const result = await index.handleBounceCreate({
        headers: {},
        httpMethod: 'POST',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(411, 'Length Required');
      expect(result.body).equals('Length Required', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 413 for huge content-length', async () => {
      const result = await index.handleBounceCreate({
        headers: {
          'Content-Length': '50000',
        },
        httpMethod: 'POST',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(413, 'status code');
      expect(result.body).equals('Payload Too Large', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 415 for missing content-type', async () => {
      const result = await index.handleBounceCreate({
        headers: {
          'Content-Length': '123',
        },
        httpMethod: 'POST',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(415, 'status code');
      expect(result.body).equals('Unsupported Media Type', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 415 for non-JSON', async () => {
      const result = await index.handleBounceCreate({
        headers: {
          'Content-Length': '123',
          'Content-Type': 'text/plain',
        },
        httpMethod: 'POST',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(415, 'status code');
      expect(result.body).equals('Unsupported Media Type', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 422 for missing body', async () => {
      const result = await index.handleBounceCreate({
        headers: {
          'Content-Length': '123',
          'Content-Type': 'application/json',
        },
        httpMethod: 'POST',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(422, 'status code');
      expect(result.body).equals('Unprocessable Entity', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 422 for bad length', async () => {
      const result = await index.handleBounceCreate({
        body: newLinkJson,
        headers: {
          'Content-Length': String(newLinkJson.length - 5),
          'Content-Type': 'application/json',
        },
        httpMethod: 'POST',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(422, 'status code');
      expect(result.body).equals('Unprocessable Entity', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 422 for bad json', async () => {
      const result = await index.handleBounceCreate({
        body: newLinkJson.replace('{', '!'),
        headers: {
          'Content-Length': String(newLinkJson.length),
          'Content-Type': 'application/json',
        },
        httpMethod: 'POST',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(422, 'status code');
      expect(result.body).equals('Unprocessable Entity', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 422 for incomplete json', async () => {
      const badLink = JSON.stringify({name: 'whatever'});
      const result = await index.handleBounceCreate({
        body: badLink,
        headers: {
          'Content-Length': String(badLink.length),
          'Content-Type': 'application/json',
        },
        httpMethod: 'POST',
      }, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(422, 'status code');
      expect(result.body).equals('Unprocessable Entity', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 204 if the link already exists as-is', async () => {
      if (dataStore == null) {
        throw new Error('Missing dataStore — check beforeEach');
      }
      dataStore.onLinkFromName = (name) => {
        expect(name).equals(newLink.name);
        return Promise.resolve(newLink);
      };
      const result = await index.handleBounceCreate(newLinkPost, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(204, 'status code');
      expect(result.body).equals('No Content', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 409 if the link already exists with a different title', async () => {
      if (dataStore == null) {
        throw new Error('Missing dataStore — check beforeEach');
      }
      dataStore.onLinkFromName = (name) => {
        expect(name).equals(newLink.name);
        return Promise.resolve({
          href: newLink.href,
          name: newLink.name,
          title: 'wrong' + newLink.title,
        } as BounceLink);
      };
      const result = await index.handleBounceCreate(newLinkPost, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(409, 'status code');
      expect(result.body).equals('Conflict', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 409 if the link already exists with a different href', async () => {
      if (dataStore == null) {
        throw new Error('Missing dataStore — check beforeEach');
      }
      dataStore.onLinkFromName = (name) => {
        expect(name).equals(newLink.name);
        return Promise.resolve({
          href: 'wrong' + newLink.href,
          name: newLink.name,
          title: newLink.title,
        } as BounceLink);
      };
      const result = await index.handleBounceCreate(newLinkPost, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(409, 'status code');
      expect(result.body).equals('Conflict', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns 503 if the link cannot be created', async () => {
      if (dataStore == null) {
        throw new Error('Missing dataStore — check beforeEach');
      }
      dataStore.onLinkFromName = (name) => {
        expect(name).equals(newLink.name);
        return Promise.resolve(null);
      };
      dataStore.onCreateLink = (createLink) => {
        expect(createLink).not.eq(null);
        expect(createLink.name).equals(newLink.name);
        expect(createLink.title).equals(newLink.title);
        expect(createLink.href).equals(newLink.href);
        return Promise.resolve(null as any as BounceLink);
      };
      const result = await index.handleBounceCreate(newLinkPost, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(503, 'status code');
      expect(result.body).equals('Service Unavailable', 'result body');
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/plain');
    });
    it('returns a valid result if everything works', async () => {
      if (dataStore == null) {
        throw new Error('Missing dataStore — check beforeEach');
      }
      dataStore.onLinkFromName = (name) => {
        expect(name).equals(newLink.name);
        return Promise.resolve(null);
      };
      dataStore.onCreateLink = (createLink) => {
        expect(createLink).not.eq(null);
        expect(createLink.name).equals(newLink.name);
        expect(createLink.title).equals(newLink.title);
        expect(createLink.href).equals(newLink.href);
        return Promise.resolve(createLink);
      };
      const result = await index.handleBounceCreate(newLinkPost, context);
      expect(result).is.not.equals(null, 'result is not null');
      expect(result.statusCode).equals(201, 'status code');
      expect(result.body).not.eq(null);
      expect(result.headers).to.haveOwnProperty('Content-Type').contains('text/html');
    });
  });
});
