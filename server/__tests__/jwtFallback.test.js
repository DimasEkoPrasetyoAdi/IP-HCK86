describe('JWT helper fallback secret (development)', () => {
  const originalEnv = { ...process.env };
  afterAll(() => { process.env = originalEnv; });

  test('falls back to devsecret when JWT_SECRET unset and not production', () => {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'development';
    const jwtPath = require.resolve('../helpers/jwt');
    delete require.cache[jwtPath];
    const { signToken, verifyToken } = require('../helpers/jwt');
    const token = signToken({ foo: 'bar' });
    const decoded = verifyToken(token);
    expect(decoded.foo).toBe('bar');
  });
});
