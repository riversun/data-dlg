module.exports = {
  verbose: true,
  testEnvironment: 'jsdom',
  testMatch: [
    "**/test/**/*.test.js"
  ],
  testTimeout: 5000,
  moduleDirectories: [
    "node_modules"
  ],
  // css,scssなどを無視させる
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules"
  },
  coverageDirectory: "./coverage/",
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "src_lib/res", "test", "test_server"
  ],
  globalSetup: "./test_server/test-server-invoke",
  globalTeardown: "./test_server/test-server-finish",

};
