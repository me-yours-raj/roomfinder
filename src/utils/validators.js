const {
  ROOM_TYPES,
  FACILITIES,
  FURNISHING_OPTIONS,
  FOOD_OPTIONS,
  BATHROOM_OPTIONS,
  TENANT_PREFERENCES
} = require("./locations");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .']{1,59}$/;

function trim(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value) {
  return EMAIL_REGEX.test(trim(value).toLowerCase());
}

function isPhone(value) {
  const digits = String(value || "").replace(/\s+/g, "");
  return PHONE_REGEX.test(digits);
}

function isStrongPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 72;
}

function isName(value) {
  return NAME_REGEX.test(trim(value));
}

function parseRent(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 500 || number > 500000) {
    return null;
  }
  return Math.round(number);
}

function parseOptionalDeposit(value) {
  if (value === undefined || value === null || trim(String(value)) === "") {
    return 0;
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1000000) {
    return null;
  }
  return Math.round(number);
}

function isRoomType(value) {
  return ROOM_TYPES.some((item) => item.value === value);
}

function parseCoordinate(val, min, max) {
  if (val === undefined || val === null || trim(String(val)) === "") {
    return undefined;
  }
  const num = Number(val);
  if (Number.isFinite(num) && num >= min && num <= max) {
    return num;
  }
  return null;
}

function normalizeFacilities(list) {
  if (!list) {
    return [];
  }
  const items = Array.isArray(list) ? list : String(list).split(",");
  const unique = [...new Set(items.map((item) => trim(item)).filter(Boolean))];
  return unique.filter((item) => FACILITIES.includes(item));
}

function validationError(message, details) {
  const error = new Error(message);
  error.status = 400;
  error.details = details || [];
  return error;
}

module.exports = {
  trim,
  isEmail,
  isPhone,
  isStrongPassword,
  isName,
  parseRent,
  parseOptionalDeposit,
  isRoomType,
  parseCoordinate,
  normalizeFacilities,
  validationError
};
