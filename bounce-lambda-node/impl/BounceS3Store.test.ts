import {AWSError, Request} from "aws-sdk";
import {GetObjectOutput, GetObjectRequest, PutObjectOutput, PutObjectRequest} from "aws-sdk/clients/s3";
import {expect} from 'chai';
import {describe, it} from 'mocha';
import {BounceLink} from "../api/BounceLink";
import {BounceUser} from "../api/BounceUser";
import {BounceS3Store} from "./BounceS3Store";
import {TestableBounceS3Store} from "./TestableBounceS3Store";

const link: BounceLink = {
  hits: 1234,
  href: 'https://github.com/rickosborne',
  name: 'github',
  peeks: 56,
  title: 'GitHub',
};
const linkGetOut: GetObjectOutput = {
  Body: new Buffer(JSON.stringify(link), 'utf-8'),
};
const linkPutOut: PutObjectOutput = {
  ETag: 'some-etag',
};
const linkPath = 'link/github.json';
const user: BounceUser = {
  email: 'some@example.com',
};
const userGetOut: GetObjectOutput = {
  Body: new Buffer(JSON.stringify(user), 'utf-8'),
};
const userPath = 'user/some~40example~2ecom.json';
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

enum TestResultType {
  SUCCEED = 'succeed',
  FAIL = 'fail',
  THROW = 'throw',
}

const errorMessage = 'Thrown service error';

function onSomething<P extends PutObjectRequest | GetObjectRequest, D extends PutObjectOutput | GetObjectOutput>(
  resultType: TestResultType,
  store: TestableBounceS3Store,
  objectPath: string,
  resultData: D,
): (params: P, callback?: (err: AWSError, data: D) => void) => Request<D, AWSError> {
  return (params, callback) => {
    expect(params.Bucket).equals(store.testableConfig.bucketName);
    expect(params.Key).deep.equals(objectPath);
    if (callback == null) {
      throw new Error(`Missing callback for shouldGet(${JSON.stringify(params)})`);
    } else if (resultType === TestResultType.THROW) {
      throw new Error(errorMessage);
    }
    callback(
      resultType === TestResultType.FAIL ? error : undefined as any,
      resultType === TestResultType.SUCCEED ? resultData : undefined as any,
    );
    return undefined as any;
  };
}

const testReturnedError = async <T, P extends PutObjectRequest | GetObjectRequest, D extends PutObjectOutput | GetObjectOutput>(
  functionName: string,
  objectPath: string,
  getOut: D | null | undefined,
  putOut: D | null | undefined,
  resultType: TestResultType,
  block: (store: TestableBounceS3Store) => Promise<T>,
): Promise<T> => {
  const store = new TestableBounceS3Store();
  if (getOut != null) {
    store.testableS3.onGetObject = onSomething<GetObjectRequest, GetObjectOutput>(resultType, store, objectPath, getOut);
  }
  if (putOut != null) {
    store.testableS3.onPutObject = onSomething<PutObjectRequest, PutObjectOutput>(resultType, store, objectPath, putOut);
  }
  try {
    const result = await block(store);
    return Promise.resolve(result);
  } catch (e) {
    switch (resultType) {
      case TestResultType.THROW:
        expect(e.message).equals(errorMessage);
        break;
      case TestResultType.FAIL:
        expect(e.message).equals(error.message);
        break;
      default:
        throw new Error('Expected success');
    }
    return Promise.resolve(undefined as any);
  }
};

describe('BounceS3Store', () => {
  describe('createLink', () => {
    it('returns loaded data', async () => {
      const returned = await testReturnedError(
        'createLink',
        linkPath,
        null,
        linkPutOut,
        TestResultType.SUCCEED,
        (store) => store.createLink(link),
      );
      expect(returned.name).equals(link.name);
      expect(returned.title).equals(link.title);
      expect(returned.href).equals(link.href);
      expect(returned.hits).equals(link.hits);
      expect(returned.created).instanceOf(Date);
      expect(returned.id).equals(linkPutOut.ETag);
    });
    it('throws on thrown error', async () => {
      await testReturnedError(
        'linkFromName',
        linkPath,
        null,
        linkPutOut,
        TestResultType.THROW,
        (store) => store.createLink(link),
      );
    });
    it('throws on returned error', async () => {
      await testReturnedError(
        'linkFromName',
        linkPath,
        null,
        linkPutOut,
        TestResultType.FAIL,
        (store) => store.createLink(link),
      );
    });
  });
  describe('linkFromName', () => {
    it('returns loaded data', async () => {
      const returned = await testReturnedError(
        'linkFromName',
        linkPath,
        linkGetOut,
        null,
        TestResultType.SUCCEED,
        (store) => store.linkFromName(link.name),
      );
      expect(returned).deep.eq(link);
    });
    it('throws on thrown error', async () => {
      await testReturnedError(
        'linkFromName',
        linkPath,
        linkGetOut,
        null,
        TestResultType.THROW,
        (store) => store.linkFromName(link.name),
      );
    });
    it('throws on returned error', async () => {
      await testReturnedError(
        'linkFromName',
        linkPath,
        linkGetOut,
        null,
        TestResultType.FAIL,
        (store) => store.linkFromName(link.name),
      );
    });
    it('returns null on malformed data', async () => {
      expect(await testReturnedError<BounceLink | null, GetObjectRequest, GetObjectOutput>(
        'linkFromName',
        linkPath,
        {Body: new Buffer('this is not json')},
        null,
        TestResultType.SUCCEED,
        (store) => store.linkFromName(link.name),
      )).equals(null);
    });
    it('returns null on no data', async () => {
      expect(await testReturnedError<BounceLink | null, GetObjectRequest, GetObjectOutput>(
        'linkFromName',
        linkPath,
        {},
        null,
        TestResultType.SUCCEED,
        (store) => store.linkFromName(link.name),
      )).equals(null);
    });
  });
  describe('pathForLink', () => {
    it('works for string', () => {
      expect(new TestableBounceS3Store().pathForLink('foo-')).equals('link/foo-.json');
    });
    it('works for Link', () => {
      expect(new TestableBounceS3Store().pathForLink(link)).equals(`link/${link.name}.json`);
    });
  });
  describe('pathForUser', () => {
    it('works for string', () => {
      expect(new TestableBounceS3Store().pathForUser('foo!')).equals('user/foo~21.json');
    });
    it('works for User', () => {
      expect(new TestableBounceS3Store().pathForUser(user)).equals(userPath);
    });
  });
  describe('track', () => {
    it('does nothing', () => {
      new TestableBounceS3Store().track(link, true);
      new TestableBounceS3Store().track(link, false);
    });
  });
  describe('userFromEmail', () => {
    it('returns loaded data', async () => {
      const returned = await testReturnedError(
        'userFromEmail',
        userPath,
        userGetOut,
        null,
        TestResultType.SUCCEED,
        (store) => store.userFromEmail(user.email),
      );
      expect(returned).deep.eq(user);
    });
    it('throws on thrown error', async () => {
      await testReturnedError(
        'userFromEmail',
        userPath,
        userGetOut,
        null,
        TestResultType.THROW,
        (store) => store.userFromEmail(user.email),
      );
    });
    it('throws on returned error', async () => {
      await testReturnedError(
        'userFromEmail',
        userPath,
        userGetOut,
        null,
        TestResultType.FAIL,
        (store) => store.userFromEmail(user.email),
      );
    });
    it('returns null on malformed data', async () => {
      expect(await testReturnedError<BounceUser | null, GetObjectRequest, GetObjectOutput>(
        'userFromEmail',
        userPath,
        {Body: new Buffer('this is not json')},
        null,
        TestResultType.SUCCEED,
        (store) => store.userFromEmail(user.email),
      )).equals(null);
    });
  });
});
