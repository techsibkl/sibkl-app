import { getPeopleFlowPersonId, PeopleFlow } from "./peopleFlow.type";

function assert(condition: boolean, message: string) {
	if (!condition) {
		throw new Error(message);
	}
}

const withPrefixedId: PeopleFlow = { p__id: 42 };
assert(getPeopleFlowPersonId(withPrefixedId) === 42, "p__id should win");

const withPeopleId: PeopleFlow = { people_id: 7 };
assert(getPeopleFlowPersonId(withPeopleId) === 7, "people_id fallback");

const withBoth: PeopleFlow = { p__id: 1, people_id: 99 };
assert(
	getPeopleFlowPersonId(withBoth) === 1,
	"p__id should take precedence over people_id",
);

console.log("peopleFlow.type tests passed");
