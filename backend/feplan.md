# 🗺️ FE Auth & Non-Auth Route Handling Plan

> **Context**: Backend uses **Session-Based Auth** (Passport.js + express-session cookie).  
> No JWT. No localStorage token. The browser cookie (`g18-session`) IS the auth proof.

---

## The Core Problem

The FE needs to know **"Is the user logged in?"** before rendering any page.

Since there's no JWT to decode on the FE, the only source of truth is the **backend session**.  
The FE must ask the server: _"Who am I?"_

---

## Step 1 — Add a `/me` Endpoint on Backend (Required!)

> [!IMPORTANT]
> The current backend does NOT have a `/me` route. You need to add one.
> Without this, the FE has no way to verify session state.

```
GET /api/auth/me
→ Protected by authProtect middleware
→ Returns: { data: { user: req.user } }
→ 401 if not logged in
```

This becomes the **single source of truth** for the FE.

---

## Step 2 — FE Auth State (Global)

Use a **global auth store** (Context API / Zustand / any state manager).

```
AuthStore {
  user: UserObject | null   ← null = not logged in
  isLoading: boolean        ← true while /me is being fetched
  isAuthenticated: boolean  ← derived: !!user
}
```

**On app boot**, immediately call `GET /api/auth/me`:

- ✅ 200 → set `user`, `isAuthenticated = true`
- ❌ 401 → set `user = null`, `isAuthenticated = false`

---

## Step 3 — Route Architecture

```
App
├── Public Routes (no auth required)
│   ├── /              → Landing Page
│   ├── /login         → Login Page
│   ├── /register      → Register Page
│   └── /auth/google   → (redirect trigger)
│
└── Protected Routes (auth required)
    └── /notes         → Notes Dashboard
```

---

## Step 4 — The Two Guard Components

### 🔒 `<ProtectedRoute>` — For `/notes` and all auth pages

```jsx
function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) return <FullPageSpinner />; // ⏳ wait for /me
    if (!isAuthenticated) return <Navigate to="/login" />; // ❌ kick out
    return children; // ✅ let in
}
```

### 🌐 `<PublicRoute>` — For `/login`, `/register` (redirect if already logged in)

```jsx
function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) return <FullPageSpinner />;
    if (isAuthenticated) return <Navigate to="/notes" />; // already in? go home
    return children;
}
```

---

## Step 5 — Full Router Wiring

```jsx
<Router>
    <Routes>
        {/* Public: accessible to all */}
        <Route path="/" element={<LandingPage />} />

        {/* Public: redirect to /notes if already logged in */}
        <Route
            path="/login"
            element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            }
        />
        <Route
            path="/register"
            element={
                <PublicRoute>
                    <RegisterPage />
                </PublicRoute>
            }
        />

        {/* Protected: redirect to /login if not logged in */}
        <Route
            path="/notes"
            element={
                <ProtectedRoute>
                    <NotesPage />
                </ProtectedRoute>
            }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
</Router>
```

---

## Step 6 — The Auth Flow: Full Picture

### 📧 Email/Password Login

```
User fills form → POST /api/auth/login
  ✅ 200 → Backend sets session cookie
         → FE: set user in AuthStore
         → Navigate to /notes
  ❌ 401 → show error message
```

### 🔵 Google OAuth Login

```
User clicks "Login with Google"
  → FE redirects browser to: GET /api/auth/google
  → Google OAuth flow happens server-side
  → Backend redirects to: <FRONTEND_ORIGIN>/notes  (on success)
  → FE /notes page loads → ProtectedRoute runs → calls /me
  → /me returns user → authenticated ✅
```

> [!NOTE]
> For Google OAuth, the FE doesn't need to do anything special.
> The backend already redirects to `/notes` on success, and `/notes` is a ProtectedRoute
> which will call `/me` automatically and confirm the session.

### 🚪 Logout

```
User clicks Logout
  → POST /api/auth/logout  (need to add this endpoint too!)
  → Backend: destroySessionAndLogout() → clears cookie
  → FE: set user = null in AuthStore
  → Navigate to /login
```

---

## Step 7 — API Client Setup (Critical for Sessions!)

> [!CAUTION]
> `fetch()` does NOT send cookies by default cross-origin.
> You MUST use `credentials: "include"` on every request.

```js
// Base API client
const api = axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true, // ← THIS IS MANDATORY for session cookies
});

// OR with fetch:
fetch("/api/auth/me", {
    credentials: "include", // ← same thing
});
```

Without this, every request goes without the session cookie → 401 forever.

---

## Summary Table

| Route       | Guard              | Behavior                               |
| ----------- | ------------------ | -------------------------------------- |
| `/`         | None               | Open to all                            |
| `/login`    | `<PublicRoute>`    | Redirects to `/notes` if logged in     |
| `/register` | `<PublicRoute>`    | Redirects to `/notes` if logged in     |
| `/notes`    | `<ProtectedRoute>` | Redirects to `/login` if not logged in |

---

## What You Still Need to Add on BE

| Endpoint                | Purpose                               |
| ----------------------- | ------------------------------------- |
| `GET /api/auth/me`      | FE checks session on page load        |
| `POST /api/auth/logout` | FE triggers logout (destroys session) |

Both are simple — `authProtect` guard + call existing `destroySessionAndLogout()`.
