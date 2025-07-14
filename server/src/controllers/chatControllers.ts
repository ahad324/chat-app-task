import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel';
import User from '../models/userModel';

const accessChat = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) {
        console.log("UserId param not sent with request");
        res.sendStatus(400);
        return;
    }

    let isChat: any = await Chat.find({
        $and: [
            { users: { $elemMatch: { $eq: (req as any).user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    }).populate("users", "-password").populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        let chatData = {
            users: [(req as any).user._id, userId],
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).send(FullChat);
        } catch (error: any) {
            res.status(400);
            throw new Error((error as Error).message);
        }
    }
});

const fetchChats = asyncHandler(async (req: Request, res: Response) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: (req as any).user._id } } })
            .populate("users", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "name pic email",
                }) as any;
                res.status(200).send(results);
            });
    } catch (error: any) {
        res.status(400);
        throw new Error((error as Error).message);
    }
});

export { accessChat, fetchChats };