import type { Environment } from "./types";
import mysql from "mysql2";
import { getDatabaseConfig } from "./utils/getDatabaseConfig";

import { Kysely, MysqlDialect } from "kysely";
import type { DB } from "./db-codegen";

export async function createDatabase(env: Environment) {
  const config = await getDatabaseConfig(env);

  const dialect = new MysqlDialect({
    pool: mysql.createPool({
      // DB_HOST allows for overriding with RDS Proxy host
      host: process.env.DB_HOST ?? config.host,
      port: config.port,
      database: config.dbname,
      user: config.username,
      password: config.password,
    }),
  });

  return new Kysely<DB>({
    dialect,
  });
}

export type Database = Awaited<ReturnType<typeof createDatabase>>;
