# Feature flags and launch gating

How the app decides whether a tab or feature is visible. Two layers exist. Only the runtime layer currently hides product features.

**Last updated:** 2026-10-24

---

## Layers

```
GET /system/config
        │
        ▼
stores/systemStore.ts     feature flags, app_status, store version
        │                  disk cache is fallback only
        ▼
hooks/useFeatureFlag.ts   flag AND launch gate
        │
        ▼
Tabs, screens, actions

config/featureFlags.ts    binaryFeatureFlags (build-time hard guard)
                          all product keys are commented out today
```

| Layer | Source | What it does now |
|-------|--------|------------------|
| Runtime flag | `feature_flags` on `GET /system/config` | Turns a feature on or off for every binary |
| Launch gate | `app_status` on the same response, plus local countdown | Keeps runtime flags off until the launch window is open |
| Binary guard | `extra.PILOT_BUILD` via `binaryFeatureFlags` | Settings footer label only. It does not hide Cells, Events, or attendance |

`PILOT_BUILD` is still set per EAS profile. It is not the switch that shows or hides tabs. Do not read `process.env.PILOT_BUILD` in components.

Backend auth still applies. A hidden tab is not a permission check.

---

## Runtime flags

Defined on `FeatureFlags` in `types/SystemConfig.ts` and defaulted to `false` in `stores/systemStore.ts`:

| Key | What the client gates |
|-----|------------------------|
| `people` | People tab |
| `guestFollowUp` | Follow-up tab (the whole tab, not only guest users) |
| `leadersPage` | Leaders tab |
| `cells` | Cells tab and the Cells section on a person profile |
| `cellFollowUp` | Cell assignment UI inside Follow-up |
| `cellAttendance` | Cell QR scan, sessions, and the attendance tab actions |
| `events` | Events tab. Also requires a signed-in user (`!isGuest`) |

Home and Settings are always in the tab bar.

### Resolution order

`useFeatureFlag(key)` returns `featureFlags[key] && launchGatePassed`.

1. **API wins.** A successful `fetchSystemConfig()` replaces in-memory flags and writes `system_feature_flags.json` under the app document directory.
2. **Disk is a fallback.** On cold start, `hydratePersistedFlags()` restores the last successful payload so the tab bar can render before the network returns. A failed fetch keeps those flags. It does not reset them to `false`.
3. **First install.** No disk file yet, so every flag stays `false` until the first successful fetch.

Call sites:

```tsx
const showCells = useFeatureFlag("cells");

<Tabs.Screen
  name="cells"
  options={{ href: showCells ? "/(app)/cells" : null }}
/>
```

`href: null` removes the tab. Deep links into a hidden stack are not given a second binary redirect; the tab layout is the entry gate.

Cell attendance is the exception to “hide completely”: the Scan / Sessions actions stay on the cell profile and open a “Feature not released yet” dialog while `cellAttendance` is false.

---

## Launch window

A new `app_status.launch_version` (different from the version stored in `seen_launch_version.txt`) sets `hasNewLaunch`. The launch gate applies only while `hasNewLaunch` is true. After `acknowledgeLaunch()`, flags follow the server value alone, even if `launch_date` is still in the future.

While `hasNewLaunch` is true, runtime flags stay off until one of these is true:

- `app_status.status === "unlocked"` (early start, even if `launch_date` is in the future)
- the device clock has reached `launch_date` (`utils/launchWindow.ts`, `isLaunchWindowOpen`)
- the user has activated this version (`hasActivatedLaunch`)

`useFeatureFlag` ticks locally while the window is locked, so tabs can appear at `launch_date` without waiting for a backend row flip.

Home shows `LaunchBanner` while `hasNewLaunch` is true. It routes to `/(app)/home/launch` and hides the tab bar on that screen.

Pull-to-refresh on the launch screen calls `fetchSystemConfig()`, then `activateLaunch()` when `isLaunchWindowOpen` is true. That writes `activated_launch_version.txt`. The unlocked launch page is restored after a cold start when that file matches the current version, or when the server status is already `unlocked` (the store treats remote unlock as activation and persists it).

`acknowledgeLaunch()` writes the seen version and deletes the activated file. The banner goes away. Flags stay available because `hasNewLaunch` is now false.

`app_version` on the same config is separate. It drives the store-update prompt (`needsAppUpdate`) and does not gate features.

### Config refresh

| Trigger | Behavior |
|---------|----------|
| App start | `fetchSystemConfig()` |
| Foreground FCM with `data.type === "system_config_updated"` | Refetch immediately |
| App returns to foreground | Refetch if the last fetch was more than 5 minutes ago |
| Background FCM | Logged only. The foreground `AppState` listener is the catch-up |

The device subscribes to the FCM topic `system-config` after notification permission is granted (`app/_layout.tsx`). No per-device token is required for that topic.

---

## Binary flag (`PILOT_BUILD`)

`app.config.ts` sets `extra.PILOT_BUILD` to the boolean `process.env.PILOT_BUILD === "true"`.

`binaryFeatureFlags` in `config/featureFlags.ts` only exports `isPilotBuild` today. The `cells`, `cellAttendance`, and `cellFollowUp` binary keys are commented out. To hard-remove a feature from non-pilot binaries again, uncomment or add a key there and combine it with the hook:

```tsx
const canSee = binaryFeatureFlags.cells && useFeatureFlag("cells");
```

Features that should exist in every binary need `useFeatureFlag` only.

### EAS profiles

Shared iOS image: `macos-sequoia-15.6-xcode-26.2` on the `base` profile (`eas.json`). React Native 0.79’s `fmt` 11.x fails on Xcode 26 unless `plugins/withFmtConstevalFix.js` is applied from `app.config.ts`. That plugin file must be committed; EAS only uploads git-tracked files. Remove it after a React Native release that bundles `fmt` ≥ 12.1.0.

| Profile | `PILOT_BUILD` | Use |
|---------|---------------|-----|
| `development` | `true` | Dev client |
| `staging` | `true` | Internal staging |
| `pilot` | `true` | Store distribution against the production API |
| `production` | `false` | Public store binary |

Local scripts (`package.json`):

```bash
npm run ios:dev            # .env.development, PILOT_BUILD unset
npm run ios:dev:pilot      # .env.development, PILOT_BUILD=true
npm run ios:staging        # .env.staging, PILOT_BUILD=true
npm run ios:prod           # .env.production, PILOT_BUILD unset
npm run ios:pilot          # .env.production, PILOT_BUILD=true
# android:dev, android:dev:pilot, android:staging, android:prod, android:pilot match the same envs
```

Changing `PILOT_BUILD` requires a new native build. Metro restart alone does not re-run `app.config.ts` inside an existing dev client.

### Settings footer

The footer prints `Pilot` when `binaryFeatureFlags.isPilotBuild` is true. That constant is true only when `extra.PILOT_BUILD` is boolean `false` or the string `"false"`. Because `app.config.ts` stores a boolean, a production build (`PILOT_BUILD=false`) shows **Pilot**, and a pilot build (`PILOT_BUILD=true`) shows **Production**. Do not use the footer to confirm the env var or to explain a missing tab. Check `/system/config` and `useFeatureFlag`.

Dev logs: `[binaryFeatureFlags] isPilotBuild: …`.

---

## Adding a flag

1. Add the camelCase key to `FeatureFlags` in `types/SystemConfig.ts`. The key must match `app_feature_flags.key` from the API.
2. Add the same key to `DEFAULT_FLAGS` in `stores/systemStore.ts` as `false`.
3. Gate every entry point with `useFeatureFlag("myFeature")`: tab `href`, stack screens, buttons, and list metadata.
4. Prefer removing the UI (`href: null`, conditional render). Cell attendance is the existing locked-dialog exception.
5. Add a `binaryFeatureFlags` entry only if the feature must be absent from non-pilot binaries even when the server flag is on.
6. Confirm the backend still authorizes the API. The client flag is not a security boundary.

---

## Relationship to auth

Flags decide whether the feature is shipped in this session. They do not replace:

- Firebase Auth and guest mode (`stores/authStore.ts`)
- CASL (`utils/casl/defineAbilityFor.ts`) — what this person may do
- `X-Person-Revision` refresh — see `CODEBASE.md` (`secureFetch`)

```tsx
{useFeatureFlag("cells") && ability.can("read", "CellDetails") && (
  <CellCard />
)}
```

`useFeatureFlag` is a hook. Do not call it inside a condition. Read it once at the top of the component, which is what `CellProfileScreen` does so early returns do not change the hook count.

---

## Troubleshooting

| Symptom | Cause | What to check |
|---------|--------|----------------|
| Tab missing on a fresh install | Defaults are all `false` until `/system/config` succeeds | Network, `apiEndpoints.system.getConfig`, Metro log `[getSystemConfig]` |
| Tab missing after a server enable | Launch gate still closed | `hasNewLaunch`, `app_status.status`, `launch_date`, `hasActivatedLaunch` |
| Tab stuck on after a server disable | Last disk snapshot, fetch failing | `system_feature_flags.json`; a failed fetch does not clear flags |
| Flag flipped on the server, app still old | Push not received in foreground, or app not resumed | FCM `system_config_updated`, or background the app for 5+ minutes and reopen |
| Countdown hit zero, tabs still hidden | `launch_date` missing or unparseable while status is `locked` | `isLaunchWindowOpen` returns false without a valid date |
| Launch screen stays locked at T=0 | Refresh ran before the clock crossed `launch_date` | Pull to refresh again; success calls `activateLaunch()` |
| Banner returned after restart | `seen_launch_version.txt` does not match `launch_version` | `acknowledgeLaunch()` is what dismisses it |
| Settings says Pilot on a production binary | Footer predicate is inverted relative to `extra.PILOT_BUILD` | Ignore the label; see Settings footer above |
| iOS EAS build fails in `fmt` consteval | Xcode 26 image without the plugin | `./plugins/withFmtConstevalFix` in `app.config.ts` plugins, file committed |
| `PILOT_BUILD=true` but feature still hidden | Binary flag is not the product gate | Server `feature_flags` and launch window |

---

## File reference

```
types/SystemConfig.ts                 FeatureFlags, AppStatus, AppStoreVersion
services/System/system.service.ts     GET /system/config
stores/systemStore.ts                 fetch, disk cache, launch version files
hooks/useFeatureFlag.ts               flag && launch gate
utils/launchWindow.ts                 isLaunchWindowOpen
app/(app)/_layout.tsx                 tab href gating
app/(app)/home/index.tsx              LaunchBanner
app/(app)/home/launch.tsx             locked / celebrate / unlocked
app/_layout.tsx                       FCM topic + refetch
config/featureFlags.ts                binaryFeatureFlags
app.config.ts                         extra.PILOT_BUILD, fmt plugin
eas.json                              per-profile PILOT_BUILD and Xcode image
app/(app)/settings/index.tsx          footer label
```

## Related

- [CODEBASE.md](../CODEBASE.md) — routes, services, `secureFetch`
- [PHONE_NUMBERS.md](./PHONE_NUMBERS.md) — stored phone shape for profile and event forms
- [SDK_54_UPGRADE.md](./SDK_54_UPGRADE.md) — Expo SDK upgrade notes
