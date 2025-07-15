
import asyncHandler from 'express-async-handler';
import User, { IUser } from '../models/userModel';
import generateToken from '../utils/generateToken';
import cloudinary from '../config/cloudinary';
import sharp from 'sharp';
import { Buffer } from 'buffer';
import { Request, Response } from 'express';

const uploadToCloudinary = (buffer: Buffer): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'chat-app-profiles' },
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
        throw new Error("Please enter all the fields");
    }

    if (password.length < 8) {
        res.status(400);
        throw new Error("Password must be at least 8 characters long");
    }

    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) {
        res.status(400);
        throw new Error("User with this email already exists");
    }

    const userExistsByName = await User.findOne({ name });
    if (userExistsByName) {
        res.status(400);
        throw new Error("Username is already taken");
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
            // Proceed without a picture if upload fails but inform the user
        }
    }

    const user = await User.create({
        name,
        email,
        password,
        pic: picUrl,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken((user._id as any).toString()),
        });
    } else {
        res.status(400);
        throw new Error("Failed to create the user");
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
            token: generateToken((user._id as any).toString()),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

const allUsers = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUser;
    if (!user) {
        res.status(401);
        throw new Error("Not authorized");
    }
    const query: any = { _id: { $ne: user._id } };
    const searchKeyword = req.query.search as string;

    if (searchKeyword && searchKeyword.trim() !== '') {
        query.$or = [
            { name: { $regex: searchKeyword, $options: "i" } },
            { email: { $regex: searchKeyword, $options: "i" } },
        ];
    }
    
    const users = await User.find(query);
    res.send(users);
});

const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as IUser;
    if (!user) {
        res.status(401);
        throw new Error("Not authorized");
    }
    const userToUpdate = await User.findById(user._id);

    if (!userToUpdate) {
        res.status(404);
        throw new Error("User not found");
    }
    
    if ((req as any).file) {
        try {
            const processedBuffer = await sharp((req as any).file.buffer)
                .resize(200, 200, { fit: 'cover' })
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toBuffer();
            
            const result = await uploadToCloudinary(processedBuffer);
            userToUpdate.pic = result.secure_url;
        } catch (error: any) {
            res.status(500);
            throw new Error("Image upload failed, please try again.");
        }
    }
    
    const updatedUser = await userToUpdate.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        pic: updatedUser.pic,
    });
});

export { registerUser, authUser, allUsers, updateUserProfile };
