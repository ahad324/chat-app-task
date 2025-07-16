import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { sendMessage, allMessages, updateMessage, deleteMessage } from '../controllers/messageControllers';

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);
router.route('/:messageId').put(protect, updateMessage).delete(protect, deleteMessage);

export default router;
