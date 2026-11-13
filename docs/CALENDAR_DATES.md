# Calendar dates

How a picked day is stored. Implementation: `utils/localDate.ts`. Inputs: `components/shared/FormDateInput.tsx`, `components/Cells/CreateSessionSheet.tsx`, and event custom fields of type `date` in `components/Events/EventCustomFieldRenderer.tsx`.

**Last updated:** 2026-11-13

---

## Stored shape

A calendar day is `YYYY-MM-DD` in the device timezone. It is not a UTC instant.

| Source | Saved |
|--------|--------|
| Picker `Date` for 25 Oct 2026 at local midnight | `2026-10-25` |
| Already `2026-10-25` | `2026-10-25` |
| Empty, `not-a-date`, or `2026-02-31` | not saved (`null`) |

Android date pickers return local midnight. `date.toISOString()` turns that into the previous UTC day for timezones east of UTC (Malaysia is UTC+8), so 25 Oct becomes `2026-10-24`. Cell sessions, profile and flow dates, and event date fields were saved one day early until they went through this module.

Event start and end on the event record are still API timestamps. Whether to show a clock is `start_includes_time` / `end_includes_time`, not this helper. See the events section of `CODEBASE.md`.

---

## API

```ts
import {
  formatLocalDate,
  parseCalendarDate,
  toCalendarDateString,
} from "@/utils/localDate";

formatLocalDate(new Date(2026, 9, 25, 0, 0, 0));
// "2026-10-25"

toCalendarDateString("2026-10-25");
// "2026-10-25"

parseCalendarDate("2026-02-31");
// null
```

- `formatLocalDate` uses `getFullYear` / `getMonth` / `getDate`. It does not use `toISOString`.
- `parseCalendarDate` accepts a `Date`, a `YYYY-MM-DD` string, or an ISO instant. A date-only string is constructed as local midnight (`new Date(year, monthIndex, day)`), so it stays on that calendar day. An instant uses the local day of that instant, which puts a local-midnight value that was previously serialized with `toISOString()` back on the intended day.
- `toCalendarDateString` is `formatLocalDate(parseCalendarDate(value))`, or `null` when the value is not a date. Invalid calendar days such as 31 Feb are rejected.

`FormDateInput` commits `formatLocalDate(selectedDate)` into the form. Event metadata of type `date` runs `toCalendarDateString` in `formatMetadataForSubmit` before submit. Creating a cell session sends `formatLocalDate(date)` as `meeting_date`.

---

## Constraints

- Do not persist a picker date with `toISOString().slice(0, 10)`.
- Do not add a second formatter in the screen. Profile, flows, cell sessions, and event custom dates go through `localDate.ts`.
- A `YYYY-MM-DD` value is a calendar day. Parsing it with `new Date("2026-10-25")` is UTC midnight and will display as the previous evening in Malaysia.
- `utils/localDate.test.mjs` covers the local-midnight case. Run it with `node --test utils/localDate.test.mjs`.

---

## Related

- [CODEBASE.md](../CODEBASE.md) — events date-only display, cell sessions
- [PHONE_NUMBERS.md](./PHONE_NUMBERS.md) — the other shared form normalizer
