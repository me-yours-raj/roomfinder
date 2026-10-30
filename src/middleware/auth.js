const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { config } = require("../config/env");

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  };
}

function setAuthCookie(res, user) {
  res.cookie("rf_token", signToken(user), cookieOptions());
}

function clearAuthCookie(res) {
  res.clearCookie("rf_token", { ...cookieOptions(), maxAge: 0 });
}

async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies.rf_token;
    if (!token) {
      req.user = null;
      return next();
    }
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      req.user = null;
      return next();
    }
    req.user = user;
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
}

async function requireAuth(req, res, next) {
  await optionalAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ message: "Please log in to continue." });
    }
    return next();
  });
}

function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: "Please log in to continue." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do that." });
    }
    return next();
  };
}

function publicUser(user) {
  if (!user) {
    return null;
  }
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
}

module.exports = {
  setAuthCookie,
  clearAuthCookie,
  optionalAuth,
  requireAuth,
  requireRole,
  publicUser
};
