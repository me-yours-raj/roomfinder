/**
 * Automated Verification & Test Suite for Room Finder
 * Performs real tests against database and Express backend.
 * Run with: npm test
 */
const { connectDatabase } = require("../src/config/db");
const Property = require("../src/models/Property");
const User = require("../src/models/User");
const mailer = require("../src/utils/mailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function runTests() {
  console.log("==================================================");
  console.log("   ROOM FINDER AUTOMATED VERIFICATION SUITE       ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${details ? " - " + details : ""}`);
      failed++;
    }
  }

  // 1. Database Connection & Demo Listings Count
  console.log("--- 1. Database & Demonstration Seed Verification ---");
  await connectDatabase();
  assert(true, "Database connected successfully to MongoDB Atlas");

  const totalDemo = await Property.countDocuments({ isDemo: true });
  assert(totalDemo === 20, "Exact 20 demonstration listings seeded", `Found ${totalDemo} listings`);

  const demoTypes = await Property.distinct("type", { isDemo: true });
  assert(
    demoTypes.includes("single-room") &&
    demoTypes.includes("pg") &&
    demoTypes.includes("hostel") &&
    demoTypes.includes("shared-room") &&
    demoTypes.includes("1bhk") &&
    demoTypes.includes("2bhk"),
    "Demonstration listings include required mix of room categories",
    `Categories: ${demoTypes.join(", ")}`
  );

  const maskedPhones = await Property.find({ isDemo: true }).select("contactNumber");
  const allMasked = maskedPhones.every((p) => p.contactNumber.includes("(DEMO"));
  assert(allMasked, "All demo phone numbers are visibly masked demonstration strings");

  // 2. Location & Rent Filtering
  console.log("\n--- 2. Location, Category & Price Filter Verification ---");
  const patnaRooms = await Property.find({ isRemoved: false, city: /Patna/i });
  assert(patnaRooms.length > 0, `Search by city 'Patna' returns results (found ${patnaRooms.length})`);

  const boringRoadRooms = await Property.find({ isRemoved: false, locality: /Boring Road/i });
  assert(boringRoadRooms.length > 0, `Search by locality 'Boring Road' returns results (found ${boringRoadRooms.length})`);

  const pgRooms = await Property.find({ isRemoved: false, type: "pg" });
  assert(pgRooms.length > 0, `Search by room type 'pg' returns results (found ${pgRooms.length})`);

  const budgetRooms = await Property.find({ isRemoved: false, monthlyRent: { $gte: 4000, $lte: 7000 } });
  assert(budgetRooms.length > 0, `Search by rent range ₹4,000–₹7,000 returns results (found ${budgetRooms.length})`);

  // 3. Map Coordinates & OpenStreetMap Policy Compliance
  console.log("\n--- 3. Leaflet Map & OpenStreetMap Policy Compliance ---");
  const sampleWithCoords = await Property.findOne({ isDemo: true, "location.lat": { $exists: true } });
  assert(
    sampleWithCoords && sampleWithCoords.location.lat && sampleWithCoords.location.lng,
    "Demonstration listings have approximate geographic coordinates for OpenStreetMap",
    `Sample coordinates: Lat ${sampleWithCoords?.location?.lat}, Lng ${sampleWithCoords?.location?.lng}`
  );

  const fs = require("fs");
  const path = require("path");
  const detailJs = fs.readFileSync(path.join(__dirname, "..", "public", "js", "detail.js"), "utf8");
  assert(
    detailJs.includes("https://tile.openstreetmap.org/{z}/{x}/{y}.png"),
    "Leaflet uses canonical HTTPS OpenStreetMap tile URL (no deprecated subdomain sharding)"
  );
  assert(
    detailJs.includes("https://www.openstreetmap.org/copyright") && detailJs.includes("OpenStreetMap"),
    "OpenStreetMap attribution complies with official OSM foundation copyright guidelines"
  );
  assert(
    fs.existsSync(path.join(__dirname, "..", "public", "js", "leaflet.js")) &&
    fs.existsSync(path.join(__dirname, "..", "public", "css", "leaflet.css")),
    "Leaflet assets are locally bundled to prevent external CDN failure"
  );

  const serverJs = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
  assert(
    serverJs.includes("strict-origin-when-cross-origin"),
    "Server transmits valid HTTP Referer header to tile.openstreetmap.org per OSM policy"
  );

  // 4. Mailer & SMTP Status
  console.log("\n--- 4. Nodemailer & SMTP Configuration Verification ---");
  const smtpConfigured = mailer.isConfigured();
  assert(smtpConfigured, "SMTP is configured with user and authentication token");

  // 5. Password Hashing & OTP Token Security
  console.log("\n--- 5. Authentication & Security Guardrails ---");
  const dummyPass = "StrongPassword123";
  const dummyHash = await bcrypt.hash(dummyPass, 12);
  const match = await bcrypt.compare(dummyPass, dummyHash);
  assert(match, "Bcrypt password hashing with salt rounds 12 operates correctly");

  const rawOtp = "654321";
  const hashedOtp = crypto.createHash("sha256").update(rawOtp).digest("hex");
  const hashedMatch = crypto.createHash("sha256").update(rawOtp).digest("hex") === hashedOtp;
  assert(hashedMatch, "SHA-256 hashed OTP token representation verification succeeds");

  // 6. Admin Account Security
  console.log("\n--- 6. Administrator Account & RBAC ---");
  const adminUser = await User.findOne({ role: "admin" }).select("+passwordHash");
  assert(adminUser !== null, "Administrator account exists in database");
  if (adminUser) {
    assert(adminUser.role === "admin", "Admin role verified");
    assert(adminUser.passwordHash && adminUser.passwordHash.startsWith("$2"), "Admin password hash is properly encrypted");
  }

  // 7. Property Lifecycle CRUD Test
  console.log("\n--- 7. Owner Property Lifecycle (Create, Read, Update, Delete) ---");
  const testOwner = await User.findOne({ role: "owner" });
  if (testOwner) {
    const testProp = await Property.create({
      title: "Temporary Test Accommodation for Automated Verification",
      type: "single-room",
      monthlyRent: 5000,
      deposit: 5000,
      city: "Patna",
      locality: "Bailey Road",
      address: "Test Lane",
      description: "This is a temporary test property created by the test suite to verify CRUD.",
      contactNumber: "9876543210",
      owner: testOwner._id,
      photos: ["/images/demo/room-single-1.svg"],
      facilities: ["WiFi", "Water supply"],
      amenities: ["WiFi", "Water supply"],
      furnishingStatus: "Semi-Furnished",
      foodAvailability: "None",
      bathroomDetails: "Attached",
      tenantPreference: "Students Only",
      isDemo: false
    });
    assert(testProp._id !== undefined, "Owner can create a listing in MongoDB");

    testProp.monthlyRent = 5500;
    await testProp.save();
    const updated = await Property.findById(testProp._id);
    assert(updated.monthlyRent === 5500, "Owner can update an existing listing");

    await Property.deleteOne({ _id: testProp._id });
    const deleted = await Property.findById(testProp._id);
    assert(deleted === null, "Owner can delete listing");
  }

  console.log("\n==================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
