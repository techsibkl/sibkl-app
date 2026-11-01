# Phone numbers

Shared rules for profile edit and event registration. Implementation: `utils/phone.ts`, input UI: `components/shared/PhoneFormField.tsx`.

**Last updated:** 2026-10-24

---

## Stored shape

Digits only, country code included, no `+`, spaces, or dashes, and no national trunk `0`.

| Input | Stored |
|-------|--------|
| `0123456789` (default country Malaysia) | `60123456789` |
| `+60 12-345 6789` | `60123456789` |
| empty / no national digits | `""` |

Default dial code is `60` (`DEFAULT_DIAL_CODE`) when the value is empty or does not start with a known country code.

`formatPhone()` in `utils/helper.ts` is `toInternationalDigits()`. Event custom fields of type `phone` run through it in `utils/eventFormHelpers.ts` before submit. Profile and event contact fields use `PhoneFormField`, which writes `joinPhone(dialCode, national)` into the form value.

---

## Where it is used

| Surface | Code |
|---------|------|
| Profile edit | `constants/const_person.ts` maps the `phone` field to `PhoneFormField` |
| Event registration contact block | `components/Events/ParticipantContactFields.tsx` |
| Event custom field type `phone` | `components/Events/EventCustomFieldRenderer.tsx` |
| Submit normalization | `toInternationalDigits` / `formatPhone` |

The country list is `PHONE_COUNTRIES` in `utils/phone.ts` (one row per dial code). The picker shows `Name (+code)`.

---

## Rules

`splitPhone` (display) and `joinPhone` (form value):

- Strip non-digits.
- If the digits start with a known dial code and something remains after it, that prefix is the country and the rest is national. Longer codes win (`673` before `60` would not matter; `852` is tried before `60`).
- Otherwise the country stays `60` and leading zeros are removed from the national part.
- `joinPhone` returns `""` when the national part is empty after stripping zeros. The dial code is not stored alone.

`parsePastedPhone` runs on each keystroke in the national box:

- A value that starts with `+` or `00`, matches a known dial code, and has at least 6 national digits is split into country + national.
- A value with no `+` / `00` is treated as international only when the matched dial code is at least 2 digits and the whole digit string is 10–15 digits.
- Anything else stays in the national box. A Malaysian mobile typed as `123456789` matches dial code `1` (US/Canada) but is rejected by the length rule, so it is not rewritten to `+1`.

On blur, the field re-joins and re-splits so a typed trunk `0` is dropped from the stored value.

---

## Constraints

- Do not persist `+60…` or `012…`. The API value is the digit string from `joinPhone` / `toInternationalDigits`.
- Do not add a second formatter in the screen. Registration and profile both go through this module.
- Unknown country codes are stored as Malaysia plus the remaining digits. A number that already starts with a listed dial code is left unchanged by `toInternationalDigits`.
- `parsePastedPhone` will not split a short local number. Users pick the country explicitly for those.
- The national box accepts digits only. `+` is only special when it arrives as a paste that `parsePastedPhone` recognizes.

---

## Examples

```ts
import { joinPhone, parsePastedPhone, splitPhone, toInternationalDigits } from "@/utils/phone";

splitPhone("60123456789");
// { dialCode: "60", national: "123456789" }

joinPhone("60", "0123456789");
// "60123456789"

toInternationalDigits("+65 8123 4567");
// "6581234567"

parsePastedPhone("+60123456789");
// { dialCode: "60", national: "123456789" }

parsePastedPhone("123456789");
// null — left as a national number under the selected country
```
