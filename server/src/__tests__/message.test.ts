import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import request from 'supertest';
import express, { Request, Response, NextFunction, Application } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { IUser } from '../models/userModel';
import Chat from '../models/chatModel';
import Message from '../models/messageModel';
import { errorHandler } from '../middleware/errorMiddleware';
import messageRoutes from '../routes/messageRoutes';

jest.mock('../middleware/authMiddleware', () => ({
    protect: jest.fn((req: Request, res: Response, next: NextFunction) => {
        req.user = {
            _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
            name: 'Sender User',
            email: 'sender@example.com'
        } as IUser;
        next();
    }),
}));

describe('Message Endpoints', () => {
    let app: Application;
    let senderId: mongoose.Types.ObjectId, receiverId: mongoose.Types.ObjectId;
    let chatId: mongoose.Types.ObjectId;
    let token: string;
    let messageId: mongoose.Types.ObjectId;

    beforeEach(async () => {
        app = express();
        app.use(express.json());
        app.use('/api/message', messageRoutes);
        app.use(errorHandler);

        const sender = await User.create({ _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'), name: 'Sender User', email: 'sender@example.com', password: 'password123' });
        const receiver = await User.create({ name: 'Receiver User', email: 'receiver@example.com', password: 'password123' });
        senderId = sender._id as mongoose.Types.ObjectId;
        receiverId = receiver._id as mongoose.Types.ObjectId;

        const chat = await Chat.create({ users: [senderId, receiverId] });
        chatId = chat._id as mongoose.Types.ObjectId;
        
        const message = await Message.create({ sender: senderId, content: 'Initial message', chat: chatId });
        messageId = message._id as mongoose.Types.ObjectId;

        token = jwt.sign({ id: senderId }, 'a_secret');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/message', () => {
        it('should send a message successfully', async () => {
            const res = await request(app)
                .post('/api/message')
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Hello there!', chatId: chatId.toString() });

            expect(res.statusCode).toEqual(200);
            expect(res.body.content).toBe('Hello there!');
            expect(res.body.sender.name).toBe('Sender User');
            expect(res.body.chat._id.toString()).toBe(chatId.toString());
        });

        it('should return 400 if content or chatId is missing', async () => {
            const res = await request(app)
                .post('/api/message')
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Missing chat ID' });
            
            expect(res.statusCode).toEqual(400);
        });
    });
    
    describe('GET /api/message/:chatId', () => {
        it('should fetch all messages for a chat', async () => {
             await request(app)
                .post('/api/message')
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Another message', chatId: chatId.toString() });

            const res = await request(app)
                .get(`/api/message/${chatId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(2);
            expect(res.body[0].content).toBe('Initial message');
        });
    });

    describe('PUT /api/message/:messageId', () => {
        it('should update a message successfully', async () => {
            const res = await request(app)
                .put(`/api/message/${messageId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Updated content' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.content).toBe('Updated content');
            const updatedMessage = await Message.findById(messageId);
            expect(updatedMessage?.content).toBe('Updated content');
        });
        
        it('should not allow updating another user\'s message', async () => {
            const otherUserMessage = await Message.create({ sender: receiverId, content: 'Other user message', chat: chatId });
            const res = await request(app)
                .put(`/api/message/${otherUserMessage._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Trying to update' });
            
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toBe('User not authorized to edit this message');
        });
    });
    
    describe('DELETE /api/message/:messageId', () => {
        it('should "delete" a message by updating its content and isDeleted flag', async () => {
            const res = await request(app)
                .delete(`/api/message/${messageId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.content).toBe('This message was deleted');
            expect(res.body.isDeleted).toBe(true);

            const deletedMessage = await Message.findById(messageId);
            expect(deletedMessage?.content).toBe('This message was deleted');
            expect(deletedMessage?.isDeleted).toBe(true);
        });
        
        it('should not allow deleting another user\'s message', async () => {
             const otherUserMessage = await Message.create({ sender: receiverId, content: 'Other user message', chat: chatId });
             const res = await request(app)
                .delete(`/api/message/${otherUserMessage._id}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toBe('User not authorized to delete this message');
        });
    });
});