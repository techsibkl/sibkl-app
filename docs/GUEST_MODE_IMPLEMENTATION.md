# Guest Mode Implementation Guide

## Overview
This document explains the Guest Mode implementation for the Expo app auth flow. Guest mode allows users to access the main app and view public content without logging in.

## Changes Made

### 1. **Auth Store** (`stores/authStore.ts`)
Added guest mode support to Zustand store:

```typescript
- Added `isGuest: boolean` state
- Added `guestLogin(): void` action
```

**Guest Login Flow:**
- Sets `isGuest = true`
- Sets `isAuthenticated = false`
- Sets `firebaseUser = null`
- Sets `user = null`
- Sets `authLoaded = true`
- Sets `ability` to Role.NONE
- Bypasses Firebase entirely

**Sign Out Enhancement:**
- Also resets `isGuest = false` when user signs out

### 2. **Secure Fetch** (`utils/secureFetch.ts`)
Updated fetch wrapper to support guest users:

```typescript
- Checks `isGuest` state from store
- Allows requests without Authorization header for guests
- Still requires Firebase token for authenticated users
```

**Key Logic:**
- Guest users: No Authorization header sent
- Authenticated users: Bearer token sent as before
- Error handling: Allows guests to proceed (no "User not signed in" error)

### 3. **Sign In Screen** (`app/(auth)/sign-in.tsx`)
Added "Continue as Guest" button below existing auth options:

```typescript
- New button triggers `guestLogin()`
- Styled with border to distinguish from primary Sign In action
- Mobile-responsive padding (Android vs iOS)
```

### 4. **Root Navigation** (`app/_layout.tsx`)
Updated auth routing logic:

```typescript
if (!authLoaded) {
  // Loading state
  router.replace("/(auth)/splash");
} else if (isGuest) {
  // Guest goes straight to app
  router.replace("/(app)/home");
} else if (!firebaseUser) {
  // No Firebase user → sign in
  router.replace("/(auth)/sign-in");
} else if (!user?.people_id) {
  // Incomplete profile → complete it
  router.replace("/(auth)/complete-profile");
} else {
  // Authenticated → home
  router.replace("/(app)/home");
}
```

## How It Works

### Guest User Journey
1. User taps "Continue as Guest"
2. `guestLogin()` sets `isGuest = true` and `authLoaded = true`
3. Navigation check sees `isGuest = true` → routes to `/(app)/home`
4. App screens render with `isGuest` context
5. API calls via `secureFetch()` don't include Authorization header

### Access Control
Guests can:
- ✅ View main home page
- ✅ Access announcements (public API)
- ✅ View any screen with `get_public: true` in Flow rules
- ✅ Read any public Announcements/Resources

Guests cannot:
- ❌ Access authenticated-only features
- ❌ View user-specific data
- ❌ Perform mutations (create/update/delete)
- ❌ Access role-based content

### CASL Ability
Guest users have `Role.NONE` ability, which grants:
- Reading public flows (`Flow` with `get_public: true`)
- Reading assigned profiles (none for guests)
- Reading public announcements (if available)

Restrict access in components using:
```typescript
import { useAuthStore } from "@/stores/authStore";

// In component:
const { ability, isGuest } = useAuthStore();

if (!ability.can("read", "Announcements")) {
  return <LockedContent />;
}
```

## Edge Cases & Considerations

### 1. **Existing Firebase Auth State**
- `handleAuthStateChange` is NOT called for guests
- Firebase auth state listener still runs
- If user has existing Firebase session, it won't interfere with guest mode
- When guest user logs in, guest state is cleared and normal flow takes over

### 2. **Unauthenticated API Calls**
Current implementation relies on backend accepting requests without Authorization header for public endpoints:

```typescript
// Backend should handle:
if (!Authorization header) {
  // Treat as public/guest request
}
```

If you need explicit guest handling on backend:
```typescript
// Add custom header in secureFetch
const headers = {
  ...(isGuest ? { "X-Guest-User": "true" } : {}),
  ...
};
```

### 3. **Persisting Guest State**
Currently, guest state is NOT persisted across app restarts. If you need persistence:

```typescript
// In guestLogin():
import AsyncStorage from "@react-native-async-storage/async-storage";

await AsyncStorage.setItem("isGuest", "true");

// In init():
const isGuest = await AsyncStorage.getItem("isGuest");
if (isGuest === "true") {
  set({ isGuest: true, authLoaded: true });
}
```

### 4. **Device Token Registration**
Guest users skip device token registration (line 121 in `app/_layout.tsx`):
```typescript
useEffect(() => {
  if (!firebaseUser) return; // Guests have null firebaseUser
  // ... token registration
}, [firebaseUser?.uid]);
```

This is intentional—guests won't receive push notifications.

### 5. **Logout from Guest Mode**
When a guest user taps sign out:
```typescript
await signOut(); // Doesn't actually sign out (no Firebase session)
// But sets: isGuest = false, authLoaded = true
// Navigation will route back to sign-in
```

If you want to prevent guests from signing out:
```typescript
const handleSignOut = async () => {
  if (isGuest) {
    // Don't actually sign out guests, just navigate
    router.replace("/(auth)/sign-in");
    return;
  }
  await signOut();
};
```

## Testing Checklist

- [ ] Tap "Continue as Guest" button
- [ ] App navigates to home without Firebase auth
- [ ] Can view announcements (no Authorization header sent)
- [ ] Cannot access authenticated features (show login prompt)
- [ ] Guest button still visible when returning to sign-in
- [ ] Sign out clears guest state
- [ ] Existing login flow still works
- [ ] No errors in console related to missing auth

## Rollback Instructions

If you need to remove guest mode:

1. Remove `isGuest` from `AuthState` type
2. Remove `guestLogin()` action
3. Remove guest login from `secureFetch.ts`
4. Remove "Continue as Guest" button from sign-in screen
5. Remove `isGuest` check from navigation routing

All changes are isolated and non-breaking.

## API Endpoint Considerations

Ensure your backend handles these scenarios:

1. **Public endpoints** (announcements, flows):
   - Accept requests WITHOUT Authorization header
   - Return public/guest-accessible data only

2. **Authenticated endpoints** (user profile, settings):
   - Check Authorization header
   - Return 401 if missing for protected resources

3. **Guest-specific endpoints** (optional):
   - Can use `X-Guest-User: true` header if needed
   - Implement guest role restrictions server-side

## Future Enhancements

Consider implementing:

1. **Persistent Guest Sessions**
   - Save state to AsyncStorage
   - Restore on app launch

2. **Guest Analytics**
   - Track guest user actions
   - Separate from authenticated user metrics

3. **Guest Upsell**
   - Show limited-feature notices
   - Prompt to sign up at key moments

4. **Guest Permissions**
   - Create more granular Role.GUEST role
   - Define specific guest-accessible features
   - Different from Role.NONE

5. **Guest Session Timeout**
   - Auto-logout guests after inactivity
   - Preserve some state if desired
