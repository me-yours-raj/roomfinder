const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const mailer = require("../utils/mailer");
const {
  setAuthCookie,
  clearAuthCookie,
  publicUser
} = require("../middleware/auth");
const {
  trim,
  isEmail,
  isPhone,
  isStrongPassword,
  isName,
  validationError
} = require("../utils/validators");

function generateNumericOtp(digits = 6) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits);
  return crypto.randomInt(min, max).toString();
}

function hashToken(val) {
  return crypto.createHash("sha256").update(String(val)).digest("hex");
}

async function register(req, res, next) {
  try {
    const name = trim(req.body.name);
    const email = trim(req.body.email).toLowerCase();
    const password = req.body.password;
    const phone = String(req.body.phone || "").replace(/\s+/g, "");
    const requestedRole = trim(req.body.role);

    const details = [];
    if (!isName(name)) {
      details.push("Enter a valid name (letters only, 2–60 characters).");
    }
    if (!isEmail(email)) {
      details.push("Enter a valid email address.");
    }
    if (!isStrongPassword(password)) {
      details.push("Password must be 8–72 characters.");
    }
    if (phone && !isPhone(phone)) {
      details.push("Enter a valid 10-digit Indian mobile number, or leave it blank.");
    }
    if (details.length) {
      throw validationError("Please correct the highlighted fields.", details);
    }

    // Role check: prevent admin escalation
    const role = ["owner", "student"].includes(requestedRole) ? requestedRole : "pending";

    // Verification Service Configuration Guardrail
    if (!mailer.isConfigured()) {
      return res.status(503).json({
        message:
          "Email verification service is currently unavailable. Please try again later or contact support."
      });
    }

    const existing = await User.findOne({ email });
    const otp = generateNumericOtp(6);
    const hashedOtp = hashToken(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existing) {
      if (existing.isVerified !== false) {
        return res.status(409).json({ message: "An account with this email already exists. Please log in." });
      }

      // Re-registering unverified account: update credentials and send fresh OTP
      existing.name = name;
      existing.passwordHash = await bcrypt.hash(password, 12);
      existing.phone = phone || undefined;
      existing.role = role;
      existing.emailOtp = hashedOtp;
      existing.emailOtpExpires = otpExpiry;
      await existing.save();

      const mailResult = await mailer.sendRegistrationOtpEmail({
        to: existing.email,
        name: existing.name,
        otp,
        expiresInMinutes: 10
      });

      if (!mailResult.sent) {
        return res.status(500).json({
          message: "Failed to send verification email. Please check your email settings."
        });
      }

      return res.status(200).json({
        message: "A 6-digit verification code has been sent to your email address.",
        requireOtp: true,
        email: existing.email
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      phone: phone || undefined,
      role,
      isVerified: false,
      emailOtp: hashedOtp,
      emailOtpExpires: otpExpiry
    });

    const mailResult = await mailer.sendRegistrationOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      expiresInMinutes: 10
    });

    if (!mailResult.sent) {
      return res.status(500).json({
        message: "Failed to send verification email. Please check your email settings."
      });
    }

    return res.status(201).json({
      message: "Registration successful! A 6-digit verification code has been sent to your email address.",
      requireOtp: true,
      email: user.email
    });
  } catch (error) {
    return next(error);
  }
}

async function verifyRegistrationOtp(req, res, next) {
  try {
    const email = trim(req.body.email).toLowerCase();
    const otp = String(req.body.otp || "").replace(/\s+/g, "");

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and 6-digit verification code are required." });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Please enter a valid 6-digit numeric verification code." });
    }

    const hashedOtp = hashToken(otp);

    const user = await User.findOne({
      email,
      emailOtp: hashedOtp,
      emailOtpExpires: { $gt: new Date() }
    }).select("+emailOtp +emailOtpExpires");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification code. Please check your code or request a new one."
      });
    }

    user.isVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save();

    // Send welcome email asynchronously
    mailer.sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) => {
      console.error("[Auth] Welcome email send error:", err.message);
    });

    setAuthCookie(res, user);
    return res.json({
      message: "Email verified successfully! Welcome to Room Finder.",
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function resendRegistrationOtp(req, res, next) {
  try {
    const email = trim(req.body.email).toLowerCase();
    if (!isEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (!mailer.isConfigured()) {
      return res.status(503).json({
        message: "Email verification service is currently unavailable."
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If this account is awaiting verification, a new code has been sent." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "This account is already verified. Please log in." });
    }

    const otp = generateNumericOtp(6);
    user.emailOtp = hashToken(otp);
    user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const mailResult = await mailer.sendRegistrationOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      expiresInMinutes: 10
    });

    if (!mailResult.sent) {
      return res.status(500).json({ message: "Failed to resend verification email." });
    }

    return res.json({ message: "A new 6-digit verification code has been sent to your email." });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = trim(req.body.email).toLowerCase();
    const password = req.body.password;
    if (!isEmail(email) || !password) {
      return res.status(400).json({ message: "Enter your email and password." });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated. Contact an administrator." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.isVerified === false) {
      if (!mailer.isConfigured()) {
        return res.status(403).json({
          message: "Your email address is not verified. Please contact support to activate your account."
        });
      }

      const otp = generateNumericOtp(6);
      user.emailOtp = hashToken(otp);
      user.emailOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      await mailer.sendRegistrationOtpEmail({
        to: user.email,
        name: user.name,
        otp,
        expiresInMinutes: 10
      });

      return res.status(403).json({
        message: "Your email address is not verified. A 6-digit verification code has been sent to your email.",
        requireOtp: true,
        email: user.email
      });
    }

    setAuthCookie(res, user);
    return res.json({ message: "Logged in successfully.", user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: "You have been logged out." });
}

async function me(req, res) {
  return res.json({ user: publicUser(req.user) });
}

async function selectRole(req, res, next) {
  try {
    const role = trim(req.body.role);
    if (!["student", "owner"].includes(role)) {
      return res.status(400).json({ message: "Choose Student/User or Property Owner." });
    }
    if (req.user.role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot change role." });
    }

    req.user.role = role;
    await req.user.save();
    setAuthCookie(res, req.user);
    return res.json({
      message: role === "owner" ? "Role updated to Property Owner." : "Role updated to Student / Tenant.",
      user: publicUser(req.user)
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    if (!["student", "owner"].includes(req.user.role)) {
      return res.status(403).json({ message: "This profile cannot be updated here." });
    }
    const name = trim(req.body.name);
    const phone = String(req.body.phone || "").replace(/\s+/g, "");
    const details = [];
    if (!isName(name)) {
      details.push("Enter a valid name (letters only, 2–60 characters).");
    }
    if (phone && !isPhone(phone)) {
      details.push("Enter a valid 10-digit Indian mobile number, or leave it blank.");
    }
    if (details.length) {
      throw validationError("Please correct the highlighted fields.", details);
    }
    req.user.name = name;
    req.user.phone = phone || undefined;
    await req.user.save();
    return res.json({ message: "Profile updated successfully.", user: publicUser(req.user) });
  } catch (error) {
    return next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const email = trim(req.body.email).toLowerCase();
    if (!isEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    if (!mailer.isConfigured()) {
      return res.status(503).json({
        message: "Password reset service is currently unavailable. Please try again later or contact support."
      });
    }

    const genericSuccessMsg =
      "If an account exists with this email, a 6-digit password reset code has been sent. Please check your inbox and spam folder.";

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: genericSuccessMsg, email });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated. Contact an administrator." });
    }

    const otp = generateNumericOtp(6);
    user.resetPasswordOtp = hashToken(otp);
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const mailResult = await mailer.sendPasswordResetOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      expiresInMinutes: 10
    });

    if (!mailResult.sent) {
      return res.status(500).json({ message: "Failed to send password reset email. Please try again later." });
    }

    return res.json({
      message: "A 6-digit password reset code has been sent to your email address.",
      requireOtp: true,
      email: user.email
    });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const email = trim(req.body.email).toLowerCase();
    const otp = String(req.body.otp || "").replace(/\s+/g, "");
    const password = req.body.password;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, 6-digit code, and new password are required." });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Please enter a valid 6-digit numeric verification code." });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: "Password must be 8–72 characters." });
    }

    const hashedOtp = hashToken(otp);

    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordExpires: { $gt: new Date() }
    }).select("+passwordHash +resetPasswordOtp +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset code. Please check your code or request a new one."
      });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    if (user.isVerified === false) {
      user.isVerified = true;
    }
    await user.save();

    mailer.sendPasswordChangedEmail({ to: user.email, name: user.name }).catch((err) => {
      console.error("[Auth] Password changed notification error:", err.message);
    });

    return res.json({
      message: "Your password has been reset successfully! You can now log in with your new password."
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  logout,
  me,
  selectRole,
  updateProfile,
  forgotPassword,
  resetPassword
};
