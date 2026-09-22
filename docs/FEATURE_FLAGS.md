# Build-Time Feature Flags (Pilot Builds)

Guide for adding and gating experimental features in the SIBKL mobile app using a single build-time flag: `PILOT_BUILD`.

---

## Overview

The app ships two kinds of binaries from **one codebase**:

| Build type | Distribution | `PILOT_BUILD` | Purpose |
|------------|--------------|---------------|---------|
| **Production** | App Store / Google Play (public) | `false` | Stable public release |
| **Pilot** | TestFlight / Google Play testing | `true` | Experimental features for testers |

Pilot users are identified by **which binary they installed**, not by email, profile, or Git branch.

---

## Architecture

```
PILOT_BUILD env var (EAS / local shell / .env)
        │
        ▼
app.config.ts  →  expo.extra.PILOT_BUILD  (boolean)
        │
        ▼
config/featureFlags.ts  →  featureFlags.{cells, cellFollowUp, ...}
        │
        ▼
Components / navigation  →  hide or show UI (no locked/disabled states)
```

**Single source of truth for app code:** `config/featureFlags.ts`

**Do not** read `process.env.PILOT_BUILD` in components. Environment variables are resolved at build time in `app.config.ts` and exposed through Expo `extra`, the same pattern used for `ENV` and `API_URL`.

---

## Current flags

Defined in `config/featureFlags.ts`:

| Flag | Pilot (`true`) | Production (`false`) | What it gates |
|------|----------------|----------------------|---------------|
| `isPilotBuild` | `true` | `false` | Debug label only (Settings footer) |
| `cells` | enabled | hidden | Cells tab, cells stack, profile Cells tab |
| `cellFollowUp` | enabled | hidden | Cell assignment in Follow-up flows |
| `cellAttendance` | enabled | hidden | Scan QR, Sessions, Attendance tab |

All feature flags currently derive from `PILOT_BUILD`. When pilot ends, flip production builds to `false` and remove gating code in a follow-up cleanup PR if desired.

---

## Configuration files

| File | Role |
|------|------|
| `config/featureFlags.ts` | Central flag definitions — **edit here first** |
| `app.config.ts` | Reads `process.env.PILOT_BUILD`, writes `extra.PILOT_BUILD` |
| `eas.json` | Sets `PILOT_BUILD` per EAS build profile |
| `package.json` | Local run scripts with/without `PILOT_BUILD=true` |

### EAS build profiles

| Profile | `PILOT_BUILD` | `APP_ENV` | Use case |
|---------|---------------|-----------|----------|
| `development` | `true` | (from `.env`) | Dev client |
| `staging` | `true` | `staging` | Internal staging builds |
| `pilot` | `true` | `production` | TestFlight / Play testing on prod API |
| `production` | `false` | `production` | Public App Store / Play release |

The `pilot` profile uses the **production API** and **production bundle ID**, but enables pilot UI. That lets testers exercise real prod data without exposing features to the general public.

### iOS build image (Xcode 26+)

Apple requires App Store submissions to be built with **Xcode 26 or newer** (since April 2026). All EAS profiles use `"image": "latest"` (Xcode 26.x) via the shared `base` profile.

React Native 0.79 bundles `fmt` 11.x, which fails on Xcode 26 unless patched. The app includes `plugins/withFmtConstevalFix.js`, which injects a Podfile hook during prebuild to disable `FMT_USE_CONSTEVAL`. Remove this plugin after upgrading to a React Native release that bundles `fmt` ≥ 12.1.0.

**EAS Build only uploads git-tracked files.** You must commit and push `plugins/withFmtConstevalFix.js` and the `app.config.ts` plugin entry — local-only changes are not sent to EAS cloud builds.

---

## Building

### Pilot build (features ON)

```bash
# EAS — recommended for TestFlight / Play testing
eas build --profile pilot --platform ios
eas build --profile pilot --platform android

# Submit
eas submit --profile pilot --platform ios
eas submit --profile pilot --platform android
```

### Production build (features OFF)

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Local device runs

```bash
# Pilot (prod API, flags on)
npm run ios:pilot
npm run android:pilot

# Production-like (prod API, flags off)
npm run ios:prod
npm run android:prod

# Dev / staging (flags on by default in scripts)
npm run ios:dev
npm run ios:staging
```

### Metro / dev client

Set in your local `.env` (not committed):

```env
PILOT_BUILD=true
```

Or inline:

```bash
PILOT_BUILD=true npm start
```

If `PILOT_BUILD` is unset, it defaults to **`false`** (production-safe).

> **Note:** Changing `PILOT_BUILD` requires restarting Metro and, for native builds, re-running `expo run:ios` / `expo run:android` so `app.config.ts` is re-evaluated.

---

## Verifying the current binary

1. **Settings screen** — footer shows `vX.Y.Z · Pilot` or `vX.Y.Z · Production`.
2. **Metro console** (dev only) — look for:
   ```
   [featureFlags] isPilotBuild: true | flags: { cells: true, ... }
   ```

---

## Adding a new pilot feature

### Step 1 — Add the flag

In `config/featureFlags.ts`:

```ts
export const featureFlags = {
  isPilotBuild,
  cells: isPilotBuild,
  cellFollowUp: isPilotBuild,
  cellAttendance: isPilotBuild,
  myNewFeature: isPilotBuild, // ← add here
} as const;
```

Use a dedicated flag even if it currently mirrors `isPilotBuild`. That makes it easy to split flags later (e.g. ship cells but not attendance).

### Step 2 — Gate UI entry points

Import once:

```ts
import { featureFlags } from "@/config/featureFlags";
```

**Conditional render (buttons, cards, sections):**

```tsx
{featureFlags.myNewFeature && (
  <TouchableOpacity onPress={handlePress}>
    <Text>New Feature</Text>
  </TouchableOpacity>
)}
```

**Tab bar (Expo Router):**

```tsx
<Tabs.Screen
  name="my-feature"
  options={{
    title: "My Feature",
    href: featureFlags.myNewFeature ? "/(app)/my-feature" : null,
  }}
/>
```

**Stack layout guard (deep links):**

```tsx
if (!featureFlags.myNewFeature) {
  return <Redirect href="/(app)/home" />;
}
```

**Dynamic lists (tabs, menu items):**

```ts
const tabs = [
  "Info",
  ...(featureFlags.myNewFeature ? ["My Feature"] : []),
  "Settings",
];
```

### Step 3 — Hide, do not disable

When a feature is off:

- Remove navigation items (`href: null`).
- Do not render buttons, cards, or tabs.
- Do **not** show greyed-out / locked UI unless product explicitly requires it.

Existing non-pilot behaviour must stay unchanged.

### Step 4 — Test both modes

- [ ] Pilot build: feature visible and usable.
- [ ] Production build: feature completely absent (not just disabled).
- [ ] Deep link to gated route redirects or 404s gracefully in production.
- [ ] Settings footer shows correct Pilot / Production label.

---

## Gating patterns in this codebase

Reference implementations you can copy:

| Pattern | Example file |
|---------|----------------|
| Hide bottom tab | `app/(app)/_layout.tsx` |
| Redirect entire stack | `app/(app)/cells/_layout.tsx` |
| Hide profile tab | `app/(app)/profile/[id].tsx` |
| Hide action buttons + sub-tabs | `app/(app)/cells/profile/[id].tsx` |
| Hide follow-up cell UI | `components/Flows/PeopleFlowDialog.tsx` |
| Hide flow action component | `components/Flows/Actions/AssignDistrictCellAction.tsx` |
| Hide list row metadata | `components/Flows/PeopleFlowRow.tsx` |
| Hide FAB actions | `constants/cont_cells.ts` |

---

## What NOT to do

| Avoid | Why |
|-------|-----|
| `if (process.env.PILOT_BUILD)` in components | Env is not available at runtime; use `featureFlags` |
| Email / user-profile checks for pilot | Unreliable; build type is the source of truth |
| Git branch logic | Same codebase must produce both binaries |
| Third-party flag services | Out of scope; keep it lightweight |
| Treating flags as security | Frontend hiding ≠ authorization |
| Locked/disabled UI for hidden features | Product requirement is full hide |

---

## Security

**Feature flags are frontend availability only.**

- A production user can still call backend APIs directly if they know the endpoints.
- Backend must continue to authenticate (Firebase) and authorize (CASL) independently.
- `PILOT_BUILD` is embedded in the binary at compile time — it is not secret and can be inspected.
- Never skip server-side permission checks because a feature is “pilot only”.

When rolling out a pilot feature, ensure the backend either:

1. Already enforces proper roles/permissions, or
2. Is updated to reject unauthorized access before pilot distribution.

---

## Relationship to other access control

This system is **orthogonal** to:

- **Firebase Auth** — who is signed in.
- **CASL / `useAbility()`** — what a signed-in user may do.
- **Guest mode** — unauthenticated browsing.

Typical layering:

```tsx
// Pilot build AND user has permission
{featureFlags.cells && ability.can("read", "Cell") && (
  <CellCard />
)}
```

Pilot flags decide **whether the feature exists in this binary**. CASL decides **whether this user can use it**.

---

## Promoting a feature to production

When a pilot feature is ready for everyone:

1. Remove the `featureFlags.*` checks from UI (or set the flag to always `true` temporarily).
2. Keep backend authorization as-is.
3. Ship via `production` EAS profile (`PILOT_BUILD=false`).
4. Remove the flag from `featureFlags.ts` in a cleanup PR once no longer needed.

You do **not** need a separate Git branch or a new app binary type after promotion — just stop gating the UI.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Feature missing in dev | `PILOT_BUILD` not set | `PILOT_BUILD=true npm start` or use `ios:dev` script |
| Feature still visible after setting `false` | Stale native build / cache | Re-run `expo run:ios` or `eas build` |
| iOS build fails with `fmt::basic_format_string` consteval error | Xcode 26 + unpatched fmt | Ensure `./plugins/withFmtConstevalFix` is in `app.config.ts` plugins |
| EAS says build cannot be submitted (Xcode 16) | Old EAS image | Use `"image": "latest"` in `eas.json` (Xcode 26+) |
| Settings says Pilot but feature hidden | Flag not wired to UI | Check `featureFlags.ts` and component import |
| `featureFlags` all false in EAS build | Wrong profile | Use `pilot` or `staging`, not `production` |
| Env set but flag still false | `app.config.ts` not re-run | Restart Metro; rebuild native app |

---

## Quick checklist (copy for PRs)

```markdown
## Feature flag checklist

- [ ] Added flag to `config/featureFlags.ts`
- [ ] Gated all navigation entry points (tabs, stacks, deep links)
- [ ] Gated buttons, cards, and sub-tabs
- [ ] No direct `process.env.PILOT_BUILD` in components
- [ ] No disabled/locked UI — feature fully hidden when off
- [ ] Backend auth/authz unchanged or updated separately
- [ ] Tested with `PILOT_BUILD=true` and `PILOT_BUILD=false`
- [ ] Verified Settings footer shows correct build mode
```

---

## File reference

```
config/featureFlags.ts          # Flag definitions (edit here)
app.config.ts                   # PILOT_BUILD → extra.PILOT_BUILD
eas.json                        # Per-profile PILOT_BUILD values
app/(app)/_layout.tsx           # Tab bar gating
app/(app)/cells/_layout.tsx     # Stack redirect
app/(app)/settings/index.tsx    # Pilot / Production debug label
package.json                    # Local pilot/prod run scripts
```

---

## Related docs

- [SDK_54_UPGRADE.md](./SDK_54_UPGRADE.md) — Expo SDK 53 → 54 upgrade checklist
- [CODEBASE.md](../CODEBASE.md) — app architecture overview

---

**Last updated:** 2026-08-16
