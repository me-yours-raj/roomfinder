const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Property = require("../models/Property");
const { setAuthCookie, publicUser } = require("../middleware/auth");
const { trim, isEmail } = require("../utils/validators");
const { deletePhotoFiles } = require("../middleware/upload");
const { toDetail } = require("./propertyController");

async function login(req, res, next) {
  try {
    const email = trim(req.body.email).toLowerCase();
    const password = req.body.password;
    if (!isEmail(email) || !password) {
      return res.status(400).json({ message: "Enter the administrator email and password." });
    }

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid administrator credentials." });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "This administrator account is deactivated." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid administrator credentials." });
    }

    setAuthCookie(res, user);
    return res.json({ message: "Administrator logged in.", user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function dashboard(req, res, next) {
  try {
    const [userCount, ownerCount, listingCount, removedCount] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({ role: "owner" }),
      Property.countDocuments({ isRemoved: false }),
      Property.countDocuments({ isRemoved: true })
    ]);
    return res.json({
      stats: { userCount, ownerCount, listingCount, removedCount }
    });
  } catch (error) {
    return next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 });
    return res.json({
      users: users.map((user) => publicUser(user))
    });
  } catch (error) {
    return next(error);
  }
}

async function setUserActive(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found." });
    }
    const isActive = Boolean(req.body.isActive);
    user.isActive = isActive;
    await user.save();
    return res.json({
      message: isActive ? "Account reactivated." : "Account deactivated.",
      user: publicUser(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function listListings(req, res, next) {
  try {
    const properties = await Property.find({}).populate("owner", "name email").sort({ createdAt: -1 });
    return res.json({
      properties: properties.map((property) => ({
        ...toDetail(property, { includeOwnerMeta: true }),
        ownerName: property.owner && property.owner.name,
        ownerEmail: property.owner && property.owner.email
      }))
    });
  } catch (error) {
    return next(error);
  }
}

async function removeListing(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Listing not found." });
    }
    property.isRemoved = true;
    property.removedReason = trim(req.body.reason) || "Removed by administrator";
    await property.save();
    return res.json({ message: "Listing removed from public view." });
  } catch (error) {
    return next(error);
  }
}

async function restoreListing(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Listing not found." });
    }
    property.isRemoved = false;
    property.removedReason = undefined;
    await property.save();
    return res.json({ message: "Listing restored." });
  } catch (error) {
    return next(error);
  }
}

async function destroyListing(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Listing not found." });
    }
    deletePhotoFiles(property.photos);
    await property.deleteOne();
    return res.json({ message: "Listing permanently deleted." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  dashboard,
  listUsers,
  setUserActive,
  listListings,
  removeListing,
  restoreListing,
  destroyListing
};
