const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { findOrgByDomain, createOrgFromDomain } = require("../services/orgService");

const JWT_SECRET = process.env.JWT_SECRET;

// seperate the domain from email
const getDomainFromEmail = (email) => email.split("@")[1]?.toLowerCase();

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const domain = getDomainFromEmail(email);
    if (!domain) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    // look for organization
    let org = await findOrgByDomain(domain);
    let role = "EMPLOYEE";

    if (!org) {
      // if first user of this domain, create new org
      org = await createOrgFromDomain(domain);
      role = "ADMIN";
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      orgId: org._id,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role, orgId: user.orgId },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

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

    const user = await User.findOne({ email }).populate("orgId");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.orgId.status !== "ACTIVE" && user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Organization not active yet" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, orgId: user.orgId._id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        org: {
          id: user.orgId._id,
          name: user.orgId.name,
          domain: user.orgId.domain,
          status: user.orgId.status,
        },
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
};
