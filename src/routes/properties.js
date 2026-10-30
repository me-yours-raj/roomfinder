const express = require("express");
const propertyController = require("../controllers/propertyController");
const { requireAuth, requireRole, optionalAuth } = require("../middleware/auth");
const { handleUpload } = require("../middleware/upload");

const router = express.Router();

router.get("/", propertyController.listPublic);
router.get("/mine", requireAuth, requireRole("owner"), propertyController.listMine);
router.get("/:id", optionalAuth, propertyController.getPublic);
router.post("/", requireAuth, requireRole("owner"), handleUpload, propertyController.createListing);
router.put("/:id", requireAuth, requireRole("owner"), handleUpload, propertyController.updateListing);
router.delete("/:id", requireAuth, requireRole("owner"), propertyController.deleteListing);

module.exports = router;
