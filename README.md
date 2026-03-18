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

## Repository Structure

```text
proof_of_concept/
├── README.md                                # This file
├── store/
│   └── useAuthStore.ts                      # Zustand global auth store
├── api/
│   ├── axios.ts                             # Axios client & token interceptors
│   └── folderService.ts                     # Typesafe abstraction for existing REST APIs
├── middleware.ts                            # Next.js server-side route protection
└── components/
    └── BrowseClientExample.tsx              # Example TanStack Query implementation
```

## Detailed Walkthrough

### 1. Global State ([Zustand](https://zustand-demo.pmnd.rs/))
Located in `store/useAuthStore.ts`. Demonstrates centralized state management for authentication. This eliminates prop drilling, local component bloat, and allows different parts of the UI to easily subscribe to the user's authentication state without passing props through multiple hierarchies.

### 2. API Layer & Interceptors ([Axios](https://axios-http.com/docs/intro))
Located in `api/axios.ts`. Centralizes token injection via HTTP headers and manages automatic token rotation. Instead of handling 401 errors manually in every single component, the interceptor refreshes the token in the background and replays the failed request seamlessly, drastically improving the User Experience.

### 3. Route Protection ([Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware))
Located in `middleware.ts`. Provides server-side protection to key user routes. This is a massive upgrade over purely client-side redirects (like `window.location.href = '/'`). By validating sessions at the Edge/Server logic layer, we heavily increase security and entirely eliminate unauthorized page flashing.

### 4. Data Fetching ([TanStack React Query](https://tanstack.com/query/latest/docs/framework/react/overview))
Located in `components/BrowseClientExample.tsx`. Replaces complex, locally managed state setups (`useState`, `useEffect`, `setLoading`, `setError`) with a streamlined hook that fetches remote API data natively. It handles loading skeletons, error boundaries, data synchronization, background refetching, and caching out of the box.

## Relevance to GSoC 2026

This PoC directly addresses the scaling and architectural pain points outlined in my proposal for FOSSologyUI. 
By migrating from heavily scattered local state hooks (currently 260+ instances) to a layered, predictable architecture (Zustand + React Query + Next.js Middleware), the codebase becomes infinitely more scalable, highly performant, and significantly easier for the open-source community to understand and maintain.

---

**Author:** Aditya Agrawal — GSoC 2026 applicant, FOSSology project
