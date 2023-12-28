import type mysql from "mysql2/promise";

export type { DatabaseConfig } from "./schema/DatabaseConfig";

export interface IDatabase extends AsyncDisposable {
  connect(): Promise<void>;
  get con(): mysql.Connection;
}

export type Environment = "production";
