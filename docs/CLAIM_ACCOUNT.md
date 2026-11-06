# Claim an existing person

How a person record that has no Firebase user becomes an app account. This is separate from event claim (`events/claimMyEvents` in `CODEBASE.md`).

**Last updated:** 2026-11-06

Implementation: `(auth)/sign-up.tsx` → `selected-account.tsx` → `verify-otp.tsx` → `claim-set-password.tsx`. State lives in `stores/claimStore.ts` (`selectedProfile`, `verificationChannel`: `"email"` | `"sms"` | `null`).

---

## Flow

```
sign-up          search people with no uid (name only)
    │
    ├─ Create New Account → claimStore.reset() → new-account
    │                         email OTP, then Firebase sign-up
    │
    └─ pick a row → selected-account
                      │
                      ├─ Verify via Email → POST otp/create
                      └─ Verify via SMS   → POST otp/send-sms   (Twilio Verify)
                                │
                                ▼
                          verify-otp (6 digits)
                                │
                                ▼
                      claim-set-password
                      Firebase createUser + POST users/create-user-with-existing-person
                                │
                                ▼
                      complete-profile?claimedPeopleId=
```

Search data is `fetchPeopleWithNoUid` (`GET` people with no uid, `allowUnauthenticated: true`). The list filter matches `full_legal_name` only. The screen copy mentions email and phone; those strings do not search.

Rows are ordered by `claimConfidenceRank` (`utils/claimSuggestion.ts`):

| Confidence | When | Rank |
|------------|------|------|
| `high` | Email has a local part and a domain with a dot, and the phone has 8 or more digits | 2, amber card, “Suggested” |
| `email` | Complete email only | 1, “Suggested” |
| `none` | Otherwise | 0 |

Masked values still count. A masked phone that keeps the first and last digits and still has 8 digits is treated as a stored full number.

---

## Verification channel

`selected-account.tsx` enables a channel from the masked profile, not from confidence:

| Channel | Enabled when | Request |
|---------|--------------|---------|
| Email | `email` contains `@` and is non-empty after trim | `sendOTP(personId, null)` → `POST otp/create` `{ person_id }` |
| SMS | Phone has at least 7 digits | `sendSmsOTP(personId)` → `POST otp/send-sms` `{ person_id }` |

A disabled row opens an alert telling the person to ask a cell leader or admin to update the contact. SMS is slightly looser than the “Suggested” phone check (7 digits vs 8).

Both OTP helpers in `services/OTP/otp.service.ts` call `secureFetch` with `allowUnauthenticated: true`. There is no Firebase user yet.

`verify-otp.tsx` treats the session as SMS only when `verificationChannel === "sms"` **and** `selectedProfile` is set. A leftover `"sms"` from an abandoned claim must not run the Twilio path on a new-account email OTP. **Create New Account** calls `claimStore.reset()` for that reason. Do not navigate to `verify-otp` after a claim without setting the channel.

---

## OTP screen

Six digits. A paste or autofill that lands in one box fills the row. The code submits itself when all six are filled.

| | Email | SMS |
|--|-------|-----|
| First resend wait | 30s | 60s (matches the backend delay) |
| Resends this screen allows | 3 | 2 |
| Verify | `POST otp/verify` `{ person_id, otpCode }` or `{ email, otpCode }` | `POST otp/verify-sms` `{ person_id, otpCode }` |

The SMS comment in the screen: the backend allows 3 sends per 10 minutes. The send on `selected-account` uses one, so the OTP screen offers two resends. A failed SMS resend shows `result.message` (rate limit) and turns the button back on without counting the resend.

SMS success returns `{ data: { email } }`. The email may be missing. The app passes `""` into `claim-set-password`, not the string `"undefined"`.

Email success with a selected profile goes to the same password screen. Email success **without** a profile (new account) creates the Firebase user with `pendingSignUp` and replaces to `complete-profile`. New-account passwords are held in `signUpStore` until then. Claim passwords are typed on the next screen, so `selected-account` clears pending sign-up to empty strings before the email OTP.

---

## Password and link

`claim-set-password.tsx`:

- `verificationChannel === "sms"`: email is editable and required. Copy says the profile has no email. If verify returned an address, it is the default and can still be changed.
- Email channel: the field is disabled and labeled “Claim Email (Verified)”.

Submit:

1. `createUserWithEmailAndPassword` with that email and the new password.
2. `POST users/create-user-with-existing-person` with `{ people_id }`.
3. Prefetch `["person", personId]`, then `router.replace` to `complete-profile` with `claimedPeopleId`.

`auth/email-already-in-use` on the OTP screen (new-account path) tells the user to sign in. The claim password screen shows `err.message`.

---

## Constraints

- Do not create the Firebase user before OTP success. Claim creates it on the password screen; a brand-new account creates it on `verify-otp`.
- Do not send SMS without `person_id`. The phone number is read from the person record on the server.
- Do not persist the claim profile in navigation params alone. `claimStore.selectedProfile` is what the OTP screen uses.
- Reset the store when leaving the claim path. Channel and profile are in-memory Zustand only.
- Email change after the account exists is not this flow. My Profile shows email read-only and omits it from `updatePeople` (`CODEBASE.md`). Settings → change email updates Firebase `updateEmail` only.

---

## File reference

```
app/(auth)/sign-up.tsx                 name search, create-new resets the store
app/(auth)/selected-account.tsx        email vs SMS
app/(auth)/verify-otp.tsx              both channels, resend limits
app/(auth)/claim-set-password.tsx      Firebase user + link person
app/(auth)/new-account.tsx             email OTP for a person who is not claiming
stores/claimStore.ts                   selectedProfile, verificationChannel
services/OTP/otp.service.ts            sendOTP, verifyOTP, sendSmsOTP, verifySmsOTP
utils/claimSuggestion.ts               Suggested badge and sort
utils/endpoints.ts                     otp.create, otp.verify, otp.sendSms, otp.verifySms
services/Person/person.service.ts      fetchPeopleWithNoUid
```
