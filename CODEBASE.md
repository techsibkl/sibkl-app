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
| `profile/index.tsx` | “My Profile” (logged-in user). Email is shown even though the field is `editable: false` |
| `profile/updateProfile/index.tsx` | Edit own profile. Email is disabled and stripped before `updatePeople`. Phone: `docs/PHONE_NUMBERS.md` |

**Header:** `SharedHeader` with `<Greeting />` on home; titled headers on sub-screens.

**Email on My Profile.** `constants/const_person.ts` marks `email` `editable: false`, but both screens still render it (`key === "email"` is included anyway). The value is `person.email`, then the Firebase `user.email`. The edit form disables that field for every signed-in user and `delete`s `email` from the payload, so a profile save cannot change the person email. Changing the login address is Settings → change email, which calls Firebase `updateEmail` after re-auth and does not write the person row. A verified email-change flow for people who already have an account is not in this screen yet.

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

**Attendance ids.** Person ids arrive as numbers or numeric strings. Session screens and `cellAttendance.service.ts` compare them with `toPeopleId` / `isSamePeopleId`. `null` and `""` stay `null` so a guest row is not person `0`. A `Map` keyed with the raw value will miss a checked-in member.

**Sessions.** Create is `ability.can("manage", "CellSession")`, or the person is in `leader_of_cell_ids` / `core_of_cell_ids` for this cell **and** `can("create", "CellSession")`. Close uses `manage` CellSession, or leader/core of this cell. Cell Admin has `manage` on `CellSession`. A zone leader who is not also leader or core of that cell can open the list from the profile (`isZoneLeaderOfCell`) but does not pass the create/close check. `meeting_date` for a new session is a local calendar day (`utils/localDate.ts`), not `toISOString()`.

**Who can manage a cell** (`profile/[id].tsx`), from the loaded cell and the current person:

| Role | How it is detected | What the screen allows |
|------|--------------------|------------------------|
| Cell leader | `leader_of_cell_ids`, or `cell_leader_1` / `cell_leader_2` | Members, sessions, join requests. **Edit info** opens `https://sibklcms-prod.web.app/forms/cells/update/` in the browser |
| Zone leader | `zone_leader_1` / `zone_leader_2` on this cell (not `leader_of_cell_ids`) | Same profile actions, including **Edit info**. Session create/close still requires leader/core of this cell or `manage` `CellSession` |
| Cell core | `core_of_cell_ids`, or `is_core` on their roster row | Add/remove members, review joins, sessions. Not treated as a leader for Edit info |

CASL (`utils/casl/defineAbilityFor.ts`) mirrors that split. Cell leaders and zone leaders share rules on `leader_of_cell_ids` (profile, flows, notes, cell details, members, sessions). Zone leaders also get `CellMembers` and `CellSession` on any cell where `zone_leader_1` or `zone_leader_2` is their person id. They do not get `CellDetails` update from the zone slot alone.

Client CASL is UX. The API still authorizes. Role grants stack with `can` only; there is no `cannot()`, so a second role cannot revoke the first. `Cell Coordinator` is not a client role. See the permissions section below.

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

**Assign person.** `PersonListItem` shows a “Has account” chip when `person.has_account` is true. The same chip is on the cell add-member sheet. `has_account` means the person id exists on `users.people_id` (`person.type.ts`). `fetchPeopleScopedFields` and `fetchPeopleScopedMaskedFields` coerce `true` or `1` to boolean and sort those people first, then by name. The assign dialog still groups cell, then district, then others inside that list.

---

### `leaders/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index`, `[category]`. Mounts `VimeoThumbnailBridge` and `VimeoFullscreenHost` |
| `index.tsx` | Resource categories (gallery / list) |
| `[category].tsx` | Files in one category. A row with `vimeo_link` is labeled “Vimeo” |

Uses `useResourcesQuery`, `useFilteredResources`. Category name shown in header on `[category]`.

**Vimeo.** Only links `parseVimeoLink` accepts play inside the app (`utils/vimeo.ts`): `vimeo.com` and `player.vimeo.com`, including an unlisted hash (`/123456789/abcdef` or `?h=`). Anything else stays an external open (YouTube or Drive). Watch calls `openVimeoFullscreen`, which sets `autoplay=1` and renders `VimeoPlayer`.

The player is a WebView whose `baseUrl` is `VIMEO_EMBED_ORIGIN` (`https://sibklcms-prod.web.app/`, trailing slash required so Android sends that document origin). Vimeo privacy checks the embedding Referer and has no app-id allowlist, so a new player host will not load until that domain is on the video’s embed allowlist. Thumbnails use one hidden WebView (`VimeoThumbnailBridge`) that fetches oEmbed with the same base URL, 8s timeout, in-memory cache in `utils/vimeoThumbnail.ts`. Do not put a WebView on every card.

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
| `claim-set-password.tsx` | Password after a successful claim OTP. See `docs/CLAIM_ACCOUNT.md` |
| `complete-profile.tsx` | Post-signup profile completion |
| `forgot-password.tsx` | Password reset |
| `selected-account.tsx` | Email or SMS verification for the selected person |
| `verify-otp.tsx` | Email OTP and Twilio SMS OTP |

Claiming a CMS person (email or SMS) is `docs/CLAIM_ACCOUNT.md`. Event registration claim is the events section above.

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
| `localDate.ts` | Calendar days in the device timezone. See below |
| `vimeo.ts` | Allowlisted Vimeo embed URL and player HTML |
| `claimSuggestion.ts` | “Suggested” rank on the claim search list |
| `appVersion.ts` | Store-update prompt comparison (`major.minor.patch`) |
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

Permissions: `authStore.ability` from `defineAbilityFor(person)`. Use `hooks/useAbility.ts` in components. Zone Leader is a real role string (`"Zone Leader"`), not an alias of Cell Leader. `Cell Coordinator` was removed from the `Role` enum and from the follow-up assignment filter. A person whose only role string is `Cell Coordinator` gets the authenticated defaults (own profile, public flows, own notes) and not the “known role” extras (`PeopleScoped`, `CellScoped`, archived profiles).

Role blocks only call `can()`. Do not add `cannot()` to take a subject away from a combined role; it used to wipe Media Admin and made Cell Admin / People Admin depend on `manage all` plus exceptions. Current shape:

| Role | Grants beyond the authenticated defaults |
|------|------------------------------------------|
| Senior Pastor, Super Admin | `manage` `all` |
| Cell Admin | `manage` cell, district, zone, session, and leadership-request subjects |
| Cell Leader | On `leader_of_cell_ids`: profile, flows (including `complete`), notes, cell details, members, sessions |
| Zone Leader | Same as Cell Leader on `leader_of_cell_ids`, plus `CellMembers` and `CellSession` where `zone_leader_1` or `zone_leader_2` is this person. No `CellDetails` update from the zone slot |
| Cell Core | On `core_of_cell_ids`: profile, flows (`assign`, not `complete`), notes, read cell details, members (including create/delete), sessions |
| People Admin | `manage` people, notes, duplicates, flows. Read-only on cell structure |
| Media Admin | `manage` announcements and resources. Does not clear other roles |
| District Pastor / District Admin | District-scoped people, cells, zones, flows. Both can `complete` `PeopleFlow` in their districts |
| Staff | Only what is already in the defaults for that assignee (explicit repeat, not `manage all`) |

Anyone with at least one known role (not `None`, not an unknown string) can also read `PeopleScoped`, `CellScoped`, and archived profiles.

**Calendar dates.** `formatLocalDate` / `parseCalendarDate` / `toCalendarDateString` keep a `YYYY-MM-DD` value on that civil day. An ISO instant uses the device’s local day, so a local midnight that was serialized with `toISOString()` is not stored as the previous day. `FormDateInput`, cell session create, and event date fields go through this module. Do not send `date.toISOString()` for a date-only field.

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

See `docs/FEATURE_FLAGS.md` for server feature flags, the launch window, and the build-time `PILOT_BUILD` label. See `docs/PHONE_NUMBERS.md` for the stored phone format. See `docs/CLAIM_ACCOUNT.md` for email and SMS claim.

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
| Claim a person (email or SMS) | `docs/CLAIM_ACCOUNT.md`, `stores/claimStore.ts` |
| Calendar date off by one day | `utils/localDate.ts` |
| Attendance check missing a member | `toPeopleId` / `isSamePeopleId` in `utils/cellMembership.ts` |
| Vimeo embed blocked | `VIMEO_EMBED_ORIGIN` in `utils/vimeo.ts` |
| Event list, claim, check-in | `services/Event/event.service.ts`, `hooks/Event/` |
| Store update prompt | `needsAppUpdate` in `stores/systemStore.ts`, `docs/FEATURE_FLAGS.md` |
| Expo SDK upgrade (53 → 54) | `docs/SDK_54_UPGRADE.md` |
