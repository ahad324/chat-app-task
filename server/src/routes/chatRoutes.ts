import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { accessChat, fetchChats } from '../controllers/chatControllers';

const router = express.Router();

router.route('/').post(protect, accessChat);
router.route('/').get(protect, fetchChats);

export default router;
