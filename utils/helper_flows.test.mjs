import assert from "node:assert/strict";
import test from "node:test";

// Mirror of getPeopleFlowPersonId for unit testing without a TS runner.
function getPeopleFlowPersonId(personFlow) {
	const personId = Number(personFlow.p__id ?? personFlow.people_id);
	return Number.isFinite(personId) ? personId : null;
}

test("getPeopleFlowPersonId prefers p__id", () => {
	assert.equal(getPeopleFlowPersonId({ p__id: 42, people_id: 99 }), 42);
});

test("getPeopleFlowPersonId falls back to people_id", () => {
	assert.equal(getPeopleFlowPersonId({ people_id: 7 }), 7);
});

test("getPeopleFlowPersonId returns null when id is missing", () => {
	assert.equal(getPeopleFlowPersonId({}), null);
	assert.equal(getPeopleFlowPersonId({ p__id: "bad" }), null);
});
