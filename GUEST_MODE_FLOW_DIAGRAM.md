# Guest Mode Flow Diagrams

## Authentication State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    App Launch                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
           ┌───────────────────────┐
           │  authLoaded = false   │
           │  Show: Splash Screen  │
           └───────────┬───────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    ┌──────────────┐        ┌──────────────┐
    │ Firebase     │        │ Manual Guest │
    │ Session      │        │ Login        │
    │ Exists?      │        │              │
    └──────┬───────┘        └──────┬───────┘
           │                       │
      NO  │                        │  YES
          ▼                        ▼
    ┌──────────────────────┐  ┌────────────────────┐
    │ firebaseUser = null  │  │ isGuest = true     │
    │ Show: Sign In        │  │ Show: Home         │
    │ - Email/Password     │  │ (Direct Access)    │
    │ - Continue as Guest  │  └────────────────────┘
    └──────┬───────────────┘
      YES │
          ▼
    ┌──────────────────────┐
    │ Complete Profile?    │
    │ people_id exists?    │
    └──────┬────────────┬──┘
      NO  │            │ YES
          ▼            ▼
    ┌─────────────┐  ┌──────────────┐
    │ Show:       │  │ Show: Home   │
    │ Complete    │  │ (Fully Auth) │
    │ Profile     │  └──────────────┘
    └─────────────┘
```

## User Journey: Guest vs Authenticated

### Guest User Path
```
┌─────────────────┐
│  Sign In Screen │
└────────┬────────┘
         │
    ┌────▼──────────────────┐
    │ User taps:             │
    │ "Continue as Guest"    │
    └────┬───────────────────┘
         │
    ┌────▼──────────────────────┐
    │  guestLogin()              │
    │  • isGuest = true          │
    │  • isAuthenticated = false │
    │  • firebaseUser = null     │
    │  • user = null             │
    │  • authLoaded = true       │
    │  • ability = Role.NONE     │
    └────┬──────────────────────┘
         │
    ┌────▼────────────────┐
    │  Route to:           │
    │  /(app)/home         │
    └────┬────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │  Guest Access in App               │
    │  ✅ Home Page                       │
    │  ✅ Announcements (no auth header) │
    │  ✅ Public Flows                   │
    │  ❌ Profile Settings               │
    │  ❌ Cell Details                   │
    │  ❌ Personal Flows                 │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────┐
    │ User wants to Login    │
    │ Taps: Sign In button   │
    └────┬───────────────────┘
         │
    ┌────▼──────────────────┐
    │ Route to:              │
    │ /(auth)/sign-in        │
    └────┬───────────────────┘
         │
    ┌────▼──────────────────┐
    │ Complete auth flow     │
    │ Guest state cleared    │
    │ isGuest = false        │
    └────┬───────────────────┘
         │
    ┌────▼────────────────┐
    │ Authenticated Access │
    │ Full app features    │
    └──────────────────────┘
```

### Authenticated User Path (Unchanged)
```
┌─────────────────┐
│  Sign In Screen │
└────────┬────────┘
         │
    ┌────▼────────────────────────┐
    │ User taps:                   │
    │ "Sign In" (with credentials) │
    └────┬───────────────────────┘
         │
    ┌────▼──────────────────────┐
    │  signIn(email, password)   │
    │  • Firebase auth           │
    │  • handleAuthStateChange   │
    │  • isAuthenticated = true  │
    └────┬──────────────────────┘
         │
    ┌────▼───────────────────────┐
    │ Profile Complete?           │
    │ people_id exists?           │
    └────┬────────────┬──────────┘
      NO │            │ YES
         ▼            ▼
    ┌─────────────┐ ┌──────────────┐
    │ Complete    │ │ Route to:    │
    │ Profile     │ │ /(app)/home  │
    └─────────────┘ └──────────────┘
         │
         └──────────────────┐
                            │
                    ┌───────▼──────────────┐
                    │ Authenticated Access │
                    │ Full app features    │
                    └──────────────────────┘
```

## Network Request Flow

### Guest User API Call
```
┌──────────────────────┐
│ Component             │
│ secureFetch(url, ...) │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────────────┐
│ secureFetch() function       │
│                              │
│ 1. Get store state           │
│    isGuest = true            │
│                              │
│ 2. Check auth                │
│    firebaseUser = null ✓     │
│    isGuest = true ✓          │
│    → Proceed                 │
│                              │
│ 3. Skip token fetch          │
│    if (user && !isGuest)     │
│    → No token obtained       │
│                              │
│ 4. Build headers             │
│    {                         │
│      "Content-Type": "..."   │
│      (NO Authorization)      │
│    }                         │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ HTTP Request                 │
│                              │
│ GET /api/announcements       │
│ Headers:                     │
│   Content-Type: app/json     │
│   (NO Authorization header)  │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Backend                      │
│                              │
│ if (!Authorization) {        │
│   // Treat as guest          │
│   return public data only    │
│ }                            │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Response                     │
│ {                            │
│   success: true              │
│   data: [...]  // public     │
│ }                            │
└──────────────────────────────┘
```

### Authenticated User API Call
```
┌──────────────────────┐
│ Component             │
│ secureFetch(url, ...) │
└──────────┬────────────┘
           │
           ▼
┌─────────────────────────────┐
│ secureFetch() function       │
│                              │
│ 1. Get store state           │
│    isGuest = false           │
│    firebaseUser exists       │
│                              │
│ 2. Check auth                │
│    user exists ✓             │
│    isGuest = false ✓         │
│    → Proceed                 │
│                              │
│ 3. Fetch token               │
│    if (user && !isGuest)     │
│    token = await getIdToken()│
│    → Token obtained          │
│                              │
│ 4. Build headers             │
│    {                         │
│      "Content-Type": "..."   │
│      Authorization:          │
│        "Bearer <token>"      │
│    }                         │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ HTTP Request                 │
│                              │
│ GET /api/announcements       │
│ Headers:                     │
│   Content-Type: app/json     │
│   Authorization:             │
│     Bearer eyJhbGc...        │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Backend                      │
│                              │
│ if (Authorization) {         │
│   // Verify token            │
│   // Get user roles          │
│   return public + user data  │
│ }                            │
└──────────┬────────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Response                     │
│ {                            │
│   success: true              │
│   data: [...] // public +    │
│              // user-scoped  │
│ }                            │
└──────────────────────────────┘
```

## Feature Access Control

```
┌────────────────────────────────────────────────────────────────┐
│                    App Feature Decision Tree                    │
└────────────────┬─────────────────────────────────────────────────┘
                 │
          ┌──────▼──────┐
          │  Check:     │
          │  isGuest?   │
          └──┬───────┬──┘
        YES  │       │ NO
             │       │
          ┌──▼──┐  ┌─▼────────────┐
          │     │  │              │
          │     │  │ Check:       │
          │     │  │ isAuth?      │
          │     │  └─┬───────┬────┘
          │     │ YES│       │NO
          │     │    │       │
    ┌─────▼──┬──▼──┐ │  ┌────▼────┐
    │         │     │ │  │          │
    ▼         ▼     ▼ ▼  ▼          │
┌────────┐ ┌────┐ ┌────────┐        │
│ Home   │ │Sign│ │Full    │        │
│Page    │ │In  │ │Access  │        │
│        │ │Req │ │        │        │
│✅Pub   │ │    │ │✅All   │        │
│✅Ann   │ │    │ │Features│        │
│❌Auth  │ │    │ │        │        │
└────────┘ └────┘ └────────┘        │
                                    ▼
                            ┌──────────────┐
                            │ Splash/Load  │
                            │ (authLoaded  │
                            │  = false)    │
                            └──────────────┘

Legend:
✅ = Accessible
❌ = Blocked
Auth = Authenticated-only features
Pub = Public features
Ann = Announcements
```

## State Transitions

```
                    ┌─────────────────────┐
                    │   Initial State     │
                    │ isGuest = false     │
                    │ isAuth = false      │
                    │ authLoaded = false  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼───────────┐
                    │  App Initializing    │
                    │ authLoaded = false   │
                    │ (checking Firebase)  │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┼──────────────┐
                 │             │              │
           ┌─────▼─────┐  ┌────▼────┐  ┌────▼────┐
           │ Firebase   │  │ Manual  │  │ No Session
           │ Session    │  │ Guest   │  │ + No Guest
           │ Found      │  │ Login   │  │ (Go to SignIn)
           └─────┬─────┘  └────┬────┘  └────┬────┘
                 │             │            │
            ┌────▼─────┐   ┌───▼───┐  ┌────▼───┐
            │Sign In    │   │Guest  │  │Sign In │
            │→Complete  │   │Mode   │  │Screen  │
            │Profile    │   │Active │  │        │
            └─────┬─────┘   └───┬───┘  └────────┘
                  │             │
              ┌───▼─┐        ┌──▼────────┐
              │Home │        │Home (Guest│
              │Full │        │ Features) │
              │Auth │        └───┬───────┘
              └─────┘            │
                                 │ User Signs In
                                 │
                        ┌────────▼──────┐
                        │SignIn Screen   │
                        │(Guest cleared) │
                        │→Authenticate   │
                        └────────┬───────┘
                                 │
                        ┌────────▼──────┐
                        │Complete Profile│
                        │or              │
                        │Full Auth       │
                        └────────┬───────┘
                                 │
                        ┌────────▼──────┐
                        │Home (Full Auth│
                        │Full Features)  │
                        └────────────────┘
```

## Component Rendering Flow

```
┌─────────────────────────────────┐
│  useAuthStore hook              │
│  const { isGuest, ... } = store  │
└──────────────┬──────────────────┘
               │
        ┌──────▼──────┐
        │ Render logic │
        └──┬───────┬──┘
      YES  │       │ NO
      (G)  │       │ (A)
       ┌───▼──┐    │
       │      │    │
       ▼      │    │
    ┌──────┐  │    │
    │Guest │  │    │
    │View  │  │    │
    └──────┘  │    │
       │      │    │
       │      │    ├───────┬──────┐
       │      │    │       │      │
       │      │    ▼       ▼      ▼
       │      │  ┌──┐  ┌──┐  ┌──────┐
       │      └→ │or├──┤if├──┤Auth? │
       │         └──┘  └──┘  └──┬───┘
       │                        │
       │                    YES │ NO
       │                        │
       │                  ┌─────▼────┐
       │                  │           │
       │                  ▼           ▼
       │              ┌────────┐  ┌─────────┐
       │              │Authed  │  │Loading  │
       │              │View    │  │Screen   │
       │              └────────┘  └─────────┘
       │                  │
       └──────────────────┘
              │
              ▼
        ┌──────────────┐
        │ Render Final │
        │ Component    │
        └──────────────┘
```

This helps visualize:
- Guest vs authenticated paths
- Network differences
- Feature access matrix
- State transitions
- Component rendering logic
