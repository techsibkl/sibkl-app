import { Person } from "@/services/Person/person.type";
import { subject, type AnyAbility } from "@casl/ability";

export function hasAbility(person: Person, ability: string): boolean {
  return person.abilities?.includes(ability);
}

/** Highest matching flag wins. Delete is allowed only for a strictly lower rank. */
export const CellMemberRank = {
  MEMBER: 0,
  CORE: 1,
  CELL_LEADER: 2,
  ZONE_LEADER: 3,
} as const;

export function cellMemberRank(member: {
  is_zone_leader?: number | boolean;
  is_cell_leader?: number | boolean;
  is_core?: number | boolean;
}): number {
  if (member.is_zone_leader) return CellMemberRank.ZONE_LEADER;
  if (member.is_cell_leader) return CellMemberRank.CELL_LEADER;
  if (member.is_core) return CellMemberRank.CORE;
  return CellMemberRank.MEMBER;
}

export function canDeleteCellMember(
  ability: AnyAbility,
  cellId: number,
  member: {
    id: number;
    is_zone_leader?: number | boolean;
    is_cell_leader?: number | boolean;
    is_core?: number | boolean;
  },
  districtId?: number | null,
) {
  return ability.can(
    "delete",
    subject("CellMembers", {
      id: member.id,
      cell_ids: cellId,
      district_id: districtId ?? undefined,
      rank: cellMemberRank(member),
    }),
  );
}
