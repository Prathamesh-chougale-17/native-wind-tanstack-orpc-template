# Native Wind — RBAC App Template

A concise, cross-platform template showcasing Role-Based Access Control (RBAC) with three roles: `user`, `org`, and `admin`.  
Designed for product folks and general users who want a clear overview of what the app does and the core technologies powering it.

---

## What this app provides (user-facing)

- Role-aware experiences:
  - user — regular app features
  - org — organization member access and team views
  - admin — global management: create organizations, manage users and roles
- Cross-platform UI: mobile (Expo / React Native) and web
- Admin panel to manage organizations and users
- Secure sign-in and session management
- Fast, responsive UI with consistent identity and navigation links

---

## Key features (at a glance)

- Role-specific navigation and content
- Organization membership and team listing
- Admin tools: create/edit/delete organizations, change user roles, assign users to orgs
- Stable user IDs and linkable profiles (fixes _id_ vs _id_ mismatches)
- Responsive UI with client-side caching for performance

---

## Technology stack (summary)

- Frontend: Expo (React Native) + React (web)
- Data fetching & cache: TanStack Query (React Query)
- API: oRPC (type-safe API surface) on a lightweight server
- Authentication: Better-Auth (MongoDB adapter)
- Database: MongoDB with Mongoose + helper layer
- Monorepo tooling: pnpm-style structure

---

## Roles — who can do what

- user
  - Default; regular app capabilities
- org
  - Member of an organization; can view org details and members
- admin
  - Global management: organizations + users + role assignments

---

## Simple architecture diagram (Mermaid)

Below is a simplified diagram showing how the main pieces interact. (If your viewer supports Mermaid, paste this section into a Mermaid-enabled renderer.)

flowchart LR
  subgraph Clients
    Web[Web UI]
    Mobile[Mobile {Expo}]
  end

  Web & Mobile -->|oRPC / HTTP| ClientSDK[oRPC client]
  ClientSDK -->|type-safe calls| Server[Server {ORPC routers}]
  Server --> Auth[Better-Auth {sessions}]
  Server --> DB[MongoDB]
  DB --> Models[User & Organization helpers]
  Server -->|invalidate/refetch| Cache[TanStack Query cache]
  AdminUI[Admin Panel] --- Server

  note right of Server: Middleware enforces roles: protected / org / admin
  note right of Auth: User object includes role and optional organizationId

---

## Quick non-technical start

- Mobile: open via Expo Go (ask a developer to run the dev server and share the QR).
- Web: open the hosted URL or run the web server locally.
- Admin demo: sign in with an `admin` account and open the Admin panel to manage orgs and users.
