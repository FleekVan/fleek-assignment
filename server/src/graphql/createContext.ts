import type { Database } from "@fleek-packages/database";
import type { GraphQLContext } from "./GraphQLContext";
import { createServices } from "../services/createServices";

export function createContext(db: Database): GraphQLContext {
  return {
    db,
    services: createServices({ db }),
  };
}
