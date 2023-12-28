import type { Database } from "@fleek-packages/database";
import { StoreRecordService } from "./StoreRecordService";

export type CreateServicesOptions = {
  db: Database;
};

export type Services = ReturnType<typeof createServices>;

export function createServices(options: CreateServicesOptions) {
  return {
    storeRecord: new StoreRecordService(options.db),
  };
}
