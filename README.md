# Native Wind — RBAC App Template

A concise, user-friendly overview of the app: what it does, the key features, the technology stacks that power it, and a simple architecture diagram.

---

## What this app does (short)

This template demonstrates role-based access control (RBAC) across a cross-platform app. It supports three roles:

- `user` — regular user features
- `org` — organization member (access to org data)
- `admin` — global administrator (manage orgs and users)

The app includes a polished UI that adapts based on the signed-in user's role, an Admin panel for organization/user management, and secure authentication.

---

## Key features (for non-technical audiences)

- Role-aware navigation: users only see screens and actions allowed for their role.
- Organization management: admins can create and edit organizations and assign users to them.
- User management: admins can view all users and change roles.
- Consistent user identity: profile links and user pages work reliably across the app.
- Cross-platform UI: mobile (Expo / React Native) and web with a consistent look-and-feel.

---

## Technology stack (short)

- Frontend: Expo (React Native) for mobile; React for web  
- Data fetching & caching: TanStack Query (React Query) on the client  
- API: ORPC (type-safe API surface) served by a lightweight server  
- Authentication: Better-Auth (session-based auth with MongoDB adapter)  
- Database: MongoDB (document store) with helper utilities  
- Monorepo tooling: pnpm

---

## Roles and what they can do (user-friendly)

- user
  - Default role for most users.
  - Use the application features available to individual users.

- org
  - Member of one organization.
  - Can access organization-only screens and view other org members.

- admin
  - Global administrator with the ability to:
    - Create, update, and delete organizations.
    - View all users and change their roles.
    - Assign or remove users from organizations.

---

## Simple architecture diagram (Mermaid)

Below is a simplified diagram showing how the main pieces interact. If your viewer supports Mermaid (GitHub, Mermaid Live Editor, Obsidian, etc.), paste the block below into it or view this README in a Mermaid-enabled renderer.

```mermaid
flowchart LR
  subgraph Clients["Clients"]
    Web["Web UI"]
    Mobile["Mobile (Expo)"]
  end

  Web -->|oRPC / HTTP| ClientSDK["oRPC Client"]
  Mobile -->|oRPC / HTTP| ClientSDK

  ClientSDK -->|type-safe calls| Server["Server (API & ORPC routers)"]

  Server --> Auth["Auth (Better-Auth sessions)"]
  Server --> DB["MongoDB"]
  DB --> Models["Models: User & Organization helpers"]

  Server -->|invalidate / refetch| Cache["TanStack Query cache"]
  ClientSDK --> Cache

  AdminUI["Admin Panel"] -->|manage users / orgs| Server
  ClientSDK -->|requests| AdminUI

  %% Notes for clarity
  note right of Server
    Middleware enforces role checks:
    - protectedProcedure (authenticated)
    - orgProcedure (org OR admin)
    - adminProcedure (admin only)
  end

  note right of Auth
    Sessions contain:
    - user id
    - role (user | org | admin)
    - optional organizationId
  end

  %% Optional style hints (some renderers honor these)
  classDef clients fill:#f8fafc,stroke:#0f172a,color:#0f172a;
  classDef server fill:#eef2ff,stroke:#3730a3,color:#0f172a;
  classDef db fill:#ecfccb,stroke:#365314,color:#0f172a;
  classDef auth fill:#fde68a,stroke:#92400e,color:#0f172a;
  classDef cache fill:#fff7ed,stroke:#9a3412,color:#0f172a;

  class Clients clients;
  class Server server;
  class DB db;
  class Auth auth;
  class Cache cache;
```

---

## Quick demo notes (for product / design reviewers)

- Ask a developer to sign you in as an `admin` user to see the Admin panel.
- As `admin` you can create organizations and assign users.
- Sign in as an `org` user to see organization-specific views and teammates.
- As a `user` you see only personal features.

---

If you'd like, I can produce:
- A printable one-page PDF of this overview
- A role-by-role walkthrough with annotated screenshots
- A short demo script with test account examples

Which would you prefer next?