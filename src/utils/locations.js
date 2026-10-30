/**
 * Location, Room Categories, and Property Metadata for Bihar.
 * Standardized across Room Finder application.
 */

const BIHAR_STATE = "Bihar";

const POPULAR_CITIES = [
  {
    city: "Patna",
    localities: ["Boring Road", "Kankarbagh", "Bailey Road", "Rajendra Nagar", "Patliputra", "Fraser Road", "Anisabad", "Ashiana Nagar"]
  },
  {
    city: "Gaya",
    localities: ["Civil Lines", "Magadh Colony", "A.P. Colony", "Rampur", "Bodh Gaya Road"]
  },
  {
    city: "Muzaffarpur",
    localities: ["Mithanpura", "Bhagwanpur", "Saraiyaganj", "Brahmpura", "Kalambagh Road"]
  },
  {
    city: "Bhagalpur",
    localities: ["Barari", "Adampur", "T.N.B. College Road", "Zero Mile", "Tilka Manjhi"]
  },
  {
    city: "Darbhanga",
    localities: ["Laheriasarai", "Donar", "Bela", "Tower Chowk", "Medical Road"]
  },
  {
    city: "Purnia",
    localities: ["Line Bazar", "Khushkibagh", "Bhatta Bazar", "Navratan Hata"]
  },
  {
    city: "Begusarai",
    localities: ["Town Area", "Barauni", "Traffic Chowk", "Power House"]
  },
  {
    city: "Arrah",
    localities: ["Nawada", "Katira", "Anaith", "Judge Court Road"]
  }
];

const ROOM_TYPES = [
  { value: "single-room", label: "Single Room", description: "Private room with solo occupancy" },
  { value: "shared-room", label: "Shared Room", description: "Cost-effective room shared with 1-3 roommates" },
  { value: "pg", label: "PG (Paying Guest)", description: "Accommodation with food, maintenance & amenities" },
  { value: "hostel", label: "Hostel", description: "Student/working hostel with mess and study facilities" },
  { value: "flat", label: "Flat / Apartment", description: "Independent residential apartment" },
  { value: "1bhk", label: "1 BHK", description: "One bedroom, hall and kitchen apartment" },
  { value: "2bhk", label: "2 BHK", description: "Two bedrooms, hall and kitchen apartment" },
  { value: "roommate", label: "Roommate Wanted", description: "Existing tenant seeking a flatmate/roommate" }
];

const FACILITIES = [
  "WiFi",
  "Air conditioning",
  "Power backup",
  "Attached bathroom",
  "RO Drinking Water",
  "Geyser",
  "Food / Mess Included",
  "Parking",
  "CCTV Security",
  "Daily Cleaning",
  "Washing Machine / Laundry",
  "Furnished",
  "Refrigerator",
  "Balcony"
];

const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"];

const FOOD_OPTIONS = [
  "None",
  "Mess Included",
  "Self Cooking Allowed",
  "Veg Only",
  "Both Veg & Non-Veg"
];

const BATHROOM_OPTIONS = ["Attached", "Shared"];

const TENANT_PREFERENCES = [
  "Any / All",
  "Boys Only",
  "Girls Only",
  "Family Only",
  "Students Only",
  "Working Professionals"
];

function roomTypeLabel(value) {
  const match = ROOM_TYPES.find((item) => item.value === value);
  return match ? match.label : "Room / Rental";
}

module.exports = {
  BIHAR_STATE,
  POPULAR_CITIES,
  ROOM_TYPES,
  FACILITIES,
  FURNISHING_OPTIONS,
  FOOD_OPTIONS,
  BATHROOM_OPTIONS,
  TENANT_PREFERENCES,
  roomTypeLabel
};
