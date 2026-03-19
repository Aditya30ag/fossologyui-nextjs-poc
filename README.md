# FOSSologyUI Next.js Modernization PoC

Proof-of-concept demonstrating the transition of the FOSSology user interface from legacy state management to a modern, scalable Next.js architecture. 

GSoC 2026 acceptance criteria PoC for the project **"Rewrite FOSSology UI using NextJS"**. https://github.com/fossology/fossology/discussions/3267#discussioncomment-15578012

## What This Demonstrates

- **Global State Management:** Using Zustand for centralized authentication state instead of scattered `useState` hooks and prop drilling.
- **Server State & Caching:** Utilizing TanStack React Query to fetch, cache, and synchronize remote API data, completely replacing complex local fetching logic.
- **Secure Authentication Flow:** Robust token injection, automatic token refresh rotation via Axios Interceptors, and robust session handling.
- **Server-Side Route Protection:** Next.js Middleware protecting key routes (e.g., `/browse`, `/upload`) before the page even loads.

## Architecture & Data Flow

```text
┌──────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                              │
│                                                                  │
│  ┌───────────────────┐    REST API Request                       │
│  │ UI Component      │ ─────────────────────────────┐            │
│  │ (e.g., Browse)    │                              ▼            │
│  │                   │                 ┌───────────────────────┐ │
│  │ • Renders UI      │                 │  Axios Service        │ │
│  │ • Triggers action │                 │  (Interceptor Layer)  │ │
│  └────────┬──────────┘                 │                       │ │
│           │                            │ • Injects Bearer      │ │
│           │ Accesses State             │ • Handles 401 Reauth  │ │
│           ▼                            └──────────┬────────────┘ │
│  ┌──────────────────┐                             │              │
│  │ State Management │ ◄───────────────────────────┘              │
│  │                  │        Returns Data/Errors                 │
│  │ • TanStack Query │                                            │
│  │ • Zustand (Auth) │                                            │
│  └──────────────────┘                                            │
└──────────────────────────────────────────────────────────────────┘
```

**Key flow:**
1. User logs in. **Zustand** stores the user profile, while an HTTP-only cookie secures the active token.
2. User navigates to a protected route (e.g., `/browse`). **Next.js Middleware** intercepts the request and validates the token on the server before rendering anything.
3. The `BrowseClient` component mounts and uses **TanStack Query** to fetch directory/folder data.
4. The global **Axios Interceptor** automatically attaches the Bearer token to the outgoing request. If the token has expired, it intercepts the 401 block, fetches a new refresh token seamlessly, and safely retries the original request without user interruption.


## Detailed Walkthrough

### 1. Global State ([Zustand](https://zustand-demo.pmnd.rs/))
Located in `store/useAuthStore.ts`.

### 2. API Layer & Interceptors ([Axios](https://axios-http.com/docs/intro))
Located in `api/axios.ts`.

### 3. Route Protection ([Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware))
Located in `middleware.ts`.

### 4. Data Fetching ([TanStack React Query](https://tanstack.com/query/latest/docs/framework/react/overview))
Located in `components/BrowseClientExample.tsx`.

## Project Structure would look like

It i basically a micro-version of what the final production Next.js architecture will look like. 

```text
src/
├── app/                        # Next.js App Router (Pages & Layouts)
│   ├── (auth)/                 # Public routes (Login, Register)
│   ├── browse/                 # Protected: File & Folder navigation
│   ├── upload/                 # Protected: Package uploads
│   └── settings/               # Protected: User & System settings
├── components/                 # Shared Reusable UI Components
│   ├── ui/                     # Base design elements (Buttons, Modals, Toasts)
│   ├── forms/                  # Standardized React Hook Form + Zod templates
│   └── data-tables/            # Reusable TanStack virtualized tables
├── core/                       # Core Business Logic & State
│   ├── api/                    # Typed services targeting BOTH existing backend APIs and new APIs
│   ├── store/                  # Zustand global state (Auth, UI preferences)
│   └── hooks/                  # Custom TanStack Query hooks (e.g., useGetFolders)
├── types/                      # Global TypeScript interfaces matching backend APIs
├── utils/                      # Helper functions and formatters
└── middleware.ts               # Global Next.js request interceptor & route protector
```

## Strategy for Completing the Next.js Migration (Remaining 70-80%)

Since the current UI is only **20-30% complete** compared to the legacy Symfony/Twig interface, tasks is to migrate the remaining 70-80% requires in Next.js, systematic approach:

### 1. The Audit & Mapping Phase (First Weeks)
* **UI Gap Analysis:** I will systematically document all missing legacy workflows and map them strictly to the existing REST API endpoints, immediately flagging any legacy features that do not yet have a matching backend REST API.

### 2. Standardizing the Component & Data Foundation (Early Coding)
* **Base Architecture:** Build the core foundations demonstrated in this PoC first (Zustand Auth Store, Axios Interceptors, Next.js Route Middleware).
* **Component Library:** Finalize a core set of highly reusable UI components (Data Tables, Modals, Breadcrumbs) and standardize all form inputs exclusively using **React Hook Form** + **Zod**.

### 3. Iterative, Feature-Driven Implementation (Weeks 5-10)
Instead of building blindly, the integration will be handled module-by-module, moving from easiest to most complex:
* **Module A (Read-Only Views):** Dashboard, Browse Files, and Package Search. These modules rely heavily on `GET` requests, entirely abstracted using global **TanStack React Query** hooks.
* **Module B (Mutations & Uploads):** Uploads, folder management, and user settings. Utilizing React Query `useMutation` hooks alongside the global Axios error handling.
* **Module C (Core Compliance Tools):** License clearing interfaces, copyright scanners, and reporting tools. These are the heaviest features of FOSSology, requiring **Zustand** to gracefully handle complex local state tracking across massive component trees.

### 4. Continuous Integration & Parity Testing (Weeks 11-12)
* Validate absolute feature and workflow parity against the older Symfony UI manually.
* Implement comprehensive unit and integration tests utilizing **Jest** and **React Testing Library** for all newly migrated components to secure against future regressions.

## Relevance to GSoC 2026

This PoC directly addresses the scaling and architectural pain points outlined in my proposal for FOSSologyUI. [GSoC 2026 Discussion](https://github.com/fossology/fossology/discussions/3267#discussioncomment-15578012)
By migrating from heavily scattered local state hooks (currently 260+ instances) to a layered, predictable architecture (Zustand + React Query + Next.js Middleware), the codebase becomes infinitely more scalable, highly performant, and significantly easier for the open-source community to understand and maintain.

---

**Author:** Aditya Agrawal GSoC 2026 applicant, FOSSology project
