import type { Database } from "..";

export class StoreRecordRepository {
  constructor(private db: Database) {}

  async findMany(query: { limit: number; offset: number }) {
    return this.db
      .selectFrom("StoreRecord")
      .limit(query.limit)
      .offset(query.offset)
      .selectAll()
      .execute();
  }

  async createOne(record: { name: string; value: string }) {
    return await this.db.transaction().execute(async (trx) => {
      const res = await trx
        .insertInto("StoreRecord")
        .values(record)
        .executeTakeFirstOrThrow();

      return trx
        .selectFrom("StoreRecord")
        .selectAll()
        .where("id", "=", res.insertId!)
        .executeTakeFirstOrThrow();
    });
  }
}
