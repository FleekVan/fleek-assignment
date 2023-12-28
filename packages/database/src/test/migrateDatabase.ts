import type { Database } from "../createDatabase";
import { MySQLCooperativeLock } from "../MySQLCooperativeLock";
import { sql } from "kysely";
import path from "node:path";
import fs from "node:fs/promises";
import sqlFormatter from "@sqltools/formatter";

export async function migrateDatabase(db: Database) {
  const statements = await prepareMigrationStatements();
  const migrationCreateTableStatementsCount = statements.filter((s) =>
    s.startsWith("CREATE TABLE"),
  ).length;

  const dbName: string = (
    (await sql`SELECT DATABASE()`.execute(db)).rows[0] as any
  )["DATABASE()"];

  const lock = new MySQLCooperativeLock(db, "test-migration-lock", 30);
  await lock.acquire();
  try {
    const currentTables = await getCurrentDatabaseTables();
    const currentTablesCreateStatements =
      await getCurrentDatabaseTablesCreateTable(dbName, currentTables);

    const formattedStatements = statements.map((s) => sqlFormatter.format(s));
    const shouldMigrationExecute =
      currentTables.length === 0 ||
      currentTablesCreateStatements.length !==
        migrationCreateTableStatementsCount ||
      currentTablesCreateStatements.some(
        (s) => !formattedStatements.includes(sqlFormatter.format(s)),
      );

    if (!shouldMigrationExecute) {
      return;
    }
    if (currentTables.length > 0) {
      await sql`DROP DATABASE ${sql.id(dbName)}`.execute(db);
      await sql`CREATE DATABASE ${sql.id(dbName)}`.execute(db);
      await sql`USE ${sql.id(dbName)}`.execute(db);
    }

    for (const stmt of statements) {
      await sql.raw(stmt).execute(db);
    }
  } finally {
    await lock.release();
  }

  ///////////////////////////////////////////////////////

  async function prepareMigrationStatements() {
    const SKEEMA_DIR = path.join(__dirname, "../../../../schema/fleekdb");
    const files = await fs.readdir(SKEEMA_DIR);
    const tableDefinitions = files.filter((f) => f.endsWith(".sql"));
    let statements: string[] = [];
    for (const tableDef of tableDefinitions) {
      const contents = await fs.readFile(
        path.join(SKEEMA_DIR, tableDef),
        "utf8",
      );
      statements.push(contents);
    }
    return statements;
  }

  async function getCurrentDatabaseTables() {
    return (
      await sql`SELECT TABLE_NAME FROM
        INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()`.execute(db)
    ).rows.map((row: any) => row.TABLE_NAME);
  }

  async function getCurrentDatabaseTablesCreateTable(
    dbName: string,
    tables: string[],
  ) {
    const createTableStatements: string[] = [];
    for (const tableName of tables) {
      const createStatement = (
        (await sql`SHOW CREATE TABLE ${sql.id(dbName, tableName)}`.execute(
          db,
        )) as any
      ).rows[0]["Create Table"];
      createTableStatements.push(createStatement + ";");
    }

    return createTableStatements;
  }
}
