process.env.NODE_ENV = 'test';
process.env.PORT = process.env.PORT || '0';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/shoozyou_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
