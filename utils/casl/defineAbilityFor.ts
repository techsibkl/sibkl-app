import { Person } from "@/services/Person/person.type";
import {
	AbilityBuilder,
	type AnyAbility,
	createMongoAbility,
} from "@casl/ability";

export enum Role {
	NONE = "None",
	SENIOR_PASTOR = "Senior Pastor",
	SUPER_ADMIN = "Super Admin",
	CELL_ADMIN = "Cell Admin",
	CELL_COORDINATOR = "Cell Coordinator",
	CELL_LEADER = "Cell Leader",
	CELL_CORE = "Cell Core",
	// PEOPLE_ADMIN is a special role that can manage people but not permissions or cells/districts
	// i.e MSJ, Connect, Guest Ministry Admins
	PEOPLE_ADMIN = "People Admin",
	STAFF = "Staff",
	DISTRICT_PASTOR = "District Pastor",
	DISTRICT_ADMIN = "District Admin",
	MINISTRY_PASTOR = "Ministry Pastor",
	MINISTRY_ADMIN = "Ministry Admin",
	GUEST = "Guest (New)",
	GUEST_INTEGRATED = "Guest (Integrated)",
	MEMBER = "Member",
}

export function defineAbilityFor(person: Person): AnyAbility {
	const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
	try {
		// Default for ALL roles (including no role)
		can("read", "Flow", { district_id: null, get_public: true });
		can(["update", "read"], "PeopleProfile", { id: person.id }); // Can update self
		can("read", "PeopleProfile", {
			assignee_ids: { $in: [person.id] },
		});
		// Strictly only RUD notes if owner
		can(["read", "update", "delete"], "PeopleProfileNotes", {
			owner_id: person.id,
		});
		can(["read", "update", "assign", "default", "add"], "PeopleFlow", {
			assignee_id: person.id,
		});
		can("read", "Notification", { people_id: person.id });

		if (
			!person ||
			person?.roles?.includes(Role.NONE) ||
			!person?.roles?.every((role) =>
				Object.values<string>(Role).includes(role),
			)
		) {
			//  No roles, use default permissions above (can read public flows, can read/update self profile, can manage assigned people flow)
		}

		// default permissions that apply to anyone with a valid role
		// (this is where you can add any extra “base” rules that should
		// be granted to every authenticated user regardless of what
		// specific role(s) they have)
		if (person?.roles && person.roles.length > 0) {
			can("read", "PeopleScoped");
			can("read", "PeopleProfile", {
				status: "ARCHIVED",
			});
		}

		if (
			person?.roles?.includes(Role.SENIOR_PASTOR) ||
			person?.roles?.includes(Role.SUPER_ADMIN)
		) {
			can("manage", "all");
		}

		if (
			person?.roles?.includes(Role.CELL_ADMIN) ||
			person?.roles?.includes(Role.CELL_COORDINATOR)
		) {
			can("manage", "all");
			cannot("manage", "Permissions");
			cannot("manage", "Duplicates");
			cannot("manage", "PeopleProfile");
			// Only explicitly assigned to staff
			can("read", "PeopleProfile", {
				assignee_ids: { $in: [person.id] },
			});
			cannot(["create", "update", "delete"], "Flow");
			can("read", "Flow", { district_id: null, get_public: true });

			cannot("manage", "PeopleFlow");
			can(["read", "update", "assign", "default", "add"], "PeopleFlow", {
				assignee_id: person.id,
			});
		}

		if (person?.roles?.includes(Role.CELL_LEADER)) {
			can(["read", "update"], "PeopleProfile", {
				cell_ids: { $in: person.leader_of_cell_ids },
			});

			can(["create", "read", "delete"], "PeopleProfileNotes", {
				cell_ids: { $in: person.leader_of_cell_ids },
			});

			can(["read", "update"], "CellDetails", {
				cell_ids: { $in: person.leader_of_cell_ids },
			});

			can(["create", "read", "update", "delete"], "CellMembers", {
				cell_ids: { $in: person.leader_of_cell_ids },
			});

			can(["create", "update", "delete"], "CellChangeRequest", {
				cell_ids: { $in: person.leader_of_cell_ids },
			});
		}

		if (person?.roles?.includes(Role.CELL_CORE)) {
			can(["read", "update"], "PeopleProfile", {
				cell_ids: { $in: person.core_of_cell_ids },
			});
			can(["create", "read", "delete"], "PeopleProfileNotes", {
				cell_ids: { $in: person.core_of_cell_ids },
			});
			can(["read"], "CellDetails", {
				cell_ids: { $in: person.core_of_cell_ids },
			});

			can(["read"], "CellMembers", {
				cell_ids: { $in: person.core_of_cell_ids },
			});
		}

		if (person?.roles?.includes(Role.PEOPLE_ADMIN)) {
			can("manage", "all");
			cannot("manage", "Permissions");
			cannot(["create", "update", "delete"], "CellDetails");
			cannot(["create", "update", "delete"], "CellMembers");
			cannot(["create", "update", "delete"], "CellCreationRequest");
			cannot(["create", "update", "delete"], "CellChangeRequest");
			cannot(["create", "update", "delete"], "DistrictDetails");
			cannot(["create", "update", "delete"], "Zone");
		}

		if (person?.roles?.includes(Role.STAFF)) {
			// Only explicitly assigned to staff
			can("read", "PeopleProfile", {
				assignee_ids: { $in: [person.id] },
			});
			can("read", "Flow", { district_id: null, get_public: true });
			can(["read", "update", "assign", "default"], "PeopleFlow", {
				assignee_id: person.id,
			});
		}

		if (person?.roles?.includes(Role.DISTRICT_ADMIN)) {
			can(["read", "update", "delete"], "PeopleProfile", {
				district_ids: { $in: person.admin_district_ids },
			});

			can(["create", "read", "delete"], "PeopleProfileNotes", {
				district_ids: { $in: person.admin_district_ids },
			});
			// Strictly only RUD if owner
			can(["read", "update", "delete"], "PeopleProfileNotes", {
				owner_id: person.id,
			});

			// Duplicates
			can(["read", "merge", "archive"], "Duplicates", {
				district_id: { $in: person.admin_district_ids },
			});

			// Cells
			can("autoApprove", "Cell");
			can(["read", "update"], "CellDetails", {
				district_id: { $in: person.admin_district_ids },
			});

			can(["create", "read", "delete"], "CellMembers", {
				district_id: { $in: person.admin_district_ids },
			});

			can(["create", "read", "update"], "CellCreationRequest", {
				district_ids: { $in: person.admin_district_ids },
			});

			can(["read", "update"], "CellChangeRequest", {
				district_ids: { $in: person.admin_district_ids },
			});

			// Cell Map - Not used
			can(["read"], "CellMap", { district_admin_id: person.id });

			// Zones
			can(["create", "read", "update"], "Zone", {
				district_id: { $in: person.admin_district_ids },
			});

			// Districts
			can(["read", "update"], "DistrictDetails", {
				district_id: { $in: person.admin_district_ids },
			});

			// Flows
			can("create", "Flow");
			can("read", "Flow", { district_id: null, get_public: true }); // separate read permissions (some flows allow public to read)
			can(["read", "update", "delete", "add"], "Flow", {
				district_id: { $in: person.admin_district_ids },
			});

			can(["read", "update", "assign"], "PeopleFlow", {
				district_id: { $in: person.admin_district_ids },
			});

			can(["read", "update", "assign", "complete"], "PeopleFlow", {
				flow_district_id: { $in: person.admin_district_ids },
			});

			can(["read", "update", "assign"], "PeopleFlow", {
				assignee_id: person.id,
			});

			can("read", "Notification", { people_id: person.id });
		}

		if (person?.roles?.includes(Role.DISTRICT_PASTOR)) {
			can(["read", "update", "delete"], "PeopleProfile", {
				district_ids: { $in: person.pastor_district_ids },
			});
			can(["create", "read", "delete"], "PeopleProfileNotes", {
				district_ids: { $in: person.pastor_district_ids },
			});
			// Strictly only RUD if owner
			can(["read", "update", "delete"], "PeopleProfileNotes", {
				owner_id: person.id,
			});

			// Manage Duplicates
			can(["read", "merge", "archive"], "Duplicates", {
				district_id: { $in: person.pastor_district_ids },
			});

			// Cells
			can("autoApprove", "Cell");
			can(["read", "update"], "CellDetails", {
				district_id: { $in: person.pastor_district_ids },
			});
			can(["create", "read", "delete"], "CellMembers", {
				district_id: { $in: person.pastor_district_ids },
			});

			// Manage Cells
			can(["create", "read", "update"], "CellCreationRequest", {
				district_ids: { $in: person.pastor_district_ids },
			});
			can(["read", "update"], "CellChangeRequest", {
				district_ids: { $in: person.pastor_district_ids },
			});

			// Cell Map - Not used
			can(["read"], "CellMap", { district_pastor_id: person.id });

			// Zones
			can(["create", "read", "update"], "Zone", {
				district_id: { $in: person.pastor_district_ids },
			});

			// Districts
			can(["read", "update"], "DistrictDetails", {
				district_id: { $in: person.pastor_district_ids },
			});

			// Flows
			can("create", "Flow");
			can("read", "Flow", { district_id: null, get_public: true }); // separate read permissions (some flows allow public to read)
			can(["read", "update", "delete", "add"], "Flow", {
				district_id: { $in: person.pastor_district_ids },
			});
			can(["read", "update", "assign"], "PeopleFlow", {
				district_id: { $in: person.pastor_district_ids },
			});

			can(["read", "update", "assign", "complete"], "PeopleFlow", {
				flow_district_id: { $in: person.pastor_district_ids },
			});

			can(["read", "update", "assign"], "PeopleFlow", {
				assignee_id: person.id,
			});

			can("read", "Notification", { people_id: person.id });
		}

		return build();
	} catch {
		return build();
	}
}
