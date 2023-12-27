import type { IDatabase } from "@fleek-packages/database";
import type mysql from "mysql2";

export class StoreRecordService {
  constructor(private con: IDatabase["con"]) {}

  async findMany(query: {
    limit: number;
    offset: number;
  }): Promise<mysql.RowDataPacket[]> {
    const [rows] = await this.con.query(
      "SELECT * FROM `StoreRecord` LIMIT ?  OFFSET ?",
      [query.limit, query.offset],
    );

    return rows as mysql.RowDataPacket[];
  }
}
