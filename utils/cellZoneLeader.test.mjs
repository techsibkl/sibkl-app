import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isZoneLeaderOfCell } from "./cellMembership.ts";

describe("isZoneLeaderOfCell", () => {
	it("matches either zone-leader slot when the id is a numeric string", () => {
		assert.equal(
			isZoneLeaderOfCell(15, { zone_leader_1: "15", zone_leader_2: 99 }),
			true,
		);
		assert.equal(
			isZoneLeaderOfCell("22", { zone_leader_1: 15, zone_leader_2: 22 }),
			true,
		);
	});

	it("does not treat a cell leader id list as zone leadership", () => {
		assert.equal(
			isZoneLeaderOfCell(15, { zone_leader_1: 8, zone_leader_2: null }),
			false,
		);
		assert.equal(isZoneLeaderOfCell(15, null), false);
		assert.equal(isZoneLeaderOfCell(null, { zone_leader_1: 15 }), false);
	});
});
