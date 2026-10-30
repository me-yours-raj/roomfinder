# Room Finder API

All JSON APIs are under `/api`. Session: JWT in httpOnly cookie `rf_token`. Send cookies automatically with `credentials: 'same-origin'` from the same site.

## Public

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/properties` | List public listings. Query: `city`, `locality`, `minRent`, `maxRent`, `latest=1` |
| GET | `/api/properties/:id` | Listing details (hidden if admin-removed, unless owner/admin) |
| GET | `/api/meta/locations` | Popular Bihar cities (UI helper; schema still uses free-text city/locality) |
| GET | `/api/meta/options` | Room types and facilities |

## Authentication & 6-Digit OTP Management

Rate limited: 20 requests / 15 minutes for auth endpoints.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account and send 6-digit verification OTP via Gmail SMTP. Body: `name`, `email`, `password`, optional `phone` |
| POST | `/api/auth/verify-registration-otp` | Verify 6-digit registration OTP, activate account, establish session. Body: `{ email, otp }` |
| POST | `/api/auth/resend-registration-otp` | Resend fresh 6-digit verification OTP. Body: `{ email }` |
| POST | `/api/auth/login` | User/owner login (admins are rejected here; unverified users prompted for OTP) |
| POST | `/api/auth/logout` | Clear session cookie |
| POST | `/api/auth/forgot-password` | Send 6-digit password reset OTP to Gmail. Body: `{ email }` |
| POST | `/api/auth/reset-password` | Verify 6-digit OTP and reset password. Body: `{ email, otp, password }` |
| GET | `/api/auth/me` | Current user or `{ user: null }` |
| POST | `/api/auth/select-role` | Body `{ role: "student" \| "owner" }` — only from pending |
| PUT | `/api/auth/profile` | Update name and phone |

## Owner (role `owner`)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/properties/mine` | Current owner's listings |
| POST | `/api/properties` | Create listing (`multipart/form-data`, field `photos`, 1–4 files) |
| PUT | `/api/properties/:id` | Update own listing (optional new `photos`, `keepPhotos`) |
| DELETE | `/api/properties/:id` | Delete own listing |

## Admin

Rate limited admin login: 15 / 15 minutes.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/admin/login` | Admin-only login |
| GET | `/api/admin/stats` | Counts |
| GET | `/api/admin/users` | Non-admin users |
| PATCH | `/api/admin/users/:id/active` | Body `{ isActive: true\|false }` |
| GET | `/api/admin/listings` | All listings including removed |
| POST | `/api/admin/listings/:id/remove` | Hide from public |
| POST | `/api/admin/listings/:id/restore` | Restore |
| DELETE | `/api/admin/listings/:id` | Permanent delete |

Admin routes except login require a valid admin JWT. There is no public admin registration.
