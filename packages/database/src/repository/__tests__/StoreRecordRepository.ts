import { Database } from "../..";
import { StoreRecord } from "../../db-codegen";
import { createTestDatabase } from "../../test";
import { StoreRecordRepository } from "../StoreRecordRepository";
import { faker } from "@faker-js/faker";

describe("StoreRecordRepository", () => {
  let db: Database;
  let subject: StoreRecordRepository;
  beforeAll(async () => {
    db = await createTestDatabase();
    subject = new StoreRecordRepository(db);
  });

  beforeEach(async () => {
    await db.deleteFrom("StoreRecord").execute();
  });

  test("#findMany returns all store records", async () => {
    const storeRecords = [createStoreRecord(), createStoreRecord()];
    for (const storeRecord of storeRecords) {
      await insertStoreRecord(db, storeRecord);
    }

    const result = await subject.findMany({ limit: 10, offset: 0 });

    expect(result).toMatchObject(storeRecords);
  });

  test("#findMany returns store records with limit and offset", async () => {
    const storeRecords = [createStoreRecord(), createStoreRecord()];
    for (const storeRecord of storeRecords) {
      await insertStoreRecord(db, storeRecord);
    }

    const result = await subject.findMany({ limit: 1, offset: 1 });

    expect(result).toMatchObject([storeRecords[1]]);
  });

  afterAll(async () => {
    await db.destroy();
  });
});

function createStoreRecord(): Omit<StoreRecord, "id"> {
  return {
    name: faker.string.alphanumeric(10),
    value: faker.music.songName(),
  };
}

async function insertStoreRecord(
  db: Database,
  storeRecord?: Partial<Omit<StoreRecord, "id">>,
) {
  await db
    .insertInto("StoreRecord")
    .values({ ...createStoreRecord(), ...storeRecord })
    .execute();
}
