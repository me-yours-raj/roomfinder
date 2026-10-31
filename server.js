const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { config, assertRuntimeConfig } = require("./src/config/env");
const { connectDatabase } = require("./src/config/db");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");
const authRoutes = require("./src/routes/auth");
const propertyRoutes = require("./src/routes/properties");
const adminRoutes = require("./src/routes/admin");
const metaRoutes = require("./src/routes/meta");

const app = express();

// Enable trust proxy for cloud platforms (Render, Vercel, Heroku) behind reverse proxies
app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'"],
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "https://tile.openstreetmap.org",
          "https://*.tile.openstreetmap.org",
          "https://images.unsplash.com",
          "https://res.cloudinary.com"
        ],
        "style-src": ["'self'", "'unsafe-inline'"],
        "connect-src": ["'self'"]
      }
    },
    // OpenStreetMap Tile Usage Policy requires browsers to send a valid HTTP Referer header.
    // strict-origin-when-cross-origin sends the origin to tile.openstreetmap.org without leaking full URLs.
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  })
);
app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true, limit: "200kb" }));
app.use(cookieParser());

// Unified login redirect: forward admin-login directly to main login
app.get("/admin-login.html", (_req, res) => {
  res.redirect(301, "/login.html");
});

// Static file routing
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Route aliases for convenience and compatibility
app.get("/room-details.html", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "listing.html"));
});
app.get("/rooms.html", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "listings.html"));
});
app.get("/privacy.html", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "privacy-policy.html"));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meta", metaRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

async function start() {
  const problems = assertRuntimeConfig();
  if (problems.length) {
    console.error("Configuration error:\n" + problems.join("\n"));
    process.exit(1);
  }
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`Room Finder running at http://localhost:${config.port}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Could not start server:", error.message);
    process.exit(1);
  });
}

module.exports = { app, start };
