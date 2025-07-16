import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Chat from '../models/chatModel';
import User, { IUser } from '../models/userModel';

const accessChat = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) {
    res.status(401).send('Unauthorized');
    return;
  }

  const { userId } = req.body;
  if (!userId) {
    console.log('UserId param not sent with request');
    res.sendStatus(400);
    return;
  }

  const isChat = await Chat.find({
    $and: [{ users: { $elemMatch: { $eq: user._id } } }, { users: { $elemMatch: { $eq: userId } } }],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  const populatedChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name pic email',
  });

  if (populatedChat.length > 0) {
    res.send(populatedChat[0]);
  } else {
    const chatData = {
      users: [user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to create chat');
    }
  }
});

const fetchChats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: user._id } } })
      .populate('users', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: 'latestMessage.sender',
      select: 'name pic email',
    });
    res.status(200).send(populatedResults);
  } catch (error) {
    res.status(400);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch chats');
  }
});

export { accessChat, fetchChats };
