import { createTestDatabase, migrateDatabase } from "./src/test";

export default async function globalSetup() {
  const db = await createTestDatabase();
  await migrateDatabase(db);
  await db.destroy();
}
