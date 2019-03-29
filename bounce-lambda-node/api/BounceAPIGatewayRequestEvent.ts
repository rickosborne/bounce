export interface BounceAPIGatewayRequestEvent {
  httpMethod: string;
  path: string;
  pathParameters?: {
    linkId?: string;
  };
}
