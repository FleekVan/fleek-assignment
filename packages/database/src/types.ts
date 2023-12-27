import type mysql from "mysql2/promise";

export interface IDatabase extends AsyncDisposable {
  connect(): Promise<void>;
  get con(): mysql.Connection;
}
