import type { Environment } from "./types";
import { createDatabaseFromConfig } from "./utils/createDatabaseFromConfig";
import { getDatabaseConfig } from "./utils/getDatabaseConfig";

export async function createDatabase(env: Environment) {
  const config = await getDatabaseConfig(env);

  return createDatabaseFromConfig(config);
}

export type Database = Awaited<ReturnType<typeof createDatabase>>;
