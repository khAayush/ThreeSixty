const OAuth2Client = require('google-auth-library').OAuth2Client;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { findOrgByDomain, createOrgFromDomain } = require('../services/orgServices');

const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const getDomainFromEmail = (email) => email.split('@')[1]?.toLowerCase();

const signToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
      orgId: user.orgId,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const domain = getDomainFromEmail(email);
    if (!domain) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // look for organization
    let org = await findOrgByDomain(domain);
    let role = 'EMPLOYEE';

    if (!org) {
      org = await createOrgFromDomain(domain);
      role = 'ADMIN';
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      googleId: null,
      role,
      orgId: org._id,
    });

    const token = signToken(user);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        hasPassword: !!user.passwordHash,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'User not found, check your email address.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    const token = signToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        hasPassword: !!user.passwordHash,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

const googleSignIn = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'Missing idToken' });
    }

    // token verification
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || email.split('@')[0];

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      const domain = getDomainFromEmail(email);
      if (!domain) {
        return res.status(400).json({ message: 'Invalid email' });
      }

      let org = await findOrgByDomain(domain);
      let role = 'EMPLOYEE';

      if (!org) {
        org = await createOrgFromDomain(domain);
        role = 'ADMIN';
      }

      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        passwordHash: undefined,
        googleId,
        role,
        orgId: org._id,
      });
    }

    const token = signToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        hasPassword: !!user.passwordHash,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

const setPassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password too short' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password set successfully' });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '5m' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="http://localhost:3000/reset-password?token=${resetToken}&email=${user.email}">Reset Password</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ status: 'ok', message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
    console.error(error);
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      return res
        .status(400)
        .json({ error: 'New password cannot be the same as the old password.' });
    }
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { passwordHash: encryptedPassword });
    res.json({ status: 'ok', message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { register, login, googleSignIn, setPassword, forgotPassword, resetPassword };
