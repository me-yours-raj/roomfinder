# Database and environment setup

## MongoDB Atlas (recommended for this project)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (M0 / free tier is enough).
3. Create a database user (username + password). Do not use special characters that break URIs, or URL-encode the password.
4. Network Access: add your current IP, or `0.0.0.0/0` only for a short local demo.
5. Click **Connect** → **Drivers** → copy the URI.
6. Put it in `.env` as `MONGODB_URI`. Example shape:

```
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/roomfinder?retryWrites=true&w=majority
```

The database name `roomfinder` is created automatically on first write.

## Environment file

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable | Meaning |
| --- | --- |
| MONGODB_URI | Connection string |
| JWT_SECRET | Signing key for login cookies |
| PORT | Default 3000 |
| COOKIE_SECURE | `false` on http://localhost, `true` on HTTPS |
| ADMIN_* | Used only by `npm run create-admin` |
| DEMO_OWNER_* | Used only by `npm run seed` |

## Image storage

Development: files are saved under `uploads/properties/` and served at `/uploads/properties/...`.

Production: many hosts use ephemeral disks. For a real deployment, store images on a persistent volume or an object store (S3, Cloudinary) and save only the URL in MongoDB. Do not store large image binaries inside ordinary listing documents.

## Packaging source for submission

Zip the project **without**:

- `node_modules/`
- `.env` (include `.env.example` instead)
- files inside `uploads/properties/` except `.gitkeep`

Teachers can run `npm install` from `package.json`.
