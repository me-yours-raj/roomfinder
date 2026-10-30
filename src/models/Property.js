const mongoose = require("mongoose");
const {
  BIHAR_STATE,
  ROOM_TYPES,
  FURNISHING_OPTIONS,
  FOOD_OPTIONS,
  BATHROOM_OPTIONS,
  TENANT_PREFERENCES
} = require("../utils/locations");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    type: {
      type: String,
      required: true,
      enum: ROOM_TYPES.map((item) => item.value)
    },
    monthlyRent: { type: Number, required: true, min: 500, max: 500000 },
    deposit: { type: Number, min: 0, max: 1000000, default: 0 },
    state: { type: String, default: BIHAR_STATE, trim: true },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    locality: { type: String, required: true, trim: true, maxlength: 80 },
    address: { type: String, trim: true, maxlength: 250 },
    location: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 }
    },
    description: { type: String, required: false, default: "", trim: true, maxlength: 3000 },
    facilities: [{ type: String }],
    amenities: [{ type: String }],
    furnishingStatus: {
      type: String,
      enum: FURNISHING_OPTIONS,
      default: "Semi-Furnished"
    },
    foodAvailability: {
      type: String,
      enum: FOOD_OPTIONS,
      default: "None"
    },
    bathroomDetails: {
      type: String,
      enum: BATHROOM_OPTIONS,
      default: "Attached"
    },
    availabilityDate: {
      type: Date,
      default: Date.now
    },
    occupancy: { type: String, trim: true, maxlength: 80 },
    tenantPreference: {
      type: String,
      enum: TENANT_PREFERENCES,
      default: "Any / All"
    },
    photos: {
      type: [String],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 1 && value.length <= 4;
        },
        message: "Each listing must have between 1 and 4 photos."
      }
    },
    contactNumber: { type: String, required: true, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    ownerName: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isDemo: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    isRemoved: { type: Boolean, default: false },
    removedReason: { type: String, trim: true, maxlength: 200 }
  },
  { timestamps: true }
);

propertySchema.index({ city: 1, locality: 1, monthlyRent: 1, type: 1, isRemoved: 1, createdAt: -1 });
propertySchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Property", propertySchema);
