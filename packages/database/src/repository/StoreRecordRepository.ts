import type { Database } from "..";

export class StoreRecordRepository {
  constructor(private db: Database) {}

  async findOne(id: bigint) {
    return await this._findOne(this.db, id);
  }

  async findPKs(pks: readonly bigint[]) {
    return this.db
      .selectFrom("StoreRecord")
      .where("id", "in", pks)
      .selectAll()
      .execute();
  }

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

  async updateOne(record: { id: bigint; name: string; value: string }) {
    return await this.db.transaction().execute(async (trx) => {
      await this._findOne(trx, record.id);

      // Update the record.
      // We can't use num rows affected to verify the record existed,
      // because we could be updating to the exact same value.
      await trx
        .updateTable("StoreRecord")
        .where("id", "=", record.id)
        .set(record)
        .executeTakeFirstOrThrow();

      return trx
        .selectFrom("StoreRecord")
        .selectAll()
        .where("id", "=", record.id)
        .executeTakeFirstOrThrow();
    });
  }

  private async _findOne(db: Database, id: bigint) {
    try {
      return await db
        .selectFrom("StoreRecord")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirstOrThrow();
    } catch (e) {
      throw new Error("No StoreRecord matched the given id");
    }
  }
}
