import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

// The GraphQL schema
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => "world",
  },
};

// Set up Apollo Server
export const server = new ApolloServer({
  typeDefs,
  resolvers,

  // Enable GraphQL Playground even on prod, because it makes it easier to test.
  // Should not be enabled on a real production deployment
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
  introspection: true,
});
