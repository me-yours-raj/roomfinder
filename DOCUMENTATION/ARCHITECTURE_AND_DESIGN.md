# Room Finder — Architecture, Design & Data Flow Specification

This document details the system design, database models, security architecture, and REST API specification for **Room Finder Bihar**.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Tier (Browser)"]
        UI["HTML5 + CSS3 + Vanilla JavaScript"]
        LeafletLib["Leaflet 1.9.4 Map Engine"]
        Storage["httpOnly Cookies (JWT Session)"]
    end

    subgraph ServerTier ["Application Tier (Node.js & Express)"]
        App["Express.js App (server.js)"]
        Security["Helmet CSP & Rate Limiters"]
        AuthMid["JWT & RBAC Middleware"]
        UploadMid["Multer File Upload Middleware"]
        Controllers["Auth, Property & Admin Controllers"]
        MailerUtil["Nodemailer SMTP Service"]
    end

    subgraph DataTier ["Data & External Services Tier"]
        MongoDB[("MongoDB Atlas (Mongoose ODM)")]
        LocalUploads[("Disk Storage (uploads/properties/)")]
        OSM["OpenStreetMap Tile Servers"]
        SMTPGateway["Gmail / SMTP Server"]
    end

    UI -->|HTTP / Fetch Requests| Security
    Security --> App
    App --> AuthMid
    App --> UploadMid
    AuthMid --> Controllers
    UploadMid --> Controllers
    Controllers -->|Queries & Updates| MongoDB
    UploadMid -->|Stores JPEGs / PNGs| LocalUploads
    Controllers -->|Dispatches 6-Digit OTP| MailerUtil
    MailerUtil -->|SMTP :465 / :587| SMTPGateway
    LeafletLib -->|Map Tile Requests| OSM
```

---

## 2. Database Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ PROPERTY : "owns / publishes"

    USER {
        ObjectId _id PK
        string name "User full name"
        string email "Unique lowercase email"
        string passwordHash "Bcrypt salt 12 hash"
        string phone "10-digit mobile number"
        string role "pending | student | owner | admin"
        boolean isActive "Default: true"
        boolean isVerified "Default: false"
        string emailOtp "SHA-256 hashed OTP"
        date emailOtpExpires "10-minute expiry"
        string resetPasswordOtp "SHA-256 hashed OTP"
        date resetPasswordExpires "10-minute expiry"
        date createdAt
        date updatedAt
    }

    PROPERTY {
        ObjectId _id PK
        string title "5-140 chars"
        string type "single-room | shared-room | pg | hostel | flat | 1bhk | 2bhk | roommate"
        number monthlyRent "INR per month"
        number deposit "Security deposit"
        string state "Default: Bihar"
        string city "District or town"
        string locality "Neighborhood"
        string address "Street address"
        object location "{ lat: Number, lng: Number }"
        string description "Detailed description"
        stringArray facilities "WiFi, AC, Attached Bath..."
        string furnishingStatus "Furnished | Semi-Furnished | Unfurnished"
        string foodAvailability "None | Mess Included | Self Cooking..."
        string bathroomDetails "Attached | Shared"
        string tenantPreference "Any | Boys | Girls | Family..."
        date availabilityDate "Available from"
        string occupancy "Single | 2 sharing..."
        stringArray photos "1-4 photograph paths"
        string contactNumber "Owner phone number"
        string contactEmail "Owner contact email"
        string ownerName "Owner display name"
        ObjectId owner FK "References USER._id"
        boolean isDemo "true for sample listings"
        boolean isPublished "Default: true"
        boolean isRemoved "Soft-delete flag"
        string removedReason "Admin moderation note"
        date createdAt
        date updatedAt
    }
```

---

## 3. Email OTP Verification Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Student / Owner
    participant Client as Frontend (register.html / JS)
    participant Server as Express Server (authController)
    participant SMTP as Nodemailer SMTP
    participant DB as MongoDB Atlas

    User->>Client: Fills registration form & submits
    Client->>Server: POST /api/auth/register
    Server->>Server: Validates fields & generates 6-digit OTP
    Server->>Server: Computes SHA-256 hash of OTP
    Server->>DB: Stores User { isVerified: false, emailOtp: hashedOtp, expiry: +10m }
    Server->>SMTP: Dispatches email with plaintext OTP
    SMTP-->>User: Delivers email with 6-digit OTP code
    Server-->>Client: HTTP 201 { requireOtp: true, email }
    Client->>Client: Switches to Step 2 OTP entry form
    User->>Client: Enters 6-digit code
    Client->>Server: POST /api/auth/verify-registration-otp { email, otp }
    Server->>Server: Computes SHA-256 hash of entered code
    Server->>DB: Queries user matching email, hashed OTP & non-expired time
    Server->>DB: Updates user { isVerified: true, emailOtp: null, emailOtpExpires: null }
    Server->>Client: Sets httpOnly JWT cookie & returns HTTP 200 { user }
    Client->>User: Redirects to dashboard based on role
```

---

## 4. REST API Specification

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/api/auth/register` | `POST` | Public (Rate-limited) | Validates input, creates unverified user, sends 6-digit OTP |
| `/api/auth/verify-registration-otp` | `POST` | Public (Rate-limited) | Verifies 6-digit OTP, activates account, issues JWT cookie |
| `/api/auth/resend-registration-otp` | `POST` | Public (Rate-limited) | Resends fresh 6-digit OTP code |
| `/api/auth/login` | `POST` | Public (Rate-limited) | Verifies email & password; sets httpOnly JWT cookie |
| `/api/auth/logout` | `POST` | Authenticated | Clears JWT session cookie |
| `/api/auth/me` | `GET` | Optional Auth | Returns current authenticated user profile |
| `/api/auth/select-role` | `POST` | Authenticated | Updates user role between student and owner |
| `/api/auth/profile` | `PUT` | Authenticated | Updates name and phone number |
| `/api/auth/forgot-password` | `POST` | Public (Rate-limited) | Sends 6-digit password reset OTP to user email |
| `/api/auth/reset-password` | `POST` | Public (Rate-limited) | Verifies OTP and updates user password |
| `/api/properties` | `GET` | Public | Search listings with filters (city, locality, type, rent, sort) |
| `/api/properties/:id` | `GET` | Public | Returns comprehensive details of a listing |
| `/api/properties/mine` | `GET` | Owner only | Returns listings owned by current authenticated owner |
| `/api/properties` | `POST` | Owner only | Creates a new property listing with 1-4 photo uploads |
| `/api/properties/:id` | `PUT` | Owner only | Updates owner's listing and photos |
| `/api/properties/:id` | `DELETE` | Owner only | Deletes owner's listing and unlinks photos from disk |
| `/api/meta/locations` | `GET` | Public | Returns popular Bihar cities and localities |
| `/api/meta/options` | `GET` | Public | Returns room types, amenities, and specification enums |
| `/api/admin/login` | `POST` | Public (Rate-limited) | Dedicated administrator authentication |
| `/api/admin/stats` | `GET` | Admin only | Dashboard metrics (total users, owners, listings, removed) |
| `/api/admin/users` | `GET` | Admin only | Returns registered user accounts |
| `/api/admin/users/:id/active`| `PATCH` | Admin only | Deactivates or reactivates a user account |
| `/api/admin/listings` | `GET` | Admin only | Returns all listings including removed items |
| `/api/admin/listings/:id/remove` | `POST` | Admin only | Moderates / takes down a listing with a reason |
| `/api/admin/listings/:id/restore`| `POST` | Admin only | Restores a moderated listing |
| `/api/admin/listings/:id` | `DELETE` | Admin only | Permanently deletes a listing and its files |

---

## 5. Role-Based Access Control Matrix

| Feature / Action | Visitor | Student / Tenant | Property Owner | Administrator |
|---|:---:|:---:|:---:|:---:|
| Search & Browse Listings | Yes | Yes | Yes | Yes |
| View Room Details & Map | Yes | Yes | Yes | Yes |
| Copy Owner Contact Number | Yes | Yes | Yes | Yes |
| Account Registration & Login | Yes | Yes | Yes | Dedicated |
| Update Profile & Mobile Number | No | Yes | Yes | No |
| Post New Property Listings | No | No | Yes | No |
| Edit / Delete Own Listings | No | No | Yes | No |
| Moderate Any Listing | No | No | No | Yes |
| Deactivate User Accounts | No | No | No | Yes |
| View System Dashboard Metrics | No | No | No | Yes |
