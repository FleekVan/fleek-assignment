import mysql2 from "mysql2/promise";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { StartedMySqlContainer } from "@testcontainers/mysql";
import { createDatabaseFromConfig } from "../utils/createDatabaseFromConfig";
import { DatabaseConfig, DatabaseConfigSchema } from "../schema/DatabaseConfig";
import { Database } from "..";

const cwdHash = createHash("md5").update(process.cwd()).digest("hex");

/**
 * Get a KnexTestDatabase instance attached to a docker container
 */
export async function createTestDatabase(): Promise<Database> {
  const config = await getTestDatabaseConnectionConfig();
  return createDatabaseFromConfig(config);
}

/**
 * Migrate the test database to the current skeema definition
 */

let _container: StartedMySqlContainer | undefined;
/**
 * @internal You should not call this function directly.
 * Use the getTestDatabase() instead
 */
export async function startMySqlContainer() {
  if (_container) {
    return _container;
  }
  const MySqlContainer = await import("@testcontainers/mysql").then(
    (m) => m.MySqlContainer,
  );
  return (_container = await new MySqlContainer()
    .withDatabase("fleekdb" + cwdHash)
    .withUsername("user")
    .withUserPassword("user")
    .withRootPassword("root-" + cwdHash)
    .withReuse()
    .start());
}

let _config: DatabaseConfig | undefined;
/**
 * @internal You should not call this function directly.
 * Use the getTestDatabase() instead.
 *
 * Since the only thing that can possibly change between invocations
 * is the port of the mysql container, and that should not change in
 * the same test session, we're caching the config to a temp file.
 *
 * @param fromContainer If true, the database config will be loaded from the container and filesystem cache will not be considered
 */
async function getTestDatabaseConnectionConfig(): Promise<DatabaseConfig> {
  if (_config) {
    return _config satisfies DatabaseConfig;
  }

  const configPath = getConfigFilePath();
  try {
    // fast path, we get the config from the shared file
    _config = DatabaseConfigSchema.parse(
      JSON.parse(await fs.readFile(configPath, "utf8")),
    );
    // and we verify that we have a valid connection
    const conn = await mysql2.createConnection(_config);
    await conn.query("SELECT 1");
    await conn.end();

    return _config satisfies DatabaseConfig;
  } catch (e) {
    // do nothing
  }

  // slow path, we get the config from the nodecontainers
  const container = await startMySqlContainer();
  _config = DatabaseConfigSchema.parse({
    port: container.getPort(),
    host: container.getHost(),
    user: "root",
    password: container.getRootPassword(),
    database: container.getDatabase(),
  });

  try {
    await fs.writeFile(configPath, JSON.stringify(_config, null, 4));
  } catch (e) {
    // do nothing
  }
  return _config;

  /////////////////////////////

  function getConfigFilePath() {
    return path.join(os.tmpdir(), `test-db-${cwdHash}.json`);
  }
}
