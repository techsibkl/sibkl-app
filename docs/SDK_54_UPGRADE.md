# Expo SDK 54 Upgrade Checklist (sibkl-app)

Step-by-step guide for upgrading **sibkl-app** from Expo SDK 53 → SDK 54, including New Architecture preparation required before a future SDK 55 upgrade.

**Do this in a dedicated branch/sprint — not mixed with pilot feature work.**

---

## Current → target

| | Now (SDK 53) | Target (SDK 54) |
|---|---|---|
| Expo SDK | 53 | 54 |
| React Native | 0.79.6 | ~0.81.x |
| React | 19.0.0 | ~19.1.x |
| New Architecture | **Off** (`newArchEnabled: false`) | **On** (recommended before SDK 55) |
| Reanimated | 3.17.x | 4.x (+ `react-native-worklets`) |
| Legacy Architecture | Supported | Last SDK to support opting out |

SDK 55 removes Legacy Architecture entirely. Treat this upgrade as **two goals**:

1. Move to SDK 54.
2. Enable and validate New Architecture.

---

## Recommended approach (two phases)

```
Phase A — Enable New Architecture on SDK 53 (1–2 days)
    ↓ smoke test on dev client
Phase B — Upgrade to SDK 54 (2–3 days)
    ↓ full regression
Phase C — EAS builds + TestFlight / Play internal (1 day)
```

Skipping Phase A and jumping straight to SDK 54 + New Arch in one step is possible but harder to debug when something breaks.

---

## Before you start

### Prerequisites

- [ ] Pilot build shipped or paused — upgrade is a separate workstream
- [ ] Clean git branch: `git checkout -b upgrade/expo-sdk-54`
- [ ] Latest EAS CLI: `npm install -g eas-cli@latest`
- [ ] Node 20+ (matches EAS build servers)
- [ ] Xcode 16.1+ locally (Xcode 26 recommended for parity with EAS `"latest"`)
- [ ] Physical iOS + Android devices for testing (FCM, camera, push)

### Read first

- [Expo SDK 54 changelog](https://expo.dev/changelog/sdk-54)
- [Expo New Architecture guide](https://docs.expo.dev/guides/new-architecture/)
- [Native upgrade helper (53 → 54)](https://docs.expo.dev/bare/upgrade/?fromSdk=53&toSdk=54)

---

## Phase A — Enable New Architecture on SDK 53

Validate New Arch **before** bumping SDK versions. If something breaks here, fixes are easier to isolate.

### A1. Update config

In `app.config.ts`:

```ts
// Change:
newArchEnabled: false,
// To:
newArchEnabled: true,
```

Or remove the line entirely (SDK 53 defaults to New Arch enabled when unset).

### A2. Clean native project

```bash
rm -rf node_modules ios android
npm install
npx expo prebuild --clean
```

### A3. Local dev build

```bash
npm run ios:dev
npm run android:dev
```

### A4. Smoke test (Phase A)

Focus on areas that use native modules heavily:

| Area | What to check |
|------|----------------|
| Auth | Sign in, sign up, OTP, guest mode, sign out |
| Bottom sheets | Cell profile sheets, create session, add members |
| Animations | Tab transitions, sheet open/close, scroll |
| Firebase | Auth token refresh, API calls via `secureFetch` |
| Push (device) | Permission prompt, token registration, foreground notification |

### A5. If Phase A fails

Common culprits in this project:

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| Red screen on sheet open | `@gorhom/bottom-sheet` + Reanimated | Ensure Reanimated babel plugin is last in `babel.config.js` |
| Firebase crash on launch | RN Firebase version | Check [@react-native-firebase compatibility](https://rnfirebase.io/) for New Arch |
| Blank/styled screens | NativeWind | Clear Metro cache: `npx expo start -c` |
| Android build fail | Static frameworks | Keep `useFrameworks: "static"` in `expo-build-properties` |

**Do not proceed to Phase B until Phase A smoke tests pass.**

---

## Phase B — Upgrade to SDK 54

### B1. Upgrade Expo and aligned packages

```bash
npx expo install expo@^54.0.0 --fix
```

This updates `expo`, `react-native`, `react`, and all Expo-managed packages to SDK 54–compatible versions.

### B2. Install Reanimated 4 peer dependency

SDK 54 uses Reanimated 4, which requires worklets:

```bash
npx expo install react-native-reanimated react-native-worklets
```

Verify `babel.config.js` — Reanimated plugin must remain **last**:

```js
plugins: ["react-native-reanimated/plugin"],
```

NativeWind 4 typically handles worklets integration; no extra babel plugin needed for worklets in most setups.

### B3. Upgrade third-party packages

Run and fix any peer dependency warnings:

```bash
npm install
npx expo-doctor
```

Packages to watch in **this** project:

| Package | Notes |
|---------|--------|
| `@react-native-firebase/app`, `auth`, `messaging` | Bump to latest 24.x or 25.x if available; test auth + FCM on device |
| `@gorhom/bottom-sheet` | Used in cells flows; verify sheet gestures after Reanimated 4 |
| `@shopify/flash-list` | FlashList v2+ prefers New Arch; should improve after Phase A |
| `nativewind` | Stay on v4; run with cleared cache after upgrade |
| `react-native-paper` | Usually fine; verify date pickers and modals |
| `react-native-gesture-handler` | Must match Expo SDK 54 recommended version |
| `react-native-screens` | Must match Expo SDK 54 recommended version |
| `expo-camera` | Test QR scanner flow: `cells/scanner`, `cells/qrScan` |
| `expo-notifications` | Test alongside FCM in `app/_layout.tsx` |
| `lucide-react-native` | Low risk |
| `@casl/ability`, `@tanstack/react-query` | JS-only; low risk |

### B4. Update dev tooling

```bash
npx expo install eslint-config-expo --fix
```

Ensure `@types/react` matches the React version installed by `--fix`.

### B5. Config file review

#### `app.config.ts`

- [ ] Confirm `newArchEnabled: true` (or removed)
- [ ] Keep `expo-build-properties` with `useFrameworks: "static"` (required for Firebase)
- [ ] Keep Firebase plugins: `@react-native-firebase/app`, `auth`, `messaging`
- [ ] Review `plugins/withFmtConstevalFix` — **may still be needed on SDK 54 / RN 0.81**; try a build without it first, re-add if fmt errors return

#### `eas.json`

- [ ] Keep `"image": "latest"` for App Store compliance (Xcode 26+)
- [ ] Optionally pin after successful build: `"image": "macos-sequoia-15.6-xcode-26.1"` for reproducibility

#### `babel.config.js`

- [ ] `babel-preset-expo` with NativeWind `jsxImportSource`
- [ ] `react-native-reanimated/plugin` last

#### `metro.config.js`

- [ ] `withNativeWind(config, { input: './global.css' })` — no change expected

### B6. Clean rebuild

```bash
rm -rf node_modules ios android .expo
npm install
npx expo prebuild --clean
```

### B7. Local builds

```bash
npm run ios:staging
npm run android:staging
```

Fix compile errors before moving to EAS.

### B8. EAS development build

```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

Install dev clients on test devices, then:

```bash
npm start
```

---

## Phase C — Full regression test matrix

Use this checklist before merging. Test on **physical devices** where noted.

### Auth & onboarding

- [ ] Sign in (email/password)
- [ ] Sign up → OTP → complete profile
- [ ] Forgot password
- [ ] Guest mode → browse → sign in transition
- [ ] Sign out
- [ ] Delete account flow

### Core tabs

- [ ] Home — announcements, notifications preview
- [ ] People — list, search, profile navigation
- [ ] Follow-up (flows) — list, filters, person dialog, notes tab
- [ ] Leaders — categories, files, gallery
- [ ] Settings — all menu items, build mode label (Pilot/Production)

### Pilot feature flags

Test with both build modes:

- [ ] **Pilot** (`PILOT_BUILD=true`): Cells tab visible, attendance, cell follow-up assignment
- [ ] **Production** (`PILOT_BUILD=false`): Cells hidden, no attendance UI, no cell assignment in flows
- [ ] Settings footer shows correct `Pilot` / `Production` label

See [FEATURE_FLAGS.md](./FEATURE_FLAGS.md).

### Cells (pilot builds only)

- [ ] Cells list, join cell, cell profile
- [ ] Members list, search, add/remove members
- [ ] Attendance tab, scan QR, sessions list, session detail
- [ ] Bottom sheets: create session, add members, search members, member actions

### Notifications (physical device)

- [ ] iOS: permission prompt, FCM token sent to backend
- [ ] Android: notification channel, permission (API 33+)
- [ ] Foreground notification display
- [ ] Tap notification → deep link / app open
- [ ] Background message handler (no crash)

### API & permissions

- [ ] Authenticated API calls (`secureFetch` + Firebase token)
- [ ] CASL-gated actions (assign, cell session create, etc.)
- [ ] Guest mode blocked from protected routes

### Platform-specific

- [ ] iOS: safe area, tab bar, stack back navigation
- [ ] Android: edge-to-edge, keyboard resize, back gesture
- [ ] Staging vs production env (API URL, bundle ID)

### EAS store builds

- [ ] `eas build --profile pilot --platform ios` succeeds
- [ ] `eas build --profile pilot --platform android` succeeds
- [ ] iOS build shows Xcode 26+ (App Store eligible)
- [ ] No fmt consteval errors (or fmt plugin still applied)
- [ ] `eas submit --profile pilot --platform ios` (optional smoke)

---

## Packages and files reference

### High-touch native files in this repo

| File | Why it matters |
|------|----------------|
| `app/_layout.tsx` | FCM, expo-notifications, auth routing |
| `app.config.ts` | New Arch, Firebase, build properties, fmt plugin |
| `babel.config.js` | Reanimated + NativeWind |
| `metro.config.js` | NativeWind |
| `plugins/withFmtConstevalFix.js` | Xcode 26 fmt workaround |
| `eas.json` | Build profiles, PILOT_BUILD, iOS image |
| `config/featureFlags.ts` | Build-time flags (unchanged by SDK upgrade) |
| `utils/secureFetch.ts` | Firebase auth token |
| `stores/authStore.ts` | Firebase auth state |

### JS-only (low upgrade risk)

- `@tanstack/react-query`
- `@casl/ability`, `@casl/react`
- `zustand`
- `date-fns`, `lodash`
- `react-hook-form`
- Most `services/` and `hooks/` (except those importing native modules)

---

## fmt plugin — keep or remove?

After upgrading to SDK 54 / RN 0.81:

1. **Try removing** `./plugins/withFmtConstevalFix` from `app.config.ts`
2. Run `eas build --profile pilot --platform ios`
3. If fmt consteval errors return → **re-add the plugin**

The upstream fix lands in RN when `fmt` ≥ 12.1.0 is bundled (expected in later RN / SDK 55+). Until then, the plugin is safe to keep.

---

## Rollback plan

If the upgrade is blocked:

```bash
git checkout dev-main   # or your base branch
git branch -D upgrade/expo-sdk-54
```

For a partial rollback (keep branch, revert config):

1. Restore `package.json` / `package-lock.json` from base branch
2. Set `newArchEnabled: false` if needed
3. `rm -rf node_modules ios android && npm install && npx expo prebuild --clean`

Ship pilot builds from SDK 53 + fmt plugin while the upgrade branch is in progress.

---

## Effort estimate (this project)

| Phase | Estimate | Notes |
|-------|----------|-------|
| Phase A (New Arch on 53) | 1–2 days | Bottom sheets, Firebase, animations |
| Phase B (SDK 54 bump) | 1–2 days | `expo install --fix`, Reanimated 4, build fixes |
| Phase C (regression + EAS) | 1–2 days | Full test matrix, both platforms |
| **Total** | **3–5 days** | One developer, familiar with the codebase |

Add 1–2 days buffer if Firebase or NativeWind issues appear on New Architecture.

---

## After SDK 54 — path to SDK 55

Once SDK 54 is stable with New Architecture:

1. Monitor [Expo SDK 55 changelog](https://expo.dev/changelog/sdk-55)
2. Upgrade: `npx expo install expo@^55.0.0 --fix`
3. Remove `newArchEnabled` (required and non-configurable on SDK 55)
4. Re-test full matrix
5. Remove fmt plugin if RN bundles fmt ≥ 12.1.0

Estimated SDK 54 → 55 effort: **2–3 days** (mostly testing, if New Arch already validated).

---

## PR checklist

Copy into your upgrade PR description:

```markdown
## SDK 54 upgrade

- [ ] New Architecture enabled (`newArchEnabled: true`)
- [ ] `npx expo install expo@^54.0.0 --fix` applied
- [ ] `react-native-worklets` installed (Reanimated 4)
- [ ] `npx expo-doctor` passes (or warnings documented)
- [ ] iOS local build passes
- [ ] Android local build passes
- [ ] EAS development build passes (iOS + Android)
- [ ] EAS pilot build passes (iOS + Android)
- [ ] Full regression matrix completed (link to test notes)
- [ ] fmt plugin: kept / removed (with build log evidence)
- [ ] FEATURE_FLAGS.md / pilot builds verified
- [ ] No unrelated feature changes in this PR
```

---

## Quick command reference

```bash
# Phase A
# app.config.ts → newArchEnabled: true
rm -rf node_modules ios android && npm install
npx expo prebuild --clean
npm run ios:dev

# Phase B
npx expo install expo@^54.0.0 --fix
npx expo install react-native-reanimated react-native-worklets
npx expo-doctor
rm -rf node_modules ios android .expo && npm install
npx expo prebuild --clean
npm run ios:staging
npm run android:staging

# Phase C
eas build --profile development --platform all
eas build --profile pilot --platform all
```

---

## Related docs

- [FEATURE_FLAGS.md](./FEATURE_FLAGS.md) — pilot build configuration
- [CODEBASE.md](../CODEBASE.md) — app architecture overview
- [GUEST_MODE_README.md](./GUEST_MODE_README.md) — guest mode testing during upgrade

---

**Last updated:** 2026-08-16
