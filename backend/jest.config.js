module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  rootDir: "./",
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFiles: ["dotenv/config"],
  testTimeout: 30000,
};
