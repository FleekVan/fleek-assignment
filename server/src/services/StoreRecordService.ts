import { StoreRecordRepository } from "@fleek-packages/database/repository";
import { GraphQLError } from "graphql";

export class StoreRecordService {
  constructor(private repo: StoreRecordRepository) {}

  async findMany(query: { limit: number; offset: number }) {
    return await this.repo.findMany(query);
  }

  async createOne(record: { name: string; value: string }) {
    try {
      return await this.repo.createOne(record);
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        throw new GraphQLError("A store record with that name already exists", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      throw e;
    }
  }
}
