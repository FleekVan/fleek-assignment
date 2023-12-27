import type { IDatabase } from "@fleek-packages/database";
import type { Services } from "../services/createServices";

export interface GraphQLContext {
  con: IDatabase["con"];
  services: Services;
}
