import type { Environment } from "../types";
import { getDatabaseConfig } from "./getDatabaseConfig";

export async function getDatabaseUrl(env: Environment): Promise<string> {
  const config = await getDatabaseConfig(env);
  const url = `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.dbname}`;

  return url;
}
