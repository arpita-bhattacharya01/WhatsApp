import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import forge from 'node-forge';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'amank87025@gmail.com',
    pass: process.env.EMAIL_PASS || 'fovg kwhv tdsx aeom',
  },
});

const otpStore = {};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const encryptedPrivateKey = forge.pki.encryptRsaPrivateKey(privateKey, password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      publicKey: forge.pki.publicKeyToPem(publicKey),
      privateKeyEncrypted: encryptedPrivateKey,
    });

    res.status(201).json({ message: 'Signup successful', userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const checkEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const isMatch = await User.findOne({ where: { email } });
    if (isMatch) {
      return res.status(400).json({ exists: true, message: "Email is already registered. Please login." });
    } else {
      return res.status(200).json({ exists: false, message: 'Email is available' });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    return res.status(500).json({ message: "Something went wrong while checking the email." });
  }
};

export const checkEmailExist = async (req, res) => {
  const { email } = req.body;

  try {
    const isMatch = await User.findOne({ where: { email } });
    if (!isMatch) {
      return res.status(400).json({ exists: false, message: "Email is not registered. Please sign up." });
    } else {
      return res.status(200).json({ exists: true, message: "Email exists." });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    return res.status(500).json({ message: "Something went wrong while checking the email." });
  }
};

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: "Invalid Email Address" });
  }
  
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expireAt = Date.now() + 5 * 60 * 1000;
  otpStore[email] = { otp, expireAt, varified: false };

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'amank87025@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });
    return res.status(200).json({ message: "Otp is send to Email " });
  } catch (error) {
    return res.status(500).json({ message: "failed to sent otp", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  
  if (!record) {
    return res.status(400).json({ message: "No OTP found for this email " });
  }
  if (Date.now() > record.expireAt) {
    return res.status(400).json({ message: "OTP Expired" });
  }
  if (record.otp != otp.toString()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  
  otpStore[email].varified = true;
  return res.status(200).json({ message: 'OTP Varified Successfully' });
};

export const updatePassword = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    await User.update(
      { password: hashedPassword },
      { where: { email } }
    );
    return res.status(200).json({ message: "Password Updated Successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Error in updating password" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getPublicKey = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ publicKey: user.publicKey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch public key" });
  }
};

export const getPrivateKey = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ encryptedPrivateKey: user.privateKeyEncrypted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch private key" });
  }
}; 