import { Database } from "./createDatabase";
import { sql } from "kysely";

const GET_LOCK_SUCCESS = 1;
const GET_LOCK_TIMEOUT = 0;
const GET_LOCK_ERROR = null;
type GetLockResult =
  | typeof GET_LOCK_SUCCESS
  | typeof GET_LOCK_TIMEOUT
  | typeof GET_LOCK_ERROR;

const RELEASE_LOCK_SUCCESS = 1;
const RELEASE_LOCK_FAILURE = 0;
const RELEASE_LOCK_DOES_NOT_EXIST = null;
type ReleaseLockResult =
  | typeof RELEASE_LOCK_SUCCESS
  | typeof RELEASE_LOCK_FAILURE
  | typeof RELEASE_LOCK_DOES_NOT_EXIST;

/**
 * A cooperative lock that uses MySQL's GET_LOCK and RELEASE_LOCK functions.
 *
 * This is an application-level lock. It does not by itself prevent access to any resources,
 * but the application can use it a a signal that a resource is in use.
 */
export class MySQLCooperativeLock {
  public isLocked = false;

  constructor(
    private readonly db: Database,
    public readonly lockName: string,
    public readonly timeoutSeconds = 10,
  ) {
    if (lockName.length > 64) {
      throw new Error(
        `Lock name "${lockName}" is too long. Maximum length is 64 characters.`,
      );
    }
  }

  async acquire(): Promise<true> {
    if (this.isLocked) {
      throw new Error(`Lock "${this.lockName}" already acquired.`);
    }

    const lockStmt = sql`GET_LOCK(${sql.lit(this.lockName)}, ${sql.lit(
      this.timeoutSeconds,
    )})`;
    const lockName = lockStmt.compile(this.db).sql;

    const {
      rows: [res],
    } = await sql.raw("SELECT " + lockName).execute(this.db);
    const lock: GetLockResult = (res as any)[lockName];
    switch (lock) {
      case GET_LOCK_SUCCESS:
        this.isLocked = true;
        return true;
      case GET_LOCK_TIMEOUT:
        throw new Error(
          `Unable to acquire lock "${this.lockName}" - timed out after ${this.timeoutSeconds} seconds.`,
        );
      case GET_LOCK_ERROR:
        throw new Error(
          `Unable to acquire lock "${this.lockName}" - unexpected MySQL failure.`,
        );
      default:
        assertNever(lock);
    }
  }

  async release(): Promise<true> {
    if (!this.isLocked) {
      throw new Error(`Lock "${this.lockName}" not acquired.`);
    }
    const lockStmt = sql`RELEASE_LOCK(${sql.lit(this.lockName)})`;
    const lockName = lockStmt.compile(this.db).sql;

    const {
      rows: [res],
    } = await sql.raw("SELECT " + lockName).execute(this.db);
    const lock: ReleaseLockResult = (res as any)[lockName];
    switch (lock) {
      case RELEASE_LOCK_SUCCESS:
        this.isLocked = false;
        return true;
      case RELEASE_LOCK_FAILURE:
        throw new Error(`Lock ${this.lockName} failed to release`);
      case RELEASE_LOCK_DOES_NOT_EXIST:
        throw new Error(`Lock ${this.lockName} does not exist`);
      default:
        assertNever(lock);
    }
  }
}

function assertNever(x: never): never {
  throw new Error(
    "Unexpected code executed, value should have been of type never but was: " +
      JSON.stringify(x),
  );
}
