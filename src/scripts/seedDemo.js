/**
 * Room Finder - Demonstration Listings Seeding Script
 * Inserts exactly 20 demonstration listings.
 * All phone numbers are non-working, visibly masked demo strings.
 * Safe, idempotent and repeatable.
 * Usage: npm run seed
 */
const bcrypt = require("bcryptjs");
const { config, assertRuntimeConfig } = require("../config/env");
const { connectDatabase } = require("../config/db");
const User = require("../models/User");
const Property = require("../models/Property");
const { BIHAR_STATE } = require("../utils/locations");

const DEMO_LISTINGS = [
  {
    title: "[DEMO] Krishna Heights Furnished Single Room, Boring Road",
    type: "single-room",
    monthlyRent: 6500,
    deposit: 6500,
    city: "Patna",
    locality: "Boring Road",
    address: "Approximate: Lane 3, Near AN College, Boring Road, Patna - 800013 (DEMO LOCATION)",
    location: { lat: 25.6139, lng: 85.1186 },
    description:
      "A peaceful and fully furnished single room suitable for students and working professionals. Features wooden bed, mattress, study desk, ergonomic chair, and good natural lighting. Close to coaching centers and food joints.",
    facilities: ["WiFi", "Furnished", "Attached bathroom", "Power backup", "RO Drinking Water"],
    amenities: ["WiFi", "Furnished", "Attached bathroom", "Power backup", "RO Drinking Water"],
    furnishingStatus: "Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Attached",
    occupancy: "Single occupant",
    tenantPreference: "Students Only",
    photos: ["/images/demo/room-single-1.svg", "/images/demo/room-study-1.svg", "/images/demo/room-balcony-1.svg"],
    contactNumber: "+91 00000 00001 (DEMO ONLY)",
    contactEmail: "demo-owner-1@roomfinder.bihar",
    ownerName: "Demo Owner - Krishna Accommodations"
  },
  {
    title: "[DEMO] Maa Sharda Executive Girls PG with Meals, Kankarbagh",
    type: "pg",
    monthlyRent: 5500,
    deposit: 4000,
    city: "Patna",
    locality: "Kankarbagh",
    address: "Approximate: Road No. 2, Near Domino's Chowk, Kankarbagh Main Road, Patna - 800020 (DEMO LOCATION)",
    location: { lat: 25.5960, lng: 85.1550 },
    description:
      "Safe and well-maintained paying-guest accommodation for female students and working women. Nutritious home-cooked breakfast and dinner provided daily. 24/7 CCTV surveillance and security guard present.",
    facilities: ["WiFi", "Food / Mess Included", "CCTV Security", "Power backup", "Daily Cleaning"],
    amenities: ["WiFi", "Food / Mess Included", "CCTV Security", "Power backup", "Daily Cleaning"],
    furnishingStatus: "Furnished",
    foodAvailability: "Mess Included",
    bathroomDetails: "Shared",
    occupancy: "2 sharing",
    tenantPreference: "Girls Only",
    photos: ["/images/demo/room-pg-1.svg", "/images/demo/room-double-1.svg"],
    contactNumber: "+91 00000 00002 (DEMO ONLY)",
    contactEmail: "demo-owner-2@roomfinder.bihar",
    ownerName: "Demo Owner - Maa Sharda Hostels"
  },
  {
    title: "[DEMO] Ganga View 2 BHK Semi-Furnished Apartment, Bailey Road",
    type: "2bhk",
    monthlyRent: 14000,
    deposit: 28000,
    city: "Patna",
    locality: "Bailey Road",
    address: "Approximate: Sai Heritage Towers, Near RPS More, Bailey Road, Patna - 800015 (DEMO LOCATION)",
    location: { lat: 25.6095, lng: 85.0880 },
    description:
      "Spacious 2 BHK residential apartment on 3rd floor with lift access and covered car parking. Features a large living room, modular kitchen, two bathrooms, and an open balcony with city skyline views.",
    facilities: ["Parking", "Air conditioning", "Power backup", "Balcony", "CCTV Security"],
    amenities: ["Parking", "Air conditioning", "Power backup", "Balcony", "CCTV Security"],
    furnishingStatus: "Semi-Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Attached",
    occupancy: "Family / Professionals",
    tenantPreference: "Family Only",
    photos: ["/images/demo/room-living-1.svg", "/images/demo/room-single-2.svg", "/images/demo/room-kitchen-1.svg"],
    contactNumber: "+91 00000 00003 (DEMO ONLY)",
    contactEmail: "demo-owner-3@roomfinder.bihar",
    ownerName: "Demo Owner - Ganga Residencies"
  },
  {
    title: "[DEMO] Ashoka Boys Hostel & Study Hub, Rajendra Nagar",
    type: "hostel",
    monthlyRent: 4200,
    deposit: 3000,
    city: "Patna",
    locality: "Rajendra Nagar",
    address: "Approximate: Road 5, Opposite Commerce College, Rajendra Nagar, Patna - 800016 (DEMO LOCATION)",
    location: { lat: 25.6030, lng: 85.1610 },
    description:
      "Organised student hostel designed for competitive exam aspirants. Dedicated quiet study hall, high-speed fiber internet, RO drinking water, and daily cleaning service. 5 minutes walk from Rajendra Nagar Terminal.",
    facilities: ["WiFi", "RO Drinking Water", "Washing Machine / Laundry", "CCTV Security", "Power backup"],
    amenities: ["WiFi", "RO Drinking Water", "Washing Machine / Laundry", "CCTV Security", "Power backup"],
    furnishingStatus: "Furnished",
    foodAvailability: "Mess Included",
    bathroomDetails: "Shared",
    occupancy: "Bunk bed (3 sharing)",
    tenantPreference: "Boys Only",
    photos: ["/images/demo/room-hostel-1.svg", "/images/demo/room-study-2.svg"],
    contactNumber: "+91 00000 00004 (DEMO ONLY)",
    contactEmail: "demo-owner-4@roomfinder.bihar",
    ownerName: "Demo Manager - Ashoka Student Services"
  },
  {
    title: "[DEMO] Patliputra Luxury Studio Single Room with AC, Patliputra",
    type: "single-room",
    monthlyRent: 8500,
    deposit: 8500,
    city: "Patna",
    locality: "Patliputra",
    address: "Approximate: Near Alpana Market Circle, Patliputra Colony, Patna - 800013 (DEMO LOCATION)",
    location: { lat: 25.6265, lng: 85.1090 },
    description:
      "Premium air-conditioned single room in an upscale, quiet residential neighborhood. Includes queen-size bed, private attached washroom, mini refrigerator, and private terrace sitting area.",
    facilities: ["WiFi", "Air conditioning", "Furnished", "Attached bathroom", "Power backup", "Refrigerator"],
    amenities: ["WiFi", "Air conditioning", "Furnished", "Attached bathroom", "Power backup", "Refrigerator"],
    furnishingStatus: "Furnished",
    foodAvailability: "None",
    bathroomDetails: "Attached",
    occupancy: "Single executive",
    tenantPreference: "Working Professionals",
    photos: ["/images/demo/room-single-3.svg", "/images/demo/room-balcony-2.svg", "/images/demo/room-kitchen-1.svg"],
    contactNumber: "+91 00000 00005 (DEMO ONLY)",
    contactEmail: "demo-owner-5@roomfinder.bihar",
    ownerName: "Demo Owner - Executive Suites Patna"
  },
  {
    title: "[DEMO] Fraser Road Commercial 1 BHK Independent Flat, Fraser Road",
    type: "1bhk",
    monthlyRent: 11000,
    deposit: 22000,
    city: "Patna",
    locality: "Fraser Road",
    address: "Approximate: Near Dak Bungalow Crossing, Fraser Road, Patna - 800001 (DEMO LOCATION)",
    location: { lat: 25.6080, lng: 85.1380 },
    description:
      "Centrally situated 1 BHK flat right in the heart of Patna. Excellent connectivity to Patna Junction, banks, restaurants, and coaching institutions. Ground floor with security guard.",
    facilities: ["Parking", "Power backup", "Attached bathroom", "CCTV Security"],
    amenities: ["Parking", "Power backup", "Attached bathroom", "CCTV Security"],
    furnishingStatus: "Semi-Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Attached",
    occupancy: "1 to 2 occupants",
    tenantPreference: "Any / All",
    photos: ["/images/demo/room-living-2.svg", "/images/demo/room-kitchen-1.svg"],
    contactNumber: "+91 00000 00006 (DEMO ONLY)",
    contactEmail: "demo-owner-6@roomfinder.bihar",
    ownerName: "Demo Owner - Central City Flats"
  },
  {
    title: "[DEMO] Budget Shared Room for College Students, Anisabad",
    type: "shared-room",
    monthlyRent: 3500,
    deposit: 2500,
    city: "Patna",
    locality: "Anisabad",
    address: "Approximate: Near Golamber Chowk, Anisabad, Patna - 800002 (DEMO LOCATION)",
    location: { lat: 25.5780, lng: 85.0920 },
    description:
      "Affordable double-sharing room for college students. Rent includes water supply and high-speed WiFi. Easy bus connectivity to AIIMS Patna and Patna Junction.",
    facilities: ["WiFi", "RO Drinking Water", "Furnished"],
    amenities: ["WiFi", "RO Drinking Water", "Furnished"],
    furnishingStatus: "Semi-Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Shared",
    occupancy: "2 sharing",
    tenantPreference: "Students Only",
    photos: ["/images/demo/room-double-1.svg", "/images/demo/room-study-1.svg"],
    contactNumber: "+91 00000 00007 (DEMO ONLY)",
    contactEmail: "demo-owner-7@roomfinder.bihar",
    ownerName: "Demo Owner - Anisabad Student Rooms"
  },
  {
    title: "[DEMO] Friendly Flatmate Wanted in 3BHK Flat, Ashiana Nagar",
    type: "roommate",
    monthlyRent: 4800,
    deposit: 4800,
    city: "Patna",
    locality: "Ashiana Nagar",
    address: "Approximate: Ashiana-Digha Road, Ashiana Nagar Phase 1, Patna - 800025 (DEMO LOCATION)",
    location: { lat: 25.6170, lng: 85.0740 },
    description:
      "Looking for a chilled out and hygienic roommate in a spacious 3 BHK apartment. Private bedroom with shared living hall, modular kitchen, and washing machine.",
    facilities: ["WiFi", "Washing Machine / Laundry", "Furnished", "Balcony", "Power backup"],
    amenities: ["WiFi", "Washing Machine / Laundry", "Furnished", "Balcony", "Power backup"],
    furnishingStatus: "Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Attached",
    occupancy: "Single room in shared flat",
    tenantPreference: "Working Professionals",
    photos: ["/images/demo/room-single-2.svg", "/images/demo/room-living-1.svg"],
    contactNumber: "+91 00000 00008 (DEMO ONLY)",
    contactEmail: "demo-owner-8@roomfinder.bihar",
    ownerName: "Demo Flatmate - Rahul Verma"
  },
  {
    title: "[DEMO] Green Valley 1 BHK Independent Flat, Civil Lines, Gaya",
    type: "1bhk",
    monthlyRent: 8800,
    deposit: 15000,
    city: "Gaya",
    locality: "Civil Lines",
    address: "Approximate: Near Head Post Office, Civil Lines, Gaya - 823001 (DEMO LOCATION)",
    location: { lat: 24.7960, lng: 84.9990 },
    description:
      "Independent 1 BHK flat on ground floor with spacious living hall, clean kitchen, and separate water storage. Safe residential locality with markets and medical stores within walking distance.",
    facilities: ["Parking", "Power backup", "Furnished", "RO Drinking Water"],
    amenities: ["Parking", "Power backup", "Furnished", "RO Drinking Water"],
    furnishingStatus: "Semi-Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Attached",
    occupancy: "Small family or 2 sharing",
    tenantPreference: "Family Only",
    photos: ["/images/demo/room-living-1.svg", "/images/demo/room-single-1.svg"],
    contactNumber: "+91 00000 00009 (DEMO ONLY)",
    contactEmail: "demo-owner-9@roomfinder.bihar",
    ownerName: "Demo Owner - Gaya Property Care"
  },
  {
    title: "[DEMO] Bodh Nirvana Single Room for Students, A.P. Colony, Gaya",
    type: "single-room",
    monthlyRent: 4500,
    deposit: 4000,
    city: "Gaya",
    locality: "A.P. Colony",
    address: "Approximate: Near A.P. Colony Park, Gaya - 823001 (DEMO LOCATION)",
    location: { lat: 24.7890, lng: 85.0080 },
    description:
      "Quiet single room suited for students studying at Gaya College and coaching students. Features bed, wardrobe, table, chair, and peaceful garden surroundings.",
    facilities: ["WiFi", "RO Drinking Water", "Furnished", "Attached bathroom"],
    amenities: ["WiFi", "RO Drinking Water", "Furnished", "Attached bathroom"],
    furnishingStatus: "Furnished",
    foodAvailability: "None",
    bathroomDetails: "Attached",
    occupancy: "Single occupant",
    tenantPreference: "Students Only",
    photos: ["/images/demo/room-single-2.svg", "/images/demo/room-study-1.svg"],
    contactNumber: "+91 00000 00010 (DEMO ONLY)",
    contactEmail: "demo-owner-10@roomfinder.bihar",
    ownerName: "Demo Owner - Bodh Nirvana Homes"
  },
  {
    title: "[DEMO] Magadh Boys PG & Mess Facilities, Magadh Colony, Gaya",
    type: "pg",
    monthlyRent: 5000,
    deposit: 3500,
    city: "Gaya",
    locality: "Magadh Colony",
    address: "Approximate: Sector 2, Magadh Colony, Gaya - 823001 (DEMO LOCATION)",
    location: { lat: 24.7820, lng: 84.9850 },
    description:
      "Comfortable PG accommodation offering vegetarian breakfast, lunch, and dinner. Mineral water dispenser, high-speed WiFi, and 24-hour backup inverter.",
    facilities: ["WiFi", "Food / Mess Included", "Power backup", "CCTV Security", "Daily Cleaning"],
    amenities: ["WiFi", "Food / Mess Included", "Power backup", "CCTV Security", "Daily Cleaning"],
    furnishingStatus: "Furnished",
    foodAvailability: "Veg Only",
    bathroomDetails: "Shared",
    occupancy: "2 sharing",
    tenantPreference: "Boys Only",
    photos: ["/images/demo/room-pg-2.svg", "/images/demo/room-double-2.svg"],
    contactNumber: "+91 00000 00011 (DEMO ONLY)",
    contactEmail: "demo-owner-11@roomfinder.bihar",
    ownerName: "Demo Manager - Magadh PG"
  },
  {
    title: "[DEMO] Tirhut Student Shared Accommodation, Mithanpura, Muzaffarpur",
    type: "shared-room",
    monthlyRent: 3800,
    deposit: 3000,
    city: "Muzaffarpur",
    locality: "Mithanpura",
    address: "Approximate: Near Club Road, Mithanpura, Muzaffarpur - 842002 (DEMO LOCATION)",
    location: { lat: 26.1150, lng: 85.3950 },
    description:
      "Twin sharing student room located in Mithanpura. Equipped with individual study tables, wooden beds, and wardrobe space. Well-connected to RDLS College and local markets.",
    facilities: ["WiFi", "RO Drinking Water", "Power backup", "Furnished"],
    amenities: ["WiFi", "RO Drinking Water", "Power backup", "Furnished"],
    furnishingStatus: "Semi-Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Shared",
    occupancy: "2 sharing",
    tenantPreference: "Students Only",
    photos: ["/images/demo/room-double-1.svg", "/images/demo/room-study-2.svg"],
    contactNumber: "+91 00000 00012 (DEMO ONLY)",
    contactEmail: "demo-owner-12@roomfinder.bihar",
    ownerName: "Demo Owner - Tirhut Student Stays"
  },
  {
    title: "[DEMO] Kaveri Girls Hostel & Safe Residence, Bhagwanpur, Muzaffarpur",
    type: "hostel",
    monthlyRent: 4600,
    deposit: 4000,
    city: "Muzaffarpur",
    locality: "Bhagwanpur",
    address: "Approximate: Near Bhagwanpur Chowk, Muzaffarpur - 842001 (DEMO LOCATION)",
    location: { lat: 26.1260, lng: 85.3580 },
    description:
      "Secure and modern girls hostel with biometric entry, female warden, hygienic mess meals, and power backup. Close to MIT Muzaffarpur campus.",
    facilities: ["WiFi", "Food / Mess Included", "CCTV Security", "Daily Cleaning", "Power backup"],
    amenities: ["WiFi", "Food / Mess Included", "CCTV Security", "Daily Cleaning", "Power backup"],
    furnishingStatus: "Furnished",
    foodAvailability: "Mess Included",
    bathroomDetails: "Shared",
    occupancy: "2-3 sharing",
    tenantPreference: "Girls Only",
    photos: ["/images/demo/room-hostel-2.svg", "/images/demo/room-double-2.svg"],
    contactNumber: "+91 00000 00013 (DEMO ONLY)",
    contactEmail: "demo-owner-13@roomfinder.bihar",
    ownerName: "Demo Warden - Kaveri Hostels"
  },
  {
    title: "[DEMO] Shahi Residency 2 BHK Family Flat, Saraiyaganj, Muzaffarpur",
    type: "2bhk",
    monthlyRent: 12500,
    deposit: 25000,
    city: "Muzaffarpur",
    locality: "Saraiyaganj",
    address: "Approximate: Tower Chowk Road, Saraiyaganj, Muzaffarpur - 842001 (DEMO LOCATION)",
    location: { lat: 26.1210, lng: 85.3850 },
    description:
      "Well-ventilated 2 BHK apartment featuring two bedrooms, modular kitchen, two western washrooms, and dedicated two-wheeler parking. Prime central city area.",
    facilities: ["Parking", "Power backup", "Balcony", "Attached bathroom"],
    amenities: ["Parking", "Power backup", "Balcony", "Attached bathroom"],
    furnishingStatus: "Semi-Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Attached",
    occupancy: "Family occupancy",
    tenantPreference: "Family Only",
    photos: ["/images/demo/room-living-2.svg", "/images/demo/room-kitchen-1.svg", "/images/demo/room-single-3.svg"],
    contactNumber: "+91 00000 00014 (DEMO ONLY)",
    contactEmail: "demo-owner-14@roomfinder.bihar",
    ownerName: "Demo Owner - Shahi Properties"
  },
  {
    title: "[DEMO] Vikramshila Furnished Single Room, Barari, Bhagalpur",
    type: "single-room",
    monthlyRent: 4200,
    deposit: 3500,
    city: "Bhagalpur",
    locality: "Barari",
    address: "Approximate: Near JLNMCH Medical College, Barari, Bhagalpur - 812003 (DEMO LOCATION)",
    location: { lat: 25.2600, lng: 87.0220 },
    description:
      "Single room suitable for medical and engineering students. Quiet residential neighborhood with RO water and 24-hour electricity. 10 minutes from Bhagalpur river ghats.",
    facilities: ["WiFi", "RO Drinking Water", "Furnished", "Attached bathroom"],
    amenities: ["WiFi", "RO Drinking Water", "Furnished", "Attached bathroom"],
    furnishingStatus: "Furnished",
    foodAvailability: "None",
    bathroomDetails: "Attached",
    occupancy: "Single occupant",
    tenantPreference: "Students Only",
    photos: ["/images/demo/room-single-1.svg", "/images/demo/room-study-1.svg"],
    contactNumber: "+91 00000 00015 (DEMO ONLY)",
    contactEmail: "demo-owner-15@roomfinder.bihar",
    ownerName: "Demo Owner - Vikramshila Accommodations"
  },
  {
    title: "[DEMO] Silk City Executive Girls PG, Adampur, Bhagalpur",
    type: "pg",
    monthlyRent: 5200,
    deposit: 4500,
    city: "Bhagalpur",
    locality: "Adampur",
    address: "Approximate: Near S.M. College Road, Adampur, Bhagalpur - 812001 (DEMO LOCATION)",
    location: { lat: 25.2480, lng: 86.9820 },
    description:
      "Fully furnished girls paying guest accommodation near SM College. Offers quality North Indian meals twice daily, power backup, and CCTV security.",
    facilities: ["WiFi", "Food / Mess Included", "CCTV Security", "Power backup", "Daily Cleaning"],
    amenities: ["WiFi", "Food / Mess Included", "CCTV Security", "Power backup", "Daily Cleaning"],
    furnishingStatus: "Furnished",
    foodAvailability: "Mess Included",
    bathroomDetails: "Shared",
    occupancy: "2 sharing",
    tenantPreference: "Girls Only",
    photos: ["/images/demo/room-pg-1.svg", "/images/demo/room-double-1.svg"],
    contactNumber: "+91 00000 00016 (DEMO ONLY)",
    contactEmail: "demo-owner-16@roomfinder.bihar",
    ownerName: "Demo Owner - Silk City Hostels"
  },
  {
    title: "[DEMO] Mithila Heritage 1 BHK Independent Flat, Laheriasarai, Darbhanga",
    type: "1bhk",
    monthlyRent: 7500,
    deposit: 12000,
    city: "Darbhanga",
    locality: "Laheriasarai",
    address: "Approximate: Court Road, Near Collectorate, Laheriasarai, Darbhanga - 846001 (DEMO LOCATION)",
    location: { lat: 26.1220, lng: 85.8970 },
    description:
      "Peaceful 1 BHK apartment situated close to the court campus and DMCH Darbhanga. Includes bedroom, drawing room, bathroom, and kitchen with gas connection point.",
    facilities: ["Parking", "Power backup", "Attached bathroom", "Water supply"],
    amenities: ["Parking", "Power backup", "Attached bathroom"],
    furnishingStatus: "Semi-Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Attached",
    occupancy: "Small family or 2 professionals",
    tenantPreference: "Working Professionals",
    photos: ["/images/demo/room-living-1.svg", "/images/demo/room-single-2.svg"],
    contactNumber: "+91 00000 00017 (DEMO ONLY)",
    contactEmail: "demo-owner-17@roomfinder.bihar",
    ownerName: "Demo Owner - Mithila Heritage Flats"
  },
  {
    title: "[DEMO] Vidyapati Boys PG & Mess, Donar, Darbhanga",
    type: "pg",
    monthlyRent: 4800,
    deposit: 3000,
    city: "Darbhanga",
    locality: "Donar",
    address: "Approximate: Donar Chowk, Darbhanga - 846004 (DEMO LOCATION)",
    location: { lat: 26.1600, lng: 85.9120 },
    description:
      "Affordable boys PG with hygienic mess, study atmosphere, and clean drinking water. Located near LNMU university campus.",
    facilities: ["WiFi", "Food / Mess Included", "RO Drinking Water", "Daily Cleaning"],
    amenities: ["WiFi", "Food / Mess Included", "RO Drinking Water", "Daily Cleaning"],
    furnishingStatus: "Furnished",
    foodAvailability: "Mess Included",
    bathroomDetails: "Shared",
    occupancy: "2 sharing",
    tenantPreference: "Boys Only",
    photos: ["/images/demo/room-pg-2.svg", "/images/demo/room-hostel-1.svg"],
    contactNumber: "+91 00000 00018 (DEMO ONLY)",
    contactEmail: "demo-owner-18@roomfinder.bihar",
    ownerName: "Demo Manager - Vidyapati Stays"
  },
  {
    title: "[DEMO] Kosi Valley Furnished Single Room, Line Bazar, Purnia",
    type: "single-room",
    monthlyRent: 4000,
    deposit: 3000,
    city: "Purnia",
    locality: "Line Bazar",
    address: "Approximate: Near Hospital Road, Line Bazar, Purnia - 854301 (DEMO LOCATION)",
    location: { lat: 25.7780, lng: 87.4720 },
    description:
      "Single room with attached bathroom located in Line Bazar, Purnia. Suitable for medical representatives, students, and bank staff. 24-hour running water.",
    facilities: ["WiFi", "Attached bathroom", "Furnished", "RO Drinking Water"],
    amenities: ["WiFi", "Attached bathroom", "Furnished", "RO Drinking Water"],
    furnishingStatus: "Furnished",
    foodAvailability: "None",
    bathroomDetails: "Attached",
    occupancy: "Single occupant",
    tenantPreference: "Any / All",
    photos: ["/images/demo/room-single-3.svg", "/images/demo/room-study-2.svg"],
    contactNumber: "+91 00000 00019 (DEMO ONLY)",
    contactEmail: "demo-owner-19@roomfinder.bihar",
    ownerName: "Demo Owner - Kosi Accommodations"
  },
  {
    title: "[DEMO] Industrial Area Shared Student Room, Town Area, Begusarai",
    type: "shared-room",
    monthlyRent: 3200,
    deposit: 2000,
    city: "Begusarai",
    locality: "Town Area",
    address: "Approximate: Near Traffic Chowk, Begusarai - 851101 (DEMO LOCATION)",
    location: { lat: 25.4180, lng: 86.1320 },
    description:
      "Budget friendly shared room for polytechnic and ITI students in Begusarai. Good transport connectivity to Barauni industrial complex and local colleges.",
    facilities: ["RO Drinking Water", "Furnished", "Power backup"],
    amenities: ["RO Drinking Water", "Furnished", "Power backup"],
    furnishingStatus: "Semi-Furnished",
    foodAvailability: "Self Cooking Allowed",
    bathroomDetails: "Shared",
    occupancy: "2 sharing",
    tenantPreference: "Students Only",
    photos: ["/images/demo/room-double-2.svg", "/images/demo/room-study-1.svg"],
    contactNumber: "+91 00000 00020 (DEMO ONLY)",
    contactEmail: "demo-owner-20@roomfinder.bihar",
    ownerName: "Demo Owner - Begusarai Rentals"
  }
];

async function seed() {
  const problems = assertRuntimeConfig();
  if (problems.length) {
    console.error("Configuration errors:\n" + problems.join("\n"));
    process.exit(1);
  }

  await connectDatabase();

  // Create or retrieve Demo Owner user
  const email = config.demoOwner.email.toLowerCase();
  let owner = await User.findOne({ email });
  if (!owner) {
    const passwordHash = await bcrypt.hash(config.demoOwner.password, 12);
    owner = await User.create({
      name: "Demo Account Manager",
      email,
      passwordHash,
      phone: "9800000000",
      role: "owner",
      isActive: true,
      isVerified: true
    });
    console.log(`Created demo owner user: ${email}`);
  } else {
    owner.role = "owner";
    owner.isActive = true;
    owner.isVerified = true;
    await owner.save();
    console.log(`Verified demo owner user: ${email}`);
  }

  // Remove existing demo listings to guarantee repeatability without duplicates
  const deleteResult = await Property.deleteMany({ isDemo: true });
  console.log(`Cleared ${deleteResult.deletedCount} existing demo listings.`);

  // Insert exactly 20 demo listings with past timestamp so user-uploaded listings stay on top
  const pastBaseTime = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const toInsert = DEMO_LISTINGS.map((item, index) => ({
    ...item,
    owner: owner._id,
    state: BIHAR_STATE,
    isDemo: true,
    isPublished: true,
    isRemoved: false,
    createdAt: new Date(pastBaseTime + index * 60000),
    updatedAt: new Date(pastBaseTime + index * 60000)
  }));

  const inserted = await Property.insertMany(toInsert);
  console.log(`Successfully seeded exactly ${inserted.length} demonstration listings into MongoDB.`);

  if (require.main === module) {
    process.exit(0);
  }
}

if (require.main === module) {
  seed().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}

module.exports = { seed, DEMO_LISTINGS };
