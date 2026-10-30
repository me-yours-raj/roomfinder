# Room Finder — Comprehensive Viva Voce Questions & Answers
**Academic Project:** Diploma in Computer Science & Engineering Minor Project  
**Project Title:** Room Finder — Rental Accommodation Discovery Platform for Bihar  

---

## 1. Project Overview & General Concept

### Q1: What is the main objective of the Room Finder project?
**Answer:**  
Room Finder is a full-stack web application designed to solve the problem of fragmented, unverified, and broker-heavy rental accommodation search across Bihar (particularly in educational and employment centers like Patna, Gaya, Muzaffarpur, Bhagalpur, and Darbhanga).  
It provides:
1. **Public browsing without forced login**: Students and tenants can search rooms by city, locality, room category, and budget.
2. **Role-based user management**: Three distinct roles: Visitor/Student, Property Owner, and Administrator.
3. **Direct owner contact**: Prospective tenants can view and copy the owner's phone number without paying brokerage.
4. **Interactive Leaflet/OpenStreetMap**: Visualizing approximate neighborhood locations for accommodations.
5. **Security & Honest Demonstration**: 20 clearly labelled demonstration listings with masked non-working phone numbers and approximate coordinates to avoid misleading examiners or the public.

---

### Q2: Why did you choose Vanilla HTML5, CSS3, and JavaScript instead of React or Angular?
**Answer:**  
1. **Academic appropriateness**: The diploma syllabus emphasizes fundamental web architecture, the DOM API, HTTP request-response lifecycle, and vanilla JavaScript event handling.
2. **Zero build step & low overhead**: No Webpack, Vite, Babel, or heavy node bundle overhead. Pages load instantly without hydration delays.
3. **Simplicity and maintainability**: Any beginner or junior developer can inspect the `public/` directory and understand how the frontend communicates with Express REST APIs via `fetch`.
4. **Cost & portability**: The lightweight client runs smoothly on any basic mobile device or low-resource system without high RAM usage.

---

### Q3: Why did you use Node.js and Express.js for the backend?
**Answer:**  
1. **Single language full-stack**: JavaScript on both client and server reduces cognitive switching and allows sharing data validation schemas.
2. **Asynchronous event-driven I/O**: Express and Node handle concurrent HTTP requests, photo uploads, database queries, and SMTP email dispatch without blocking the main event thread.
3. **Rich ecosystem**: Mature libraries like `mongoose` for ODM, `bcryptjs` for password hashing, `multer` for multipart form file uploads, `helmet` for security headers, and `nodemailer` for SMTP emails.

---

### Q4: Why did you choose MongoDB Atlas instead of MySQL or PostgreSQL?
**Answer:**  
1. **Flexible schema**: Rental listings vary significantly—some have deposits, some do not; some have 1 photo, others 4; facilities and amenities are arrays of strings; geographic coordinates are nested objects `{ lat, lng }`. Document-based NoSQL is a natural fit for hierarchical property data.
2. **Cloud-hosted free tier**: MongoDB Atlas provides a managed M0 sandbox cluster with automated backups, high availability, and native connection strings without local database installation overhead.
3. **Indexing capabilities**: Mongoose schemas allow compound indexing (e.g. `{ city: 1, locality: 1, monthlyRent: 1, isRemoved: 1 }`) to ensure quick query execution.

---

## 2. Authentication, Security & OTP Workflow

### Q5: How is user authentication implemented?
**Answer:**  
Authentication is built using standard email and password authentication with industry-grade cryptography:
1. **Password Hashing**: Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 12 rounds of salt.
2. **Email Verification via 6-Digit OTP**: Accounts cannot log in until verified by a 6-digit numeric OTP sent via Nodemailer.
3. **Session Management**: Upon successful authentication, a JSON Web Token (JWT) is signed on the server with `JWT_SECRET` and placed into an `httpOnly` cookie (`token`).
4. **HttpOnly Cookies**: By setting `httpOnly: true`, client-side JavaScript cannot access the token via `document.cookie`, mitigating Cross-Site Scripting (XSS) credential theft.

---

### Q6: How does the 6-digit OTP verification work, and why is it stored as a hash?
**Answer:**  
When a user registers or requests a password reset:
1. A cryptographically secure 6-digit number is generated using Node's `crypto.randomInt(100000, 1000000)`.
2. To avoid storing plaintext OTPs in the database, the server hashes the OTP with **SHA-256** (`crypto.createHash("sha256").update(otp).digest("hex")`).
3. The hashed OTP and an expiration timestamp (10 minutes from generation) are saved on the user document.
4. The plaintext OTP is sent to the user's email via SMTP using Nodemailer.
5. When the user submits the code, the server computes the SHA-256 hash of their input and compares it with the database record using `{ email, emailOtp: hashedOtp, emailOtpExpires: { $gt: new Date() } }`.
6. Upon verification, the OTP fields are cleared (`undefined`) so the token cannot be re-used.

---

### Q7: Why do you never log passwords or OTPs to the console?
**Answer:**  
Logging sensitive credentials, tokens, or OTP codes to server terminal logs is a major security vulnerability (CWE-532: Insertion of Sensitive Information into Log File). In shared hosting, CI/CD pipelines, or cloud logging dashboards (e.g., CloudWatch, Papertrail), logs can be viewed by unauthorized staff or stored in unencrypted log aggregators. Room Finder strictly forbids logging sensitive credentials.

---

### Q8: What happens if SMTP is not configured or fails?
**Answer:**  
In accordance with honest software engineering principles:
1. The server checks `mailer.isConfigured()`.
2. If `SMTP_USER` or `SMTP_PASS` is missing in `.env`, the server returns an HTTP 503 Service Unavailable error explaining that SMTP email service is not configured on the server.
3. It does not fake a success message.
4. If SMTP credentials exist but the mail server rejects the connection (e.g., invalid Google App Password or network timeout), the backend returns HTTP 500 with a descriptive error.

---

### Q9: How is Role-Based Access Control (RBAC) enforced?
**Answer:**  
RBAC is enforced on the server through Express middleware (`src/middleware/auth.js`):
1. `requireAuth`: Reads and verifies the JWT cookie. If invalid or missing, rejects with HTTP 401 Unauthorized.
2. `requireRole(role)`: Inspects `req.user.role`. If the user does not have the specified role, returns HTTP 403 Forbidden.
3. Crucially, admin endpoints (`/api/admin/*`) require `requireRole("admin")`.
4. Regular registration endpoints only allow roles `"student"` or `"owner"`. There is no public registration for the `"admin"` role. Admin accounts are initialized strictly through `npm run create-admin` via environment variables.

---

## 3. Database Design & Models

### Q10: What are the primary Mongoose models in this application?
**Answer:**  
Two primary models:
1. **User Model (`src/models/User.js`)**:
   - `name`: String, required.
   - `email`: String, required, unique, lowercase.
   - `passwordHash`: String, select: false (hidden from default queries).
   - `phone`: String, optional Indian mobile number.
   - `role`: Enum `["pending", "student", "owner", "admin"]`.
   - `isActive`: Boolean, default true.
   - `isVerified`: Boolean, default false.
   - `emailOtp`, `emailOtpExpires`: Hashed verification token & expiry.
   - `resetPasswordOtp`, `resetPasswordExpires`: Hashed password reset token & expiry.

2. **Property Model (`src/models/Property.js`)**:
   - `title`: String (5-140 chars).
   - `type`: Enum (`single-room`, `shared-room`, `pg`, `hostel`, `flat`, `1bhk`, `2bhk`, `roommate`).
   - `monthlyRent`: Number, required.
   - `deposit`: Number.
   - `state`: String ("Bihar").
   - `city`, `locality`, `address`: Strings.
   - `location`: `{ lat: Number, lng: Number }` for Leaflet map markers.
   - `photos`: Array of Strings (1-4 paths).
   - `facilities` / `amenities`: Array of Strings.
   - `furnishingStatus`, `foodAvailability`, `bathroomDetails`, `tenantPreference`.
   - `owner`: ObjectId referencing User model.
   - `isDemo`: Boolean (differentiates sample data from real listings).
   - `isRemoved`, `removedReason`: Soft-delete moderation flags.

---

### Q11: How do you handle database indexing?
**Answer:**  
In `Property.js`, we defined compound indexes:
```javascript
propertySchema.index({ city: 1, locality: 1, monthlyRent: 1, type: 1, isRemoved: 1, createdAt: -1 });
propertySchema.index({ owner: 1, createdAt: -1 });
```
This ensures that search queries filtering by location, rent range, room type, and active status run in $O(\log N)$ index scan time instead of a costly full collection scan ($O(N)$).

---

## 4. Map Integration & Leaflet

### Q12: How is the map implemented, and why Leaflet with OpenStreetMap?
**Answer:**  
1. **Leaflet 1.9.4**: An open-source, mobile-friendly JavaScript library for interactive maps.
2. **OpenStreetMap (OSM) Tiles**: Free, community-driven cartographic tile server (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
3. **No Paid API Keys**: Unlike Google Maps JavaScript API, Leaflet + OSM requires no credit card, no billing setup, and no quota restrictions for academic demonstration.
4. **Bundled Assets**: Leaflet JS and CSS are bundled locally in `public/js/leaflet.js` and `public/css/leaflet.css`, ensuring the UI loads without CDN dependencies.
5. **Interactive Marker & Popup**: When a listing has latitude and longitude, Leaflet plots a marker with a clickable popup showing the property title, room type, and monthly rent. External buttons link directly to OpenStreetMap and Google Maps.

---

### Q13: What is the OpenStreetMap Tile Usage Policy, and how does your application comply with it?
**Answer:**  
The OpenStreetMap Foundation (OSMF) maintains a strict Tile Usage Policy because their community-funded servers have finite capacity. Room Finder complies with every requirement:
1. **Canonical HTTPS Endpoint**: We use `https://tile.openstreetmap.org/{z}/{x}/{y}.png` directly. We avoid deprecated round-robin subdomains (`{s}`) since HTTP/2 renders domain sharding obsolete.
2. **Prominent License Attribution**: Every map displays visible credit: `© OpenStreetMap contributors` with an active hyperlink to `https://www.openstreetmap.org/copyright`. Leaflet's attribution control is never hidden or obscured.
3. **Valid HTTP Referer**: OSM requires that web applications send a valid HTTP `Referer` header. We configured Helmet with `referrerPolicy: { policy: "strict-origin-when-cross-origin" }` so browsers transmit our origin to OSM servers without stripping referrer data.
4. **No Bulk Downloading / Offline Scraping**: We do not scrape, cache-bust, or bulk-prefetch tiles.
5. **Max Zoom Level**: Zoom is strictly capped at `maxZoom: 19`, matching OSM's maximum raster rendering depth.
6. **Direct OpenStreetMap Linking**: On listing pages, we provide a direct link to view coordinates on `openstreetmap.org`, promoting the open-source mapping community.

---

### Q14: What precautions are taken regarding demonstration coordinates?
**Answer:**  
Demonstration listings use approximate city or neighborhood coordinates (e.g. Patna Boring Road ~ 25.6139, 85.1186). The UI explicitly displays a disclaimer:
> *"⚠️ Marker shows approximate demonstration position in Patna. Not a surveyed real property."*  
This prevents misleading users or examiners into believing that a sample marker identifies an actual vacant building.

---

## 5. File Uploads & Multer Security

### Q14: How are property photos uploaded and stored?
**Answer:**  
Photos are uploaded using `multer` configured with disk storage:
1. **1 to 4 photos limit**: Enforced on both frontend and backend using `multer({ limits: { files: 4 } }).array("photos", 4)`.
2. **File Size Limit**: Max 2 MB per file.
3. **MIME Type Validation**: Only `image/jpeg`, `image/png`, and `image/webp` are permitted; executable files (.exe, .php, .js) are rejected by `fileFilter`.
4. **Safe Filenames**: Stored as `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`. User-provided filenames are never trusted to prevent Directory Traversal attacks (`../../etc/passwd`).
5. **Disk Unlinking**: When a listing is deleted or existing photos are removed during edit, `fs.unlink` deletes the files from disk to prevent storage leaks.
6. **Live Previews**: The frontend uses `FileReader` and Object URLs to render thumbnail previews with a "✕" remove button before form submission.

---

## 6. HTTP & Web Security

### Q15: What security headers are implemented via Helmet?
**Answer:**  
`helmet` is configured in `server.js` with Content Security Policy (CSP):
- `script-src: ["'self'"]` (prevents malicious inline or external script injection).
- `img-src: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://tile.openstreetmap.org", "https://images.unsplash.com"]` (allows Leaflet map tiles and permitted image assets).
- `connect-src: ["'self'"]` (restricts AJAX/Fetch to the application origin).
- `style-src: ["'self'", "'unsafe-inline'"]`.
- `X-Powered-By` header is disabled via `app.disable("x-powered-by")` to avoid fingerprinting.

---

### Q16: How do you mitigate brute-force attacks?
**Answer:**  
We employ `express-rate-limit` middleware:
1. `authLimiter`: Limits login, registration, and OTP endpoints to 20 requests per 15-minute window per IP.
2. `adminLimiter`: Limits administrator login attempts to 15 requests per 15-minute window.
If exceeded, the server responds with HTTP 429 Too Many Requests.

---

## 7. Demonstration Data & Viva Defense

### Q17: Why did you seed exactly 20 demonstration listings?
**Answer:**  
Per project specifications, exactly 20 demonstration listings were seeded across key cities in Bihar (Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga, Purnia, Begusarai) covering all primary room categories (Single Room, Shared Room, PG, Hostel, Flat, 1BHK, 2BHK, Roommate).  
Every listing features:
- Title prefixed with `[DEMO]`
- Visibly masked non-working phone numbers (`+91 00000 00001 (DEMO ONLY)`)
- Approximate coordinates
- Clear `DEMO LISTING` badges on cards and details pages.

### Q18: How can you verify that the seeding script is repeatable and doesn't duplicate records?
**Answer:**  
In `src/scripts/seedDemo.js`:
1. It executes `Property.deleteMany({ isDemo: true })` prior to insertion.
2. It then inserts the exact 20 array items.
3. Running `npm run seed` 10 times will always result in exactly 20 demo listings in the database.
Real user listings (`isDemo: false`) are preserved and untouched.
