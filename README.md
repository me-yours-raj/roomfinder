# Room Finder — Bihar Rental Accommodation Discovery Platform

> **Rental Accommodation Platform &bull; Bihar, India**  
> Built with HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, MongoDB Atlas, and Leaflet OpenStreetMap.

Room Finder is a full-stack, responsive web application for discovering rental rooms, paying-guest (PG) accommodations, hostels, and flats across **Bihar, India** (including Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga, Purnia, Begusarai, and Arrah).

Inspired by the property-discovery experience of modern housing portals, Room Finder features **original branding, original layouts, and zero heavy frameworks**.

---

## 1. Key Highlights & Features

- **Public Search without Forced Login**: Filter by city, locality, room category, and rent range (₹).
- **Interactive OpenStreetMap with Leaflet**: View approximate accommodation location with marker popups and direct Google Maps navigation links.
- **Three Dedicated Roles**:
  - **Visitor / Student / Tenant**: Browse listings, view photo galleries, copy verified owner contact numbers directly without brokerage.
  - **Property Owner**: Register, publish accommodation listings with 1–4 photos (with live preview & removal controls), edit, and manage listings.
  - **Administrator**: Dedicated portal (`/admin-login.html`) to monitor dashboard statistics, review listings, moderate/take down listings, and manage user accounts.
- **Secure Authentication & Email OTP**:
  - Password hashing using `bcryptjs` (12 salt rounds).
  - 6-digit email verification OTP delivered via Nodemailer SMTP.
  - SHA-256 hashed OTP token storage with strict 10-minute expiration.
  - Zero plaintext OTP storage; zero credential logging.
  - Secure session management using `httpOnly` JWT cookies.
- **Exactly 20 Demonstrative Listings**:
  - Pre-seeded across Bihar with realistic titles, full amenities, and approximate coordinates.
  - Visibly masked, non-working demonstration phone numbers (`+91 00000 00001 (DEMO ONLY)`).
  - Clear `DEMO LISTING` badges on cards and detail pages.
- **Transparent Privacy Policy & Support Footer**:
  - Consistent across every page with verified support channels.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Responsive grid, custom CSS variables, no heavy framework dependencies |
| **Backend** | Node.js &amp; Express.js | RESTful JSON API architecture, modular routers and controllers |
| **Database** | MongoDB Atlas (Mongoose ODM) | Cloud-hosted NoSQL database with compound indexes |
| **Authentication**| `bcryptjs` &amp; `jsonwebtoken` | 12-round salt hashing, JWT stored in `httpOnly` cookies |
| **Email Service** | `nodemailer` (SMTP) | Dispatches 6-digit OTP verification codes and password reset links |
| **Interactive Maps**| Leaflet 1.9.4 &amp; OpenStreetMap | Offline-bundled Leaflet JS/CSS with free OSM tile layer |
| **Photo Uploads** | `multer` (Disk Storage) | 1–4 photos, 2 MB size limit, JPG/PNG/WEBP validation, safe filenames |
| **Security** | `helmet` &amp; `express-rate-limit` | Content Security Policy (CSP), rate limiting on authentication routes |

---

## 3. Project Structure

```
room-finder/
├── public/                       # Static frontend assets
│   ├── index.html                # Homepage with hero, categories, locations
│   ├── listings.html             # Room discovery & multi-filter search
│   ├── listing.html              # Room details with gallery & Leaflet map
│   ├── privacy-policy.html       # Full transparent privacy policy
│   ├── login.html                # User & Owner login
│   ├── register.html             # User registration & 6-digit OTP verification
│   ├── forgot-password.html      # Password reset OTP request
│   ├── reset-password.html       # 6-digit OTP verification & new password form
│   ├── profile.html              # User account profile view
│   ├── select-role.html          # Role selection (Student vs Owner)
│   ├── owner.html                # Owner listings dashboard
│   ├── owner-form.html           # Add/edit listing form with photo previews
│   ├── admin-login.html          # Dedicated administrator login
│   ├── admin.html                # Admin moderation & user management dashboard
│   ├── 404.html                  # Friendly error page
│   ├── css/
│   │   ├── styles.css            # Primary responsive stylesheet
│   │   ├── leaflet.css           # Bundled Leaflet map styles
│   │   └── images/               # Leaflet marker icons
│   ├── js/
│   │   ├── api.js                # Core API fetch helper & listing card renderer
│   │   ├── nav.js                # Dynamic navigation & mobile toggle
│   │   ├── home.js               # Homepage listings & location loader
│   │   ├── listings.js           # Search filter & sorting controller
│   │   ├── detail.js             # Room details & Leaflet map initializer
│   │   ├── owner-form.js         # Listing creation & photo preview manager
│   │   ├── owner.js              # Owner listings CRUD manager
│   │   ├── admin.js              # Administrator dashboard & moderation logic
│   │   ├── auth-pages.js         # Login, registration, OTP & password reset
│   │   ├── leaflet.js            # Bundled Leaflet 1.9.4 library
│   │   └── profile.js            # Profile update controller
│   └── images/demo/              # 16 custom SVG room illustrations
├── src/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection manager
│   │   └── env.js                # Environment configuration loader
│   ├── controllers/
│   │   ├── authController.js     # Register, OTP verify, login, reset password
│   │   ├── propertyController.js # Search, details, owner CRUD
│   │   └── adminController.js    # Stats, moderation, user management
│   ├── middleware/
│   │   ├── auth.js               # JWT cookie extraction & role checks
│   │   ├── upload.js             # Multer photo upload & file validation
│   │   ├── rateLimit.js          # Express rate limiting middleware
│   │   └── errorHandler.js       # Centralized 404 & error handlers
│   ├── models/
│   │   ├── User.js               # User schema & credentials
│   │   └── Property.js           # Property listing schema & indexes
│   ├── routes/
│   │   ├── auth.js               # /api/auth endpoints
│   │   ├── properties.js         # /api/properties endpoints
│   │   ├── admin.js              # /api/admin endpoints
│   │   └── meta.js               # /api/meta metadata endpoints
│   ├── scripts/
│   │   ├── seedDemo.js           # Database seeder (exactly 20 demo listings)
│   │   ├── generateDemoImages.js # SVG illustration generator
│   │   └── createAdmin.js        # Admin account initial provisioning
│   └── utils/
│       ├── locations.js          # Bihar cities, room types, amenities
│       ├── mailer.js             # Nodemailer SMTP transporter & templates
│       └── validators.js         # Input validation helpers
├── tests/
│   └── test-suite.js             # 18 automated verification tests
├── uploads/properties/           # User-uploaded photos (gitignored)
├── DOCUMENTATION/                # Viva questions, ERD & system architecture
│   ├── VIVA_QUESTIONS_AND_ANSWERS.md
│   ├── ARCHITECTURE_AND_DESIGN.md
│   └── FEATURE_LIST_AND_LIMITATIONS.md
├── server.js                     # Express server entry point
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment variables template
└── .gitignore                    # Sensitive file ignore rules
```

---

## 4. Setup & Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or later recommended)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free account (or local MongoDB server)
- A modern web browser (Chrome, Edge, Firefox)

### Step 1: Clone or Open the Workspace
```bash
cd room-finder
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# On Windows PowerShell / CMD:
copy .env.example .env

# On Linux / macOS:
cp .env.example .env
```

Open `.env` in your text editor and ensure the following keys are set:
```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/roomfinder?retryWrites=true&w=majority

# Secret for signing JWT session cookies (use a long random string)
JWT_SECRET=your-random-secure-secret-key-at-least-32-chars

# Port (default 3000)
PORT=3000

# Administrator account credentials (used by npm run create-admin)
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourAdminSecurePassword

# Gmail SMTP Email Configuration (for real 6-digit OTP delivery)
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-16-char-google-app-password
SMTP_FROM="Room Finder Bihar" <your-gmail-address@gmail.com>
```

> **How to create a Google App Password for Gmail SMTP:**
> 1. Go to your [Google Account Security](https://myaccount.google.com/security) and ensure **2-Step Verification** is turned ON.
> 2. Open [Google App Passwords](https://myaccount.google.com/apppasswords).
> 3. Enter an app name (e.g. `RoomFinder`) and click **Create**.
> 4. Copy the generated 16-character code into `SMTP_PASS` in your `.env` file.

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Seed Exactly 20 Demonstration Listings
```bash
npm run seed
```
*This generates 16 local SVG room illustrations and seeds exactly 20 clearly labelled demonstration listings into MongoDB Atlas without duplicates.*

### Step 5: Provision Administrator Account
```bash
npm run create-admin
```
*This creates or updates the administrator account matching `ADMIN_EMAIL` and `ADMIN_PASSWORD`.*

### Step 6: Run Automated Tests
```bash
npm test
```
*Runs the test suite verifying database connectivity, exact 20 demo listings, price/locality search filters, Leaflet coordinates, bcrypt hashing, and owner property lifecycle.*

### Step 7: Start the Server
```bash
npm start
```
*Or for development with automatic restart:*
```bash
npm run dev
```

Open your browser and navigate to:  
👉 **http://localhost:3000**

---

## 5. User Roles & Login Credentials

### 1. Public Visitor / Student
- **Access**: Open **http://localhost:3000** directly.
- **Capabilities**: Browse all accommodations, filter by city or budget, view Leaflet OpenStreetMap markers, copy owner contact numbers.
- **Account**: Register via `/register.html` (select "Student / Tenant").

### 2. Property Owner
- **Access**: Register via `/register.html` (select "Property Owner").
- **Capabilities**: Access `/owner.html`, create listings with up to 4 photos at `/owner-form.html`, edit or delete own listings.
- **Demo Owner Account**:
  - Email: `demo-owner@example.com`
  - Password: `DemoOwner123`

### 3. Administrator
- **Access**: Dedicated login page at **http://localhost:3000/admin-login.html**.
- **Credentials** (from `.env`):
  - Email: `admin@example.com`
  - Password: `ANKIT RAJ PROJECT` (or value set in `.env`)
- **Capabilities**: View dashboard metrics, moderate/remove inappropriate listings, and deactivate user accounts.

---

## 6. Deployment Guide

Room Finder can be deployed to free or low-cost cloud platforms such as **Render**, **Railway**, or **Koyeb**:

1. **Push repository to GitHub**: Ensure `.env` is never committed (protected by `.gitignore`).
2. **Create a Web Service on Render / Railway**:
   - Environment: `Node.js`
   - Build Command: `npm install && npm run seed && npm run create-admin`
   - Start Command: `npm start`
3. **Configure Environment Variables**:
   - Add `MONGODB_URI`, `JWT_SECRET`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
   - Set `COOKIE_SECURE=true` when running on HTTPS.
4. **Persistent Storage Note**:
   - In basic cloud containers, local files in `uploads/` do not persist across redeployments. For persistent production storage, configure cloud object storage (e.g. Cloudinary or AWS S3), or use MongoDB Atlas references.

---

## 7. Viva Voce & Examination Documentation

The project includes dedicated documentation in the `DOCUMENTATION/` directory:

- [VIVA_QUESTIONS_AND_ANSWERS.md](DOCUMENTATION/VIVA_QUESTIONS_AND_ANSWERS.md) — 18+ in-depth viva questions covering full-stack concepts, Express middleware, MongoDB Atlas indexing, Nodemailer SMTP, Bcrypt salt rounds, Leaflet tile layers, JWT cookie security vs localStorage, Multer disk storage, CSP, etc.
- [ARCHITECTURE_AND_DESIGN.md](DOCUMENTATION/ARCHITECTURE_AND_DESIGN.md) — Mermaid architecture diagrams, database ERD, sequence diagram for email OTP verification, and REST API specification.
- [FEATURE_LIST_AND_LIMITATIONS.md](DOCUMENTATION/FEATURE_LIST_AND_LIMITATIONS.md) — Complete checklist of verified features, test logs, and honest scope limitations.

---

## 8. Support & Contact Information

For project evaluations, viva questions, or technical inquiries:

- **Instagram**: [@me_yours_raj](https://www.instagram.com/me_yours_raj/)
- **Email**: [dictatorhitler5@gmail.com](mailto:dictatorhitler5@gmail.com)
- **Platform**: Room Finder Rental Accommodation &bull; Bihar, India

---
&copy; 2026 Room Finder. All rights reserved.
#   r o o m f i n d e r  
 #   r o o m f i n d e r  
 