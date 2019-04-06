"use strict";

import {APIGatewayProxyResult, Context} from "aws-lambda";
// Implementations
import "../impl/BounceApp.impl";
import "../impl/BounceConsoleLogger";
import "../impl/BounceDataStoreManager";
import "../impl/BounceEnvConfig";
import "../impl/BounceLinkRenderer.impl";

import {BounceAPIGatewayRequestEvent} from "../api/BounceAPIGatewayRequestEvent";
import {BounceApp} from "../api/BounceApp";
import {BounceLink} from "../api/BounceLink";
import {BounceLinkRenderer} from "../api/BounceLinkRenderer";
import {JsonParser} from "../api/JsonParser";
import {buildParser} from "../impl/JsonParser.impl";

function httpResponse(code: number, message: string): APIGatewayProxyResult {
  return {
    body: message,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
    statusCode: code,
  };
}

const NO_CONTENT_204 = httpResponse(204, 'No Content');
const BAD_REQUEST_400 = httpResponse(400, 'Bad Request');
const NOT_FOUND_404 = httpResponse(404, 'Not Found');
const METHOD_NOT_ALLOWED_405 = httpResponse(405, 'Method Not Allowed');
const CONFLICT_409 = httpResponse(409, 'Conflict');
const LENGTH_REQUIRED_411 = httpResponse(411, 'Length Required');
const PAYLOAD_TOO_LARGE_413 = httpResponse(413, 'Payload Too Large');
const UNSUPPORTED_MEDIA_TYPE_415 = httpResponse(415, 'Unsupported Media Type');
const UNPROCESSABLE_ENTITY_422 = httpResponse(422, 'Unprocessable Entity');
const SERVER_ERROR_500 = httpResponse(500, 'Internal Server Error');
const SERVICE_UNAVAILABLE_503 = httpResponse(503, 'Service Unavailable');

const CONTENT_LENGTH_MAX = 1000;
const CONTENT_TYPE_JSON = 'application/json';

/**
 * Exported for test injection.
 */
export let app: BounceApp | undefined;
/**
 * Exported for test injection.
 */
export let linkRenderer: BounceLinkRenderer | undefined;

function getApp(): BounceApp {
  if (app == null) {
    /* istanbul ignore next */
    app = BounceApp.getInstance();
  }
  return app;
}

function getLinkRenderer(): BounceLinkRenderer {
  if (linkRenderer == null) {
    linkRenderer = BounceLinkRenderer.getInstance();
  }
  return linkRenderer;
}

export async function handleBounceRequest(request: BounceAPIGatewayRequestEvent, context: Context): Promise<APIGatewayProxyResult> {
  try {
    if (request == null || context == null) {
      return SERVER_ERROR_500;
    }
    let linkName: string | null = null;
    let link: BounceLink | null = null;
    if (request.pathParameters != null && request.pathParameters.linkId != null) {
      linkName = request.pathParameters.linkId;
    } else if (request.path != null) {
      linkName = request.path.replace(/^\//, '');
    }
    const theApp = getApp();
    if (linkName != null && linkName !== '') {
      link = await theApp.linkFromName(linkName);
    } else {
      link = theApp.defaultLink();
    }
    if (link == null) {
      return NOT_FOUND_404;
    }
    const isPeek: boolean = request.httpMethod === 'HEAD';
    theApp.track(link, isPeek);
    const theRenderer = getLinkRenderer();
    return {
      body: isPeek ? '' : theRenderer.asHTML(link),
      headers: {
        'Content-Type': `${isPeek ? 'text/plain' : 'text/html'}; charset=utf-8`,
        'Location': link.href,
      },
      statusCode: isPeek ? 200 : 302,
    };
  } catch (e) {
    /* istanbul ignore next */
    console.log(e);
    /* istanbul ignore next */
    return SERVER_ERROR_500;
  }
}

const bounceCreateRequestParser: JsonParser<BounceLink> = buildParser<BounceLink>('BounceCreateRequest')
  .requiredString('href')
  .requiredString('title')
  .requiredString('name')
  .parser()
;

export async function handleBounceCreate(request: BounceAPIGatewayRequestEvent, context: Context): Promise<APIGatewayProxyResult> {
  try {
    if (request == null || context == null) {
      return SERVER_ERROR_500;
    } else if (request.httpMethod == null || (request.httpMethod !== 'POST' && request.httpMethod !== 'PUT')) {
      return METHOD_NOT_ALLOWED_405;
    } else if (request.headers == null) {
      return BAD_REQUEST_400;
    } else if (request.headers['Content-Length'] == null) {
      return LENGTH_REQUIRED_411;
    } else if (parseInt(request.headers['Content-Length'], 10) > CONTENT_LENGTH_MAX) {
      return PAYLOAD_TOO_LARGE_413;
    } else if (request.headers['Content-Type'] == null || request.headers['Content-Type'].indexOf(CONTENT_TYPE_JSON) < 0) {
      return UNSUPPORTED_MEDIA_TYPE_415;
    } else if (request.body == null) {
      return UNPROCESSABLE_ENTITY_422;
    }
    const contentLength = parseInt(request.headers['Content-Length'], 10);
    if (contentLength !== request.body.length) {
      return UNPROCESSABLE_ENTITY_422;
    }
    let toCreate: BounceLink | null = null;
    try {
      const json = JSON.parse(request.body);
      toCreate = bounceCreateRequestParser.parse(json);
    } catch (e) {
      return UNPROCESSABLE_ENTITY_422;
    }
    if (toCreate == null) {
      return UNPROCESSABLE_ENTITY_422;
    }
    const theApp = getApp();
    const found = await theApp.linkFromName(toCreate.name);
    if (found != null) {
      if (found.href === toCreate.href && found.title === toCreate.title) {
        return NO_CONTENT_204;
      } else {
        return CONFLICT_409;
      }
    }
    const created = await theApp.createLink(toCreate);
    if (created == null) {
      return SERVICE_UNAVAILABLE_503;
    }
    const renderer = getLinkRenderer();
    return {
      body: renderer.asHTML(created),
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      statusCode: 201,
    };
  } catch (e) {
    /* istanbul ignore next */
    console.log(e);
    /* istanbul ignore next */
    return SERVER_ERROR_500;
  }
}
