import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IChat extends Document {
  users: mongoose.Types.ObjectId[];
  latestMessage?: mongoose.Types.ObjectId;
}

const chatSchema: Schema<IChat> = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true },
);

const Chat: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);
export default Chat;
