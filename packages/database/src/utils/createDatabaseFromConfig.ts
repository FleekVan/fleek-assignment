import mysql from "mysql2";
import { Kysely, MysqlDialect } from "kysely";
import type { DB } from "../db-codegen";
import type { DatabaseConfig } from "../schema/DatabaseConfig";

export function createDatabaseFromConfig(config: DatabaseConfig) {
  return new Kysely<DB>({
    dialect: new MysqlDialect({
      pool: mysql.createPool(config),
    }),
  });
}
