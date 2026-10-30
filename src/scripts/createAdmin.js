/**
 * Creates or updates the first administrator from .env values.
 * Usage: npm run create-admin
 */
const bcrypt = require("bcryptjs");
const { config, assertRuntimeConfig } = require("../config/env");
const { connectDatabase } = require("../config/db");
const User = require("../models/User");

async function run() {
  const problems = assertRuntimeConfig();
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  if (!config.admin.email || !config.admin.password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.");
    process.exit(1);
  }
  if (config.admin.password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connectDatabase();
  const email = config.admin.email.toLowerCase();
  const passwordHash = await bcrypt.hash(config.admin.password, 12);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.name = config.admin.name;
    existing.passwordHash = passwordHash;
    existing.role = "admin";
    existing.isActive = true;
    existing.isVerified = true;
    await existing.save();
    console.log(`Updated administrator account for ${email}`);
  } else {
    await User.create({
      name: config.admin.name,
      email,
      passwordHash,
      role: "admin",
      isActive: true,
      isVerified: true
    });
    console.log(`Created administrator account for ${email}`);
  }

  process.exit(0);
}

run().catch((error) => {
  console.error("Could not create admin:", error.message);
  process.exit(1);
});
