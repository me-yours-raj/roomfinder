const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

function required(name, fallback) {
  const value = process.env[name];
  if (value && value.trim()) {
    return value.trim();
  }
  return fallback;
}

const config = {
  port: Number(required("PORT", "3000")),
  appUrl: required("APP_URL", `http://localhost:${Number(process.env.PORT || 3000)}`),
  mongodbUri: process.env.MONGODB_URI || "",
  jwtSecret: required("JWT_SECRET", ""),
  cookieSecure: String(process.env.COOKIE_SECURE || "false").toLowerCase() === "true",
  admin: {
    name: required("ADMIN_NAME", "Administrator"),
    email: required("ADMIN_EMAIL", ""),
    password: process.env.ADMIN_PASSWORD || ""
  },
  demoOwner: {
    email: required("DEMO_OWNER_EMAIL", "demo-owner@example.com"),
    password: process.env.DEMO_OWNER_PASSWORD || "DemoOwner123"
  },
  smtp: {
    service: process.env.SMTP_SERVICE || "gmail",
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true").toLowerCase() === "true",
    user: process.env.SMTP_USER || process.env.GMAIL_USER || "",
    pass: process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "",
    from: process.env.SMTP_FROM || ""
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || ""
  }
};

function assertRuntimeConfig() {
  const problems = [];
  if (!config.mongodbUri) {
    problems.push("MONGODB_URI is missing. Copy .env.example to .env and add your Atlas connection string.");
  }
  if (!config.jwtSecret || config.jwtSecret === "change-this-to-a-long-random-string") {
    problems.push("JWT_SECRET must be set to a unique random value in .env.");
  }
  return problems;
}

module.exports = { config, assertRuntimeConfig };
