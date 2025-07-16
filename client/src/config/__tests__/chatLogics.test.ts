
import { describe, it, expect } from 'vitest';
import { getSender, getSenderFull, isSameSender, isLastMessage, isSameSenderMargin, isSameUser } from '../chatLogics';
import { User, Message } from '../../types';

const mockUser1: User = { _id: '1', name: 'User One', email: 'user1@test.com', pic: '' };
const mockUser2: User = { _id: '2', name: 'User Two', email: 'user2@test.com', pic: '' };
const mockUsers: User[] = [mockUser1, mockUser2];

const createMockMessage = (sender: User, content: string): Message => ({
    _id: Math.random().toString(),
    sender,
    content,
    chat: { _id: 'chat1', chatName: 'Test Chat', users: [], isGroupChat: false },
});

describe('Chat Logics', () => {
    describe('getSender', () => {
        it('should return the other user\'s name', () => {
            expect(getSender(mockUser1, mockUsers)).toBe('User Two');
        });
        it('should return the first user\'s name if logged user is second', () => {
            expect(getSender(mockUser2, mockUsers)).toBe('User One');
        });
    });

    describe('getSenderFull', () => {
        it('should return the other user\'s full object', () => {
            expect(getSenderFull(mockUser1, mockUsers)).toEqual(mockUser2);
        });
        it('should return the first user\'s full object if logged user is second', () => {
            expect(getSenderFull(mockUser2, mockUsers)).toEqual(mockUser1);
        });
    });

    const messages: Message[] = [
        createMockMessage(mockUser2, 'Hello'),
        createMockMessage(mockUser1, 'Hi'),
        createMockMessage(mockUser1, 'How are you?'),
        createMockMessage(mockUser2, 'Fine, thanks!'),
    ];

    describe('isSameSender', () => {
        it('should return true if the next message is from a different sender', () => {
            expect(isSameSender(messages, messages[0], 0, mockUser1._id)).toBe(true);
        });
        it('should return false if the sender is the logged in user', () => {
            expect(isSameSender(messages, messages[1], 1, mockUser1._id)).toBe(false);
        });
        it('should return false if the next message is from the same sender', () => {
            expect(isSameSender(messages, messages[1], 1, mockUser2._id)).toBe(false);
        });
    });

    describe('isLastMessage', () => {
        it('should return true if it is the last message and not from the logged user', () => {
            expect(isLastMessage(messages, 3, mockUser1._id)).toBe(true);
        });
        it('should return false if it is the last message but from the logged user', () => {
            expect(isLastMessage(messages, 3, mockUser2._id)).toBe(false);
        });
        it('should return false if it is not the last message', () => {
            expect(isLastMessage(messages, 2, mockUser1._id)).toBe(false);
        });
    });

    describe('isSameSenderMargin', () => {
        it('should return 33 if next message is from same sender and not logged user', () => {
            const testMessages = [createMockMessage(mockUser2, 'a'), createMockMessage(mockUser2, 'b')];
            expect(isSameSenderMargin(testMessages, testMessages[0], 0, mockUser1._id)).toBe(33);
        });
        it('should return 0 if next message is from different sender and not logged user', () => {
            expect(isSameSenderMargin(messages, messages[0], 0, mockUser1._id)).toBe(0);
        });
        it('should return "auto" if message is from logged user', () => {
            expect(isSameSenderMargin(messages, messages[1], 1, mockUser1._id)).toBe('auto');
        });
    });

    describe('isSameUser', () => {
        it('should return true if the previous message is from the same user', () => {
            expect(isSameUser(messages, messages[2], 2)).toBe(true);
        });
        it('should return false if the previous message is from a different user', () => {
            expect(isSameUser(messages, messages[1], 1)).toBe(false);
        });
        it('should return false for the first message', () => {
            expect(isSameUser(messages, messages[0], 0)).toBe(false);
        });
    });
});
