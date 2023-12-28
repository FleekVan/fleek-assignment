import { StoreRecordRepository } from "@fleek-packages/database/repository";
import { GraphQLError } from "graphql";
import Dataloader from "dataloader";

export class StoreRecordService {
  constructor(private repo: StoreRecordRepository) {}

  async findOne(id: bigint) {
    return this.batchFindPKs.load(id);
  }

  private batchFindPKs = new Dataloader(async (pks: readonly bigint[]) => {
    const records = await this.repo.findPKs(pks);
    const map = new Map<bigint, (typeof records)[number]>();
    for (const record of records) {
      map.set(BigInt(record.id), record);
    }
    return pks.map((pk) => map.get(pk));
  });

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

  async updateOne(record: { id: bigint; name: string; value: string }) {
    try {
      return await this.repo.updateOne(record);
    } catch (e) {
      if (e.message === "No StoreRecord matched the given id") {
        throw new GraphQLError(
          `No StoreRecord matched the given id: ${record.id}`,
          {
            extensions: {
              code: "BAD_USER_INPUT",
            },
          },
        );
      }

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
