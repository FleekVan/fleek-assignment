import type { Database } from "@fleek-packages/database";
import type { Services } from "../services/createServices";

export interface GraphQLContext {
  db: Database;
  services: Services;
}
