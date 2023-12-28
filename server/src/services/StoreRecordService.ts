import { StoreRecordRepository } from "@fleek-packages/database/repository";

export class StoreRecordService {
  constructor(private repo: StoreRecordRepository) {}

  findMany(query: { limit: number; offset: number }) {
    return this.repo.findMany(query);
  }
}
