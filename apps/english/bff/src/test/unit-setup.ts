// Unit specs use no database. postgres-js connects lazily, so a URL that
// points nowhere is safe as long as a spec never runs a query.
Object.assign(process.env, {
  NODE_ENV: 'test',
  LOG_LEVEL: 'error',
  DATABASE_URL: 'postgresql://postgres@127.0.0.1:1/unit',
  DATABASE_SSL: 'false',
  JWT_SECRET: 'unit-test-secret',
  ADMIN_EMAILS: 'teacher@example.com',
  RESEND_API_KEY: '',
});
