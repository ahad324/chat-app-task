
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Message from '../models/messageModel';
import User from '../models/userModel';
import Chat from '../models/chatModel';

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        res.sendStatus(400);
        return
    }

    let newMessage = {
        sender: (req as any).user._id,
        content: content,
        chat: chatId,
    };

    try {
        let message: any = await Message.create(newMessage);
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email',
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        });

        res.json(message);
    } catch (error: any) {
        res.status(400);
        throw new Error((error as Error).message);
    }
});

const allMessages = asyncHandler(async (req: Request, res: Response) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error: any) {
        res.status(400);
        throw new Error((error as Error).message);
    }
});

const updateMessage = asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
        res.status(404);
        throw new Error("Message not found");
    }

    if (message.sender.toString() !== (req as any).user._id.toString()) {
        res.status(403);
        throw new Error("User not authorized to edit this message");
    }
    
    if (message.isDeleted) {
        res.status(400);
        throw new Error("Cannot edit a deleted message");
    }

    message.content = content;
    
    let updatedMessage: any = await message.save();
    
    updatedMessage = await updatedMessage.populate("sender", "name pic");
    updatedMessage = await updatedMessage.populate("chat");
    updatedMessage = await User.populate(updatedMessage, {
        path: 'chat.users',
        select: 'name pic email',
    });

    res.json(updatedMessage);
});

const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);

    if (!message) {
        res.status(404);
        throw new Error("Message not found");
    }

    if (message.sender.toString() !== (req as any).user._id.toString()) {
        res.status(403);
        throw new Error("User not authorized to delete this message");
    }
    
    message.content = "This message was deleted";
    message.isDeleted = true;

    let deletedMessage: any = await message.save();

    deletedMessage = await deletedMessage.populate("sender", "name pic");
    deletedMessage = await deletedMessage.populate("chat");
    deletedMessage = await User.populate(deletedMessage, {
        path: 'chat.users',
        select: 'name pic email',
    });

    res.json(deletedMessage);
});


export { sendMessage, allMessages, updateMessage, deleteMessage };
