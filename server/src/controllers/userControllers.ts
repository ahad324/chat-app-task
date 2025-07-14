

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel';
import generateToken from '../utils/generateToken';
import cloudinary from '../config/cloudinary';
import sharp from 'sharp';

const uploadToCloudinary = (buffer: Buffer): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'chat-app' },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });
};

const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Fields");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    let picUrl: string | undefined;

    if ((req as any).file) {
        try {
            const processedBuffer = await sharp((req as any).file.buffer)
                .resize(200, 200, { fit: 'cover' })
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toBuffer();
            
            const result = await uploadToCloudinary(processedBuffer);
            picUrl = result.secure_url;
        } catch (error: any) {
            console.error("Image upload failed:", error);
            // Proceed without a picture if upload fails
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        pic: picUrl, // If picUrl is undefined, schema default will apply
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id.toString()),
        });
    } else {
        res.status(400);
        throw new Error("Failed to Create the User");
    }
});

const authUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id.toString()),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

const allUsers = asyncHandler(async (req: Request, res: Response) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search as string, $options: "i" } },
            { email: { $regex: req.query.search as string, $options: "i" } },
        ]
    } : {};

    const users = await User.find(keyword).find({ _id: { $ne: (req as any).user._id } });
    res.send(users);
});


export { registerUser, authUser, allUsers };
