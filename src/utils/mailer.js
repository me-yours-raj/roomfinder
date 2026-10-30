const nodemailer = require("nodemailer");
const { config } = require("../config/env");

let transporter = null;

function isConfigured() {
  return Boolean(config.smtp.user && config.smtp.pass);
}

function getTransporter() {
  if (!transporter) {
    if (!isConfigured()) {
      return null;
    }

    const transportOptions =
      config.smtp.service === "gmail"
        ? {
            service: "gmail",
            auth: {
              user: config.smtp.user,
              pass: config.smtp.pass
            }
          }
        : {
            host: config.smtp.host || "smtp.gmail.com",
            port: config.smtp.port || 465,
            secure: config.smtp.secure,
            auth: {
              user: config.smtp.user,
              pass: config.smtp.pass
            }
          };

    transporter = nodemailer.createTransport(transportOptions);
  }
  return transporter;
}

function getSenderAddress() {
  if (config.smtp.from && config.smtp.from.trim()) {
    return config.smtp.from.trim();
  }
  if (config.smtp.user) {
    return `"Room Finder Bihar" <${config.smtp.user}>`;
  }
  return '"Room Finder Bihar" <noreply@roomfinder.bihar>';
}

/**
 * Sends an email using Nodemailer.
 * NOTE: As per project security standards, OTP codes and passwords are NEVER logged to console.
 */
async function sendMail({ to, subject, text, html }) {
  const mailClient = getTransporter();

  if (!mailClient) {
    console.warn(`[Mailer] SMTP is not configured. Email to "${to}" cannot be dispatched.`);
    return { sent: false, error: "SMTP is not configured on the server." };
  }

  try {
    const info = await mailClient.sendMail({
      from: getSenderAddress(),
      to,
      subject,
      text,
      html
    });
    console.log(`[Mailer] Email delivered to ${to} (Message ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${to}:`, error.message);
    return { sent: false, error: error.message };
  }
}

/**
 * Send 6-digit OTP for Registration email verification
 */
async function sendRegistrationOtpEmail({ to, name, otp, expiresInMinutes = 10 }) {
  const displayName = name ? name.trim() : "there";
  const subject = `Your Room Finder Verification Code: ${otp}`;

  const text = `Hello ${displayName},

Thank you for registering on Room Finder Bihar!

Your 6-digit email verification code is: ${otp}

This code will expire in ${expiresInMinutes} minutes.

If you did not request this verification code, please ignore this email.

— Room Finder Bihar Team
https://roomfinder.bihar`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Room Finder Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f8; margin: 0; padding: 24px; color: #1c2b32;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #d5e0e4; overflow: hidden; box-shadow: 0 4px 12px rgba(15,36,42,0.06);">
    <div style="background: linear-gradient(135deg, #0f5c65, #0a434a); padding: 24px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Room Finder Bihar</h1>
      <p style="color: #d7e6e8; margin: 6px 0 0; font-size: 13px;">Find a Room That Feels Like Home</p>
    </div>
    <div style="padding: 30px 30px 24px;">
      <p style="font-size: 16px; margin: 0 0 16px;">Hello <strong>${displayName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
        Thank you for joining Room Finder. Please enter the following 6-digit verification code to verify your email address and activate your account:
      </p>
      <div style="text-align: center; margin: 28px 0; background: #f0fdfa; border: 2px dashed #0f5c65; border-radius: 10px; padding: 18px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f5c65; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 16px; text-align: center;">
        ⏱️ This code will expire in <strong>${expiresInMinutes} minutes</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
        If you did not initiate this registration request, please disregard this email. Your email will not be used without verification.
      </p>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
      &copy; 2026 Room Finder &bull; Rental Accommodation Platform &bull; Bihar, India
    </div>
  </div>
</body>
</html>`;

  return sendMail({ to, subject, text, html });
}

/**
 * Send 6-digit OTP for Password Reset
 */
async function sendPasswordResetOtpEmail({ to, name, otp, expiresInMinutes = 10 }) {
  const displayName = name ? name.trim() : "there";
  const subject = `Room Finder Password Reset Code: ${otp}`;

  const text = `Hello ${displayName},

We received a request to reset your Room Finder Bihar account password.

Your 6-digit password reset code is: ${otp}

This code is valid for ${expiresInMinutes} minutes.

If you did not request a password reset, please ignore this email. Your password will remain unchanged.

— Room Finder Bihar Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Room Finder Password Reset Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f8; margin: 0; padding: 24px; color: #1c2b32;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #d5e0e4; overflow: hidden; box-shadow: 0 4px 12px rgba(15,36,42,0.06);">
    <div style="background: linear-gradient(135deg, #0f5c65, #0a434a); padding: 24px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Room Finder Bihar</h1>
      <p style="color: #d7e6e8; margin: 6px 0 0; font-size: 13px;">Account Security Notification</p>
    </div>
    <div style="padding: 30px 30px 24px;">
      <p style="font-size: 16px; margin: 0 0 16px;">Hello <strong>${displayName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px;">
        We received a request to reset the password for your Room Finder account. Use the 6-digit code below to proceed with setting a new password:
      </p>
      <div style="text-align: center; margin: 28px 0; background: #fff7ed; border: 2px dashed #c2410c; border-radius: 10px; padding: 18px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #c2410c; font-family: monospace;">${otp}</span>
      </div>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 16px; text-align: center;">
        ⏱️ This code will expire in <strong>${expiresInMinutes} minutes</strong>.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
        If you did not request this password reset, please ensure your account is secure. No changes have been made to your credentials.
      </p>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
      &copy; 2026 Room Finder &bull; Rental Accommodation Platform &bull; Bihar, India
    </div>
  </div>
</body>
</html>`;

  return sendMail({ to, subject, text, html });
}

/**
 * Send Welcome notification email
 */
async function sendWelcomeEmail({ to, name }) {
  const displayName = name ? name.trim() : "there";
  const subject = "Welcome to Room Finder Bihar!";
  const text = `Hello ${displayName},\n\nYour email address has been successfully verified! Welcome to Room Finder.\n\nYou can now browse listings, save your preferences, and contact verified owners.\n\n— Room Finder Bihar Team`;
  const html = `
<div style="font-family: sans-serif; padding: 20px; color: #1c2b32;">
  <h2 style="color: #0f5c65;">Welcome to Room Finder Bihar!</h2>
  <p>Hello <strong>${displayName}</strong>,</p>
  <p>Your email has been verified successfully. Welcome to the community!</p>
  <p>Best regards,<br><strong>Room Finder Team</strong></p>
</div>`;

  return sendMail({ to, subject, text, html });
}

/**
 * Send Password Changed confirmation
 */
async function sendPasswordChangedEmail({ to, name }) {
  const displayName = name ? name.trim() : "there";
  const subject = "Your Room Finder Password Was Successfully Changed";
  const text = `Hello ${displayName},\n\nYour password for Room Finder Bihar was recently changed.\n\nIf you did not make this change, please contact administrator support immediately.\n\n— Room Finder Bihar Team`;
  const html = `
<div style="font-family: sans-serif; padding: 20px; color: #1c2b32;">
  <h3 style="color: #0f5c65;">Password Changed</h3>
  <p>Hello <strong>${displayName}</strong>,</p>
  <p>This is a confirmation that your account password has been updated successfully.</p>
</div>`;

  return sendMail({ to, subject, text, html });
}

module.exports = {
  isConfigured,
  sendMail,
  sendRegistrationOtpEmail,
  sendPasswordResetOtpEmail,
  sendWelcomeEmail,
  sendPasswordChangedEmail
};
