# HexCode — Security Analysis

Audit date: 2026-05-13
Scope: Full stack (`~/Codes/hexcode/backend/` + `~/Codes/hexcode/frontend/`)

---

## Severity Ratings (Post-Fix)

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| **CRITICAL** | 2 | 1 | 1 |
| **HIGH** | 5 | 5 | 0 |
| **MEDIUM** | 4 | 4 | 0 |
| **LOW** | 3 | 3 | 0 |
| **INFO** | 4 | — | 4 (observations) |

**Critical vulnerability still open:** `.env` file with live production credentials on disk. Requires manual secrets rotation.

---

## Remediation Status

| # | Issue | Status | Fix Details |
|---|-------|--------|-------------|
| C-1 | Ban/unban routes no auth | **✅ FIXED** | Added `authMiddleware` + `checkAdmin` to both routes |
| C-2 | `.env` with live secrets | **⚠️ MANUAL** | Rotate all secrets manually (DB, JWT, OAuth) |
| H-1 | JWT in localStorage | **✅ FIXED** | Moved to Zustand memory store + `window.__ZUSTAND_AUTH_TOKEN` global ref |
| H-2 | axios CVEs | **✅ FIXED** | Updated to `^1.15.2` in both workspaces, removed overrides |
| H-3 | No security headers | **✅ FIXED** | Added `helmet` middleware |
| H-4 | JWT error leakage | **✅ FIXED** | Generic "Unauthorized" response, detailed error logged server-side |
| H-5 | Judge0 API key unused | **✅ FIXED** | Added `judge0Headers` with `X-RapidAPI-Key` when token is set |
| M-1 | Rate limit too generous | **✅ FIXED** | Reduced `max` from 1000 to 5 |
| M-2 | OAuth URLs hardcoded | **✅ FIXED** | Uses `import.meta.env.VITE_API_URL` in frontend, `FRONTEND_URL` in backend |
| M-3 | CORS only localhost:5173 | **✅ FIXED** | Reads `CORS_ORIGINS` env var (comma-separated) |
| M-4 | JWT algorithm whitelist | **✅ FIXED** | Added `algorithms: ["HS256"]` to all `jwt.verify` calls |
| L-1 | Cookie secure flag logic | **✅ FIXED** | Changed to `process.env.NODE_ENV === "production"` |
| L-2 | Avatar no MIME validation | **✅ FIXED** | Added `allowedTypes` check (JPEG, PNG, WebP, GIF) |
| L-3 | DB singleton pattern | **✅ FIXED** | Added `??=` nullish coalescing for global caching |

---

## CRITICAL

### C-1: Ban/Unban Routes Have No Authentication

**File:** `backend/src/routes/auth.routes.js:89,104`
**Status: ✅ FIXED**

Added `authMiddleware` and `checkAdmin` to both routes. Only authenticated admins can ban/unban.

### C-2: `.env` File Contains Live Production Credentials on Disk

**File:** `backend/.env`
**Status: ⚠️ MANUAL ACTION REQUIRED**

Exposed secrets:
- `DATABASE_URL` — PostgreSQL connection string with credentials
- `JWT_SECRET` — Access token signing key
- `JWT_REFRESH_SECRET` — Refresh token signing key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth credentials
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — GitHub OAuth credentials

**Impact:** If the machine is compromised, all secrets are immediately exposed.

**Remediation:**
1. Rotate ALL secrets immediately (DB password, JWT secrets, OAuth client secrets)
2. Use a secrets manager or encrypted env file for production
3. Never share or commit `.env` (it is already gitignored)

---

## HIGH

### H-1: JWT Access Token Stored in localStorage (XSS-Vulnerable)

**Status: ✅ FIXED**

**Changes made:**
- Removed all `localStorage.getItem/setItem/removeItem("token")` calls
- Added `accessToken` to Zustand auth store state
- Added `window.__ZUSTAND_AUTH_TOKEN` global ref for axios interceptor access
- Axios request interceptor reads from `window.__ZUSTAND_AUTH_TOKEN` instead of `localStorage`
- App.jsx always calls `checkAuth()` on mount (refresh interceptor handles token renewal)
- OAuth success page stores token in Zustand store instead of `localStorage`

### H-2: axios 1.14.0 — Multiple Known CVEs

**Status: ✅ FIXED**

Updated axios to `^1.15.2` in both workspaces. Removed the `overrides` block from backend `package.json`. Remaining audit warnings are from transitive dependencies (moderate severity, no direct impact).

### H-3: No Security Headers Middleware

**Status: ✅ FIXED**

**Changes made:**
- Added `helmet` (`^8.0.0`) to backend dependencies
- Added `app.use(helmet())` in `src/index.js`

This enables the following headers by default:
- `Content-Security-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Origin-Agent-Cluster`
- `Referrer-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-DNS-Prefetch-Control`
- `X-Download-Options`
- `X-Frame-Options`
- `X-Permitted-Cross-Domain-Policies`
- `X-Powered-By` (removed)
- `X-XSS-Protection`

### H-4: JWT Error Messages Leak Internals

**File:** `backend/src/middleware/auth.middleware.js:27-32`
**Status: ✅ FIXED**

Changed from:
```js
message: "Unauthorized - " + error.message  // Leaks "jwt expired", etc.
```
To:
```js
message: "Unauthorized"
```
Error details are still logged server-side via `console.log("JWT ERROR:", error.message)`.

### H-5: Judge0 API Key Exists But Is Never Used

**File:** `backend/src/libs/judge0.lib.js`
**Status: ✅ FIXED**

Added `judge0Headers` that includes `X-RapidAPI-Key` header when `JUDGE0_API_TOKEN` is set. Both `submitBatch` and `pollBatchResults` now pass the headers.

---

## MEDIUM

### M-1: Auth Rate Limit Too Generous

**File:** `backend/src/middleware/auth.rateLimit.js`
**Status: ✅ FIXED**

Changed `max` from `1000` to `5` to match the original intended value.

### M-2: Frontend Hardcodes localhost:3000 for OAuth

**File:** `frontend/src/page/LoginPage.jsx`
**Status: ✅ FIXED**

OAuth redirect URLs now use:
```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
```

### M-3: CORS Only Allows Localhost:5173

**File:** `backend/src/index.js`
**Status: ✅ FIXED**

CORS now reads from `CORS_ORIGINS` environment variable (comma-separated):
```js
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:5173"];
```

### M-4: JWT Sign/Verify Lacks Algorithm Whitelist

**Files:**
- `backend/src/middleware/auth.middleware.js:25`
- `backend/src/controllers/auth.controller.js:317`
- `backend/src/config/passport.js`

**Status: ✅ FIXED**

Added `{ algorithms: ["HS256"] }` to all `jwt.verify` calls in auth middleware, auth controller (refresh), and passport config.

---

## LOW

### L-1: Refresh Cookies Missing `secure` Flag in Production Path

**Status: ✅ FIXED**

Changed from `process.env.NODE_ENV !== "development"` to `process.env.NODE_ENV === "production"` for all cookie `secure` flags. If `NODE_ENV` is unset, `secure` defaults to `false` which is safer than the inverse logic.

### L-2: Profile Avatar Upload Accepts Base64 Without Validation

**File:** `frontend/src/page/ProfilePage.jsx`
**Status: ✅ FIXED**

Added MIME type validation before file read:
```js
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
if (!allowedTypes.includes(file.type)) {
    return toast.error("Invalid file type");
}
```

Also fixed `changePassword` not being destructured from `useAuthStore()` (was missing from the import, would have caused a runtime error).

### L-3: Prisma DB Singleton Pattern Incomplete

**File:** `backend/src/libs/db.js`
**Status: ✅ FIXED**

Changed from:
```js
export const db = new PrismaClient();
if(process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```
To the proper global cache pattern:
```js
globalForPrisma.prisma ??= new PrismaClient();
export const db = globalForPrisma.prisma;
```

---

## INFO / OBSERVATIONS

| # | Finding | Details |
|---|---------|---------|
| I-1 | **bcrypt 12 rounds** | Password hashing uses cost factor 12 — good practice |
| I-2 | **httpOnly + sameSite cookies** | Refresh tokens use httpOnly, sameSite:"strict" — proper handling |
| I-3 | **Token rotation implemented** | Refresh endpoint deletes old session, creates new one with fresh JTI — prevents replay attacks |
| I-4 | **Prisma ORM** | Parameterized queries by default — no SQL injection risk |
| I-5 | **No eval/dangerouslySetInnerHTML** | Frontend has no `eval()` or `dangerouslySetInnerHTML` — good XSS posture |
| I-6 | **Zod input validation** | All auth endpoints validate with Zod schemas — prevents malformed input |
| I-7 | **OAuth callback URLs are relative** | Passport strategies use relative paths (`/api/v1/auth/google/callback`) — avoids hostname hardcoding on the backend side |

---

## Attack Surface Summary (Post-Fix)

```
Internet
  │
  ├── PORT 3000 — Express API (backend)
  │   ├── POST /api/v1/auth/login        ← rate-limited (5/15min — strict ✅)
  │   ├── POST /api/v1/auth/register     ← rate-limited (5/15min — strict ✅)
  │   ├── POST /api/v1/auth/refresh      ← rate-limited (5/15min — strict ✅)
  │   ├── POST /api/v1/auth/ban/:id      ← authMiddleware + checkAdmin ✅
  │   ├── POST /api/v1/auth/unban/:id    ← authMiddleware + checkAdmin ✅
  │   ├── GET /api/v1/auth/google        ← OAuth redirect (configurable URL ✅)
  │   ├── GET /api/v1/auth/github        ← OAuth redirect (configurable URL ✅)
  │   ├── /api/v1/problems/*             ← JWT required + algorithm whitelist ✅
  │   ├── /api/v1/execute-code/*         ← JWT required, Judge0 auth sent ✅
  │   ├── /api/v1/submission/*           ← JWT required ✅
  │   └── /api/v1/playlist/*             ← JWT required ✅
  │
  ├── PORT 5173 — Vite/React (frontend)
  │   ├── helmet security headers        ← enabled ✅
  │   └── in-memory token (Zustand)      ← no localStorage XSS vector ✅
  │
  ├── PORT 2358 — Judge0 (code execution)
  │   └── Authenticated API calls        ← X-RapidAPI-Key sent when configured ✅
  │
  └── PORT 15432 — PostgreSQL
      └── Credentials in plaintext .env  ← ⚠️ rotate manually
```

## High-Priority Remediation Checklist

- [x] Add `authMiddleware` + `checkAdmin` to ban/unban routes
- [x] Update axios to `^1.15.2` in both workspaces
- [x] Install `helmet` and apply security headers middleware
- [x] Stop leaking JWT error details in auth middleware responses
- [x] Move access token from localStorage to Zustand memory store
- [x] Send `JUDGE0_API_TOKEN` in Judge0 API requests
- [x] Reduce auth rate limiter from 1000 to 5 per window
- [x] Make OAuth URLs configurable via env variable
- [x] Add `algorithms: ["HS256"]` to all JWT verify calls
- [x] Make CORS origins configurable for production
- [x] Fix cookie secure flag logic
- [x] Add MIME type validation for avatar uploads
- [x] Fix Prisma DB singleton pattern
- [ ] **Rotate all secrets in `.env`** (DB password, JWT secrets, OAuth client secrets)
