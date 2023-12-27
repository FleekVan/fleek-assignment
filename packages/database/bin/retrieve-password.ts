#!/usr/bin/env tsx

process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";
process.env.AWS_PROFILE = process.env.AWS_PROFILE ?? "fleek";

import { Environment } from "../src/types";
import { getDatabaseSecret } from "../src/utils/getDatabaseSecret";

async function main() {
  const environment = process.argv.slice(2)[0];
  if (!environment) {
    throw new Error("Missing environment argument");
  }

  const dbConfig = await getDatabaseSecret(environment as Environment);

  console.log(dbConfig.password);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
