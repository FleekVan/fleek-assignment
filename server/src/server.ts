import { ApolloServer } from "@apollo/server";

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
});
