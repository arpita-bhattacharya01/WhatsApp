import express from 'express';
import {
  signup,
  login,
  checkEmail,
  checkEmailExist,
  sendOtp,
  verifyOtp,
  updatePassword,
  getUsers,
  getPublicKey,
  getPrivateKey
} from '../controllers/authController.js';
import { getChatData } from '../controllers/messageController.js';

const router = express.Router();

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/check-email', checkEmail);
router.post('/check-email-exist', checkEmailExist);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/update-password', updatePassword);

// User routes
router.get('/users', getUsers);
router.get('/user/:id/public-key', getPublicKey);
router.get('/user/:id/private-key', getPrivateKey);

// Message routes
router.get('/get-chat-data/:roomId', getChatData);

//EMI routes 


export default router;
