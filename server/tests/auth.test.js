// server/tests/auth.test.js
import request from 'supertest';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

const mockDbInstance = {
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn(),
  serialize: jest.fn(cb => { if (typeof cb === 'function') cb(); }),
  close: jest.fn(cb => { if (typeof cb === 'function') cb(); }),
};

jest.unstable_mockModule('sqlite3', () => ({
  Database: jest.fn(() => mockDbInstance),
  verbose: jest.fn(() => ({ Database: jest.fn(() => mockDbInstance) })),
}));

const mockBcryptCompareSync = jest.fn();
const mockBcryptHashSync = jest.fn(); // Mock for hashSync
jest.unstable_mockModule('bcryptjs', () => ({
  compareSync: mockBcryptCompareSync,
  hashSync: mockBcryptHashSync, // Provide hashSync in the mock
}));

const mockJwtSign = jest.fn();
jest.unstable_mockModule('jsonwebtoken', () => ({
  sign: mockJwtSign,
}));

const { app } = await import('../index.js');

describe('Auth Routes', () => {
  describe('POST /api/auth/login', () => {
    beforeEach(() => {
      mockDbInstance.get.mockReset();
      mockDbInstance.run.mockReset();
      mockDbInstance.all.mockReset();
      mockDbInstance.serialize.mockReset().mockImplementation(cb => { if (typeof cb === 'function') cb(); });
      mockBcryptCompareSync.mockReset();
      mockBcryptHashSync.mockReset(); // Reset hashSync mock
      mockJwtSign.mockReset();
    });

    it('should login successfully with correct credentials', async () => {
      const mockUser = { id: 'user1', username: 'testuser', password: 'hashedpassword', role: 'user', name: 'Test User' };
      mockDbInstance.get.mockImplementation((query, params, callback) => callback(null, mockUser));
      mockBcryptCompareSync.mockReturnValue(true);
      mockJwtSign.mockReturnValue('testtoken');

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('testtoken');
      expect(response.body.user.username).toBe('testuser');
      expect(mockDbInstance.get).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM users WHERE username = ?'), ['testuser'], expect.any(Function));
      expect(mockBcryptCompareSync).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(mockJwtSign).toHaveBeenCalledWith(
        { id: 'user1', username: 'testuser', role: 'user' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
    });

    it('should return 401 for invalid username', async () => {
      mockDbInstance.get.mockImplementation((query, params, callback) => callback(null, null));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'wronguser', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 401 for incorrect password', async () => {
      const mockUser = { id: 'user1', username: 'testuser', password: 'hashedpassword', role: 'user' };
      mockDbInstance.get.mockImplementation((query, params, callback) => callback(null, mockUser));
      mockBcryptCompareSync.mockReturnValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 500 if database query fails', async () => {
      mockDbInstance.get.mockImplementation((query, params, callback) => callback(new Error('DB error'), null));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });
});
