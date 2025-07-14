

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
        isGroupChat: false,
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
            chatName: "sender",
            isGroupChat: false,
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
            .populate("groupAdmin", "-password")
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

const createGroupChat = asyncHandler(async (req: Request, res: Response) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the fields" });
    }
    let users = JSON.parse(req.body.users);
    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }
    users.push((req as any).user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: (req as any).user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    } catch (error: any) {
        res.status(400);
        throw new Error((error as Error).message);
    }
});

const renameGroup = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(updatedChat);
    }
});

const addToGroup = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(added);
    }
});

const removeFromGroup = asyncHandler(async (req: Request, res: Response) => {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(removed);
    }
});


export { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };
