import { getDatabaseSecret } from "./utils/getDatabaseSecret";
import type { IDatabase, Environment } from "./types";
import mysql from "mysql2/promise";

(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");

export class Database implements IDatabase {
  private connection: mysql.Connection | null = null;

  constructor(private env: Environment) {}

  async connect() {
    const dbConfig = await getDatabaseSecret(this.env);

    this.connection = mysql.createPool({
      // DB_HOST allows for overriding with RDS Proxy host
      host: process.env.DB_HOST ?? dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.dbname,
      user: dbConfig.username,
      password: dbConfig.password,
    });
  }

  get con() {
    if (!this.connection) {
      throw new Error("Not connected");
    }
    return this.connection;
  }

  async [Symbol.asyncDispose]() {
    if (this.connection) {
      await this.connection.end();
    }
  }
}
