import type { IDatabase } from "./types";
import mysql from "mysql2/promise";
import * as AWS from "aws-sdk";

(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");

export class Database implements IDatabase {
  private connection: mysql.Connection | null = null;

  constructor() {}

  async connect() {
    const sm = new AWS.SecretsManager({
      region: process.env.AWS_REGION,
    });

    const dbSecret = await sm
      .getSecretValue({ SecretId: process.env.DB_SECRET_ARN! })
      .promise();

    const dbConfig: {
      username: string;
      password: string;
      dbname: string;
      engine: string;
      port: number;
      dbInstanceIdentifier: string;
      host: string;
    } = JSON.parse(dbSecret.SecretString!);

    this.connection = mysql.createPool({
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
