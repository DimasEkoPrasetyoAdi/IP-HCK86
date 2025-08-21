describe('JWT helper production ConfigError path', () => {
  test('throws ConfigError when JWT_SECRET missing in production', () => {
    const originalEnv = { NODE_ENV: process.env.NODE_ENV, JWT_SECRET: process.env.JWT_SECRET };
    try {
      delete process.env.JWT_SECRET;
      process.env.NODE_ENV = 'production';
  jest.resetModules();
  jest.doMock('dotenv', () => ({ config: jest.fn(() => ({})) })); // prevent .env reload
  expect(() => require('../helpers/jwt')).toThrow(/JWT_SECRET environment variable is not set/);
    } finally {
      process.env.NODE_ENV = originalEnv.NODE_ENV;
      if (originalEnv.JWT_SECRET) process.env.JWT_SECRET = originalEnv.JWT_SECRET; else delete process.env.JWT_SECRET;
  jest.resetModules();
    }
  });
});
