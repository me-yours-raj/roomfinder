const express = require("express");
const {
  POPULAR_CITIES,
  ROOM_TYPES,
  FACILITIES,
  FURNISHING_OPTIONS,
  FOOD_OPTIONS,
  BATHROOM_OPTIONS,
  TENANT_PREFERENCES,
  BIHAR_STATE
} = require("../utils/locations");

const router = express.Router();

router.get("/locations", (_req, res) => {
  res.json({ state: BIHAR_STATE, cities: POPULAR_CITIES });
});

router.get("/options", (_req, res) => {
  res.json({
    state: BIHAR_STATE,
    roomTypes: ROOM_TYPES,
    facilities: FACILITIES,
    furnishingOptions: FURNISHING_OPTIONS,
    foodOptions: FOOD_OPTIONS,
    bathroomOptions: BATHROOM_OPTIONS,
    tenantPreferences: TENANT_PREFERENCES,
    popularCities: POPULAR_CITIES
  });
});

module.exports = router;
