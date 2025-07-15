
import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/userRoutes';
import { errorHandler } from '../middleware/errorMiddleware';
import User from '../models/userModel';

const app = express();
app.use(express.json());
app.use('/api/user', userRoutes);
app.use(errorHandler);

describe('Auth Endpoints', () => {

    describe('POST /api/user (Register)', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/user')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
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

            const res = await request(app)
                .post('/api/user')
                .send({
                    name: 'Another User',
                    email: 'exist@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('User with this email already exists');
        });

        it('should fail if password is too short', async () => {
            const res = await request(app)
                .post('/api/user')
                .send({
                    name: 'Short Pass',
                    email: 'short@example.com',
                    password: '123'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toBe('Password must be at least 8 characters long');
        });
    });

    describe('POST /api/user/login (Login)', () => {
        beforeEach(async () => {
             await request(app)
                .post('/api/user')
                .send({
                    name: 'Login User',
                    email: 'login@example.com',
                    password: 'password123'
                });
        });

        it('should login an existing user successfully', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('email', 'login@example.com');
            expect(res.body).toHaveProperty('token');
        });

        it('should fail with invalid password', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Invalid Email or Password');
        });

        it('should fail with non-existent email', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .send({
                    email: 'no-exist@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.message).toBe('Invalid Email or Password');
        });
    });
});