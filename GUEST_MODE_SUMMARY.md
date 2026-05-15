# Guest Mode - Quick Summary

## What Changed

### Files Modified (4 files)
1. **`stores/authStore.ts`**
   - Added `isGuest: boolean` state
   - Added `guestLogin(): void` action
   - Updated `signOut()` to reset guest state

2. **`utils/secureFetch.ts`**
   - Checks `isGuest` state
   - Skips Authorization header for guests
   - Allows requests without Firebase user

3. **`app/(auth)/sign-in.tsx`**
   - Added "Continue as Guest" button
   - Calls `guestLogin()` when pressed

4. **`app/_layout.tsx`**
   - Updated routing to check `isGuest`
   - Routes guests directly to home

### No Breaking Changes
- All existing auth flow remains unchanged
- Authenticated users unaffected
- Guest mode is optional

## How to Use

### For Users
1. On sign-in screen, tap "Continue as Guest"
2. Access main app without Firebase login
3. View public announcements
4. Cannot access authenticated features

### For Developers

#### Check if user is guest:
```typescript
const { isGuest, isAuthenticated } = useAuthStore();

if (isGuest) {
  // Show guest-specific UI
}
```

#### Allow guest API calls:
```typescript
import { secureFetch } from "@/utils/secureFetch";

// Guest requests have no Authorization header
const response = await secureFetch("/api/announcements", {
  method: "GET"
});
```

#### Protect authenticated features:
```typescript
import { useAuthStore } from "@/stores/authStore";

const { isGuest, isAuthenticated } = useAuthStore();

if (isGuest) {
  return <SignInPrompt />;
}

// Show authenticated content
```

#### Control with CASL abilities:
```typescript
const { ability } = useAuthStore();

if (!ability.can("read", "CellDetails")) {
  // Guest cannot read cell details
}
```

## Guest User Capabilities

### Can Do ✅
- View home page
- Read public announcements
- Access public flows (`get_public: true`)
- Browse public resources
- View app without authentication

### Cannot Do ❌
- Access user profile
- Edit personal settings
- View role-restricted content
- Perform mutations (create/update/delete)
- Receive push notifications
- Access authenticated APIs

## Key Design Decisions

1. **No Firebase Session**
   - Guests bypass Firebase entirely
   - No credentials stored
   - Clean separation from auth

2. **No Authorization Header**
   - Public endpoints must accept unsigned requests
   - Backend treats missing header as guest user

3. **Same Role.NONE Ability**
   - Guests use Role.NONE, same as unauthenticated logged-in users
   - Can be enhanced to Role.GUEST if needed

4. **Not Persisted**
   - Guest state cleared on app restart by default
   - Can be persisted with AsyncStorage if desired

5. **No Intermediate State**
   - Either `isGuest === true` or user is authenticated
   - Never both true simultaneously

## Backend Requirements

Your API must support these scenarios:

1. **Accept unsigned requests for public endpoints**
   ```
   GET /api/announcements
   (no Authorization header)
   → Returns public announcements
   ```

2. **Reject unsigned requests for protected endpoints**
   ```
   GET /api/user/profile
   (no Authorization header)
   → 401 Unauthorized
   ```

3. **Include auth-dependent data**
   ```
   GET /api/announcements
   Authorization: Bearer <token>
   → Returns user-specific + public announcements
   
   GET /api/announcements
   (no header)
   → Returns only public announcements
   ```

## Testing Checklist

- [ ] "Continue as Guest" button visible on sign-in
- [ ] Tapping it navigates to home without Firebase auth
- [ ] Public announcements load without Authorization header
- [ ] Authenticated screens show sign-in prompt for guests
- [ ] Normal login flow still works
- [ ] Guest state cleared on sign out
- [ ] No console errors

## Files Created (Documentation)
- `GUEST_MODE_IMPLEMENTATION.md` - Detailed technical guide
- `GUEST_MODE_EXAMPLES.md` - Code examples and patterns
- `GUEST_MODE_SUMMARY.md` - This file

## Next Steps

1. **Test the guest flow** - Use the testing checklist above
2. **Update backend endpoints** - Ensure they handle unsigned requests
3. **Add access controls** - Use examples to gate features
4. **Monitor guest behavior** - Track guest user actions (optional)
5. **Consider enhancements**:
   - Persist guest state across app restarts
   - Add guest analytics
   - Create guest upsell moments
   - Implement guest session timeout

## Rollback

If needed, reverting is simple:
1. Remove `isGuest` from authStore
2. Remove guest check from secureFetch
3. Remove "Continue as Guest" button
4. Remove guest check from navigation
5. That's it—no other code affected

## Questions?

Refer to the implementation guide and examples for:
- Detailed explanations: `GUEST_MODE_IMPLEMENTATION.md`
- Code patterns: `GUEST_MODE_EXAMPLES.md`
- Edge cases: `GUEST_MODE_IMPLEMENTATION.md` → "Edge Cases"
