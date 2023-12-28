/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  transform: {
    "\\.[tj]sx?$": "@swc/jest",
  },
  maxWorkers: "50%",
  collectCoverage: false,
  modulePathIgnorePatterns: ["<rootDir>/cdk.out", "<rootDir>/dist"],
  globalSetup: "<rootDir>/jest.globalSetup.ts",
};
