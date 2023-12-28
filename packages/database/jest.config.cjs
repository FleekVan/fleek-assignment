/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  transform: {
    "\\.[tj]sx?$": "@swc/jest",
  },
  maxWorkers: 1, // easiest way to make sure DB tests don't conflict
  collectCoverage: false,
  modulePathIgnorePatterns: ["<rootDir>/cdk.out", "<rootDir>/dist"],
  globalSetup: "<rootDir>/jest.globalSetup.ts",
};
