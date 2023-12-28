#!/usr/bin/env tsx

process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";
process.env.AWS_PROFILE = process.env.AWS_PROFILE ?? "fleek";

import { Environment } from "../src/types";
import { getDatabaseUrl } from "../src/utils/getDatabaseUrl";

async function main() {
  const environment = process.argv.slice(2)[0];
  if (!environment) {
    throw new Error("Missing environment argument");
  }

  const url = await getDatabaseUrl(environment as Environment);

  console.log(url);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
