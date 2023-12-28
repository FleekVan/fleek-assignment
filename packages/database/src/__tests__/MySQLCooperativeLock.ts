import { Database } from "..";
import { MySQLCooperativeLock } from "../MySQLCooperativeLock";
import { createTestDatabase } from "../test";

describe("MySQLCooperativeLock async/await", () => {
  let db1: Database;
  let db2: Database;
  beforeEach(async () => {
    db1 = await createTestDatabase();
    db2 = await createTestDatabase();
  });
  afterEach(async () => {
    await db1.destroy();
    await db2.destroy();
  });

  it("lock accross connections", async () => {
    const lock1 = new MySQLCooperativeLock(db1, "test", 0.2);
    const lock2 = new MySQLCooperativeLock(db2, "test", 0.2);

    await expect(lock1.acquire()).resolves.toEqual(true);

    await expect(lock2.acquire()).rejects.toEqual(
      new Error(`Unable to acquire lock "test" - timed out after 0.2 seconds.`),
    );
  });

  it("waits to acquire lock", async () => {
    const lock1 = new MySQLCooperativeLock(db1, "test", 1);
    const lock2 = new MySQLCooperativeLock(db2, "test", 1);

    await expect(lock1.acquire()).resolves.toEqual(true);

    await Promise.all([lock2.acquire(), wait(50, () => lock1.release())]);

    expect(lock1.isLocked).toBe(false);
    expect(lock2.isLocked).toBe(true);

    await expect(lock2.release()).resolves.toEqual(true);
  });

  it("honors lock releases", async () => {
    const lock1 = new MySQLCooperativeLock(db1, "test", 1);
    const lock2 = new MySQLCooperativeLock(db2, "test", 1);

    await expect(lock1.acquire()).resolves.toEqual(true);
    await expect(lock1.release()).resolves.toEqual(true);
    await expect(lock2.acquire()).resolves.toEqual(true);
    await expect(lock2.release()).resolves.toEqual(true);
  });

  it("throws on too long lock name", () => {
    expect(() => new MySQLCooperativeLock(db1, "a".repeat(100), 1)).toThrow(
      `Lock name "${"a".repeat(
        100,
      )}" is too long. Maximum length is 64 characters.`,
    );
  });

  it("prevents double locking", async () => {
    const lock1 = new MySQLCooperativeLock(db1, "test", 1);
    await expect(lock1.acquire()).resolves.toEqual(true);
    await expect(lock1.acquire()).rejects.toEqual(
      new Error(`Lock "test" already acquired.`),
    );
  });

  it("prevents double releasing", async () => {
    const lock1 = new MySQLCooperativeLock(db1, "test", 1);
    await expect(lock1.acquire()).resolves.toEqual(true);
    await expect(lock1.release()).resolves.toEqual(true);
    await expect(lock1.release()).rejects.toEqual(
      new Error(`Lock "test" not acquired.`),
    );
  });
});

async function wait<T = undefined>(ms: number, fn?: () => T): Promise<T> {
  return new Promise((resolve) => setTimeout(resolve, ms)).then(
    () => fn?.(),
  ) as Promise<T>;
}
