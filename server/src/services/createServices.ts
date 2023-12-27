import type { IDatabase } from "@fleek-packages/database";
import { StoreRecordService } from "./StoreRecordService";

export type CreateServicesOptions = {
  con: IDatabase["con"];
};

export type Services = ReturnType<typeof createServices>;

export function createServices(options: CreateServicesOptions) {
  return {
    storeRecord: new StoreRecordService(options.con),
  };
}
