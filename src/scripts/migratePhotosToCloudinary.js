const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { config } = require("../config/env");
const { connectDatabase } = require("../config/db");
const Property = require("../models/Property");

async function migrate() {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    console.error("Cloudinary credentials are not configured in .env.");
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
  });

  const uploadDir = path.join(__dirname, "..", "..", "uploads", "properties");
  if (!fs.existsSync(uploadDir)) {
    console.error("Upload directory does not exist:", uploadDir);
    process.exit(1);
  }

  const files = fs.readdirSync(uploadDir).filter((f) => !f.startsWith(".") && (f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".webp")));
  console.log(`Found ${files.length} photos on disk to migrate.`);

  const urlMap = {};

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(uploadDir, file);
    const baseName = path.parse(file).name;
    const localRelPath = `/uploads/properties/${file}`;

    console.log(`[${i + 1}/${files.length}] Uploading ${file} to Cloudinary...`);
    try {
      const result = await cloudinary.uploader.upload(fullPath, {
        folder: "room-finder/properties",
        public_id: baseName,
        overwrite: true,
        resource_type: "image"
      });
      urlMap[localRelPath] = result.secure_url;
      console.log(`  -> Uploaded: ${result.secure_url}`);
    } catch (uploadErr) {
      console.error(`  -> Failed to upload ${file}:`, uploadErr.message);
    }
  }

  console.log("\nConnecting to MongoDB to update listings...");
  await connectDatabase();

  const properties = await Property.find({
    photos: { $regex: "^/uploads/properties/" }
  });

  console.log(`Found ${properties.length} properties referencing local photos in MongoDB.`);

  let updatedCount = 0;

  for (const prop of properties) {
    let changed = false;
    const updatedPhotos = prop.photos.map((photo) => {
      if (urlMap[photo]) {
        changed = true;
        return urlMap[photo];
      }
      return photo;
    });

    if (changed) {
      prop.photos = updatedPhotos;
      await prop.save();
      updatedCount++;
      console.log(`Updated Property: "${prop.title}" with new Cloudinary URL(s).`);
    }
  }

  console.log(`\n==============================================`);
  console.log(`Migration Complete!`);
  console.log(`Total photos uploaded to Cloudinary: ${Object.keys(urlMap).length}`);
  console.log(`Total MongoDB documents updated: ${updatedCount}`);
  console.log(`==============================================`);

  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
