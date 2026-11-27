# Cells

How the Cells tab lists cells, who can manage a roster, and when Remove is shown. Client CASL is UX. The API still authorizes.

**Last updated:** 2026-11-27

---

## Lists

`app/(app)/cells/index.tsx`

| Tab | When it appears | Source | What is listed |
|-----|-----------------|--------|----------------|
| All | Always | `GET cells/public` (`useCellsPublicQuery`) | `status === ACTIVE`, excluding cells the person is already an `ACTIVE` member of. `PENDING` memberships stay here with a badge. |
| My Cells | Always | `person.cells` from the person query | Memberships whose `member_status` is `ACTIVE`, then dropped when a known cell `status` is not `ACTIVE`. A missing cell status is kept. |
| District | Role is `District Pastor` or `District Admin`, and `pastor_district_ids` or `admin_district_ids` is non-empty | `GET cells` (`useCellsQuery`, fetched only when the tab is shown) | `status === ACTIVE` and `district_id` is in those district id lists |

Search matches `cell_name` on the open tab.

The first tab is chosen once, on mount, from `person.cells` at that moment (any membership, including pending). An empty list selects All; otherwise My Cells. A later person fetch does not move the user between those two tabs. Leaving District happens if the person no longer qualifies for it.

Check-in is blocked for `PENDING`, `REJECTED`, and `REMOVED` (`utils/cellMembership.ts`).

---

## Roster badges

Member rows read flags on the roster person, not `cell_leader_1` / `zone_leader_1` id comparisons.

| Flag | Rank used for delete | List order |
|------|----------------------|------------|
| `is_zone_leader` | 3 | First |
| `is_cell_leader` | 2 | Then |
| `is_core` | 1 | Then |
| none of the above | 0 | Then |

Within a rank, rows sort by `full_legal_name`. Sections are Pending, Active, and Rejected. Highest flag wins when more than one is set (`cellMemberRank` in `utils/casl/helper.ts`).

---

## Who the profile screen treats as a manager

`app/(app)/cells/profile/[id].tsx`. These checks are separate from the CASL cell-id lists below.

| Screen flag | How it is detected | What it unlocks |
|-------------|--------------------|-----------------|
| Cell leader | `leader_of_cell_ids` contains this cell, or the person id equals `cell_leader_1` / `cell_leader_2` | Leader actions, including **Edit info** |
| Zone leader of this cell | Person id equals `zone_leader_1` / `zone_leader_2` on the loaded cell. `zone_leader_of_cell_ids` is not read here | Same leader actions as a cell leader |
| Core | `core_of_cell_ids` contains this cell, or their own roster row has `is_core` | Add members, review joins, sessions. Not a leader |

**Edit info** is the cell-leader and zone-leader link only. It opens `https://sibklcms-prod.web.app/forms/cells/update/` in the browser. It does not pass the cell id.

Cores can accept or reject pending joins. They are not `isLeader`, so they do not get Edit info or Make Core.

---

## Removing a member

`canDeleteCellMember` builds a `CellMembers` subject with `id`, `cell_ids` (this cell), `district_id`, and `rank`, then asks CASL for `delete`.

Delete rules in `utils/casl/defineAbilityFor.ts` require the target id to be someone else, and a strictly lower rank:

| Caller role | Cells | May delete |
|-------------|-------|------------|
| Cell Leader | `leader_of_cell_ids` | Rank below cell leader (member, core) |
| Zone Leader | `zone_leader_of_cell_ids` | Rank below zone leader (member, core, cell leader) |
| Cell Core | `core_of_cell_ids` | Rank below core (member only) |
| District Pastor | `pastor_district_ids` | Any rank whose cell `district_id` is in that list. The rule has no rank condition |
| District Admin | `admin_district_ids` | Any rank whose cell `district_id` is in that list. The rule has no rank condition |
| Cell Admin, Senior Pastor, Super Admin | `manage` on cells or `all` | Any member the broader grant allows |

`MemberActionSheet` hides **Remove** when the row has `is_cell_leader` or `is_zone_leader`, even if CASL would allow the delete. **Make Core** is shown only when the viewer is a cell or zone leader of this cell, the row is not themselves, and the row is not a cell or zone leader.

`handleRemoveMember` checks `canDeleteCellMember` again before calling the API. A hidden button is not the only guard.

Zone-leader CASL uses `zone_leader_of_cell_ids`. The profile screen’s zone-leader flag uses `zone_leader_1` / `zone_leader_2`. A person can pass one check and fail the other. There is no Cell Coordinator role.

---

## Adding a member

`AddMembersSheet` loads `GET people/scoped-masked` (`usePeopleScopedMaskedFieldsQuery`).

Both scoped list helpers sort people with an account first. `has_account` is true when the API sends `true` or `1`. Ties sort by `full_legal_name`. The sheet shows a **Has account** badge.

Follow-up assign (`PersonListItem`) shows the same badge from `has_account` on `GET people/paginated`. That list is not re-sorted by account.

Who may read scoped people is in `CODEBASE.md` (People scoped). The masked endpoint is what Add Members calls.

Own-profile edit always disables email and drops it from the update payload (`home/profile/updateProfile`). That lock is not the `has_account` flag. Email changes go through Settings.
