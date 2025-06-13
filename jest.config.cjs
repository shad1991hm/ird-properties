// jest.config.cjs
module.exports = {
  testEnvironment: 'node', // Default for backend, will be overridden for frontend tests via docblock or separate config later if needed
  testMatch: [
    '**/server/tests/**/*.test.js',
    '**/src/**/*.test.ts',
    '**/src/**/*.test.tsx'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest', // For backend JS files
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.app.json', // Point directly to tsconfig.app.json
      // isolatedModules: true, // Can speed up, but skips type-checking
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Retain NODE_OPTIONS in npm test script for backend ESM tests.
  // For frontend tests, 'jsdom' environment will be set in the test file or a separate config.
  // This combined config is ambitious; separate configs might be needed if conflicts arise.
  // For now, individual test files can override the environment.
};
