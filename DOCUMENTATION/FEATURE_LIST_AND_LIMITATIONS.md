# Room Finder — Implemented Features, Verification & Project Limitations

This document provides an honest, verifiable accounting of all implemented features, automated test outcomes, and project limitations for the **Diploma in Computer Science & Engineering Minor Project**.

---

## 1. Implemented & Verified Features

### A. Frontend & User Experience
- [x] **Responsive Mobile, Tablet & Desktop Layouts**: Clean, modern CSS with flexible grids, sticky navigation, and toggleable mobile menu.
- [x] **Original Branding**: Custom palette (Deep Teal `#0f5c65`, Amber Accent `#e0632b`), typography, and custom SVG illustrations.
- [x] **Homepage ("Find a Room That Feels Like Home")**:
  - Hero search bar (Location, Room Category, Min/Max Rent).
  - 8 Interactive Category Cards (Single Room, Shared Room, PG, Hostel, Flat, 1BHK, 2BHK, Roommate).
  - Featured & Recently Added Listings section.
  - Popular Locations in Bihar (Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga, Purnia, Begusarai, Arrah).
  - 3-Step "How It Works" guide.
  - Owner Call-to-Action banner.
- [x] **Listing Search & Filtering (`listings.html`)**:
  - Search by city or locality (case-insensitive regular expression).
  - Filter by room type.
  - Filter by minimum and maximum monthly rent.
  - Sort by Newest, Rent: Low to High, Rent: High to Low.
  - Total count feedback and empty state reset button.
- [x] **Detailed Accommodation View (`listing.html` / `room-details.html`)**:
  - Photo gallery with active preview and thumbnail carousel.
  - Prominent `DEMO LISTING` banner on sample data.
  - Key specification badges (Furnishing, Food, Bathroom, Tenant Preference, Availability Date, Occupancy).
  - One-click "Copy Contact Number" button with clipboard write and fallback.
  - Direct "Call Owner" button (`tel:` scheme).
- [x] **Interactive Leaflet & OpenStreetMap**:
  - Embedded map rendering approximate coordinates.
  - Custom popup displaying listing title, room type, and rent.
  - External link button opening Google Maps navigation.
  - Clear demonstration location disclaimer.
- [x] **Consistent Footer on All Pages**:
  - Instagram handle `@me_yours_raj` linked to `https://www.instagram.com/me_yours_raj/`.
  - Support email `ankit20270raj@gmail.com` linked via `mailto:`.
  - Clickable link to Privacy Policy page.
  - Copyright and project affiliation.
- [x] **Privacy Policy (`privacy-policy.html`)**:
  - Complete, readable disclosure covering data collection, OTP policy, contact visibility, third-party mapping, security measures, and support contacts.

### B. Authentication & Security
- [x] **User Registration**: Name, email, phone, role, password hashing via `bcryptjs` (12 rounds).
- [x] **6-Digit Email OTP Verification**: Cryptographically secure numeric OTP sent via Nodemailer SMTP.
- [x] **Hashed Token Storage**: Stored as SHA-256 hash with 10-minute expiry; zero plaintext OTP storage.
- [x] **No Credential Logging**: Zero logging of passwords, OTP codes, or SMTP secrets in server logs.
- [x] **Honest SMTP Handling**: If SMTP is unconfigured, returns HTTP 503 instead of pretending emails were sent.
- [x] **Forgot & Reset Password**: 6-digit OTP verification before allowing password reset; tokens invalidated on use.
- [x] **JWT in httpOnly Cookies**: Mitigates client-side XSS token theft.
- [x] **Rate Limiting**: `express-rate-limit` on login, register, and admin routes.
- [x] **Helmet Content Security Policy (CSP)**: Configured to permit local scripts, Leaflet OSM tiles, and safe images.

### C. Property Management & Admin
- [x] **Owner Listing CRUD**: Owners can create, update, and delete only their own listings.
- [x] **Multer Photo Uploads**: 1 to 4 photos per listing, 2 MB size limit, JPG/PNG/WEBP validation, safe filenames, and live preview with removal before submit.
- [x] **Dedicated Administrator Portal (`admin-login.html` & `admin.html`)**:
  - No public registration.
  - System dashboard metrics (Total users, owners, active listings, moderated listings).
  - Listing moderation (Take down with reason, restore, or permanently destroy).
  - User management (Deactivate or reactivate accounts).

### D. Demonstration Data
- [x] **Exactly 20 Demo Listings**: Spread across Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga, Purnia, and Begusarai.
- [x] **Masked Phone Numbers**: All sample listings use non-working demonstration numbers (e.g. `+91 00000 00001 (DEMO ONLY)`).
- [x] **Repeatable Seeding (`npm run seed`)**: Clears old demo data and inserts exactly 20 records without duplicates.

---

## 2. Automated Test Verification Results

The test suite (`npm test`) executes 18 automated tests against the database and Express backend:

| Test Name | Result | Notes |
|---|:---:|---|
| Database connected successfully to MongoDB Atlas | PASS | Cloud Atlas cluster operational |
| Exact 20 demonstration listings seeded | PASS | Verified `Property.countDocuments({ isDemo: true }) === 20` |
| Demonstration listings include required mix of room categories | PASS | Verified Single Room, Shared Room, PG, Hostel, Flat, 1BHK, 2BHK |
| All demo phone numbers are visibly masked demonstration strings | PASS | Every demo record contains `(DEMO` mask |
| Search by city 'Patna' returns results | PASS | 9 listings found |
| Search by locality 'Boring Road' returns results | PASS | 1 listing found |
| Search by room type 'pg' returns results | PASS | 4 listings found |
| Search by rent range ₹4,000–₹7,000 returns results | PASS | 11 listings found |
| Demonstration listings have approximate geographic coordinates | PASS | Leaflet map coordinates available |
| SMTP is configured with user and authentication token | PASS | Verified in `.env` |
| Bcrypt password hashing with salt rounds 12 operates correctly | PASS | Hash generation and comparison confirmed |
| SHA-256 hashed OTP token representation verification succeeds | PASS | Cryptographic integrity confirmed |
| Administrator account exists in database | PASS | Role and password hash confirmed |
| Admin role verified | PASS | RBAC verified |
| Admin password hash is properly encrypted | PASS | Starts with `$2` |
| Owner can create a listing in MongoDB | PASS | CRUD test verified |
| Owner can update an existing listing | PASS | CRUD update verified |
| Owner can delete listing | PASS | CRUD delete verified |

---

## 3. Honest Project Limitations & Non-Implemented Features

To maintain scientific honesty and integrity during the viva examination, the following features are deliberately out of scope for this diploma minor project:

1. **SMS / Mobile OTP**:
   - *Status:* Not implemented.
   - *Reason:* Third-party SMS gateways in India (e.g., Twilio, Fast2SMS, MSG91) require paid credits and commercial DLT (Distributed Ledger Technology) registration. Email OTP via SMTP was implemented instead.

2. **Online Rent Payment Gateway**:
   - *Status:* Not implemented.
   - *Reason:* Integrating payment aggregators like Razorpay or Cashfree requires a registered business entity, KYC documentation, and GST details. Direct tenant-to-owner contact is prioritized.

3. **In-App Real-Time WebSocket Chat**:
   - *Status:* Not implemented.
   - *Reason:* Direct phone contact and email links provide immediate connectivity without requiring both parties to be simultaneously online.

4. **Public Image CDN Hosting**:
   - *Status:* Local file storage (`uploads/properties/`) with static Express serving is implemented.
   - *Reason:* Free cloud object storage (e.g., AWS S3, Cloudinary) introduces API credit limits or external account requirements. Local disk storage is simple, transparent, and works offline.

5. **Advanced Tenant Reviews & Star Ratings**:
   - *Status:* Not implemented.
   - *Reason:* Verified reviews require complex booking confirmation workflows to prevent review bombing or fake ratings.
