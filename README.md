# Booking API - Unified Authentication

Both roles use the **same two endpoints**:

- `POST /api/auth/register` — creates an admin or customer based on `role`
- `POST /api/auth/login` — logs in either role; role is included in the JWT and response

## Setup

1. Run `npm install`
2. Copy `.env.example` to `.env`
3. Set `MONGO_URI` and a strong `JWT_SECRET`
4. Run `npm run dev`
5. Open `http://localhost:5002/BookingManagementServices`

## Persistent uploads on Render

Render's local filesystem is temporary. To keep uploaded files available after
restarts or deployments:

1. Add a Persistent Disk to the Render web service, mounted at `/var/data`.
2. Set the service environment variable `UPLOADS_DIR` to `/var/data/uploads`.
3. Redeploy the service, then upload the files again. Files uploaded before the
   disk was mounted are not restored automatically.

The upload endpoint saves files to `UPLOADS_DIR`, and `/uploads/<filename>`
serves them from that same directory. If `UPLOADS_DIR` is not set, local
development uses the repository's `uploads/` directory.

## Register customer

```json
{
  "name": "Ankit",
  "email": "ankit@example.com",
  "password": "Password@123",
  "role": "customer"
}
```

## Register admin

```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "Password@123",
  "role": "admin"
}
```

Admin creation is protected by a server-side secret so a public user cannot simply choose `role: admin`.

## Login (same for both)

```json
{
  "email": "ankit@example.com",
  "password": "Password@123"
}
```

The response contains a JWT and `user.role` (`admin` or `customer`).
# bookingManagementServices
