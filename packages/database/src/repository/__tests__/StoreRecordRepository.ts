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

  test("#findOne returns a store record", async () => {
    const storeRecord = await insertStoreRecord(db);

    const result = await subject.findOne(storeRecord.id);

    expect(result).toMatchObject(storeRecord);
  });

  test("#findOne throws if the id does not exist", async () => {
    await expect(
      subject.findOne(999n),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"No StoreRecord matched the given id"`,
    );
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

  test("#createOne creates a store record", async () => {
    const storeRecord = createStoreRecord();

    const result = await subject.createOne(storeRecord);

    expect(result).toMatchObject(storeRecord);
    expect(
      await db.selectFrom("StoreRecord").selectAll().execute(),
    ).toMatchObject([storeRecord]);
  });

  test("#updateOne updates a store record", async () => {
    const storeRecordInput = createStoreRecord();
    const storeRecord = await insertStoreRecord(db, storeRecordInput);

    const result = await subject.updateOne({
      id: storeRecord.id,
      name: "new-name",
      value: "new-value",
    });

    expect(result).toMatchObject({
      ...storeRecord,
      name: "new-name",
      value: "new-value",
    });
  });

  test("#updateOne throws if the id does not exist", async () => {
    await expect(
      subject.updateOne({
        id: 999n,
        name: "new-name",
        value: "new-value",
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"No StoreRecord matched the given id"`,
    );
  });

  test("#updateOne throws if you try to update to an existing name", async () => {
    await insertStoreRecord(db, { name: "existing-name" });
    const storeRecordInput = createStoreRecord({ name: "new-name" });
    const storeRecord = await insertStoreRecord(db, storeRecordInput);

    await expect(
      subject.updateOne({
        id: storeRecord.id,
        name: "existing-name",
        value: "new-value",
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Duplicate entry 'existing-name' for key 'StoreRecord.name'"`,
    );
  });

  afterAll(async () => {
    await db.destroy();
  });
});

function createStoreRecord(
  record?: Partial<Omit<StoreRecord, "id">>,
): Omit<StoreRecord, "id"> {
  return {
    name: faker.string.alphanumeric(10),
    value: faker.music.songName(),
    ...record,
  };
}

async function insertStoreRecord(
  db: Database,
  storeRecord?: Partial<Omit<StoreRecord, "id">>,
) {
  return await db.transaction().execute(async (trx) => {
    const res = await trx
      .insertInto("StoreRecord")
      .values({ ...createStoreRecord(), ...storeRecord })
      .executeTakeFirstOrThrow();

    return trx
      .selectFrom("StoreRecord")
      .selectAll()
      .where("id", "=", res.insertId!)
      .executeTakeFirstOrThrow();
  });
}
