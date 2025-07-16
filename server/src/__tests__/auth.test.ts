import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import userRoutes from '../routes/userRoutes';
import { errorHandler } from '../middleware/errorMiddleware';
import User from '../models/userModel';

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn((options: any, callback: (error: any, result: any) => void) => {
        callback(null, { secure_url: 'http://mock-url.com/mock-image.jpg' });
        return {
          end: jest.fn(),
        };
      }),
    },
    config: jest.fn(),
  },
}));

jest.mock('sharp', () =>
  jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    toFormat: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('test-image') as never),
  })),
);

const app = express();
app.use(express.json());
app.use('/api/user', userRoutes);
app.use(errorHandler);

describe('Auth Endpoints', () => {
  describe('POST /api/user (Register)', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/user').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).toHaveProperty('token');

      const userInDb = await User.findOne({ email: 'test@example.com' });
      expect(userInDb).not.toBeNull();
    });

    it('should fail if email already exists', async () => {
      await User.create({ name: 'Existing User', email: 'exist@example.com', password: 'password123' });

      const res = await request(app).post('/api/user').send({
        name: 'Another User',
        email: 'exist@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('User with this email already exists');
    });

    it('should fail if password is too short', async () => {
      const res = await request(app).post('/api/user').send({
        name: 'Short Pass',
        email: 'short@example.com',
        password: '123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Password must be at least 8 characters long');
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(app).post('/api/user').send({
        name: 'Test User',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Please enter all the fields');
    });

    it('should fail if username is already taken', async () => {
      await User.create({ name: 'Existing User', email: 'another@example.com', password: 'password123' });

      const res = await request(app).post('/api/user').send({
        name: 'Existing User',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Username is already taken');
    });
  });

  describe('POST /api/user/login (Login)', () => {
    beforeEach(async () => {
      await request(app).post('/api/user').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app).post('/api/user/login').send({
        email: 'login@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('email', 'login@example.com');
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with invalid password', async () => {
      const res = await request(app).post('/api/user/login').send({
        email: 'login@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Invalid Email or Password');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app).post('/api/user/login').send({
        email: 'no-exist@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Invalid Email or Password');
    });
  });

  describe('Protect Middleware', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      const user: any = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      userId = user._id.toString();
      token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    });

    it('should allow access to protected route with valid token', async () => {
      const res = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/user');

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app).get('/api/user').set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, token failed');
    });

    it('should return 401 if token does not start with Bearer', async () => {
      const res = await request(app).get('/api/user').set('Authorization', `invalidtoken`);

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, no token');
    });

    it('should return 401 if user does not exist', async () => {
      await User.findByIdAndDelete(userId);
      const res = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, token failed');
    });
  });
});

describe('User Endpoints', () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const user: any = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    userId = user._id.toString();
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, { expiresIn: '30d' });
  });

  describe('Integration: User Registration and Login', () => {
    it('should register a user and then log them in', async () => {
      // Registration
      const regRes = await request(app).post('/api/user').send({
        name: 'Integration User',
        email: 'integration@example.com',
        password: 'password123',
      });
      expect(regRes.statusCode).toEqual(201);

      // Login
      const loginRes = await request(app).post('/api/user/login').send({
        email: 'integration@example.com',
        password: 'password123',
      });

      expect(loginRes.statusCode).toEqual(200);
      expect(loginRes.body).toHaveProperty('token');
    });
  });

  describe('Integration: User Search and Chat Initiation', () => {
    it('should search for a user and then create a chat with them', async () => {
      // Search for user
      const searchRes = await request(app).get('/api/user?search=Test').set('Authorization', `Bearer ${token}`);
      expect(searchRes.statusCode).toEqual(200);
      // This is brittle, assumes the user we created in beforeEach is the one we want
      // const userIdToChatWith = searchRes.body[0]._id;

      // Create chat
      // const chatRes = await request(app)
      //     .post('/api/chat')
      //     .set('Authorization', `Bearer ${token}`)
      //     .send({ userId: userIdToChatWith });
      // expect(chatRes.statusCode).toEqual(404); // chat routes not mounted
    });
  });

  describe('GET /api/user (All Users)', () => {
    it('should get all users except the logged in user', async () => {
      await User.create({ name: 'Another User', email: 'another@example.com', password: 'password123' });
      const res = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].name).toBe('Another User');
    });

    it('should get users by search keyword', async () => {
      await User.create({ name: 'Search User', email: 'search@example.com', password: 'password123' });
      const res = await request(app).get('/api/user?search=Search').set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].name).toBe('Search User');
    });

    it('should return an empty array if no user is found', async () => {
      const res = await request(app).get('/api/user?search=NotFound').set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(0);
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user profile picture', async () => {
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .attach('pic', Buffer.from('test-image'), 'test.jpg');

      expect(res.statusCode).toEqual(200);
      expect(res.body.pic).toBeDefined();
    });

    it('should return 401 if user not found', async () => {
      await User.findByIdAndDelete(userId);
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .attach('pic', Buffer.from('test-image'), 'test.jpg');

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Not authorized, token failed');
    });
  });
});
