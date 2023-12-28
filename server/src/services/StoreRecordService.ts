import type { Database } from "@fleek-packages/database";

export class StoreRecordService {
  constructor(private db: Database) {}

  async findMany(query: { limit: number; offset: number }) {
    return this.db
      .selectFrom("StoreRecord")
      .limit(query.limit)
      .offset(query.offset)
      .selectAll()
      .execute();
  }
}
