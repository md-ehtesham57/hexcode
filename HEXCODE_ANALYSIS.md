# HexCode — Full Project Analysis

A LeetCode-style coding platform where users solve programming problems with code execution via Judge0, OAuth authentication, problem management, and progress tracking.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Backend Analysis](#backend-analysis)
   - [Stack & Dependencies](#backend-stack)
   - [Directory Structure](#backend-directory-structure)
   - [Database Schema](#database-schema)
   - [API Routes](#api-routes)
   - [Controllers Deep Dive](#controllers-deep-dive)
   - [Middleware](#middleware)
   - [Libraries](#libraries)
   - [Backend Bugs & Issues](#backend-bugs--issues)
3. [Frontend Analysis](#frontend-analysis)
   - [Stack & Dependencies](#frontend-stack)
   - [Directory Structure](#frontend-directory-structure)
   - [Architecture Flow](#frontend-architecture-flow)
   - [Zustand Stores](#zustand-stores)
   - [Components](#components)
   - [Pages](#pages)
   - [Frontend Bugs & Issues](#frontend-bugs--issues)
4. [End-to-End Flow](#end-to-end-flow-solving-a-problem)
5. [Languages Supported](#languages-supported)

---

## Project Overview

| Aspect | Detail |
|--------|--------|
| **Project Name** | HexCode |
| **Type** | LeetCode-style coding challenge platform |
| **Monorepo** | No — two separate workspaces: `backend/` and `frontend/` |
| **Package Manager** | npm (both workspaces have `package-lock.json`) |
| **Module System** | ESM (`"type": "module"` in both) |

---

## Backend Analysis

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express** | ^5.2.1 | Web framework (latest Express 5) |
| **Prisma** | ^5.22.0 | ORM + migrations |
| **PostgreSQL** | — | Database (port 15432) |
| **JWT** | ^9.0.3 | Access (15min) + Refresh (7d) tokens |
| **bcryptjs** | ^3.0.3 | Password hashing (12 rounds) |
| **Passport.js** | ^0.7.0 | OAuth framework |
| **passport-google-oauth20** | ^2.0.0 | Google OAuth strategy |
| **passport-github2** | ^0.1.12 | GitHub OAuth strategy |
| **Zod** | ^4.3.6 | Request validation |
| **Judge0** | — | Code execution API (localhost:2358) |
| **axios** | 1.14.0 (forced via overrides) | HTTP client for Judge0 calls |
| **express-rate-limit** | ^8.3.2 | Rate limiting |
| **cookie-parser** | ^1.4.7 | Cookie parsing for refresh tokens |
| **dotenv** | ^17.3.1 | Environment variables |
| **nodemon** | ^3.1.14 | Dev auto-restart (in `dependencies`) |

**Unused dependencies:** `cookieparser` (typo of cookie-parser), `postgres` (raw driver — Prisma is used instead)

### Backend Directory Structure

```
backend/
├── .env                          # Environment variables (real secrets on disk)
├── .env.example                  # Template for env vars (git-tracked)
├── .gitignore
├── package.json
├── package-lock.json
├── prisma/
│   ├── schema.prisma             # 7 models, 2 enums
│   └── migrations/
│       ├── 20260224062249_usermodel_added/       # Initial User table
│       ├── 20260228085421_problem_model/         # Problem model
│       ├── 20260329060211_port_15432/            # Renamed tag→tags, example→examples
│       ├── 20260402072425_sessions/              # Submission, TestCaseResult, ProblemSolved, Playlist, ProblemInPlaylist, Session
│       ├── 20260403053529_v1/                    # Added jti to Session (token rotation)
│       ├── 20260404062553_add_oauth_fields/      # provider, providerId, nullable password
│       ├── 20260404083436_add_user_ban/          # isBanned column
│       ├── 20260412055721_add_social_links/      # github, website columns
│       └── migration_lock.toml
└── src/
    ├── index.js                  # Express app entry, CORS, route mounting
    ├── config/
    │   └── passport.js           # Google + GitHub OAuth strategy config
    ├── controllers/
    │   ├── auth.controller.js    # register, login, logout, refresh, check, updateProfile, changePassword
    │   ├── executeCode.controller.js  # Judge0 batch submission + polling + DB storage
    │   ├── playlist.controller.js     # CRUD + add/remove problems
    │   ├── problem.controller.js      # CRUD + reference solution validation via Judge0
    │   └── submission.controller.js   # List submissions + count
    ├── generated/prisma/         # Prisma client (gitignored, regenerated)
    ├── libs/
    │   ├── db.js                 # Prisma client singleton
    │   └── judge0.lib.js         # Judge0 API wrapper (batch submit + poll + language maps)
    ├── middleware/
    │   ├── auth.middleware.js     # JWT verification + admin check
    │   └── auth.rateLimit.js     # Rate limiters (auth + general API)
    ├── routes/
    │   ├── auth.routes.js
    │   ├── executeCode.routes.js
    │   ├── playlist.routes.js
    │   ├── problem.routes.js
    │   └── submission.routes.js
    └── validators/
        └── auth.validator.js     # Zod schemas for register + login
```

### Database Schema

#### Enums

**`UserRole`** — `ADMIN`, `USER`

**`Difficulty`** — `EASY`, `MEDIUM`, `HARD`

#### Models

##### User

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| name | String? | Nullable |
| email | String | `@unique` |
| password | String? | Nullable — null for OAuth users |
| provider | String? | "LOCAL", "GOOGLE", "GITHUB" |
| providerId | String? | OAuth provider's user ID |
| image | String? | Profile picture URL |
| role | UserRole | Defaults to USER |
| isBanned | Boolean | Defaults to false |
| github | String? | GitHub profile URL (added in migration 8) |
| website | String? | Personal website URL |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: `problems[]`, `submission[]`, `probelemSolved[]` (typo), `playlists[]`, `session[]`

##### Problem

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| title | String | |
| description | String | |
| difficulty | Difficulty | EASY/MEDIUM/HARD |
| userId | String | FK to User (creator) |
| constraints | String | |
| hints | String? | Optional |
| editorial | String? | Optional |
| testcases | Json | Array of `{input, output}` |
| codeSnippets | Json | Per-language starter code |
| referenceSolutions | Json | Per-language reference solution |
| examples | Json | Per-language example with explanation |
| tags | String[] | PostgreSQL array |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

Relations: User (creator), Submission[], solvedBy (ProblemSolved[])

##### Submission

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| userId | String | FK to User |
| problemId | String | FK to Problem |
| sourceCode | String | |
| language | String | |
| stdin | Json | Array of inputs |
| stdout | Json | Array of outputs |
| stderr | String? | |
| compile_output | String? | |
| status | String | "Accepted" or "Wrong Answer" |
| memory | String | KB-formatted |
| time | String | Seconds-formatted |
| createdAt | DateTime | Auto |

Relations: User, Problem, TestCaseResult[]

##### TestCaseResult

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| submissionId | String | FK to Submission |
| input | String | |
| output | String | Actual stdout |
| expected_output | String | |
| stdout | String? | |
| stderr | String? | |
| status | String | Pass/fail status |
| memory | String | KB |
| time | String | Seconds |

`@@index([submissionId])` for query optimization

##### ProblemSolved

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| userId | String | FK to User |
| problemId | String | FK to Problem |
| createdAt | DateTime | Auto |

`@@unique([userId, problemId])` — one solved record per user/problem pair

##### Playlist

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| name | String | |
| description | String? | |
| userId | String | FK to User |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

`@@unique([name, userId])` — each user must have unique playlist names

##### ProblemInPlaylist

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| playListId | String | FK to Playlist (note capital L) |
| problemId | String | FK to Problem |
| createdAt | DateTime | Auto |

`@@unique([playListId, problemId])`

##### Session

| Field | Type | Notes |
|-------|------|-------|
| id | String (UUID) | Primary key |
| userId | String | FK to User |
| jti | String | `@unique` — JWT ID for token rotation |
| refreshToken | String | bcrypt-hashed |
| expiresAt | DateTime | Server-side expiry |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### API Routes

All routes are mounted under `/api/v1`.

#### Auth Routes (`/auth`)

| Method | Path | Middleware | Handler | Notes |
|--------|------|-----------|---------|-------|
| POST | `/register` | authLimiter | register | Zod validated, creates LOCAL user |
| POST | `/login` | authLimiter | login | Password compare, creates session |
| PUT | `/update-profile` | authMiddleware | updateProfile | Updates github, website, image |
| PUT | `/change-password` | authMiddleware | changePassword | Old + new password |
| GET | `/google` | passport.authenticate | — | Google OAuth redirect |
| GET | `/google/callback` | passport.authenticate | — | Sets cookie, redirects to frontend |
| GET | `/github` | passport.authenticate | — | GitHub OAuth redirect |
| GET | `/github/callback` | passport.authenticate | — | Sets cookie, redirects to frontend |
| POST | `/logout` | authMiddleware | logout | Deletes all sessions |
| GET | `/check` | authMiddleware | check | Returns current user |
| POST | `/refresh` | authLimiter | refresh | Token rotation with new JTI |
| POST | `/ban/:userId` | **NONE** | — | Temp route — NO AUTH GUARD |
| POST | `/unban/:userId` | **NONE** | — | Temp route — NO AUTH GUARD |

#### Problem Routes (`/problems`)

| Method | Path | Middleware | Handler | Notes |
|--------|------|-----------|---------|-------|
| POST | `/create-problem` | authMiddleware, checkAdmin | createProblem | Validates ref solutions via Judge0 first |
| GET | `/get-all-problems` | authMiddleware | getAllProblems | Returns all problems |
| GET | `/get-problem/:id` | authMiddleware | getProblemById | Single problem with all fields |
| PUT | `/update-problem/:id` | authMiddleware, checkAdmin | updateProblemById | **Bug: Number(id) on UUID → NaN** |
| DELETE | `/delete-problem/:id` | authMiddleware, checkAdmin | deleteProblem | Handles P2025 |
| GET | `/get-solved-problems` | authMiddleware | getAllProblemsSolvedByUser | User's solved problems |

#### Execute Code Routes (`/execute-code`)

| Method | Path | Middleware | Handler | Notes |
|--------|------|-----------|---------|-------|
| POST | `/` | authMiddleware | executeCode | Batch submit to Judge0 → poll → compare → store |

#### Submission Routes (`/submission`)

| Method | Path | Middleware | Handler | Notes |
|--------|------|-----------|---------|-------|
| POST | `/create` | authMiddleware | createSubmission | Manual submission create |
| GET | `/get-all-submissions` | authMiddleware | getAllSubmission | User's all submissions, most recent first |
| GET | `/get-submission/:problemId` | authMiddleware | getSubmissionsForProblem | Per-user per-problem |
| GET | `/get-submissions-count/:problemId` | authMiddleware | getAllTheSubmissionsForProblem | Count only (not user-specific) |

#### Playlist Routes (`/playlist`)

| Method | Path | Middleware | Handler | Notes |
|--------|------|-----------|---------|-------|
| GET | `/` | authMiddleware | getPlayAllListDetails | All user playlists with problems |
| GET | `/:playlistId` | authMiddleware | getPlayListDetails | Single playlist |
| POST | `/create-playlist` | authMiddleware | createPlayList | Name + description |
| POST | `/:playlistId/add-problem` | authMiddleware | addProblemToPlaylist | Accepts `problemIds[]` |
| DELETE | `/:playlistId` | authMiddleware | deletePlayList | Delete playlist |
| DELETE | `/:playlistId/remove-problem` | authMiddleware | removeProblemFromPlaylist | Accepts `problemIds[]`, deleteMany with `in` |

### Controllers Deep Dive

#### `auth.controller.js` — 7 Exports

**`register`**
- Validates body with `registerSchema` (Zod)
- Checks for existing LOCAL user with same email (409 if exists)
- Hashes password (bcrypt, 12 rounds)
- Creates user with `provider: "LOCAL"`, `role: UserRole.USER`
- Generates access token (15min) and refresh token (7d) with random UUID as JTI
- Creates Session record with bcrypt-hashed refresh token
- Sets `refreshToken` as httpOnly cookie (7 days)
- Returns 201 with `{user, accessToken}`

**`login`**
- Validates with `loginSchema`
- Finds LOCAL user by email
- Checks ban, existence, and that user registered via LOCAL provider
- Compares password with bcrypt
- Generates tokens, creates session, sets cookie
- Returns 200 with user data and accessToken

**`updateProfile`**
- Updates `github`, `website`, `image` fields only
- Uses req.user.id from auth middleware
- Returns updated user

**`logout`**
- Deletes ALL sessions for the authenticated user (bulk deleteMany)
- Clears refreshToken cookie
- Returns 200

**`check`**
- Returns authenticated user's profile: id, email, name, role, image, github, website, createdAt

**`refresh`**
- Reads `refreshToken` from cookie
- Verifies JWT with JWT_REFRESH_SECRET
- Looks up session by JTI
- Compares refresh token with bcrypt-hashed stored version
- Checks session expiry (returns 401 if expired)
- **Rotates tokens**: deletes old session, creates new one with fresh JTI
- Returns new accessToken + sets new refreshToken cookie

**`changePassword`**
- Verifies old password matches
- Hashes and saves new password

**Dead code:** Lines 213-215 have unused `PrismaClient` import + `new PrismaClient()` instantiation + unused `success` from `zod`. Line 7 has unused `import { error } from "console"`.

#### `executeCode.controller.js` — 1 Export

**`executeCode`**
1. Validates `source_code`, `language_id`, `stdin` (array), `expected_outputs` (array), `problemId`
2. Builds batch submissions array — one entry per test case input
3. Submits to Judge0 via `submitBatch()` → gets tokens
4. Polls results via `pollBatchResults()` — retries every 1s, max 10 attempts
5. Compares actual stdout vs expected output for each test case
6. Creates Submission record in DB
7. If all test cases pass ("Accepted"), upserts a `ProblemSolved` record
8. Saves individual test case results via `db.testCaseResult.createMany()`
9. Returns submission with test case details

**Notable:** Status strings are "Accepted"/"Wrong Answer". Memory/time stored as formatted strings (KB/s).

#### `problem.controller.js` — 6 Exports

**`createProblem`**
- Runs all reference solutions against Judge0 **before** saving the problem (pre-validation)
- Iterates each language in `referenceSolutions`, submits all test cases per language
- If any test case fails (status.id !== 3), returns 400 with error
- Only admins can create problems
- Returns 201 with created problem

**`getAllProblems`** — Returns all problems, no filtering.

**`getProblemById`** — Returns single problem by ID with selected fields.

**`updateProblemById`**
- **Critical bug on line 189:** `const problemId = Number(id)` — IDs are UUIDs, `Number()` produces `NaN`
- Uses fill-in-the-blanks merge (keeps existing values if not provided)
- Has commented-out Judge0 re-validation code for new reference solutions
- The `updateData` references `id: problemId` which won't work with string UUIDs

**`deleteProblem`** — Admin-only. Handles Prisma P2025 ("not found") gracefully.

**`getAllProblemsSolvedByUser`** — Returns problems where `solvedBy` has a record matching the user.

#### `playlist.controller.js` — 6 Exports

Simple CRUD operations:
- `createPlayList` — Creates playlist for authenticated user
- `getPlayAllListDetails` — All user playlists with eager-loaded problems
- `getPlayListDetails` — Single playlist by id + userId
- `addProblemToPlaylist` — Creates ProblemInPlaylist records from `problemIds` array
- `deletePlayList` — Deletes playlist by id
- `removeProblemFromPlaylist` — Uses `deleteMany` with `in` filter on `problemIds`

#### `submission.controller.js` — 4 Exports

- `createSubmission` — Manual standalone submission create
- `getAllSubmission` — User's submissions ordered by most recent, includes problem details
- `getSubmissionsForProblem` — User's submissions for a specific problem
- `getAllTheSubmissionsForProblem` — Returns count of ALL submissions for a problem (not user-specific)

### Middleware

#### `auth.middleware.js` — 2 Exports

**`authMiddleware`** — Protects routes:
1. Logs auth header presence
2. Extracts `Bearer <token>` from Authorization header
3. Verifies with `JWT_SECRET`
4. Fetches user from DB (selects id, name, email, role, image, isBanned)
5. Returns 404 if user not found, 403 if banned
6. Sets `req.user` and calls `next()`

**`checkAdmin`** — Simple role check: `req.user.role === "ADMIN"`, returns 403 if not.

#### `auth.rateLimit.js` — 2 Exports

- **`authLimiter`** — 1000 requests per 15 minutes (named "auth" but generous). Applied to register, login, refresh.
- **`apiLimiter`** — 100 requests per 15 minutes. Applied globally to `/api`.

**Note:** Comment says `max: 5` but code has `max: 1000`.

### Libraries

#### `db.js`
- Simple PrismaClient singleton
- Intended to cache on `globalThis` in dev (hot-reload safe)
- **Issue:** The global caching pattern is incomplete — doesn't actually check/reuse cached instance

#### `judge0.lib.js` — 4 Exports

**`getJudge0LanguageId(Language)`**
- Maps: Python→71, Java→62, JavaScript→63, C++→54, C→50
- **Missing:** TypeScript (ID 74) — it's in `getLanguageName` but not here

**`pollBatchResults(tokens)`** — Polls Judge0 batch endpoint every 1s, max 10 attempts, until all status IDs exit 1 (In Queue) and 2 (Processing).

**`submitBatch(submissions)`** — POSTs batch submissions to Judge0, returns `{token}[]`.

**`getLanguageName(languageId)`** — Reverse map: 74→TypeScript, 63→JavaScript, 71→Python, 62→Java.

### Passport Config (`config/passport.js`)

**Google Strategy**
- Callback: `/api/v1/auth/google/callback`
- Looks up user by email where provider is GOOGLE or LOCAL (potential account linking)
- Ban check before proceeding
- Auto-creates user if doesn't exist (provider="GOOGLE", password=null)
- Generates access + refresh tokens with JTI
- Invalidates ALL old sessions for user
- Hashes refresh token (bcrypt 12) and stores in Session table

**GitHub Strategy**
- Callback: `/api/v1/auth/github/callback`
- First finds by `provider: "GITHUB"` + `providerId`
- Falls back to finding by email
- Same token/session logic as Google
- If GitHub doesn't return email, uses `username@github.com` fallback

### Backend Bugs & Issues

1. **`problem.controller.js:189`** — `const problemId = Number(id)` produces `NaN` for UUID strings. `updateProblemById` is completely broken.

2. **`auth.routes.js:88-113`** — Ban/unban temp routes have **no auth middleware**. Anyone who can reach the API can ban/unban any user.

3. **`auth.controller.js:213-215`** — Dead code: unused `PrismaClient` import + `new PrismaClient()` instantiation + unused `success` from `zod`.

4. **`db.js`** — Incomplete global singleton pattern. Does not actually reuse the cached instance from `globalThis`.

5. **`passport.js:28-30`** — Google OAuth strategy searches both `GOOGLE` and `LOCAL` providers when matching user by email. This means if a LOCAL user exists with the same email, Google auth will link to that account. Might be intentional but is a security concern.

6. **`schema.prisma:38`** — Typo: `probelemSolved` instead of `problemSolved` on the User model's relation field.

7. **`judge0.lib.js`** — TypeScript (Judge0 ID 74) is missing from `getJudge0LanguageId()` but present in `getLanguageName()`. TypeScript problems cannot be executed.

8. **`auth.rateLimit.js`** — Comment says `max: 5` for auth limiter, but the actual code has `max: 1000`. The rate limit is effectively meaningless for auth endpoints.

9. **Unused dependencies:** `cookieparser` (appears to be a typo of `cookie-parser`), `postgres` (raw driver — Prisma is used instead).

10. **`executeCode.controller.js`** — In `detailedResults.map()`, there is unreachable code after a `return` statement (console.logs on lines 65-71 never execute).

11. **`.env` with real secrets** — Exists on disk with real DB credentials, JWT secrets, Judge0 token, OAuth client IDs/secrets. Git-ignored but physically present on the machine.

---

## Frontend Analysis

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^19.0.0 | UI framework (latest) |
| **Vite** | ^8.0.0 | Build tool (latest v8) |
| **Tailwind CSS** | ^4.1.0 | Utility CSS (v4 with `@import "tailwindcss"`) |
| **daisyUI** | ^5.0.0 | Component library (Tailwind v4 compatible) |
| **Monaco Editor** | ^4.6.0 | VS Code in-browser editor |
| **Zustand** | ^5.0.0 | State management |
| **react-router-dom** | ^7.0.0 | Client-side routing (v7) |
| **react-hook-form** | ^7.54.0 | Form management |
| **@hookform/resolvers** | ^5.0.0 | Zod integration for react-hook-form |
| **Zod** | ^3.24.0 | Form validation |
| **axios** | ^1.7.0 | HTTP client |
| **lucide-react** | ^0.475.0 | SVG icons |
| **react-hot-toast** | ^2.5.0 | Toast notifications |
| **react-resizable-panels** | ^3.0.0 | Resizable split panels (unused in source) |

### Frontend Directory Structure

```
frontend/
├── index.html                    # Vite entry, title: "frontend"
├── vite.config.js                # React + Tailwind plugins, optimizeDeps
├── package.json
├── eslint.config.js              # Flat config, react-hooks + react-refresh
├── README.md                     # Default Vite README (unmodified)
├── public/
│   ├── favicon.svg               # Purple "H" logo SVG
│   ├── icons.svg                 # SVG sprite (social icons — unused in source)
│   └── profile-icon.svg          # Gradient avatar placeholder
└── src/
    ├── main.jsx                  # StrictMode + BrowserRouter + App
    ├── App.jsx                   # Route definitions, auth check, Toaster
    ├── index.css                 # Tailwind v4 + daisyUI + custom animations
    ├── lib/
    │   ├── axios.js              # Axios instance + 401 silent refresh interceptor with queue
    │   └── lang.js               # Judge0 language ID↔name mappings
    ├── store/
    │   ├── useAuthStore.js       # Auth state & actions
    │   ├── useProblemStore.js    # Problem CRUD state
    │   ├── useExecutionStore.js  # Code execution state
    │   ├── useSubmissionStore.js # Submission state & history
    │   ├── usePlaylistStore.js   # Playlist CRUD state
    │   └── useAction.js          # Cross-store deletion logic
    ├── layout/
    │   └── Layout.jsx            # Navbar + Outlet
    ├── components/
    │   ├── Navbar.jsx            # Glass-morphism navbar with avatar dropdown
    │   ├── AdminRoute.jsx        # Role-based route guard (ADMIN only)
    │   ├── AuthImagePattern.jsx  # Decorative auth page background
    │   ├── AvatarPlaceholder.jsx # Gradient SVG avatar placeholder
    │   ├── HexcodeLogo.jsx       # Custom hexagonal logo SVG
    │   ├── LogoutButton.jsx      # Logout action button
    │   ├── ProblemTable.jsx      # Search, filter, paginate problem list
    │   ├── Submission.jsx        # Detailed submission results
    │   ├── SubmissionList.jsx    # Past submissions list for a problem
    │   ├── CreateProblemForm.jsx # Full problem creation form (1030 lines)
    │   ├── CreatePlaylistModel.jsx # Modal for new playlist (typo in filename)
    │   └── AddToPlaylist.jsx     # Modal to add problem to existing playlist
    └── page/
        ├── HomePage.jsx          # Welcome hero + ProblemTable
        ├── LoginPage.jsx         # Email/password form + OAuth buttons
        ├── SignUpPage.jsx        # Name/email/password registration
        ├── ProblemPage.jsx       # Monaco editor + description + test cases + submissions
        ├── AddProblem.jsx        # Wrapper for CreateProblemForm
        ├── EditProblemPage.jsx   # Manual edit form (not using CreateProblemForm)
        ├── oauth-success.jsx     # OAuth token handler
        ├── Dashboard.jsx         # Stats + recent activity
        ├── PlaylistsPage.jsx     # Playlist grid
        ├── PlaylistDetailsPage.jsx # Single playlist view
        └── ProfilePage.jsx       # User profile management
```

### Frontend Architecture Flow

```
Browser → React Router (v7)
  ├── /login, /signup → auth forms (redirect to / if already authenticated)
  ├── <Layout> (renders Navbar)
  │   ├── /                         → HomePage → ProblemTable
  │   ├── /problem/:id              → ProblemPage
  │   │   ├── Left tab: Description / Submissions / Discussion / Hints
  │   │   ├── Right: Monaco Editor + language selector + zoom controls
  │   │   └── Bottom: Test cases / Submission component results
  │   ├── /add-problem              → AdminRoute → CreateProblemForm
  │   ├── /edit-problem/:id         → inline admin check → manual edit form
  │   ├── /playlists                → PlaylistsPage
  │   ├── /playlists/:id            → PlaylistDetailsPage (no auth guard — potential issue)
  │   ├── /dashboard                → Dashboard (stats)
  │   └── /profile                  → ProfilePage
  └── /oauth-success                → reads ?token=, stores in localStorage, redirects

Zustand Stores ↔ Axios Instance ↔ Backend API (/api/v1/*)

Axios Interceptor Flow:
  Request: attach Bearer token from localStorage
  Response 401 → if not already retried:
    1. POST /auth/refresh (raw axios, no interceptor)
    2. Store new token in localStorage
    3. Retry all queued failed requests
    4. On failure: clear token, redirect to /login
```

### App.jsx — Route Configuration

```javascript
<Routes>
  <Route path="/login" element={<LoginPage />} />   ← redirects to / if authUser
  <Route path="/signup" element={<SignUpPage />} />  ← redirects to / if authUser
  <Route element={<Layout />}>                        ← Navbar wrapper
    <Route path="/" element={<HomePage />} />         ← protected
    <Route path="/problem/:id" element={<ProblemPage />} />  ← protected
    <Route path="/add-problem" element={               ← AdminRoute
      <AdminRoute><AddProblem /></AdminRoute>
    } />
    <Route path="/edit-problem/:id" element={          ← inline check (inconsistent)
      authUser?.role === "ADMIN" ? <EditProblemPage /> : <Navigate to="/" />
    } />
    <Route path="/playlists" element={<PlaylistsPage />} />          ← protected
    <Route path="/playlists/:id" element={<PlaylistDetailsPage />} /> ← NOT protected!
    <Route path="/dashboard" element={<Dashboard />} />               ← protected
    <Route path="/profile" element={<ProfilePage />} />               ← protected
  </Route>
  <Route path="/oauth-success" element={<OAuthSuccess />} />  ← no Layout
</Routes>
```

### Zustand Stores

#### `useAuthStore.js`

| State | Type | Default |
|-------|------|---------|
| authUser | Object | null |
| isSigninUp (typo) | Boolean | false |
| isLoggingIn | Boolean | false |
| isCheckingAuth | Boolean | false |

| Action | API Call | Side Effects |
|--------|----------|-------------|
| checkAuth() | GET /auth/check | Sets authUser |
| signup(data) | POST /auth/register | Sets authUser, toast |
| login(data) | POST /auth/login | Sets authUser, toast |
| logout() | POST /auth/logout | Clears authUser, resets submission store, toast |
| updateProfile(data) | PUT /auth/update-profile | Merges updated fields into authUser |
| changePassword(data) | PUT /auth/change-password | Returns boolean |
| deleteAccount() | DELETE /auth/delete-account | window.confirm, clears authUser |

#### `useProblemStore.js`

| State | Type | Default |
|-------|------|---------|
| problems | Array | [] |
| problem | Object | null |
| solvedProblems | Array | [] |
| isProblemsLoading | Boolean | false |
| isProblemLoading | Boolean | false |
| isDeletingProblem | Boolean | false (never set here) |

| Action | API Call | Notes |
|--------|----------|-------|
| getAllProblems() | GET /problems/get-all-problems | |
| getProblemById(id) | GET /problems/get-problem/:id | Skips refetch if same ID already loaded. Handles 404. |
| getSolvedProblemByUser() | GET /problems/get-solved-problem | |
| updateProblemById(id, data) | PUT /problems/update-problem**${id}** | **Bug: missing / before id** |

#### `useExecutionStore.js`

| State | Type | Default |
|-------|------|---------|
| isExecuting | Boolean | false |
| executionResult | Object | null |

| Action | API Call | Notes |
|--------|----------|-------|
| executeCode(src, lang, stdin, expected, problemId) | POST /execute-code | Logs payload, cross-updates submission store |

#### `useSubmissionStore.js`

| State | Type | Default |
|-------|------|---------|
| isLoading | Boolean | false |
| submissions | Array | [] |
| problemSubmissions | Array | [] |
| submission | Object | null |
| submissionCount | Number | 0 |

| Action | API Call | Notes |
|--------|----------|-------|
| setSubmission(data) | — | Sets single submission |
| getAllSubmissions() | GET /submission/get-all-submissions | **Bug: dead code on line 16** |
| getSubmissionForProblem(id) | GET /submission/get-submission/:id | Sets problemSubmissions + submission |
| getSubmissionCountForProblem(id) | GET /submission/get-submissions-count/:id | |
| reset() | — | Clears all state (called by auth logout) |

#### `usePlaylistStore.js`

| State | Type | Default |
|-------|------|---------|
| playlists | Array | [] |
| currentPlaylist | Object | null |
| isLoading | Boolean | false |
| error | String | null |

| Action | API Call |
|--------|----------|
| createPlaylist(data) | POST /playlist/create-playlist |
| getAllPlaylists() | GET /playlist |
| getPlaylistDetails(id) | GET /playlist/:id |
| addProblemToPlaylist(id, problemIds) | POST /playlist/:id/add-problem |
| removeProblemFromPlaylist(id, problemIds) | DELETE /playlist/:id/remove-problem |
| deletePlaylist(id) | DELETE /playlist/:id |

#### `useAction.js`

| State | Type | Default |
|-------|------|---------|
| isDeletingProblem | Boolean | false |

| Action | API Call | Cross-store Side Effects |
|--------|----------|-------------------------|
| onDeleteProblem(id) | DELETE /problems/delete-problem/:id | Removes from problemStore.problems AND playlistStore.currentPlaylist.problems |

### Components

#### `Navbar.jsx`
- Fixed navbar with glass-morphism styling (backdrop-blur, border, rounded-2xl)
- **Left:** HexcodeLogo + "Hexcode" text, links to `/`
- **Right:** daisyUI dropdown with user avatar
  - Image loads from `authUser.image` with `ui-avatars.com` API fallback
  - On load error, falls back to AvatarPlaceholder component
  - Dropdown: Dashboard, My Playlists, My Profile, Add Problem (ADMIN only), Logout

#### `AdminRoute.jsx`
- Route guard that checks `authUser.role === "ADMIN"`
- Shows spinner during auth check
- Renders `<Outlet />` for children if authorized, else `<Navigate to="/" />`

#### `AuthImagePattern.jsx` (exported as `CodeBackground`)
- Full-page decorative component for auth pages (shown on `lg:` screens)
- Cycles through 3 code snippets (twoSum, reverseList, validParentheses) every 2 seconds
- Animated code icons (Braces, FileCode, Terminal, Code) with staggered pulse animations
- Mock code editor UI with red/yellow/green window dots and blinking cursor

#### `AvatarPlaceholder.jsx`
- Inline SVG with gradient (indigo→rose) showing head and body silhouette
- Same design as `public/profile-icon.svg`
- Accepts optional `className` prop (defaults to `w-10 h-10`)

#### `HexcodeLogo.jsx`
- Custom hexagonal shape SVG with continuous thin line (`strokeWidth: 3.5`)
- Cyan-to-indigo gradient (`#3abff8` → `#818cf8`)
- Accepts `className` and `color` props

#### `ProblemTable.jsx`
- Core problems listing with:
  - **Search:** Text filter by title
  - **Difficulty filter:** ALL / EASY / MEDIUM / HARD dropdown
  - **Tag filter:** All unique tags extracted from problems
  - **Pagination:** 5 items per page, prev/next with page indicator
- **Columns:** Solved (checkbox, checked if user ID in `solvedBy`), Title (link), Tags (badge-outline), Difficulty (color badge), Actions (delete/edit/bookmark)
- All filtering/pagination memoized with `useMemo`
- Modals: `CreatePlaylistModel` + `AddToPlaylistModal`

#### `Submission.jsx`
- Detailed submission results view
- Calculates average memory/time from JSON-parsed arrays
- **Stats cards:** Status, Success Rate %, Runtime (avg seconds), Memory (avg KB)
- **Test case details table:** Result (Passed/Failed icons), Expected, Actual, RAM, Time
- Defensive `ensureArray` helper handles both array and object props

#### `SubmissionList.jsx`
- Renders list of past submissions for a problem
- States: loading spinner, empty state (dashed border)
- Each card: status (Accepted/Error icon), language badge, avg time, avg memory, date
- `safeParse` and `calculateAverageMemory/Time` helpers handle JSON defensive parsing

#### `CreateProblemForm.jsx` (1030 lines)
- Full problem creation form using react-hook-form + Zod
- **Zod schema:** title (min 3), description (min 10), difficulty (enum), tags (min 1), constraints (required), testcases (min 1), examples (per-language), codeSnippets (per-language), referenceSolutions (per-language)
- **`getProblemSchema(isEdit)`:** Optional-all fields version for editing
- **Sample data loader:** Two pre-built problems:
  - "Climbing Stairs" (DP) — complete with test cases, code snippets, reference solutions in JS/Python/Java
  - "Valid Palindrome" (String) — same structure
- **Monaco Editor** via `@monaco-editor/react` for codeSnippets and referenceSolutions per language
- **useFieldArray** for dynamic test cases and tags (add/remove)
- Handles both create and edit modes with data merging
- **Edit mode:** Merges `initialData` with form values to avoid sending empty strings for untouched fields
- **Language key normalization:** Maps lowercase keys to uppercase (JAVASCRIPT/PYTHON/JAVA)

#### `CreatePlaylistModel.jsx` (typo in filename — "Model" instead of "Modal")
- Modal dialog with react-hook-form
- Fields: name (required), description (textarea)
- Props: `isOpen`, `onClose`, `onSubmit`
- Dark overlay + centered card

#### `AddToPlaylist.jsx`
- Modal to add a problem to an existing playlist
- Fetches all playlists when opened
- Dropdown selector + submit button
- Props: `isOpen`, `onClose`, `problemId`

#### `LogoutButton.jsx`
- Simple button wrapper calling `useAuthStore().logout()` on click

### Pages

#### `HomePage.jsx`
- Fetches all problems via `getAllProblems()` on mount
- Shows spinner or ProblemTable
- Hero section: "Welcome to Hexcode" heading
- Decorative background blur effect
- Empty state: "No problems found" dashed border

#### `LoginPage.jsx`
- Two-column layout (form left, AuthImagePattern right on lg+)
- **OAuth:** Google + GitHub buttons → redirect to `http://localhost:3000/api/v1/auth/google` (hardcoded — breaks in production)
- **Form:** email (valid) + password (min 6) with Zod, eye toggle for password
- Submit calls `login()` from auth store
- Link to `/signup`

#### `SignUpPage.jsx`
- Same layout as login
- Fields: name (min 3), email (valid), password (min 6)
- Submit calls `signup()` from auth store
- Link to `/login`

#### `ProblemPage.jsx` (Core Page)
- Route: `/problem/:id`
- **Data loading:** Fetches problem by ID + submission count in parallel (`Promise.all`)
- **Tabs (left column):**
  - Description — problem text, per-language examples, constraints
  - Submissions — renders SubmissionList component
  - Discussion — placeholder "No discussions yet"
  - Hints — renders hints or placeholder
- **Editor (right column):** Monaco Editor with:
  - Language selector (filtered by problem's codeSnippets keys)
  - Zoom controls (± buttons, 10-40px range)
  - Run Code button → executeCode() with test case inputs/outputs
  - Submit Solution → fetches submissions for this problem, switches to submissions tab (does NOT submit code — likely a bug)
- **Test cases section (bottom):** Shows input/output table, or Submission component if executionResult exists
- **Notable:** `navigate` and `toast` referenced in useEffect error handler but **not imported** — would crash. Bookmark and Share buttons are decorative.

#### `AddProblem.jsx`
- Simple wrapper rendering `<CreateProblemForm />`

#### `EditProblemPage.jsx`
- Route: `/edit-problem/:id`
- Finds existing problem from `useProblemStore.problems` (must be loaded first)
- **Not using CreateProblemForm** — completely separate manual form
- **Two-column layout:**
  - Left (5/12): Title, difficulty dropdown, description, test cases (add/remove)
  - Right (7/12): Language tabs (JS/Python/Java) with large textarea for reference solution
- Uses lowercase language keys (`javascript`, `python`, `java`) — inconsistent with CreateProblemForm which uses uppercase
- No code snippets, examples, hints, or editorial editing

#### `oauth-success.jsx`
- Reads `token` from URL search params (`?token=...`)
- Saves to localStorage, navigates to `/` (or `/login` if no token)
- Shows "Logging you in..." during processing

#### `Dashboard.jsx`
- Fetches all submissions on mount (guarded: only if user exists and submissions empty)
- **Stats cards (3-column grid):**
  1. Solved count — unique problem IDs with "Accepted" status (Trophy icon)
  2. Accuracy % — accepted/total submissions (Target icon)
  3. Top language — most used language (Zap icon)
- **Recent Activity table:** Problem link, Difficulty badge, Status, Language, Date
- **Potential issue:** Uses `isFetching` but store only has `isLoading`

#### `PlaylistsPage.jsx`
- Fetches all playlists
- Responsive grid (1/2/3 columns)
- Each card: icon, name, description (line-clamp-2), "View Problems" link
- Delete button on hover with confirmation

#### `PlaylistDetailsPage.jsx`
- Route: `/playlists/:id`
- Fetches playlist details
- Glass-morphism UI with backdrop blur
- Header: "Curated Playlist" badge, name, description, problem count
- Problem list with difficulty dots, title, category, "Begin" hover text
- Loading ring and empty state

#### `ProfilePage.jsx`
- Profile hero with clickable avatar (file upload, base64, 1MB limit)
- `ui-avatars.com` fallback
- **Personal Info:** Name and email (read-only)
- **Professional Links:** Editable github + website, "Save Changes" button
- **Security:** "Account Verified" badge, join date, Change Password button (uses `prompt()`), Delete Account
- **Bug:** `changePassword` is called but **never imported** from `useAuthStore` — runtime error on click

### Frontend Bugs & Issues

1. **`vite.config.js`** — Typo: `"react-resizable-panles"` should be `"react-resizable-panels"`. The panel library won't pre-bundle correctly.

2. **`useProblemStore.js`** — Missing `/` in URL: `update-problem${id}` generates `update-problem123` instead of `update-problem/123`.

3. **`useSubmissionStore.js:16`** — Dead code: `setSubmission:` is a statement expression (comma operator), not a state update. It does nothing.

4. **`ProfilePage.jsx`** — `changePassword` called but never imported from `useAuthStore`. Clicking "Change Password" will throw a runtime error.

5. **`ProblemPage.jsx:78-79`** — `navigate` and `toast` referenced in error handler but **not imported**. Will crash on the error path.

6. **`useAction.js`** — Unused import: `{ id }` from `zod/v4/locales` — dead code.

7. **`ProblemPage.jsx`** — "Submit Solution" button only calls `getSubmissionForProblem()` (GET request) instead of submitting code for evaluation (POST). The button appears to fetch existing submissions rather than submitting new code — likely a bug or placeholder.

8. **`LoginPage.jsx`** — OAuth login buttons hardcode `http://localhost:3000/api/v1/auth/...` instead of using the axios baseURL. This breaks in production.

9. **`CreatePlaylistModel.jsx`** — Filename typo: "Model" instead of "Modal".

10. **`useAuthStore.js`** — State key `isSigninUp` has a typo (should be `isSigningUp`).

11. **`App.jsx`** — `/playlists/:id` does not enforce authentication (no admin route or auth guard) unlike all other routes under `<Layout>`.

12. **`App.jsx`** — `/edit-problem/:id` uses inline `authUser?.role === "ADMIN"` check while `/add-problem` uses the `<AdminRoute>` wrapper — inconsistent pattern.

13. **`Dashboard.jsx`** — References `isFetching` from store but store only has `isLoading` — the loading guard may not work as intended.

14. **`Navbar.jsx`** — `/oauth-success` page uses no Navbar/Layout wrapper, so the OAuth redirect flow has no navigation.

---

## End-to-End Flow: Solving a Problem

```
1. User visits /login → enters email/password → POST /auth/login
   → Backend: validates, compares password, generates JWT + refresh token, creates Session
   → Response: { user, accessToken } + httpOnly cookie (refreshToken)
   → Frontend: stores accessToken in localStorage, sets authUser in Zustand

2. User sees HomePage → GET /problems/get-all-problems
   → ProblemTable renders with search, filter, pagination

3. User clicks a problem → navigates to /problem/:id
   → Parallel: GET /problems/get-problem/:id + GET /submission/get-submissions-count/:id
   → ProblemPage renders: description, Monaco Editor, test cases

4. User selects language → editor shows starter code from codeSnippets
   → User writes code → clicks "Run Code"
   → POST /execute-code with { source_code, language_id, stdin[], expected_outputs[], problemId }
   → Backend:
     a. Builds batch submissions (one per test case input)
     b. POST to Judge0 /submissions/batch → gets tokens
     c. Polls Judge0 /submissions/batch every 1s (max 10 attempts)
     d. Compares stdout vs expected_output for each test case
     e. Creates Submission + TestCaseResult records in DB
     f. If all pass: upsert ProblemSolved record
   → Response: { submission with test case details }
   → Frontend: shows per-test-case pass/fail with memory/time

5. User can view:
   - Submissions tab → GET /submission/get-submission/:problemId
   - Dashboard → GET /submission/get-all-submissions (stats: solved, accuracy, top language)
   - Profile → edit github/website links, change password, delete account
   - Playlists → create, add problems, view collections
```

## Languages Supported

| Language | Judge0 ID | Backend Map | Frontend Map |
|----------|-----------|-------------|--------------|
| JavaScript | 63 | ✅ `getJudge0LanguageId` | ✅ `getLanguageId` |
| Python | 71 | ✅ | ✅ |
| Java | 62 | ✅ | ✅ |
| TypeScript | 74 | ❌ **Missing** in `getJudge0LanguageId` | ✅ `getLanguageId` |
| C++ | 54 | ✅ (but no UI for it) | ❌ |
| C | 50 | ✅ (but no UI for it) | ❌ |

TypeScript problems exist in the frontend (codeSnippets, examples) but the backend's `getJudge0LanguageId` doesn't include ID 74, so TypeScript code execution will fail.

---

## Summary of Critical Bugs

| Severity | File | Issue |
|----------|------|-------|
| **CRITICAL** | `problem.controller.js:189` | `Number(id)` on UUID → `updateProblemById` always fails |
| **CRITICAL** | `auth.routes.js:88-113` | Ban/unban routes have zero auth — anyone can ban users |
| **CRITICAL** | `ProfilePage.jsx` | `changePassword` not imported — runtime error |
| **CRITICAL** | `ProblemPage.jsx:78-79` | `navigate`/`toast` not imported — runtime error on error path |
| **HIGH** | `useProblemStore.js` | Missing `/` in API URL for update |
| **HIGH** | `ProblemPage.jsx` | "Submit Solution" only GETs submissions, doesn't POST code |
| **HIGH** | `LoginPage.jsx` | OAuth URLs hardcode localhost:3000 |
| **MEDIUM** | `vite.config.js` | Typo in `optimizeDeps.include` |
| **MEDIUM** | `judge0.lib.js` | TypeScript missing from language map |
| **MEDIUM** | `passport.js` | Google OAuth links to LOCAL accounts by email |
| **LOW** | `schema.prisma` | Typo: `probelemSolved` |
| **LOW** | `useAuthStore.js` | Typo: `isSigninUp` |
| **LOW** | `CreatePlaylistModel.jsx` | Typo in filename: "Model" → "Modal" |
| **LOW** | `auth.controller.js:213-215` | Dead code (unused imports/instantiation) |
| **LOW** | `useSubmissionStore.js:16` | Dead code |
| **LOW** | `useAction.js` | Unused import |
| **LOW** | `AuthImagePattern.jsx` | Exported as `CodeBackground`, imported as `AuthImagePattern` |
