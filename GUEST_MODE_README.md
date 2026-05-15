# Guest Mode - Complete Implementation Guide

## 🎯 Overview

Guest Mode allows users to access your Expo app without Firebase authentication. Guests can view public announcements and non-authenticated features while being blocked from authenticated-only content.

**Status:** ✅ Fully Implemented and Ready to Test

## 📋 Quick Start

### For Users
1. Open the app
2. On the sign-in screen, tap **"Continue as Guest"**
3. You're in! Access home, announcements, and public features

### For Developers
Check if user is guest:
```typescript
const { isGuest, isAuthenticated } = useAuthStore();

if (isGuest) {
  return <PublicView />;
}
return <AuthenticatedView />;
```

## 🔧 What Was Changed

### 4 Files Modified

#### 1. **`stores/authStore.ts`** - Auth State Management
```diff
+ isGuest: boolean = false
+ guestLogin(): void
```
- Added guest state tracking
- Bypasses Firebase entirely
- Sets Role.NONE ability for guests

#### 2. **`utils/secureFetch.ts`** - API Request Handler
```diff
+ Checks isGuest state
+ Skips Authorization header for guests
+ Allows unsigned requests
```
- Guests make API calls without tokens
- Authenticated users unaffected
- Backend receives requests with/without headers

#### 3. **`app/(auth)/sign-in.tsx`** - UI
```diff
+ "Continue as Guest" button added
```
- New button below existing auth options
- Calls `guestLogin()`
- Mobile-responsive styling

#### 4. **`app/_layout.tsx`** - Navigation
```diff
+ isGuest check in routing logic
```
- Routes guests directly to home
- Bypasses profile completion
- Firebase init unaffected

### 5 Documentation Files Created

| File | Purpose |
|------|---------|
| `GUEST_MODE_SUMMARY.md` | 2-minute overview |
| `GUEST_MODE_IMPLEMENTATION.md` | Technical deep dive |
| `GUEST_MODE_EXAMPLES.md` | Code patterns & examples |
| `GUEST_MODE_CHECKLIST.md` | Integration & testing guide |
| `GUEST_MODE_FLOW_DIAGRAM.md` | Visual diagrams |

## 🚀 Implementation Details

### Guest Login Flow
```typescript
guestLogin() {
  set({
    isGuest: true,                    // Mark as guest
    isAuthenticated: false,           // Not authenticated
    firebaseUser: null,               // No Firebase session
    user: null,                       // No user data
    authLoaded: true,                 // Ready for routing
    ability: defineAbilityFor(        // Guest role
      { id: 0, roles: [Role.NONE] }
    ),
    isLoading: false,
  });
}
```

### API Requests
```typescript
// Guest request
secureFetch("/api/announcements")
→ Headers: { "Content-Type": "application/json" }
→ No Authorization header

// Authenticated request
secureFetch("/api/announcements")  
→ Headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer <token>"
  }
```

### Navigation Logic
```typescript
if (!authLoaded) {
  // Loading → Splash
  router.replace("/(auth)/splash");
} else if (isGuest) {
  // Guest → Home (DIRECT ACCESS)
  router.replace("/(app)/home");
} else if (!firebaseUser) {
  // No auth → Sign-in
  router.replace("/(auth)/sign-in");
} else if (!user?.people_id) {
  // Incomplete profile → Complete it
  router.replace("/(auth)/complete-profile");
} else {
  // Authenticated → Home
  router.replace("/(app)/home");
}
```

## ✅ Features Enabled

### Guests Can ✅
- View home page
- Access announcements (no Authorization header)
- View public flows (`get_public: true`)
- Browse public resources
- Use `Role.NONE` abilities

### Guests Cannot ❌
- Access user profile
- Edit settings
- View role-restricted content
- Perform mutations
- Receive push notifications
- Access authenticated APIs

## 🔐 Access Control

### Component-Level Gating
```typescript
import { useAuthStore } from "@/stores/authStore";

export const ProtectedFeature = () => {
  const { isGuest } = useAuthStore();
  
  if (isGuest) {
    return <SignInPrompt />;
  }
  
  return <FeatureContent />;
};
```

### CASL Ability-Based Gating
```typescript
const { ability } = useAuthStore();

if (ability.can("read", "CellDetails")) {
  return <CellDetails />;
}

return <AccessDenied />;
```

### Conditional UI
```typescript
export const HomeScreen = () => {
  const { isGuest } = useAuthStore();
  
  return (
    <>
      <AnnouncementsSection />  {/* Always visible */}
      
      {!isGuest && (              {/* Auth-only */}
        <>
          <PersonalFlows />
          <AssignedTasks />
        </>
      )}
    </>
  );
};
```

## 🔄 User Flows

### Flow 1: Guest → Browse → Sign In
```
Sign In Screen
    ↓
[Continue as Guest] button
    ↓
Home (Guest Access)
    ↓
Try to access Settings
    ↓
[Sign In] prompt
    ↓
Complete authentication
    ↓
Full app access
```

### Flow 2: Returning Guest
```
App Launch
    ↓
Previous guest session (if persisted)
    ↓
Home (Guest)
    ↓
[Sign In] to unlock features
    ↓
Authentication
    ↓
Full access
```

### Flow 3: Authenticated User (Unchanged)
```
App Launch
    ↓
Firebase session detected
    ↓
Complete Profile check
    ↓
Home (Full Access)
```

## 📱 API Endpoints Required

Your backend must support these scenarios:

### Public Endpoints (Accept unsigned)
```
GET /api/announcements
(no Authorization header)
→ 200 OK
→ Returns public announcements only
```

### Protected Endpoints (Require auth)
```
GET /api/user/profile
(no Authorization header)
→ 401 Unauthorized
→ Error: "Authentication required"
```

### Conditional Endpoints (Serve both)
```
GET /api/announcements
(no header)
→ Public announcements only

GET /api/announcements
Authorization: Bearer <token>
→ Public + user-specific announcements
```

## 🧪 Testing

### Quick Manual Test
1. Clear app cache
2. Tap "Continue as Guest"
3. Verify home loads
4. Open DevTools → Network
5. Make API call (e.g., announcements)
6. Verify NO "Authorization" header
7. Verify response contains data
8. Tap Sign In
9. Complete authentication
10. Verify Authorization header now present

### Unit Test Example
```typescript
test('guestLogin sets correct state', () => {
  const { guestLogin } = useAuthStore.getState();
  guestLogin();
  const state = useAuthStore.getState();
  
  expect(state.isGuest).toBe(true);
  expect(state.isAuthenticated).toBe(false);
  expect(state.firebaseUser).toBeNull();
  expect(state.authLoaded).toBe(true);
});
```

### E2E Test Example (Cypress)
```typescript
describe('Guest Mode', () => {
  it('allows guest access to app', () => {
    cy.visit('/');
    cy.contains('Continue as Guest').click();
    cy.url().should('include', '/home');
    cy.contains('Announcements').should('exist');
  });
});
```

## 🛠️ Configuration

### To Persist Guest State (Optional)
```typescript
// In guestLogin():
import AsyncStorage from '@react-native-async-storage/async-storage';

guestLogin: () => {
  await AsyncStorage.setItem('isGuest', 'true');
  set({ isGuest: true, ... });
}
```

### To Add Custom Guest Header (Optional)
```typescript
// In secureFetch():
const headers = {
  ...init.headers,
  ...(isGuest ? { "X-Guest-User": "true" } : {}),
  "Content-Type": "application/json",
};
```

### To Create Separate Guest Role (Optional)
```typescript
// Instead of Role.NONE, create:
export enum Role {
  GUEST = "Guest",
  // ... other roles
}

// Then define guest abilities:
if (person?.roles?.includes(Role.GUEST)) {
  can("read", "Announcements");
  can("read", "Resources");
  // ... guest-specific permissions
}
```

## 🚨 Edge Cases & Solutions

### Issue: Guest Can't Access Protected Features
**Expected behavior.** Guide to sign in:
```typescript
if (isGuest && needsAuth) {
  return <SignInPrompt />;
}
```

### Issue: Guest State Not Persisted
**Solution:** Use AsyncStorage (see Configuration above)

### Issue: Backend Rejects Unsigned Requests
**Solution:** Update backend to accept unsigned requests for public endpoints

### Issue: Guest User in Firebase Console
**Expected:** Guest users won't appear (no Firebase session)

## 📚 Documentation Files

### For Different Audiences

**Non-technical Users/PMs:**
- `GUEST_MODE_SUMMARY.md` - Business overview

**Frontend Developers:**
- `GUEST_MODE_IMPLEMENTATION.md` - Technical details
- `GUEST_MODE_EXAMPLES.md` - Code patterns
- `GUEST_MODE_FLOW_DIAGRAM.md` - Visual diagrams

**Integration/Testing:**
- `GUEST_MODE_CHECKLIST.md` - Step-by-step integration
- `GUEST_MODE_EXAMPLES.md` - Testing examples

**Backend Developers:**
- `GUEST_MODE_EXAMPLES.md` - Backend example code
- `GUEST_MODE_IMPLEMENTATION.md` - API requirements

## 🎯 Next Steps

1. **Review & Test**
   - Read `GUEST_MODE_SUMMARY.md` (2 min)
   - Test guest flow manually (5 min)
   - Check console for errors

2. **Backend Integration**
   - Verify endpoints accept unsigned requests
   - Update endpoints to handle guests
   - Test API calls from guest client

3. **Feature Gating**
   - Review `GUEST_MODE_EXAMPLES.md`
   - Add guest checks to protected screens
   - Test access denial for guests

4. **Testing**
   - Use `GUEST_MODE_CHECKLIST.md`
   - Run manual tests
   - Add unit/E2E tests
   - Test edge cases

5. **Deployment**
   - Ensure backend is ready
   - Deploy app with guest mode
   - Monitor guest usage
   - Collect feedback

## 🔍 Debugging

### Guest mode not activating?
```typescript
// Check store state
console.log(useAuthStore.getState().isGuest);
console.log(useAuthStore.getState().authLoaded);
```

### API calls still sending auth header?
```typescript
// Check in Network tab
// Or add logging in secureFetch:
console.log("Is guest:", isGuest);
console.log("Has user:", !!user);
console.log("Will send token:", !isGuest && !!user);
```

### Navigation not routing to home?
```typescript
// Check routing logic in app/_layout.tsx
// Verify isGuest is checked before firebaseUser
// Verify authLoaded is true
```

### Guest can access protected features?
```typescript
// Add guard at component level:
if (isGuest && needsAuth) {
  return <SignInPrompt />;
}
```

## 📞 Support

### Common Questions

**Q: Will guest users be tracked in Firebase?**
A: No, they have no Firebase session. Backend logging only.

**Q: Can guests create accounts later?**
A: Yes, they can sign in from any screen. Guest state is cleared.

**Q: Do guests receive push notifications?**
A: No, registration is skipped (no Firebase user).

**Q: Can we show ads to guests?**
A: Yes, you have the `isGuest` flag to target them.

**Q: Is guest session secure?**
A: Yes, guests can only access public data via unsigned requests.

## 🎓 Learning Resources

- [CASL Ability Documentation](https://casl.js.org/)
- [Firebase Auth - React Native](https://rnfirebase.io/auth/usage)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Expo Router Navigation](https://docs.expo.dev/routing/introduction/)

## 📝 Implementation Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| Auth Store | ✅ Complete | isGuest + guestLogin() added |
| API Handler | ✅ Complete | secureFetch supports guests |
| UI Button | ✅ Complete | Sign-in screen ready |
| Navigation | ✅ Complete | Routing logic updated |
| Documentation | ✅ Complete | 5 guides created |
| Backend Integration | ⏳ Required | Endpoints need updates |
| Feature Gating | ⏳ Required | Per-screen implementation |
| Testing | ⏳ Required | Manual + automated tests |
| Deployment | ⏳ Required | When backend ready |

## 🚀 Success Criteria

Your guest mode is working when:

- ✅ "Continue as Guest" button visible and clickable
- ✅ Tapping it routes to home without Firebase errors
- ✅ Public data loads without Authorization header
- ✅ Protected features show sign-in prompt for guests
- ✅ Users can sign in after browsing as guest
- ✅ Normal authenticated flow unaffected
- ✅ No console errors

---

**Last Updated:** 2026-05-13
**Version:** 1.0
**Status:** Ready for Integration & Testing
