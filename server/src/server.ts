import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { createSchema } from "./graphql/createSchema";

// Set up Apollo Server
export const server = new ApolloServer({
  schema: createSchema(),

  // Enable GraphQL Playground even on prod, because it makes it easier to test.
  // Should not be enabled on a real production deployment
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
  introspection: true,
});
