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
    "test", "test_server","src_bsn_2.0.27"
  ],
  globalSetup: "./test_server/test-server-invoke",
  globalTeardown: "./test_server/test-server-finish",

};
