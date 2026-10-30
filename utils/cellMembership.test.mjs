import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSamePeopleId, toPeopleId } from "./cellMembership.ts";

describe("toPeopleId", () => {
	it("coerces numeric strings and leaves numbers alone", () => {
		assert.equal(toPeopleId("15"), 15);
		assert.equal(toPeopleId(15), 15);
	});

	it("keeps guest rows null instead of person 0", () => {
		assert.equal(toPeopleId(null), null);
		assert.equal(toPeopleId(undefined), null);
		assert.equal(toPeopleId(""), null);
	});
});

describe("isSamePeopleId", () => {
	it("matches a string attendee id to a numeric roster id", () => {
		assert.equal(isSamePeopleId("15", 15), true);
		assert.equal(isSamePeopleId(15, "15"), true);
	});

	it("does not treat a guest as a member", () => {
		assert.equal(isSamePeopleId(null, 15), false);
		assert.equal(isSamePeopleId(null, null), false);
	});
});

describe("session attendee lookup", () => {
	it("finds a checked-in member when people_id is a string and member.id is a number", () => {
		const attendees = [{ people_id: "15", checked_in_at: "2026-10-24T10:00:00Z" }];
		const members = [{ id: 15 }];
		const attendeeMap = new Map();
		for (const attendee of attendees) {
			const peopleId = toPeopleId(attendee.people_id);
			if (peopleId != null) attendeeMap.set(peopleId, attendee);
		}

		const memberId = toPeopleId(members[0].id);
		assert.equal(attendeeMap.has(memberId), true);
		assert.equal(isSamePeopleId(attendees[0].people_id, members[0].id), true);
	});
});
