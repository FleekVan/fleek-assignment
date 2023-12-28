import {
  startServerAndCreateLambdaHandler,
  handlers,
} from "@as-integrations/aws-lambda";
import { server } from "./server";
import { createDatabase } from "@fleek-packages/database";
import { createContext } from "./graphql/createContext";

export const handler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    context: async () => {
      const db = await createDatabase("production");

      return createContext(db);
    },
  },
);
