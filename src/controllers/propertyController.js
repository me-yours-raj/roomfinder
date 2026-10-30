const Property = require("../models/Property");
const {
  BIHAR_STATE,
  roomTypeLabel,
  FURNISHING_OPTIONS,
  FOOD_OPTIONS,
  BATHROOM_OPTIONS,
  TENANT_PREFERENCES
} = require("../utils/locations");
const {
  trim,
  isPhone,
  isEmail,
  parseRent,
  parseOptionalDeposit,
  isRoomType,
  parseCoordinate,
  normalizeFacilities,
  validationError
} = require("../utils/validators");
const { publicPhotoPath, deletePhotoFiles } = require("../middleware/upload");

function toCard(property) {
  const photo =
    property.photos && property.photos.length > 0
      ? property.photos[0]
      : "/images/demo/room-single-1.svg";

  return {
    id: property._id.toString(),
    title: property.title,
    type: property.type,
    typeLabel: roomTypeLabel(property.type),
    monthlyRent: property.monthlyRent,
    deposit: property.deposit || 0,
    city: property.city,
    locality: property.locality,
    state: property.state || BIHAR_STATE,
    photo,
    photos: property.photos || [photo],
    facilities: property.facilities || property.amenities || [],
    amenities: property.amenities || property.facilities || [],
    furnishingStatus: property.furnishingStatus || "Semi-Furnished",
    foodAvailability: property.foodAvailability || "None",
    bathroomDetails: property.bathroomDetails || "Attached",
    tenantPreference: property.tenantPreference || "Any / All",
    isDemo: Boolean(property.isDemo),
    location: property.location && property.location.lat ? property.location : null,
    createdAt: property.createdAt
  };
}

function toDetail(property, { includeOwnerMeta = false } = {}) {
  const photos =
    property.photos && property.photos.length > 0
      ? property.photos
      : ["/images/demo/room-single-1.svg"];

  const data = {
    id: property._id.toString(),
    title: property.title,
    type: property.type,
    typeLabel: roomTypeLabel(property.type),
    monthlyRent: property.monthlyRent,
    deposit: property.deposit || 0,
    state: property.state || BIHAR_STATE,
    city: property.city,
    locality: property.locality,
    address: property.address || "",
    location: property.location && property.location.lat ? property.location : null,
    description: property.description,
    facilities: property.facilities || property.amenities || [],
    amenities: property.amenities || property.facilities || [],
    furnishingStatus: property.furnishingStatus || "Semi-Furnished",
    foodAvailability: property.foodAvailability || "None",
    bathroomDetails: property.bathroomDetails || "Attached",
    availabilityDate: property.availabilityDate || property.createdAt,
    occupancy: property.occupancy || "",
    tenantPreference: property.tenantPreference || "Any / All",
    photos,
    contactNumber: property.contactNumber,
    contactEmail: property.contactEmail || "",
    ownerName: property.ownerName || "",
    isDemo: Boolean(property.isDemo),
    isPublished: property.isPublished !== false,
    createdAt: property.createdAt
  };

  if (includeOwnerMeta && property.owner) {
    data.ownerId = property.owner._id ? property.owner._id.toString() : property.owner.toString();
  }
  if (includeOwnerMeta) {
    data.isRemoved = Boolean(property.isRemoved);
    data.removedReason = property.removedReason || "";
  }
  return data;
}

function parseListingBody(body) {
  const title = trim(body.title);
  const type = trim(body.type);
  const monthlyRent = parseRent(body.monthlyRent);
  const deposit = parseOptionalDeposit(body.deposit);
  const city = trim(body.city);
  const locality = trim(body.locality);
  const address = trim(body.address);
  const description = trim(body.description);
  const occupancy = trim(body.occupancy);
  const contactNumber = String(body.contactNumber || "").replace(/\s+/g, "");
  const contactEmail = trim(body.contactEmail).toLowerCase();
  const ownerName = trim(body.ownerName);

  const furnishingStatus = FURNISHING_OPTIONS.includes(trim(body.furnishingStatus))
    ? trim(body.furnishingStatus)
    : "Semi-Furnished";

  const foodAvailability = FOOD_OPTIONS.includes(trim(body.foodAvailability))
    ? trim(body.foodAvailability)
    : "None";

  const bathroomDetails = BATHROOM_OPTIONS.includes(trim(body.bathroomDetails))
    ? trim(body.bathroomDetails)
    : "Attached";

  const tenantPreference = TENANT_PREFERENCES.includes(trim(body.tenantPreference))
    ? trim(body.tenantPreference)
    : "Any / All";

  const availabilityDate = body.availabilityDate ? new Date(body.availabilityDate) : new Date();

  const facilities = normalizeFacilities(body.facilities || body.amenities);

  const lat = parseCoordinate(body.lat || (body.location && body.location.lat), -90, 90);
  const lng = parseCoordinate(body.lng || (body.location && body.location.lng), -180, 180);

  const details = [];
  if (title.length < 5 || title.length > 140) {
    details.push("Title must be between 5 and 140 characters.");
  }
  if (!isRoomType(type)) {
    details.push("Please select a valid room type.");
  }
  if (monthlyRent === null) {
    details.push("Monthly rent must be between ₹500 and ₹5,00,000.");
  }
  if (deposit === null) {
    details.push("Security deposit must be ₹0 or greater, up to ₹10,00,000.");
  }
  if (city.length < 2 || city.length > 80) {
    details.push("City name is required (2–80 characters).");
  }
  if (locality.length < 2 || locality.length > 80) {
    details.push("Locality is required (2–80 characters).");
  }
  if (description && description.length > 3000) {
    details.push("Description must be 3,000 characters or fewer.");
  }
  if (!isPhone(contactNumber)) {
    details.push("Owner contact number must be a valid 10-digit Indian mobile number.");
  }
  if (contactEmail && !isEmail(contactEmail)) {
    details.push("Please enter a valid owner contact email, or leave it blank.");
  }
  if (address && address.length > 250) {
    details.push("Address must be 250 characters or fewer.");
  }
  if (occupancy && occupancy.length > 80) {
    details.push("Occupancy must be 80 characters or fewer.");
  }
  if (lat === null || lng === null) {
    details.push("Coordinates must be valid latitude (-90 to 90) and longitude (-180 to 180) numbers.");
  }

  if (details.length) {
    throw validationError("Please correct the form fields.", details);
  }

  const payload = {
    title,
    type,
    monthlyRent,
    deposit: deposit !== null ? deposit : 0,
    city,
    locality,
    address: address || undefined,
    description,
    occupancy: occupancy || undefined,
    contactNumber,
    contactEmail: contactEmail || undefined,
    ownerName: ownerName || undefined,
    furnishingStatus,
    foodAvailability,
    bathroomDetails,
    tenantPreference,
    availabilityDate: Number.isNaN(availabilityDate.getTime()) ? new Date() : availabilityDate,
    facilities,
    amenities: facilities,
    state: BIHAR_STATE
  };

  if (lat !== undefined && lng !== undefined) {
    payload.location = { lat, lng };
  }

  return payload;
}

function photoPathsFromFiles(files) {
  return (files || []).map((file) => publicPhotoPath(file));
}

async function listPublic(req, res, next) {
  try {
    const city = trim(req.query.city);
    const locality = trim(req.query.locality);
    const type = trim(req.query.type);
    const minRent = req.query.minRent ? Number(req.query.minRent) : null;
    const maxRent = req.query.maxRent ? Number(req.query.maxRent) : null;
    const sortBy = trim(req.query.sortBy || req.query.sort);
    const latest = String(req.query.latest || "") === "1";
    const featured = String(req.query.featured || "") === "1";

    const filter = { isRemoved: false };

    // Text search on city or locality
    const cityRe = city ? new RegExp(city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
    const localityRe = locality ? new RegExp(locality.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;

    if (cityRe && localityRe) {
      filter.city = cityRe;
      filter.locality = localityRe;
    } else if (cityRe) {
      filter.$or = [{ city: cityRe }, { locality: cityRe }];
    } else if (localityRe) {
      filter.locality = localityRe;
    }

    // Filter by Room Type
    if (type && isRoomType(type)) {
      filter.type = type;
    }

    // Filter by Rent range
    if (Number.isFinite(minRent) || Number.isFinite(maxRent)) {
      filter.monthlyRent = {};
      if (Number.isFinite(minRent) && minRent > 0) {
        filter.monthlyRent.$gte = minRent;
      }
      if (Number.isFinite(maxRent) && maxRent > 0) {
        filter.monthlyRent.$lte = maxRent;
      }
    }

    // Sort order: Real uploaded listings (isDemo: false) appear first, followed by demo listings
    let sortObj = { isDemo: 1, createdAt: -1 };
    if (sortBy === "rent_asc" || sortBy === "price_asc") {
      sortObj = { isDemo: 1, monthlyRent: 1, createdAt: -1 };
    } else if (sortBy === "rent_desc" || sortBy === "price_desc") {
      sortObj = { isDemo: 1, monthlyRent: -1, createdAt: -1 };
    } else {
      sortObj = { isDemo: 1, createdAt: -1 };
    }

    let query = Property.find(filter).sort(sortObj);
    if (latest) {
      query = query.limit(6);
    } else if (featured) {
      query = query.limit(6);
    } else {
      query = query.limit(60);
    }

    const [properties, totalCount] = await Promise.all([
      query,
      Property.countDocuments(filter)
    ]);

    return res.json({
      properties: properties.map(toCard),
      total: totalCount
    });
  } catch (error) {
    return next(error);
  }
}

async function getPublic(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "This listing is not available." });
    }
    const isOwner = req.user && property.owner && property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === "admin";
    if (property.isRemoved && !isOwner && !isAdmin) {
      return res.status(404).json({ message: "This listing has been removed or is unavailable." });
    }

    // Find related & recommended rooms (same city or same room category, excluding current room)
    const escapedCity = (property.city || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let related = await Property.find({
      _id: { $ne: property._id },
      isRemoved: false,
      $or: [
        { city: new RegExp("^" + escapedCity + "$", "i") },
        { type: property.type }
      ]
    })
      .sort({ isDemo: 1, createdAt: -1 })
      .limit(3);

    // Fallback: If fewer than 3 found, supplement with other top active listings across Bihar
    if (related.length < 3) {
      const existingIds = [property._id].concat(related.map(function (r) { return r._id; }));
      const fillers = await Property.find({
        _id: { $nin: existingIds },
        isRemoved: false
      })
        .sort({ isDemo: 1, createdAt: -1 })
        .limit(3 - related.length);
      related = related.concat(fillers);
    }

    return res.json({
      property: toDetail(property, { includeOwnerMeta: isOwner || isAdmin }),
      related: related.map(toCard)
    });
  } catch (_error) {
    return res.status(404).json({ message: "This listing is not available." });
  }
}

async function listMine(req, res, next) {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      properties: properties.map((item) => toDetail(item, { includeOwnerMeta: true }))
    });
  } catch (error) {
    return next(error);
  }
}

async function createListing(req, res, next) {
  try {
    const payload = parseListingBody(req.body);
    const newPhotos = photoPathsFromFiles(req.files);

    if (newPhotos.length < 1 || newPhotos.length > 4) {
      throw validationError("You must upload between 1 and 4 photos.", [
        "Upload at least 1 photo and at most 4 photos (JPG, PNG, WEBP)."
      ]);
    }

    payload.photos = newPhotos;
    payload.owner = req.user._id;
    payload.ownerName = payload.ownerName || req.user.name;
    payload.contactEmail = payload.contactEmail || req.user.email;
    payload.isDemo = false;
    payload.isPublished = true;
    payload.isRemoved = false;

    const property = await Property.create(payload);
    return res.status(201).json({
      message: "Property listing created successfully and published immediately.",
      property: toDetail(property, { includeOwnerMeta: true })
    });
  } catch (error) {
    if (req.files && req.files.length) {
      deletePhotoFiles(photoPathsFromFiles(req.files));
    }
    return next(error);
  }
}

async function updateListing(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Listing not found." });
    }
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own listings." });
    }

    const payload = parseListingBody(req.body);
    const keepRaw = req.body.keepPhotos;
    const keepPhotos = (Array.isArray(keepRaw) ? keepRaw : [keepRaw])
      .map((item) => trim(item))
      .filter((photo) => property.photos.includes(photo));

    const newPhotos = photoPathsFromFiles(req.files);
    const combinedPhotos = [...keepPhotos, ...newPhotos];

    if (combinedPhotos.length < 1 || combinedPhotos.length > 4) {
      throw validationError("Total photos must be between 1 and 4.", [
        "Select which existing photos to keep, or upload new ones. Total must stay between 1 and 4."
      ]);
    }

    const removedPhotos = property.photos.filter((p) => !keepPhotos.includes(p));
    deletePhotoFiles(removedPhotos);

    payload.photos = combinedPhotos;
    payload.ownerName = payload.ownerName || req.user.name;
    payload.contactEmail = payload.contactEmail || req.user.email;

    Object.assign(property, payload);
    await property.save();

    return res.json({
      message: "Listing updated successfully.",
      property: toDetail(property, { includeOwnerMeta: true })
    });
  } catch (error) {
    if (req.files && req.files.length) {
      deletePhotoFiles(photoPathsFromFiles(req.files));
    }
    return next(error);
  }
}

async function deleteListing(req, res, next) {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Listing not found." });
    }
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own listings." });
    }

    deletePhotoFiles(property.photos);
    await property.deleteOne();

    return res.json({ message: "Listing deleted successfully." });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  toCard,
  toDetail,
  listPublic,
  getPublic,
  listMine,
  createListing,
  updateListing,
  deleteListing
};
