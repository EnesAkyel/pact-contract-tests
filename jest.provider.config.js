/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/provider/**/*.spec.ts'],
  testTimeout: 60000,
};
