import type { IDatabase } from "@fleek-packages/database";
import type { GraphQLContext } from "./GraphQLContext";
import { createServices } from "../services/createServices";

export function createContext(con: IDatabase["con"]): GraphQLContext {
  return {
    con,
    services: createServices({ con }),
  };
}
