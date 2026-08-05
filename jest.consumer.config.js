/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/consumer/**/*.spec.ts'],
  testTimeout: 30000,
};
