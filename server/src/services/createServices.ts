import type { Database } from "@fleek-packages/database";
import { StoreRecordService } from "./StoreRecordService";
import { StoreRecordRepository } from "@fleek-packages/database/repository";

export type CreateServicesOptions = {
  db: Database;
};

export type Services = ReturnType<typeof createServices>;

export function createServices(options: CreateServicesOptions) {
  return {
    storeRecord: new StoreRecordService(new StoreRecordRepository(options.db)),
  };
}
