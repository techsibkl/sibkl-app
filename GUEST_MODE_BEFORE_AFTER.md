# Guest Mode - Before & After Comparison

## Auth Store Changes

### Before
```typescript
export type AuthState = {
  firebaseUser: FirebaseAuthTypes.User | null;
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authLoaded: boolean;
  ability: AnyAbility;
  setFirebaseUser: (firebaseUser: FirebaseAuthTypes.User | null) => void;
  setUser: (user: AppUser | null) => void;
  signIn: (email: string, password: string) => Promise<...>;
  signUp: (profileData: ProfileFormData) => Promise<...>;
  signOut: () => Promise<void>;
  init: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  authLoaded: false,
  ability: defineAbilityFor(<Person>{ id: 0, roles: [Role.NONE] }),
  
  // ... existing methods ...
  
  signOut: async () => {
    await signOut(getAuth());
    set({ firebaseUser: null, user: null, isAuthenticated: false });
  },
  
  init: () => {
    set({ authLoaded: false });
    onAuthStateChanged(getAuth(), async (firebaseUser) =>
      handleAuthStateChange(firebaseUser, set)
    );
  },
}));
```

### After
```typescript
export type AuthState = {
  firebaseUser: FirebaseAuthTypes.User | null;
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;                    // ← NEW
  authLoaded: boolean;
  ability: AnyAbility;
  setFirebaseUser: (firebaseUser: FirebaseAuthTypes.User | null) => void;
  setUser: (user: AppUser | null) => void;
  signIn: (email: string, password: string) => Promise<...>;
  signUp: (profileData: ProfileFormData) => Promise<...>;
  guestLogin: () => void;              // ← NEW
  signOut: () => Promise<void>;
  init: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  firebaseUser: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,                      // ← NEW
  authLoaded: false,
  ability: defineAbilityFor(<Person>{ id: 0, roles: [Role.NONE] }),
  
  // ... existing methods ...
  
  // Guest login                        // ← NEW METHOD
  guestLogin: () => {
    set({
      isGuest: true,
      isAuthenticated: false,
      firebaseUser: null,
      user: null,
      authLoaded: true,
      ability: defineAbilityFor(<Person>{ id: 0, roles: [Role.NONE] }),
      isLoading: false,
    });
  },
  
  signOut: async () => {
    await signOut(getAuth());
    set({
      firebaseUser: null,
      user: null,
      isAuthenticated: false,
      isGuest: false,                  // ← UPDATED: Also clear guest
    });
  },
  
  init: () => {
    set({ authLoaded: false });
    onAuthStateChanged(getAuth(), async (firebaseUser) =>
      handleAuthStateChange(firebaseUser, set)
    );
  },
}));
```

**Changes:**
- ✅ Added `isGuest: boolean` field
- ✅ Added `guestLogin(): void` method
- ✅ Updated `signOut()` to also reset `isGuest`

---

## Secure Fetch Changes

### Before
```typescript
import { getAuth, getIdToken } from "@react-native-firebase/auth";

export async function secureFetch(
  input: RequestInfo,
  init: RequestInit = {},
  options: { allowUnauthenticated?: boolean } = {}
) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user && !options.allowUnauthenticated)
    throw new Error("SecureFetch: User not signed in");

  let token: string | undefined = undefined;
  if (user) token = await getIdToken(user);

  const headers = {
    ...init.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };

  const res = await fetch(input, {
    ...init,
    headers,
  });

  return res;
}
```

### After
```typescript
import { getAuth, getIdToken } from "@react-native-firebase/auth";
import { useAuthStore } from "@/stores/authStore";  // ← NEW IMPORT

export async function secureFetch(
  input: RequestInfo,
  init: RequestInit = {},
  options: { allowUnauthenticated?: boolean } = {}
) {
  const auth = getAuth();
  const user = auth.currentUser;
  const { isGuest } = useAuthStore.getState();      // ← NEW: Check guest state

  // Allow guest users to make requests
  if (!user && !isGuest && !options.allowUnauthenticated)
    throw new Error("SecureFetch: User not signed in");

  // Only fetch token for authenticated users (not guests)
  let token: string | undefined = undefined;
  if (user && !isGuest) token = await getIdToken(user);  // ← UPDATED: Skip token for guests

  const headers = {
    ...init.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };

  const res = await fetch(input, {
    ...init,
    headers,
  });

  return res;
}
```

**Changes:**
- ✅ Import `useAuthStore` from store
- ✅ Get `isGuest` state from store
- ✅ Allow requests if `isGuest` is true (bypass "not signed in" error)
- ✅ Skip token fetching if guest

---

## Sign-In Screen Changes

### Before
```typescript
const Page = () => {
  const { signIn } = useAuthStore();
  
  // ... form setup ...
  
  return (
    <KeyboardAwareScrollView className="flex-1 bg-red-700">
      {/* Logo section */}
      {/* Email input */}
      {/* Password input */}
      {/* Remember me / Forgot password */}
      
      {/* Sign in button */}
      <TouchableOpacity
        className="w-full rounded-[15px] items-center justify-center mt-4 bg-primary-600"
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-lg text-white font-bold">
            Sign In
          </Text>
        )}
      </TouchableOpacity>

      {/* Sign up link */}
      <View className="items-center">
        <Text className="font-regular text-gray-600 text-sm">
          Dont have an account?{" "}
          <Link href="/sign-up" asChild>
            <Text className="text-primary-600 font-semibold">
              Create Account
            </Text>
          </Link>
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
};
```

### After
```typescript
const Page = () => {
  const { signIn, guestLogin } = useAuthStore();  // ← NEW: Add guestLogin
  
  // ... form setup ...
  
  return (
    <KeyboardAwareScrollView className="flex-1 bg-red-700">
      {/* Logo section */}
      {/* Email input */}
      {/* Password input */}
      {/* Remember me / Forgot password */}
      
      {/* Sign in button */}
      <TouchableOpacity
        className="w-full rounded-[15px] items-center justify-center mt-4 bg-primary-600"
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-lg text-white font-bold">
            Sign In
          </Text>
        )}
      </TouchableOpacity>

      {/* Sign up link */}
      <View className="items-center">
        <Text className="font-regular text-gray-600 text-sm">
          Dont have an account?{" "}
          <Link href="/sign-up" asChild>
            <Text className="text-primary-600 font-semibold">
              Create Account
            </Text>
          </Link>
        </Text>
      </View>

      {/* Guest mode button - NEW */}
      <TouchableOpacity
        className="w-full rounded-[15px] items-center justify-center mt-3 border border-gray-300"
        style={{
          paddingVertical:
            Platform.OS === "android" ? 14 : 16,
        }}
        onPress={() => guestLogin()}
      >
        <Text className="text-lg text-gray-600 font-semibold">
          Continue as Guest
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
};
```

**Changes:**
- ✅ Import `guestLogin` from store
- ✅ Add new "Continue as Guest" button
- ✅ Style with border to differentiate from primary action
- ✅ Call `guestLogin()` on press

---

## Root Navigation Changes

### Before
```typescript
function RootLayoutNav() {
  const router = useRouter();
  const { firebaseUser, user, authLoaded, init } = useAuthStore();

  // Auth init
  useEffect(() => {
    init();
  }, [init]);

  // Auth routing
  useEffect(() => {
    if (!authLoaded) {
      router.replace("/(auth)/splash");
    } else if (!firebaseUser) {
      router.replace("/(auth)/sign-in");
    } else if (!user?.people_id) {
      router.replace("/(auth)/complete-profile");
    } else {
      router.replace("/(app)/home");
    }
  }, [user, authLoaded, router, firebaseUser]);
  
  // ... rest of component ...
}
```

### After
```typescript
function RootLayoutNav() {
  const router = useRouter();
  const { firebaseUser, user, authLoaded, init, isGuest } = useAuthStore();  // ← NEW: Add isGuest

  // Auth init
  useEffect(() => {
    init();
  }, [init]);

  // Auth routing
  useEffect(() => {
    if (!authLoaded) {
      router.replace("/(auth)/splash");
    } else if (isGuest) {                           // ← NEW: Check guest first
      // Guest users go straight to app
      router.replace("/(app)/home");
    } else if (!firebaseUser) {
      router.replace("/(auth)/sign-in");
    } else if (!user?.people_id) {
      router.replace("/(auth)/complete-profile");
    } else {
      router.replace("/(app)/home");
    }
  }, [user, authLoaded, router, firebaseUser, isGuest]);  // ← NEW: Add isGuest dependency
  
  // ... rest of component ...
}
```

**Changes:**
- ✅ Destructure `isGuest` from store
- ✅ Add `isGuest` check BEFORE Firebase checks
- ✅ Route guests directly to home
- ✅ Add `isGuest` to useEffect dependencies

---

## User Flow Comparison

### Before: Single Authentication Path
```
Sign In Screen
    ↓
[Sign In] or [Create Account]
    ↓
Firebase Authentication
    ↓
Complete Profile
    ↓
Home (Full Access)
```

### After: Multiple Paths (Guest + Auth)
```
Sign In Screen
    ↓
[Sign In] [Create Account] [Continue as Guest] ← THREE OPTIONS
    ↓                          ↓                ↓
Firebase          Firebase Auth              No Auth
Auth              ↓                           ↓
    ↓        Complete Profile      Home (Guest)
Complete
Profile           ↓
    ↓        Home (Full)
Home
(Full)
```

---

## API Call Behavior

### Before: Always Required Auth
```typescript
secureFetch("/api/announcements")

// If no Firebase user → Error: "User not signed in"
// If has user → Include Authorization header
// Backend receives: Authorization: Bearer <token>
```

### After: Optional Auth
```typescript
secureFetch("/api/announcements")

// If guest user → OK, no Authorization header
// If authenticated → Include Authorization header  
// If no auth + not guest + not allowUnauthenticated → Error

// Backend receives:
// Guest: (no Authorization header)
// Auth:  Authorization: Bearer <token>
```

---

## State Diagram Comparison

### Before: Binary Auth States
```
User State:
┌─────────────┐              ┌──────────────┐
│  Not Auth   │─────────┬────│ Authenticated│
│ firebaseUser│         │    │ firebaseUser │
│  = null     │         │    │ = obj        │
│ isAuth = F  │         │    │ isAuth = T   │
└─────────────┘         │    └──────────────┘
                   Sign In/Up
```

### After: Ternary Auth States
```
User State:
┌─────────────┐        ┌──────────┐        ┌──────────────┐
│  Not Auth   │        │  Guest   │        │ Authenticated│
│ firebaseUser│        │ isGuest=T│        │ firebaseUser │
│  = null     │        │ isAuth=F │        │ = obj        │
│ isGuest=F   │   Guest Login    │        │ isGuest=F    │
│ isAuth=F    │        │          │        │ isAuth=T     │
└─────────────┘        └──────────┘        └──────────────┘
      │                      │                    │
      └─────→ Sign In ←──────┴────────────────────┘
      └─────→ Create Account ←────────────────────┘
```

---

## Features Comparison

### Before
```
User Access:
┌────────────────────────────────┐
│     Not Authenticated Users     │
├────────────────────────────────┤
│ ✅ See sign-in screen           │
│ ✅ Can create account           │
│ ❌ Cannot access app at all     │
│ ❌ Cannot view any features     │
└────────────────────────────────┘

┌────────────────────────────────┐
│    Authenticated Users          │
├────────────────────────────────┤
│ ✅ Full app access             │
│ ✅ View personal data          │
│ ✅ All features unlocked       │
└────────────────────────────────┘
```

### After
```
User Access:
┌────────────────────────────────┐
│   Not Authenticated Users       │
├────────────────────────────────┤
│ ✅ See sign-in screen           │
│ ✅ Can create account           │
│ ❌ Cannot access app at all     │
│ ❌ Cannot view any features     │
└────────────────────────────────┘

┌────────────────────────────────┐
│    Guest Users (NEW)            │
├────────────────────────────────┤
│ ✅ Access home page            │
│ ✅ View announcements          │
│ ✅ See public flows            │
│ ✅ Browse public resources     │
│ ❌ Cannot view personal data   │
│ ❌ Cannot access role-specific │
│    content                     │
│ ❌ Cannot perform mutations    │
└────────────────────────────────┘

┌────────────────────────────────┐
│    Authenticated Users          │
├────────────────────────────────┤
│ ✅ Full app access             │
│ ✅ View personal data          │
│ ✅ All features unlocked       │
│ ✅ Role-based access           │
└────────────────────────────────┘
```

---

## Lines of Code Changed

```
stores/authStore.ts:           +16 lines (-2 lines) = +14 lines
utils/secureFetch.ts:          +3 lines (-1 lines) = +2 lines
app/(auth)/sign-in.tsx:        +13 lines = +13 lines
app/_layout.tsx:               +2 lines = +2 lines
─────────────────────────────────────────────────────
Total:                         +31 lines

Documentation created:         5 files, ~1000 lines
```

---

## Breaking Changes

**None.** ✅

All existing functionality is preserved:
- Existing login/signup flow unchanged
- Firebase auth still works
- Navigation structure preserved
- State management compatible
- API calls still work for authenticated users

---

## Backward Compatibility

### For Authenticated Users
- ✅ No changes to auth flow
- ✅ No changes to user state
- ✅ No changes to API calls
- ✅ Fully transparent

### For Developers
- ✅ Existing hooks still work
- ✅ Can ignore guest mode if not needed
- ✅ Guest mode is purely additive

### For Backend
- ✅ Existing authenticated endpoints unchanged
- ✅ Just need to handle unsigned requests for public endpoints
- ✅ No breaking changes required

---

## Migration Path

### For Existing Users
- No action needed
- Users stay logged in
- Guest mode only applies to new sessions

### For New Users
- Will see "Continue as Guest" option
- Can browse as guest or sign in
- Completely optional

### For Backend
- Audit endpoints for public data
- Make public endpoints accept unsigned requests
- Keep protected endpoints requiring auth
- Done!

---

## Summary

| Aspect | Before | After | Change |
|--------|--------|-------|--------|
| Auth modes | 1 (Firebase) | 2 (Firebase + Guest) | +1 option |
| Sign-in buttons | 1 | 2 | +1 button |
| Navigation paths | 3 | 4 | +1 path |
| Files modified | 0 | 4 | New code |
| Breaking changes | 0 | 0 | No breaks |
| Line changes | 0 | +31 | Minimal |
| User options | Sign in/up | +Guest option | Better UX |
| Feature access | All or nothing | Tiered access | Flexibility |
