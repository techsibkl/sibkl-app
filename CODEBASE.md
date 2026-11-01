# SIBKL Mobile App — Codebase Guide

Onboarding guide for the Expo / React Native app (`sibkl-app`). It talks to the REST API in `sibkl-cms-backend` via Firebase-authenticated HTTP calls.

**Stack:** Expo Router, React Native, Zustand, TanStack Query, React Native Paper, NativeWind (Tailwind), Firebase Auth, CASL permissions.

---

## How to read this codebase

Follow the navigation path from the root shell down to the API:

```
app/_layout.tsx → (auth) | (app) → domain/_layout.tsx → index.tsx → hooks → services → backend API
```

---

## 1. Entry point — `app/_layout.tsx`

Everything boots here. Two layers:

### `RootLayout` (outer)

- Loads fonts
- Wraps app in `QueryClientProvider` (TanStack Query), `ThemeProvider`, `PaperProvider`
- Renders `RootLayoutNav`

### `RootLayoutNav` (inner)

Handles **auth state routing**, **FCM push notifications**, and the **root Stack navigator**.

FCM registration subscribes the device to the `system-config` topic and refetches `GET /system/config` when a foreground message has `data.type === "system_config_updated"`. Background messages are logged; the app refetches config on resume if the last fetch is older than 5 minutes. See `docs/FEATURE_FLAGS.md`.

#### Auth routing (`useEffect` on `authLoaded`, `firebaseUser`, `user`, `isGuest`)

| Condition | Redirect |
|-----------|----------|
| `!authLoaded` | `/(auth)/splash` |
| `isGuest` | `/(app)/home` |
| `!firebaseUser` | `/(auth)/sign-in` |
| `!user?.people_id` | `/(auth)/complete-profile` |
| Otherwise | `/(app)/home` |

Auth init: `useAuthStore().init()` on mount (Firebase `onAuthStateChanged`).

The effect depends on `user?.people_id`, not the whole `user` object. A person-revision refresh updates roles in place and does not redirect to home.

`| `scanner.tsx` | Scanner entry |` should be fixed too.

#### Root Stack screens

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(auth)" />
  <Stack.Screen name="(app)" />
  <Stack.Screen name="(app)/profile" />  {/* person profile — outside tab bar */}
  <Stack.Screen name="+not-found" />
</Stack>
```

There is no global middleware file — auth guards live in this root layout.

---

## 2. Route groups

Expo Router uses **parentheses** for groups that do not appear in the URL.

| Group | Path prefix | Purpose |
|-------|-------------|---------|
| `(auth)` | `/sign-in`, `/sign-up`, … | Login, signup, onboarding |
| `(app)` | `/home`, `/people`, … | Main authenticated app |

`app/index.tsx` redirects to `/(auth)/sign-up`.

---

## 3. Bottom tab bar — `(app)/_layout.tsx`

The **bottom navbar** is defined here using Expo Router `<Tabs>`.

### Tabs

Home and Settings are always shown. The others use `useFeatureFlag` and `href: null` when the flag is off (`docs/FEATURE_FLAGS.md`).

| Tab | Route | Flag | Notes |
|-----|-------|------|--------|
| Home | `home` | always | Tab bar hidden on `home/launch` |
| Cells | `cells` | `cells` | Tab bar hidden on `scanner` and `qrScan` |
| Events | `events` | `events` | Also hidden for guests. Tab bar hidden on `qrScan` |
| People | `people` | `people` | |
| Follow-up | `flows` | `guestFollowUp` | Flag name is historical; it gates the whole tab |
| Leaders | `leaders` | `leadersPage` | |
| Settings | `settings` | always | |

### Hidden from tab bar (`href: null` always)

These routes still exist in the tab navigator but are **not shown** in the bottom bar. Navigate with `router.push()`:

| Route | Why hidden |
|-------|------------|
| `announcements` | Opened from Home “See all” |
| `notifications` | Opened from Home “See all” |
| `profile` | Person profile at `(app)/profile/[id]` — separate root stack |

### Tab bar vs header

- **Bottom bar** → `(app)/_layout.tsx` (`Tabs`, `headerShown: false` globally)
- **Top app bar** → each domain’s `_layout.tsx` (`Stack` + `SharedHeader`)

They are independent: tabs own the bottom; each domain stack owns the top.

---

## 4. App bar — `SharedHeader` + domain `_layout.tsx`

There is no single `AppBar` component. The top bar is **`components/shared/SharedHeader.tsx`**, registered per screen in domain `_layout.tsx` files:

```tsx
<Stack.Screen
  name="index"
  options={{
    headerShown: true,
    header() {
      return <SharedHeader title="People" />;
    },
  }}
/>
```

### `SharedHeader` props

| Prop | Purpose |
|------|---------|
| `title` | Header text |
| `isPop` | Show back chevron → `router.back()` |
| `backFunc` | Custom back handler |
| `child` | Replace title row (e.g. Home uses `<Greeting />`) |

Home is special: the app bar shows a personalized greeting + avatar instead of a static title.

---

## 5. Domain layouts and screens

Each tab folder has `_layout.tsx` (Stack + headers) and `index.tsx` (main screen).

### `home/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index`, `launch`, `profile/index`, `profile/updateProfile/index` |
| `index.tsx` | Dashboard — pinned announcements, notification preview, launch banner |
| `launch.tsx` | Launch countdown and unlock (`docs/FEATURE_FLAGS.md`) |
| `profile/index.tsx` | “My Profile” (logged-in user) |
| `profile/updateProfile/index.tsx` | Edit own profile (phone field: `docs/PHONE_NUMBERS.md`) |

**Header:** `SharedHeader` with `<Greeting />` on home; titled headers on sub-screens.

**`index.tsx` pattern:** compose `SharedBody` + section components + TanStack hooks (`useAnnouncementsQuery`, `useNotificationQuery`). Links to full lists via `router.push("/(app)/announcements")`.

---

### `people/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index` only (profile moved to `(app)/profile/[id]`) |
| `index.tsx` | Searchable paginated people list |

Uses `usePeoplePaginatedQuery` (infinite scroll). Row tap → `/(app)/profile/[id]` with optional `backPath`.

Guest users see limited UI (handled in screen + CASL).

---

### `cells/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index`, `profile/[id]`, `scanner`, `qrScan`, `sessions/` |
| `index.tsx` | All cells vs My Cells |
| `profile/[id].tsx` | Members, attendance, announcements |
| `scanner.tsx` | Camera permission, then routes to `qrScan` (flag `cellAttendance`) |
| `qrScan.tsx` | Session check-in scan |
| `sessions/` | Session list and one session |

**My Cells** lists memberships whose `member_status` is `ACTIVE`. `PENDING` stays on All with a badge (optimistic local ids plus the person payload). Check-in is blocked for `PENDING`, `REJECTED`, and `REMOVED` (`utils/cellMembership.ts`).

**Who can manage a cell** (`profile/[id].tsx`), from the loaded cell and the current person:

| Role | How it is detected | What the screen allows |
|------|--------------------|------------------------|
| Cell leader | `leader_of_cell_ids`, or `cell_leader_1` / `cell_leader_2` | Members, sessions, join requests. **Edit info** opens the CMS form in the browser |
| Zone leader | `zone_leader_1` / `zone_leader_2` on this cell (not `leader_of_cell_ids`) | Same manage actions, including **Edit info** |
| Cell core | `core_of_cell_ids`, or `is_core` on their roster row | Add/remove members, review joins, sessions. Not treated as a leader for Edit info |

CASL (`utils/casl/defineAbilityFor.ts`) mirrors that split. Cell leaders and zone leaders share rules on `leader_of_cell_ids` (profile, flows, notes, cell details, members, sessions). Zone leaders also get `CellMembers` and `CellSession` on any cell where `zone_leader_1` or `zone_leader_2` is their person id. They do not get `CellDetails` update from the zone slot alone.

Client CASL is UX. The API still authorizes.

---

### `events/`

Gated by `useFeatureFlag("events")` and hidden for guests.

| File | Role |
|------|------|
| `index.tsx` | Published events and the signed-in user’s registrations |
| `[eventId]/index.tsx` | Detail, register entry, check-in entry |
| `[eventId]/register.tsx` | Registration form |
| `[eventId]/confirmation.tsx` | Post-register confirmation |
| `qrScan.tsx` | Camera check-in. The scanned payload must equal the event id |
| `scanner.tsx` | Deprecated redirect to `qrScan` for old links |

`services/Event/event.service.ts` normalizes snake_case and camelCase. Registration is open when `isEventRegisterable` is true: status `published`, and now is strictly after `registration_open_at` and strictly before `registration_close_at` (`date-fns` `isAfter` / `isBefore`). A missing bound is treated as open on that side. If both bounds are missing, the window is open. `allow_rsvp` is stored on the event but is not read by `isEventRegisterable`. Check-in uses `isEventCheckInOpen`: published and `allow_checkin !== false`.

**Claim.** `useMyEventRegistrationsQuery` POSTs `events/claimMyEvents` once per signed-in Firebase uid per app session (no body). That links existing participant rows to the person. Later reads in the same session GET `events/myEvents`. A failed claim is removed from the in-memory map so the next fetch can retry. Guests do not run the query.

Phone fields on the registration form use `docs/PHONE_NUMBERS.md`.

---

### `flows/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index` |
| `index.tsx` | Follow-up flows — filter by status, flow, assignee |

Uses `useFlowsQuery`, `usePeopleFlowQuery`. Supports `flow_id` and `isMeMode` URL params.

Components: `FlowSelect`, `StatusTabs`, `PeopleFlowAssignedList`, action dialogs.

---

### `leaders/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index`, `[category]` |
| `index.tsx` | Resource categories (gallery / list) |
| `[category].tsx` | Files in one category |

Uses `useResourcesQuery`, `useFilteredResources`. Category name shown in header on `[category]`.

---

### `settings/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index`, `changeEmail`, `changePassword`, `faq`, `delete-account` |
| `index.tsx` | Settings menu — logout, guest login, links |
| `changeEmail/index.tsx` | Change email |
| `changePassword/index.tsx` | Change password (+ `ReauthModel` component) |
| `faq/index.tsx` | FAQs |
| `delete-account/index.tsx` | Account deletion |

All sub-screens use `SharedHeader` with `isPop`.

---

### `announcements/` (hidden tab)

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index`, header “All Announcements” with back |
| `index.tsx` | Full searchable announcement list |

---

### `notifications/` (hidden tab)

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index`, header “All Notifications” with back |
| `index.tsx` | Full list with filter (all / unread / closed) |

---

### `profile/` (root-level stack)

Registered in **root** `app/_layout.tsx`, not only as a hidden tab.

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `[id]` with custom back via `backPath` param |
| `[id].tsx` | Any person’s profile — info, cells, notes tabs |

Navigate: `router.push({ pathname: "/(app)/profile/[id]", params: { id, backPath } })`.

---

## 6. Auth group — `(auth)/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack for all auth screens; `SharedHeader` on some |
| `splash.tsx` | Loading splash (logo animation) |
| `sign-in.tsx` | Email/password login |
| `sign-up.tsx` | New user registration |
| `new-account.tsx` | Account creation flow |
| `claim-set-password.tsx` | Claim existing person record |
| `complete-profile.tsx` | Post-signup profile completion |
| `forgot-password.tsx` | Password reset |
| `selected-account.tsx` | Pick account to claim |
| `verify-otp.tsx` | OTP verification |

`complete-profile` header back triggers sign-out confirm dialog.

---

## 7. Typical screen pattern (`index.tsx`)

```tsx
const Screen = () => {
  const { data, isPending, refetch } = useSomeQuery();

  return (
    <SharedBody>
      <StatusBar barStyle="dark-content" />
      <SharedSearchBar ... />
      <SomeList data={data} onRefresh={refetch} />
    </SharedBody>
  );
};
```

- **`SharedBody`** — full-screen content area below the header
- **Data** — TanStack hooks in `hooks/`, not direct `fetch` in screens
- **Navigation** — `useRouter()` / `router.push()`

---

## 8. Components (`components/`)

Auto-imported via `@/` path alias.

### `shared/` — cross-feature UI

| Component | Role |
|-----------|------|
| `SharedHeader` | Top app bar |
| `SharedBody` | Page content wrapper |
| `SharedSearchBar` | Search input |
| `SharedButton`, `SharedModal` | Common actions |
| `FormField`, `FormDateInput`, `FormSelect` | Form inputs |
| `PhoneFormField` | Country code + national number (`docs/PHONE_NUMBERS.md`) |
| `DynamicFormField` | Dynamic form builder field |
| `Skeleton/*` | Loading placeholders |

### Domain folders

| Folder | Purpose |
|--------|---------|
| `Home/` | `Greeting`, `NotificationList`, `AnnouncementBanner`, `LaunchBanner` |
| `Launch/` | Locked, unlocked, and celebration views for `home/launch` |
| `People/` | `PeopleList`, `PeopleRow` |
| `Cells/` | `CellList`, `CellCard`, profile members, attendance |
| `Events/` | Cards, registration fields, check-in |
| `Flows/` | Flow list, actions, status tabs, notes |
| `Leaders/` | Categories, folders, resource viewers |
| `Announcement/` | Cards, dialogs, pin/all lists |
| `Notes/` | Note item, dialog |
| `Auth/` | Signup profile item |

---

## 9. API services (`services/`)

Pure async functions — one folder per domain, paired with `*.types.ts` where needed.

| Service | File | Main exports |
|---------|------|--------------|
| Auth | `Auth/auth.service.ts` | `createAccount`, `getPersonOfUid`, `deleteAccount` |
| Person | `Person/person.service.ts` | `fetchPeople`, `fetchPeoplePaginated`, `fetchPersonById`, `updatePeople` |
| Cell | `Cell/cell.service.ts` | Cell fetch helpers |
| Flow | `Flow/flow.service.ts` | `fetchFlows`, `fetchPeopleFlow`, mutations |
| Note | `Note/notes.service.ts` | CRUD notes |
| Announcement | `Announcement/announcement.service.ts` | `getAnnouncements` |
| Notification | `Notifications/notifications.service.ts` | `fetchNotifications`, mark read/closed |
| Resource | `Resource/resource.service.ts` | `getResources`, `getCategoryResources` |
| Template | `Template/template.service.ts` | WhatsApp templates |
| User | `User/user.service.ts` | `updateDeviceToken` |
| OTP | `OTP/otp.service.ts` | `sendOTP`, `verifyOTP` |
| Event | `Event/event.service.ts` | List, detail, register, claim, check-in |
| System | `System/system.service.ts` | `getSystemConfig` (`GET /system/config`) |

### Service pattern

```ts
import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";
import { ReturnVal } from "@/utils/types/returnVal.types";

export const fetchPeople = async (): Promise<Person[]> => {
  const response = await secureFetch(apiEndpoints.people.getAll);
  const json: ReturnVal = await response.json();
  if (!json.success) throw { status: json.status_code, message: json.message };
  return json.data as Person[];
};
```

Backend responses use `ReturnVal`: `{ success, data, message, status_code }`.

---

## 10. Endpoints — `utils/endpoints.ts`

Central URL registry. Base URL from Expo config:

```ts
const extra = Constants.expoConfig?.extra;
export const apiBaseUrl = extra?.API_URL;
```

Groups include `people`, `cells`, `flows`, `peopleFlows`, `notes`, `announcements`, `notifications`, `resources`, `users`, `otp`, `templates`, `events`, and `system`. Event staff routes (groups, imports, email) stay on the CMS; the app only calls the public event paths in this file.

Configure via `app.config.ts` / `utils/tempEnv.ts` for local dev.

---

## 11. `secureFetch` — `utils/secureFetch.ts`

All authenticated API calls go through here:

1. Reads Firebase `currentUser` from `@react-native-firebase/auth`
2. Skips token for **guest mode** (`useAuthStore.isGuest`)
3. Attaches `Authorization: Bearer <idToken>` for signed-in users
4. Sets `Content-Type: application/json`
5. Unless `skipPersonSync` is set, reads response header `X-Person-Revision`

### Person revision

The header is the server’s revision of the signed-in person. `secureFetch` keeps the first value it sees on `authStore.personRevision`. A later response with a different value calls `authStore.refreshPerson`, which reloads the person via `getPersonOfUid({ skipPersonSync: true })` and rebuilds the CASL `ability`. That is how a role change (for example a new Zone Leader) shows up without a new sign-in.

- One refresh runs at a time. Overlapping calls share that promise.
- A failed refresh is not retried for 15 seconds.
- Guests and signed-out sessions are ignored.
- `getPersonOfUid` passes `skipPersonSync` so the refresh request does not recurse.

---

## 12. Data hooks (`hooks/`)

TanStack Query layer — mirrors `services/`:

| Folder | Hooks |
|--------|-------|
| `People/` | `usePeopleQuery`, `usePeoplePaginatedQuery`, `useSinglePersonQuery` |
| `Flows/` | `useFlowsQuery`, `usePeopleFlowQuery`, mutations |
| `Cell/` | `useCellQuery`, `useSingleCellQuery` |
| `CellAttendance/` | Session and attendance queries / mutations |
| `Event/` | `useEventQuery`, `useMyEventRegistrationsQuery` (includes claim-once), `useEventCheckInMutation` |
| `Announcement/` | `useAnnouncementsQuery` |
| `Notifications/` | `useNotificationsQuery` |
| `Resource/` | `useResourcesQuery`, `useFilteredResources` |
| `Note/` | `useNotesQuery` |
| `Template/` | `useTemplatesQuery` |
| `Auth/` | `useAuthHandler` |

`usePeoplePaginatedQuery` uses `useInfiniteQuery` for scroll-to-load-more.

---

## 13. Stores (`stores/`)

Zustand for client/session state:

| Store | Role |
|-------|------|
| `authStore.ts` | Firebase user, app user, guest mode, CASL `ability`, `personRevision`, sign-in/out |
| `signUpStore.ts` | Multi-step signup state |
| `claimStore.ts` | Claim-existing-account flow (person records, not event claim) |
| `systemStore.ts` | Runtime feature flags, launch status, store-update prompt. Disk files are fallback only |

Server data lives in TanStack Query, not stores. Flags and launch state are the exception: they live in `systemStore` because tabs read them before a screen mounts. See `docs/FEATURE_FLAGS.md`.

---

## 14. Utils (`utils/`)

| File | Role |
|------|------|
| `secureFetch.ts` | Authenticated HTTP |
| `endpoints.ts` | API URL builder |
| `helper.ts` | Dates, `formatPhone` (delegates to `phone.ts`), toast errors |
| `phone.ts` | Dial code + national digits. See `docs/PHONE_NUMBERS.md` |
| `helper_profile.ts` | Profile initials, field helpers |
| `helper_flows.ts` | Flow-specific helpers |
| `helper_leaders.tsx` | Leader resource helpers |
| `launchWindow.ts` | `isLaunchWindowOpen` for the launch countdown |
| `eventRegistrationGates.ts` | Published + registration window; check-in gate |
| `cellMembership.ts` | `PENDING` / `ACTIVE` / `REJECTED` / `REMOVED` and check-in copy |
| `casl/defineAbilityFor.ts` | Role → permission rules, including `Zone Leader` |
| `casl/helper.ts` | CASL utilities |
| `tempEnv.ts` | Local dev API URL override |
| `types/` | Shared TS types (`returnVal`, `TableField`, etc.) |

Permissions: `authStore.ability` from `defineAbilityFor(person)`. Use `hooks/useAbility.ts` in components. Roles worth knowing when debugging a cell screen: Cell Leader, Zone Leader, Cell Core, Cell Coordinator, District Pastor, District Admin. Zone Leader is a real role string (`"Zone Leader"`), not an alias of Cell Leader.

---

## 15. Layout nesting diagram

```
app/_layout.tsx                    ← Root Stack, auth redirect, FCM
├── (auth)/_layout.tsx             ← Auth Stack
│   ├── splash, sign-in, sign-up, …
│
├── (app)/_layout.tsx              ← Bottom Tabs (navbar, flag-gated)
│   ├── home/_layout.tsx           ← Stack + SharedHeader / Greeting
│   │   └── index, launch, profile/*
│   ├── cells/_layout.tsx          ← flag `cells`; camera routes hide the tab bar
│   ├── events/_layout.tsx         ← flag `events` and not guest
│   ├── people/_layout.tsx
│   ├── flows/_layout.tsx
│   ├── leaders/_layout.tsx
│   ├── settings/_layout.tsx
│   ├── announcements/_layout.tsx  ← hidden tab
│   ├── notifications/_layout.tsx  ← hidden tab
│   └── profile/_layout.tsx        ← hidden tab
│
└── (app)/profile/_layout.tsx      ← Root-level person profile stack
    └── [id]
```

---

## 16. Data flow (example: People list)

```
User taps People tab
        │
        ▼
(app)/_layout.tsx Tabs → people tab active
        │
        ▼
people/_layout.tsx → SharedHeader "People"
        │
        ▼
people/index.tsx
        │
        ▼
usePeoplePaginatedQuery()  [TanStack infinite query]
        │
        ▼
person.service.fetchPeoplePaginated()
        │
        ▼
secureFetch() + Firebase token (or guest, no token)
        │
        ▼
sibkl-cms-backend REST API
```

---

## 17. Local development

```bash
npm install
# Point API_URL in app.config.ts / tempEnv to backend
npx expo run:android --device   # or ios
```

See `README.md` for EAS builds, Play Store signing, and deployment.

See `docs/FEATURE_FLAGS.md` for server feature flags, the launch window, and the build-time `PILOT_BUILD` label. See `docs/PHONE_NUMBERS.md` for the stored phone format.

---

## 18. Where to start for common tasks

| Task | Start here |
|------|------------|
| New tab screen | `(app)/{domain}/index.tsx` + `_layout.tsx` |
| New sub-screen (with back) | Add `Stack.Screen` in domain `_layout.tsx` |
| Hide from tab bar | `href: null` in `(app)/_layout.tsx` |
| New API call | `utils/endpoints.ts` → `services/` → `hooks/` |
| Auth / guest behavior | `stores/authStore.ts`, `app/_layout.tsx` routing |
| Permissions | `utils/casl/defineAbilityFor.ts` |
| Stale roles after an admin change | `X-Person-Revision` in `utils/secureFetch.ts`, `authStore.refreshPerson` |
| Zone leader cell access | `defineAbilityFor` (`zone_leader_1` / `zone_leader_2`) and `cells/profile/[id].tsx` |
| Push notifications | `app/_layout.tsx` FCM setup, `User/user.service` token, topic `system-config` |
| Top bar title / back | Domain `_layout.tsx` + `SharedHeader` |
| Bottom navbar | `(app)/_layout.tsx` only |
| Show or hide a feature | `hooks/useFeatureFlag.ts`, `docs/FEATURE_FLAGS.md` |
| Phone input / stored format | `utils/phone.ts`, `docs/PHONE_NUMBERS.md` |
| Event list, claim, check-in | `services/Event/event.service.ts`, `hooks/Event/` |
| Expo SDK upgrade (53 → 54) | `docs/SDK_54_UPGRADE.md` |
