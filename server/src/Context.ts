import type { IDatabase } from "@fleek-packages/database";

export interface Context {
  con: IDatabase["con"];
}
