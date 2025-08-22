import { Person } from "@/services/Person/person.type";

export function hasAbility(person: Person, ability: string): boolean {
  return person.abilities?.includes(ability);
}
