const express = require("express");
const adminController = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { adminLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/login", adminLimiter, adminController.login);
router.get("/stats", requireAuth, requireRole("admin"), adminController.dashboard);
router.get("/users", requireAuth, requireRole("admin"), adminController.listUsers);
router.patch("/users/:id/active", requireAuth, requireRole("admin"), adminController.setUserActive);
router.get("/listings", requireAuth, requireRole("admin"), adminController.listListings);
router.post("/listings/:id/remove", requireAuth, requireRole("admin"), adminController.removeListing);
router.post("/listings/:id/restore", requireAuth, requireRole("admin"), adminController.restoreListing);
router.delete("/listings/:id", requireAuth, requireRole("admin"), adminController.destroyListing);

module.exports = router;
