# Guest Mode Integration Checklist

## Phase 1: Implementation ✅ COMPLETE
- [x] Add `isGuest` state to authStore
- [x] Create `guestLogin()` action
- [x] Update `secureFetch` to skip auth header for guests
- [x] Add "Continue as Guest" button to sign-in screen
- [x] Update navigation routing for guests
- [x] Update `signOut()` to reset guest state

## Phase 2: Frontend Feature Gating

### Home Screen
- [ ] Wrap authenticated-only sections with guest check
- [ ] Show upsell message for guests
- [ ] Verify announcements load for guests

### Personal Flows
- [ ] Hide from guest users
- [ ] Show sign-in prompt
- [ ] Test: `isGuest ? <SignInPrompt /> : <PersonalFlows />`

### Cells Section
- [ ] Hide detailed cell info from guests
- [ ] Show cell list if public
- [ ] Test: Navigate as guest, verify access denied

### Settings
- [ ] Hide user settings from guests
- [ ] Keep sign-out visible for guests
- [ ] Test: Verify guest can exit app without errors

### Leaders/Directory
- [ ] Decide if guests can view leader list
- [ ] If yes: Show public leaders only
- [ ] If no: Hide entirely, show sign-in prompt

### Profile Section
- [ ] Hide user profile from guests
- [ ] Show sign-in prompt
- [ ] Test: All profile routes blocked for guests

## Phase 3: Backend API Updates

### Public Endpoints (Accept unsigned requests)
- [ ] `/api/announcements` - Returns public announcements
- [ ] `/api/flows?public=true` - Returns public flows
- [ ] `/api/resources?public=true` - Returns public resources
- [ ] `/api/leaders` - Returns leader list (if public)
- [ ] Add `Content-Type: application/json` header handling for all

**Implementation Pattern:**
```typescript
// Express.js example
app.get('/api/announcements', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  let userRoles = []; // Guest has empty roles
  if (token) {
    try {
      const decoded = await verifyToken(token);
      userRoles = decoded.roles;
    } catch (error) {
      // Invalid token, treat as guest
    }
  }
  
  const announcements = await Announcement.find({
    $or: [
      { public: true },
      { role_ids: { $in: userRoles } }
    ]
  });
  
  res.json({ success: true, data: announcements });
});
```

### Protected Endpoints (Require authentication)
- [ ] `/api/user/profile` - Return 401 if no token
- [ ] `/api/user/settings` - Return 401 if no token
- [ ] `/api/user/flows` - Return 401 if no token
- [ ] `/api/person` - Return 401 if no token

**Implementation Pattern:**
```typescript
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please sign in to access this resource'
    });
  }
  try {
    req.user = await verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/user/profile', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.uid);
  res.json({ success: true, data: user });
});
```

## Phase 4: Testing

### Manual Testing - Guest Flow
- [ ] Start app fresh (no cached auth)
- [ ] See sign-in screen
- [ ] Tap "Continue as Guest"
- [ ] App loads home screen
- [ ] No "User not signed in" errors in console
- [ ] Announcements section appears and loads
- [ ] No Authorization header in network tab

**Steps:**
1. Open app in simulator
2. Clear app cache: `Settings > Apps > Clear Cache`
3. Verify sign-in screen shows
4. Tap "Continue as Guest"
5. Open DevTools Network tab
6. Verify GET requests have no Authorization header
7. Verify public endpoints return data

### Manual Testing - Authenticated Features
- [ ] Tap Settings
- [ ] Cannot access profile settings
- [ ] See sign-in prompt
- [ ] Tap sign-in button
- [ ] Redirected to sign-in screen
- [ ] Can complete normal sign-in
- [ ] After login, Settings work normally

**Steps:**
1. As guest, navigate to Settings
2. Verify profile editing is blocked
3. Tap "Sign In"
4. Complete authentication
5. Verify Settings now show profile options
6. Verify network requests now include Authorization header

### Manual Testing - Sign Out
- [ ] As guest, navigate to Settings
- [ ] Tap "Sign Out" (if visible)
- [ ] Verify navigation back to sign-in
- [ ] Verify no Firebase signOut errors

**Steps:**
1. As guest, go to Settings
2. Tap Sign Out
3. Should see sign-in screen
4. No errors in console

### Manual Testing - Login from Guest State
- [ ] As guest, navigate to sign-in
- [ ] Sign in with credentials
- [ ] Verify authenticated flow works
- [ ] Verify guest state is cleared
- [ ] Verify Settings work for authenticated user

**Steps:**
1. Start as guest
2. Navigate to Settings
3. Tap sign-in button
4. Enter credentials
5. Verify authenticated flow completes
6. Return to Settings
7. Verify profile settings now accessible

### Automated Testing Examples

#### Unit Test - Guest Login
```typescript
test('guestLogin sets correct state', () => {
  const { guestLogin, getState } = useAuthStore;
  guestLogin();
  const state = getState();
  
  expect(state.isGuest).toBe(true);
  expect(state.isAuthenticated).toBe(false);
  expect(state.firebaseUser).toBeNull();
  expect(state.authLoaded).toBe(true);
});
```

#### Unit Test - SignOut Clears Guest
```typescript
test('signOut clears guest state', async () => {
  const { guestLogin, signOut, getState } = useAuthStore;
  guestLogin();
  expect(getState().isGuest).toBe(true);
  
  await signOut();
  expect(getState().isGuest).toBe(false);
});
```

#### Integration Test - Guest API Call
```typescript
test('guest user can fetch public announcements', async () => {
  const { guestLogin } = useAuthStore;
  guestLogin();
  
  const response = await secureFetch('/api/announcements');
  expect(response.ok).toBe(true);
  
  const data = await response.json();
  expect(data.success).toBe(true);
  expect(Array.isArray(data.data)).toBe(true);
});
```

#### E2E Test - Cypress
```typescript
describe('Guest Mode Flow', () => {
  it('should allow guest access to app', () => {
    cy.visit('/');
    cy.contains('Continue as Guest').click();
    cy.url().should('include', '/home');
    cy.contains('Announcements').should('exist');
  });

  it('should block guest from authenticated features', () => {
    cy.visit('/');
    cy.contains('Continue as Guest').click();
    cy.visit('/settings');
    cy.contains('Sign in to view your profile').should('exist');
  });

  it('should allow login from guest state', () => {
    cy.visit('/');
    cy.contains('Continue as Guest').click();
    cy.visit('/settings');
    cy.contains('Sign In').click();
    cy.get('[placeholder="Enter your email"]').type('test@example.com');
    cy.get('[placeholder="Enter your password"]').type('password123');
    cy.contains('Sign In').click();
    cy.url().should('include', '/home');
    cy.contains('Your Profile').should('exist');
  });
});
```

## Phase 5: Monitoring & Analytics (Optional)

- [ ] Track guest user actions (page views, API calls)
- [ ] Separate guest metrics from authenticated metrics
- [ ] Monitor guest-to-authenticated conversion rate
- [ ] Track common guest user paths

**Analytics Example:**
```typescript
import { logEvent } from '@/services/analytics';

export const useAuthStore = create<AuthState>((set) => ({
  guestLogin: () => {
    logEvent('guest_login_started');
    set({ isGuest: true, ... });
  },
  
  signIn: async (email, password) => {
    // ... sign in logic
    logEvent('guest_to_authenticated', {
      email: email,
      previousGuestUser: true
    });
  }
}));
```

## Phase 6: Performance & Edge Cases

### Memory Management
- [ ] Verify no memory leaks in guest mode
- [ ] Test app with guests for extended periods
- [ ] Monitor device storage (no persisted data needed)

### Network Handling
- [ ] Test offline mode (guest can't fetch announcements)
- [ ] Test slow network (requests timeout gracefully)
- [ ] Test failed requests (show error, not crash)

### State Management
- [ ] Verify no auth state corruption
- [ ] Test multiple app closes/opens as guest
- [ ] Test switching between guest and authenticated
- [ ] Test app restoration from background

**Test Scenarios:**
```typescript
// 1. Offline guest
isOffline && isGuest → Show "No internet" message

// 2. Network error as guest
fetchFailed && isGuest → Show retry button, not "Sign in"

// 3. App backgrounded as guest
appMinimized as guest → State preserved, no refetch on resume

// 4. Fast auth switch
guest → login → logout → guest → Should work smoothly
```

## Phase 7: Documentation & Training

- [ ] Share `GUEST_MODE_SUMMARY.md` with team
- [ ] Share `GUEST_MODE_IMPLEMENTATION.md` for deep dives
- [ ] Share `GUEST_MODE_EXAMPLES.md` for code patterns
- [ ] Train team on guest vs authenticated feature gating
- [ ] Document backend guest handling requirements
- [ ] Create guest mode FAQ

## Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Backend endpoints accept unsigned requests
- [ ] Staging environment tested end-to-end
- [ ] Analytics tracking in place
- [ ] Monitoring configured
- [ ] Rollback plan prepared

## Post-Deployment

- [ ] Monitor guest user adoption
- [ ] Track guest-to-authenticated conversion
- [ ] Monitor error logs for auth-related issues
- [ ] Gather feedback from guest users
- [ ] Optimize guest experience based on data
- [ ] Consider enhancement features

## Known Issues & Workarounds

### Issue 1: Guest State Not Persisted
**Workaround:** Add AsyncStorage persistence
```typescript
const guestLogin = async () => {
  await AsyncStorage.setItem('isGuest', 'true');
  set({ isGuest: true, ... });
};

// On app init
const savedGuest = await AsyncStorage.getItem('isGuest');
if (savedGuest === 'true') {
  set({ isGuest: true, authLoaded: true });
}
```

### Issue 2: Guest Can't Access Protected Features
**Expected Behavior:** This is intentional. Guide users to sign in:
```typescript
if (isGuest && needsAuth) {
  return <SignInPrompt />;
}
```

### Issue 3: Backend Doesn't Support Unsigned Requests
**Solution:** Update backend endpoints to accept unsigned requests for public data

## Completion Criteria

- [x] Implementation complete
- [ ] Frontend feature gates implemented
- [ ] Backend APIs support unsigned requests
- [ ] Manual testing passed
- [ ] Automated tests passing
- [ ] Documentation reviewed
- [ ] Team trained
- [ ] Deployed to staging
- [ ] Deployed to production
- [ ] Monitored for 1 week
- [ ] Guest feature considered stable

## Support & Escalation

If you encounter issues:

1. **Feature gating not working?**
   - Check `isGuest` state: `console.log(useAuthStore.getState())`
   - Verify CASL abilities: `console.log(ability.can(...))`

2. **API calls failing for guests?**
   - Check network tab for Authorization header
   - Verify backend accepts unsigned requests
   - Check error response from API

3. **Navigation issues?**
   - Verify `authLoaded` is true after `guestLogin()`
   - Check router logic in `app/_layout.tsx`
   - Ensure guest bypasses profile completion check

4. **State corruption?**
   - Check `signOut()` clears guest state
   - Verify no other code sets `isGuest` directly
   - Test state management in isolation

## Feedback Loop

Document any issues or improvements:
- [ ] Create GitHub issues for bugs
- [ ] Suggest enhancements in team discussions
- [ ] Update documentation as you learn
- [ ] Share best practices with team
