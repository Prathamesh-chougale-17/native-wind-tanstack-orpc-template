# native-wind-tanstack-orpc-template

This project is modern TypeScript monorepo that combines React, Expo (React Native), TanStack Query, ORPC, Hono, Mongoose/MongoDB, and Better-Auth for authentication.

This README has been updated to reflect the new Role-Based Access Control (RBAC) implementation (roles: `user`, `org`, `admin`) and the related API endpoints, data model changes, and developer instructions.

---

## Table of contents

- Features
- Role-Based Access Control (RBAC) — overview
- API / ORPC endpoints (summary)
- Database changes / Models
- Frontend behavior & caching
- Developer setup & scripts
- Testing & verification
- Troubleshooting
- Migration notes
- Security & auditing
- Contributing

---

## Features

- TypeScript across frontend and backend
- Expo / React Native mobile app with TanStack Query for data fetching
- ORPC for type-safe server-client API surface
- Better-Auth for authentication (MongoDB adapter)
- MongoDB via mongoose / raw client helpers
- Role-based access control with middleware: `protectedProcedure`, `orgProcedure`, `adminProcedure`
- Admin panel UI for user & organization management
- TanStack Query cache management and consistent ID mapping fixes for stable navigation

---

## Role-Based Access Control (RBAC) — overview

Roles:
- `user` — default role for most users, minimal permissions
- `org` — organization member; can access organization-specific endpoints and features
- `admin` — global administrator; can manage organizations and other users

How it works:
- Users have `role` and optional `organizationId` fields in the `user` collection.
- `role` is a string enum: `"user" | "org" | "admin"`.
- `organizationId` stores the ID of the organization the user belongs to (if any).
- ORPC procedures are wrapped with middleware:
  - `protectedProcedure` — requires an authenticated user
  - `orgProcedure` — requires an `org` member or `admin`
  - `adminProcedure` — requires `admin` role

Common patterns:
- Admin UIs use TanStack Query keys such as `["admin-users"]` and `["admin-organizations"]`.
- After role/organization changes, backend mutations trigger frontend refetches via query invalidation.

---

## API / ORPC endpoints (summary)

This project exposes the following high-level ORPC routers and handlers. Each router is protected with appropriate middleware.

Admin router (`packages/api/src/routers/admin.ts`)
- `getAllUsers` (admin only)
  - Returns: `{ users: [{ id, name, email, role, organizationId, createdAt, emailVerified }] }`
  - Note: IDs are normalized as `id` (mapped from `user.id` or `user._id` converted to string).
- `updateUserRole` (admin only)
  - Input: `{ userId: string, role: "user" | "org" | "admin" }`
  - Action: sets user's `role` and updates `updatedAt`.
- `assignUserToOrganization` (admin only)
  - Input: `{ userId: string, organizationId: string, role?: "user" | "org" | "admin" }`
  - Action: sets user's `organizationId` and optionally `role`.
- `removeUserFromOrganization` (admin only)
  - Input: `{ userId: string }`
  - Action: clears `organizationId` from user.
- `getAllOrganizations` (admin only)
  - Returns: `{ organizations: [{ id, name, description, createdAt, isActive }] }`
- `createOrganization`, `updateOrganization`, `deleteOrganization` (admin only)
  - Create/update/delete org resources.
- `getOrganizationUsers` (admin only)
  - Input: `{ organizationId: string }`
  - Returns users belonging to an organization; user IDs normalized.

User router (`packages/api/src/routers/user.ts`)
- `getProfile` (authenticated)
  - Returns: `{ user: { id, name, email, role, organizationId, emailVerified, createdAt }, organization?: { id, name, description } | null }`
  - Reads server entry for user role/organization (keeps session and DB in sync).
- `getOrganizations` (authenticated)
  - Returns: list of active organizations for UI selection.
- `getMyOrganization` (authenticated)
  - Returns the current user's organization details if assigned.
- `getOrganizationMembers` (org members or admin)
  - Returns: `{ members: [{ id, name, email, role }] }` — members' IDs are normalized.

Notes:
- All user objects returned by the API include a stable `id` property. This was fixed to avoid `user not found` navigation issues caused by `_id` vs `id` mismatches (the server maps `user.id || user._id?.toString() || user._id`).
- Mutations (role updates, org assignment) invalidate corresponding TanStack Query keys so the UI refreshes.

---

## Database changes / Models

User model expectations (stored in `user` collection):
- `_id` — MongoDB document id (ObjectId or sometimes string)
- `id` (optional) — Better-Auth may surface this; code treats it as optional
- `name` — string
- `email` — string
- `role` — `"user" | "org" | "admin"` (default: `user`)
- `organizationId` — string (optional) — organization `_id` as string
- `createdAt`, `updatedAt`, `emailVerified` — standard fields

Organization model (new / existing):
- `_id` — MongoDB ObjectId
- `name` — string
- `description` — string (optional)
- `createdBy` — user id that created it
- `isActive` — boolean
- `createdAt`, `updatedAt`

Helpers are available in `packages/db/src/models/*`:
- `userHelpers.getUserById`, `getAllUsers`, `updateUserRole`, `assignUserToOrganization`, `getUsersByOrganization`, ...
- `organizationHelpers.getAllOrganizations`, `createOrganization`, `getOrganizationById`, `updateOrganization`, ...

Important: user lookups attempt several strategies: treat `userId` as `_id` string, as an ObjectId, and as `id` field; mutations use `$or` to match any of these forms — this makes the backend resilient to variations in how the ID stored.

---

## Frontend behavior & caching

Key points for the Expo / React Native app:
- The Admin panel lists users and uses `router.push` with `user.id` to navigate to `/(tabs)/admin-panel/users/[id]`.
- Because IDs now always exist in responses as `id` (normalized), navigation and detail lookups are stable.
- TanStack Query keys used:
  - `["admin-users"]` — user list
  - `["admin-organizations"]` — org list
  - `["user-profile"]` — current user profile
- After mutating (e.g. `updateUserRole`), the backend mutation handlers call query invalidation (or the frontend invalidates queries onSuccess) to keep UI in sync.
- Stale caching issues: ensure to clear or refetch relevant queries after role changes. The sign-out flow clears TanStack Query cache to avoid showing stale role-dependent UI.
- UI-only checks:
  - Admin tab visibility depends on the resolved `role` from `user-profile`.
  - Organization-based endpoints are only called if `organizationId` is present.

---

## Developer setup & scripts

Install dependencies:
- `pnpm install`

Environment variables (.env)
- Configure server or apps with these key variables:
  - `MONGODB_URI` — connection string to MongoDB
  - `PORT` — server port (default ports are used by scripts)
  - Any Better-Auth related env vars used by your auth config

Push DB schema (if you have schema push script):
- `pnpm run db:push`

Run development:
- Start all apps: `pnpm run dev`
- Start only server: `pnpm run dev:server`
- Start only native (Expo): `pnpm run dev:native`
- Start only web: `pnpm run dev:web`

Type checking:
- `pnpm run check-types`

Misc:
- `pnpm run db:studio` — open DB studio UI if configured
- `cd apps/web && pnpm run generate-pwa-assets` — web PWA asset generation

---

## Testing & verification

1. Start your development environment (`pnpm run dev` or run server + native separately).
2. Seed or create an admin user in your DB. Ensure the user document has `"role": "admin"` (or use your existing sign-up flow and set role manually for testing).
3. Sign in on the native app (Expo).
   - Confirm `user-profile` query returns role `admin`.
   - Confirm Admin tab is visible when signed in as `admin`.
4. In Admin → Users:
   - Click a user to open their detail page (`/(tabs)/admin-panel/users/[id]`).
   - Change role to `org` or `user`, and save. Confirm the API responded and the UI updates.
5. Create an organization via Admin → Organizations:
   - Assign a user to it. Confirm `organizationId` appears in the user doc and organization members list updates.
6. Sign out, sign in as a non-admin user and verify admin routes are hidden and protected routes return a permission error.

---

## Troubleshooting

- "User not found" in Admin user detail:
  - Caused previously by `id` vs `_id` mismatch. The API now normalizes `id` using `user.id || user._id?.toString() || user._id`. Make sure your backend is rebuilt and running.
- Stale user role in UI:
  - Clear TanStack Query cache or ensure queries are invalidated/refetched after role change. Sign-out flow clears cache by design in this project.
- MongoDB ObjectId formats:
  - Some helpers attempt to convert provided `userId` to an ObjectId. If you see cast errors, ensure the incoming ID string is well-formed or that fallbacks are in place (the project includes such fallbacks).
- Permission / middleware errors:
  - Confirm the session user's `role` is actually set in the DB and sessions are refreshed. If a session contains stale role info, sign out and sign in again.
- Database lookups failing:
  - Confirm `MONGODB_URI` is set and `client` connects successfully. Check logs on the server.

---

## Migration notes

If you have existing users without `role` or `organizationId` fields:
- Default migration: set `role: "user"` for any user without `role`.
- Optionally, populate existing `id` field to stringified `_id` if some clients expect `user.id` present.
- Example migration (run in a safe environment / one-off script):
  - Find all users where `role` is missing and set `role: "user"`.
  - For users without `id`, set `id` to `String(_id)`.

---

## Security & auditing

- Admin operations should be audited. Consider adding an `auditLog` collection that records: who performed the change, what was changed, timestamp, and reason.
- Ensure admin endpoints are only accessible via `adminProcedure` middleware (server-side checks).
- Avoid exposing internal DB-only fields in API responses. Only expose fields necessary for the client.
- Rate limit critical admin endpoints and protect against CSRF where applicable.

---

## Contributing

- Follow the repository's contributing guidelines (if present).
- Run `pnpm run check-types` and test locally (`pnpm run dev`).
- When adding features that touch RBAC, add unit tests and a migration path for existing data.
- If you add new ORPC endpoints, add corresponding TanStack Query query keys and ensure frontend invalidation logic is added in mutations' onSuccess handlers.
