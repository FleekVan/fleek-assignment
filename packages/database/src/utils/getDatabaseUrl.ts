import type { Environment } from "../types";
import { getDatabaseConfig } from "./getDatabaseConfig";

export async function getDatabaseUrl(env: Environment): Promise<string> {
  const config = await getDatabaseConfig(env);

  return `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}
