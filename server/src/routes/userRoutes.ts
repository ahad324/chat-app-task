import express from 'express';
import { registerUser, authUser, allUsers } from '../controllers/userControllers';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.route('/').post(upload.single('pic'), registerUser).get(protect, allUsers);
router.post('/login', authUser);

export default router;