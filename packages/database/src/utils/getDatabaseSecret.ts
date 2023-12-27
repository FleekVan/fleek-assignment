import * as AWS from "aws-sdk";
import { Environment } from "../types";

const ENV_TO_SECRET_ARN: Record<Environment, string> = {
  production:
    "arn:aws:secretsmanager:eu-west-1:046557722402:secret:productiondatabaseSecretBD3-FOSrVBJFewqE-GwiDBp",
};

export async function getDatabaseSecret(env: Environment) {
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

  const dbConfig: {
    username: string;
    password: string;
    dbname: string;
    engine: string;
    port: number;
    dbInstanceIdentifier: string;
    host: string;
  } = JSON.parse(dbSecret.SecretString!);

  return dbConfig;
}
