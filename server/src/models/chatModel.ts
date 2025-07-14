import mongoose, { Document, Model, Schema } from 'mongoose';
import { IUser } from './userModel';
import { IMessage } from './messageModel';

export interface IChat extends Document {
    chatName: string;
    isGroupChat: boolean;
    users: mongoose.Types.ObjectId[];
    latestMessage?: mongoose.Types.ObjectId;
    groupAdmin?: mongoose.Types.ObjectId;
}

const chatSchema: Schema<IChat> = new mongoose.Schema({
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const Chat: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);
export default Chat;