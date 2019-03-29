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
import {BogusError} from "../impl/BogusError";

const NOT_FOUND_RESPONSE: APIGatewayProxyResult = {
  body: 'Not Found',
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
  },
  statusCode: 404,
};

const SERVER_ERROR_RESPONSE: APIGatewayProxyResult = {
  body: "",
  statusCode: 500,
};

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

// noinspection JSUnusedGlobalSymbols
export async function handleBounceRequest(request: BounceAPIGatewayRequestEvent, context: Context): Promise<APIGatewayProxyResult> {
  try {
    const theApp = getApp();
    if (request == null || context == null) {
      // noinspection ExceptionCaughtLocallyJS
      throw new BogusError(`Missing event or context`);
    }
    let linkName: string | null = null;
    let link: BounceLink | null = null;
    if (request.pathParameters != null && request.pathParameters.linkId != null) {
      linkName = request.pathParameters.linkId;
    } else if (request.path != null) {
      linkName = request.path.replace(/^\//, '');
    }
    if (linkName != null && linkName !== '') {
      link = await theApp.linkFromName(linkName);
    } else {
      link = theApp.defaultLink();
    }
    if (link == null) {
      return NOT_FOUND_RESPONSE;
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
    console.log(e);
    return SERVER_ERROR_RESPONSE;
  }
}
