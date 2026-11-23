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

FCM registration subscribes the device to the `system-config` topic and refetches `GET /system/config` (public; works signed out) after a random 0–20s delay when a foreground message has `data.type === "system_config_updated"`. Background messages are logged; the app refetches config on resume if the last fetch is older than 5 minutes. See `docs/FEATURE_FLAGS.md`.

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
| `index.tsx` | All, My Cells, and District (pastors and district admins) |
| `profile/[id].tsx` | Members, attendance, announcements |
| `scanner.tsx` | Camera permission, then routes to `qrScan` (flag `cellAttendance`) |
| `qrScan.tsx` | Session check-in scan |
| `sessions/` | Session list and one session |

**My Cells** lists memberships whose `member_status` is `ACTIVE`. `PENDING` stays on All with a badge (optimistic local ids plus the person payload). Check-in is blocked for `PENDING`, `REJECTED`, and `REMOVED` (`utils/cellMembership.ts`).

All, My Cells, and District list active cells only (`CellStatus`: `PENDING`, `INACTIVE`, and `DELETED` are hidden). All requires `status === ACTIVE`. My Cells treats a membership with no cell `status` as active, then drops a status that is known and not `ACTIVE`.

**District tab.** Shown when the signed-in person is `District Pastor` or `District Admin` and `pastor_district_ids` or `admin_district_ids` is non-empty. It loads `useCellsQuery` (authenticated cell list; the query stays disabled otherwise) and keeps `ACTIVE` cells whose `district_id` is in that set. Cards show `district_name`. A failed load shows `Couldn't load district cells`. My Cells stays the person’s own approved memberships; the District tab is the overseen list.

**Who can manage a cell** (`profile/[id].tsx`), from the loaded cell and the current person:

| Role | How it is detected | What the screen allows |
|------|--------------------|------------------------|
| Cell leader | `leader_of_cell_ids`, or `cell_leader_1` / `cell_leader_2` | Members, sessions, join requests. **Edit info** opens the CMS form in the browser |
| Zone leader | `zone_leader_1` / `zone_leader_2` on this cell (not `leader_of_cell_ids`) | Same manage actions, including **Edit info** |
| Cell core | `core_of_cell_ids`, or `is_core` on their roster row | Add/remove members, review joins, sessions. Not treated as a leader for Edit info |

CASL (`utils/casl/defineAbilityFor.ts`) mirrors that split. Cell leaders and zone leaders share rules on `leader_of_cell_ids` (profile, flows, notes, cell details, members, sessions). Zone leaders also get `CellMembers` and `CellSession` on any cell where `zone_leader_1` or `zone_leader_2` is their person id. They do not get `CellDetails` update from the zone slot alone.

Client CASL is UX. The API still authorizes.

**Roster** (`MembersList` / `MemberRow`). Sort is cell leaders (`cell_leader_1` / `cell_leader_2`), then zone leaders (`zone_leader_1` / `zone_leader_2`), then `is_core`, then everyone else, then name. Badges are Leader, Zone Leader, and CORE. The Zone Leader badge is the cell’s zone-leader slot, not a role string on the member.

**Remove.** `canRemoveMembers` is cell leader, zone leader of this cell, or core. The action sheet also blocks removing yourself. A core cannot remove `cell_leader_1` or `cell_leader_2`; a cell or zone leader can. `handleRemoveMember` repeats that guard.

**Add.** `addCellMembers` returns the full roster (phone, status, `is_core`). The picker row only has a name, so the cell query is replaced with that response when it is a non-empty array. A batch add that fails (a removed membership row can still exist) retries one person at a time, then `updateMemberStatus(..., "ACTIVE")`.

**Sessions.** Create is allowed when `ability.can("manage", "CellSession")`, or when this cell is in `leader_of_cell_ids` / `core_of_cell_ids` and `ability.can("create", "CellSession")`. Close is `manage CellSession` or leader/core of this cell. Cell Admin can create and close through the `manage` grant; the screens do not check `manage all`. A person who is only `zone_leader_1` / `zone_leader_2` is a leader on the cell profile, but those session screens do not count that slot as leader/core.

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

**Date-only events.** `start_includes_time` and `end_includes_time` are false when that bound has no clock time (stored as midnight UTC). `normalizeEvent` also reads `start_at_includes_time` / `end_at_includes_time`. Same calendar day: one Date row, and a time range only for the sides that include a time. Different days: separate Starts and Ends rows. `formatEventDateTime` omits the clock when `includesTime` is false.

Custom field type `date` uses the shared calendar picker and saves `YYYY-MM-DD` through `utils/localDate.ts`. Do not call `toISOString()` on a picker date. See `docs/CALENDAR_DATES.md`.

---

### `flows/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index` |
| `index.tsx` | Follow-up flows — filter by status, flow, assignee |

Uses `useFlowsQuery`, `usePeopleFlowQuery`. Supports `flow_id` and `isMeMode` URL params.

Components: `FlowSelect`, `StatusTabs`, `PeopleFlowAssignedList`, action dialogs.

**District / cell assignment.** `AssignDistrictCellAction` reads `action.value`: `district`, `cell`, or anything else (both). The cell picker also requires `useFeatureFlag("cellFollowUp")`. Districts come from `useDistrictsQuery` (`GET /districts`). Cells for the selected district come from `useAssignableCellsQuery`. Save uses `useAssignDistrictMutation` and the cell assign mutation.

The person picker (`PersonListItem`) and the add-member sheet show a **Has account** chip when `has_account` is true. `fetchPeopleScopedFields` and `fetchPeopleScopedMaskedFields` treat `1` as true and sort people with an account first, then by name.

Own profile edit (`home/profile/updateProfile`) disables the email field and deletes `email` before `updatePeople`. The Settings “Change email” row is commented out.

---

### `leaders/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index`, `[category]` |
| `index.tsx` | Resource categories (gallery / list) |
| `[category].tsx` | Files in one category |

Uses `useResourcesQuery`, `useFilteredResources`. Category name shown in header on `[category]`. The library list pull-to-refresh refetches resources.

**Vimeo.** A `vimeo_link` plays in a WebView (`VimeoPlayer`). `parseVimeoLink` accepts `vimeo.com` and `player.vimeo.com`, including an unlisted privacy hash (`h`, or the path segment after the numeric id). The HTML document’s `baseUrl` is `https://sibklcms-prod.web.app/` (`VIMEO_EMBED_ORIGIN` in `utils/vimeo.ts`). Vimeo checks that page’s Referer against a domain allowlist; there is no app-id allowlist. Keep the trailing slash — Android uses it as the document origin. Thumbnails load through the same origin (`VimeoThumbnailBridge`).

`VimeoFullscreenModal` must be rendered inside the modal that opens it. On iOS a `Modal` is presented by its parent’s view controller. A second modal mounted outside an already-open modal cannot present and leaves the app unresponsive.

**Share.** Hidden when `shareable` is `false` or `0`. A missing `shareable` still shows Share. Android `Share.share` ignores `url`, so the link is also placed in `message`.

---

### `settings/`

| File | Role |
|------|------|
| `_layout.tsx` | Stack: `index`, `changeEmail`, `changePassword`, `faq`, `delete-account` |
| `index.tsx` | Settings menu — logout, guest login, links. Footer is `v` plus `expoConfig.version` only |
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

**Claim an existing person.** `selected-account` offers email OTP (`POST /otp/create` with `person_id`) and SMS OTP (`POST /otp/send-sms` with `person_id`, Twilio Verify). Both are `allowUnauthenticated`. Email is offered when the masked email contains `@`. SMS is offered when the phone has at least 7 digits. Otherwise the button tells the user to ask a cell leader or an admin to update the contact.

`claimStore.verificationChannel` is `"email"` or `"sms"`. On `verify-otp`, SMS mode also requires `selectedProfile`. A leftover `"sms"` channel with no profile stays on the email path, so it does not run during new-account signup. SMS resend waits 60 seconds and allows 2 further sends (the screen on `selected-account` already used one). Email resend waits 30 seconds and allows 3. Verify SMS is `POST /otp/verify-sms` with `{ person_id, otpCode }`. Email verify is `POST /otp/verify`. Success returns `{ email }` (empty when the person has none) and opens `claim-set-password`. A new account with no claimed profile creates the Firebase user and opens `complete-profile`.

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
| OTP | `OTP/otp.service.ts` | `sendOTP`, `verifyOTP`, `sendSmsOTP`, `verifySmsOTP` |
| District | `District/district.service.ts` | `fetchDistricts`, `fetchDistrictCells` |
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

Groups include `people`, `cells`, `flows`, `peopleFlows`, `notes`, `announcements`, `notifications`, `resources`, `users`, `otp` (`send-sms`, `verify-sms`), `districts`, `templates`, `events`, and `system`. Event staff routes (groups, imports, email) stay on the CMS; the app only calls the public event paths in this file.

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
| `Cell/` | `useCellQuery` (optional `enabled`, used by the District tab), `useCellsPublicQuery`, `useSingleCellQuery` |
| `District/` | `useDistrictsQuery`, `useAssignableCellsQuery` |
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
| `claimStore.ts` | Claim-existing-account flow (person records, not event claim). `verificationChannel` is `email` or `sms` |
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
| `localDate.ts` | Calendar day as `YYYY-MM-DD` in the device timezone. See `docs/CALENDAR_DATES.md` |
| `vimeo.ts` | Parse allowlisted Vimeo links and build the embed document |
| `eventRegistrationGates.ts` | Published + registration window; check-in gate |
| `cellMembership.ts` | `PENDING` / `ACTIVE` / `REJECTED` / `REMOVED` and check-in copy |
| `casl/defineAbilityFor.ts` | Role → permission rules, including `Zone Leader` |
| `casl/helper.ts` | CASL utilities |
| `tempEnv.ts` | Local dev API URL override |
| `types/` | Shared TS types (`returnVal`, `TableField`, etc.) |

Permissions: `authStore.ability` from `defineAbilityFor(person)`. Use `hooks/useAbility.ts` in components.

Role blocks only call `can()`. Do not add `cannot()`: grants from multiple roles are meant to stack. `Media Admin` manages `Announcements` and `Resource` only, and does not clear other roles. `Cell Admin` and `People Admin` use explicit subject lists. There is no `manage all` except `Senior Pastor` and `Super Admin`. `Cell Coordinator` is not a role.

`People Admin` can manage people, notes, duplicates, and flows, and can read cell structure. The comment in `defineAbilityFor` says that role does not manage permissions or cells and districts.

Roles worth knowing on a cell screen: Cell Leader, Zone Leader, Cell Core, Cell Admin, District Pastor, District Admin. Zone Leader is the string `"Zone Leader"`, not an alias of Cell Leader. A signed-in person with no known role keeps only the default grants (own profile, own notes and flows, public flows, join cell, announcements and resources for their role groups). `person === null` (guest) can read announcements whose `role_group_ids` include `7`.

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

See `docs/FEATURE_FLAGS.md` for server feature flags and the launch window. See `docs/PHONE_NUMBERS.md` for the stored phone format and `docs/CALENDAR_DATES.md` for picker dates.

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
| Calendar date one day early | `utils/localDate.ts`, `docs/CALENDAR_DATES.md` |
| Event list, claim, check-in, date-only display | `services/Event/event.service.ts`, `components/Events/EventDetailContent.tsx` |
| Claim account by SMS | `app/(auth)/selected-account.tsx`, `services/OTP/otp.service.ts` |
| District cell list | `app/(app)/cells/index.tsx` (`showDistrictTab`) |
| Leaders video or Share | `utils/vimeo.ts`, `components/Leaders/ViewResourceDialog.tsx` |
| Expo SDK upgrade (53 → 54) | `docs/SDK_54_UPGRADE.md` |
