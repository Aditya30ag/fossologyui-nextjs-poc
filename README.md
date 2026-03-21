# FOSSologyUI Next.js Modernization

Demonstration of the transition of the FOSSology user interface from legacy state management to a modern, scalable Next.js architecture. 

GSoC 2026 acceptance criteria for the project **"Rewrite FOSSology UI using NextJS"**. https://github.com/fossology/fossology/discussions/3267#discussioncomment-15578012

## Purpose of this 
This folder contains a **technical validation** of the proposed tech stack (Next.js, Tailwind CSS, Zustand, and TanStack React Query) working together. 

**What is the objective here?**
This is not a final, fully integrated deliverable with a working UI views. Instead, it is an architectural proof. It validates that the selected technologies can be effectively combined to solve the existing architecture's bottlenecks. It demonstrates:
- **Global State Management:** Using Zustand for centralized authentication state instead of scattered `useState` hooks and prop drilling.
- **Server State & Caching:** Utilizing TanStack React Query to fetch, cache, and synchronize remote API data securely.
- **Secure Authentication Flow:** Robust token injection, automatic token refresh rotation via Axios Interceptors, and robust session handling.
- **Route Protection:** Next.js Middleware protecting key routes (e.g., `/browse`, `/upload`) before any page rendering occurs.

Building the complete, interactive frontend integrated closely with FOSSology's APIs is the primary deliverable of the upcoming GSoC project phase.

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


## Walkthrough

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
## Relevance to GSoC 2026

This demonstration directly addresses the scaling and architectural pain points outlined in my proposal for FOSSologyUI. [GSoC 2026 Discussion](https://github.com/fossology/fossology/discussions/3267#discussioncomment-15578012)
By migrating from heavily scattered local state hooks (currently 260+ instances) to a layered, predictable architecture (Zustand + React Query + Next.js Middleware), the codebase becomes infinitely more scalable, highly performant, and significantly easier for the open-source community to understand and maintain.

---

**Author:** Aditya Agrawal GSoC 2026 applicant, FOSSology project
