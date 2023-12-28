import * as AWS from "aws-sdk";
import type { Environment } from "../types";
import { DatabaseConfig } from "../schema/DatabaseConfig";
import { SecretsManagerDatabaseConfigSchema } from "../schema/SecretsManagerDatabaseConfig";

const ENV_TO_SECRET_ARN: Record<Environment, string> = {
  production:
    "arn:aws:secretsmanager:eu-west-1:046557722402:secret:productiondatabaseSecretBD3-FOSrVBJFewqE-GwiDBp",
};

export async function getDatabaseConfig(
  env: Environment,
): Promise<DatabaseConfig> {
  const SecretId = ENV_TO_SECRET_ARN[env];
  if (!SecretId) {
    throw new Error(
      "Cannot resolve database secret, invalid environment provided: " + env,
    );
  }

  const sm = new AWS.SecretsManager({
    region: process.env.AWS_REGION ?? "eu-west-1",
  });

  const dbSecret = await sm.getSecretValue({ SecretId }).promise();

  const config = SecretsManagerDatabaseConfigSchema.parse(
    JSON.parse(dbSecret.SecretString!),
  );

  return {
    // DB_HOST allows for overriding with RDS Proxy host
    host: process.env.DB_HOST ?? config.host,
    port: config.port,
    database: config.dbname,
    user: config.username,
    password: config.password,
  };
}
