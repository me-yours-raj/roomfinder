const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { config } = require("../config/env");

const uploadDir = path.join(__dirname, "..", "..", "uploads", "properties");
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Check if Cloudinary credentials are provided in .env
const isCloudinaryActive = Boolean(
  config.cloudinary &&
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
);

let storage;

if (isCloudinaryActive) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "room-finder/properties",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1280, height: 850, crop: "limit", quality: "auto" }]
    }
  });
} else {
  // Local disk storage fallback for local development & testing
  storage = multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, uploadDir);
    },
    filename(_req, file, cb) {
      const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
    }
  });
}

function fileFilter(_req, file, cb) {
  if (!ALLOWED_TYPES[file.mimetype]) {
    const error = new Error("Only JPG, PNG, and WEBP images are allowed.");
    error.status = 400;
    return cb(error);
  }
  return cb(null, true);
}

const uploadPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 4 }
}).array("photos", 4);

function handleUpload(req, res, next) {
  uploadPhotos(req, res, (error) => {
    if (!error) {
      return next();
    }
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "You can upload a maximum of 4 photos." });
      }
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Each photo must be 2 MB or smaller." });
      }
      return res.status(400).json({ message: "The photo upload was not accepted." });
    }
    return res.status(error.status || 400).json({ message: error.message });
  });
}

function publicPhotoPath(fileOrFilename) {
  if (!fileOrFilename) return "";
  if (typeof fileOrFilename === "object") {
    // Cloudinary provides the full secure HTTPS URL in file.path
    if (fileOrFilename.path && fileOrFilename.path.startsWith("http")) {
      return fileOrFilename.path;
    }
    return `/uploads/properties/${fileOrFilename.filename}`;
  }
  if (typeof fileOrFilename === "string") {
    if (fileOrFilename.startsWith("http") || fileOrFilename.startsWith("/")) {
      return fileOrFilename;
    }
    return `/uploads/properties/${fileOrFilename}`;
  }
  return String(fileOrFilename);
}

function deletePhotoFiles(photoPaths) {
  (photoPaths || []).forEach((photoPath) => {
    if (!photoPath) return;

    // Cloudinary cloud photo cleanup
    if (photoPath.startsWith("http") && photoPath.includes("cloudinary.com") && isCloudinaryActive) {
      try {
        const parts = photoPath.split("/");
        const uploadIdx = parts.indexOf("upload");
        if (uploadIdx !== -1) {
          const publicIdWithExt = parts.slice(uploadIdx + 2).join("/");
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
          cloudinary.uploader.destroy(publicId, () => {});
        }
      } catch (_e) {}
      return;
    }

    // Local disk cleanup
    if (photoPath.startsWith("/uploads/properties/")) {
      const filename = path.basename(photoPath);
      const fullPath = path.join(uploadDir, filename);
      fs.unlink(fullPath, () => {});
    }
  });
}

module.exports = {
  handleUpload,
  publicPhotoPath,
  deletePhotoFiles,
  MAX_FILE_SIZE,
  isCloudinaryActive
};
