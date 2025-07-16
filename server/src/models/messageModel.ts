import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  content: string;
  chat: mongoose.Types.ObjectId;
  isDeleted?: boolean;
}

const messageSchema: Schema<IMessage> = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
