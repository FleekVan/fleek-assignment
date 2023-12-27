import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";
import { server } from "./server";

export const handler = startServerAndCreateLambdaHandler(
  server,
  // We will be using the Proxy V2 handler
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
);
