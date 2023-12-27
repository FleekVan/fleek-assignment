import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";
import { server } from "./server";
import { Database } from "@fleek-packages/database";

export const handler = startServerAndCreateLambdaHandler(
  server,
  // We will be using the Proxy V2 handler
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    context: async () => {
      const db = new Database();
      await db.connect();

      return {
        con: db.con,
      };
    },
  },
);
