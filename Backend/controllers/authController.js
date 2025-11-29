const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { findOrgByDomain, createOrgFromDomain } = require("../services/orgServices");

const JWT_SECRET = process.env.JWT_SECRET;

const getDomainFromEmail = (email) => email.split("@")[1]?.toLowerCase();

const signToken = (user) =>
  jwt.sign(
    {
      userId: user._id,
      role: user.role,
      orgId: user.orgId,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );


const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const domain = getDomainFromEmail(email);
    if (!domain) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    // look for organization
    let org = await findOrgByDomain(domain);
    let role = "EMPLOYEE";

    if (!org) {
      org = await createOrgFromDomain(domain);
      role = "ADMIN";
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
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

const googleSignIn = async (req, res, next) => {
  try {
    const { email, googleId, name } = req.body; // frontend sends these

    if (!email || !googleId) {
      return res.status(400).json({ message: "Missing Google data" });
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
        return res.status(400).json({ message: "Invalid email" });
      }

      let org = await findOrgByDomain(domain);
      let role = "EMPLOYEE";

      if (!org) {
        org = await createOrgFromDomain(domain);
        role = "ADMIN";
      }

      user = await User.create({
        name: name || email.split("@")[0],
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
      return res.status(400).json({ message: "Password too short" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password set successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, googleSignIn, setPassword };