export interface BounceAPIGatewayRequestEvent {
  body?: string;
  headers?: { [name: string]: string };
  httpMethod: string;
  path?: string;
  pathParameters?: {
    linkId?: string;
  };
}
