import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasClaimPhone } from "./claimSuggestion.ts";

describe("hasClaimPhone", () => {
	it("accepts a full number", () => {
		assert.equal(hasClaimPhone("60123456789"), true);
		assert.equal(hasClaimPhone("+60 12-345 6789"), true);
	});

	it("accepts a masked number that keeps only the first and last digits", () => {
		assert.equal(hasClaimPhone("60*******89"), true);
		assert.equal(hasClaimPhone("6*********9"), true);
	});

	it("rejects an empty or placeholder phone", () => {
		assert.equal(hasClaimPhone(""), false);
		assert.equal(hasClaimPhone(null), false);
		assert.equal(hasClaimPhone("   "), false);
		assert.equal(hasClaimPhone("—"), false);
		assert.equal(hasClaimPhone("N/A"), false);
	});

	it("rejects a short digit string that is not masked", () => {
		assert.equal(hasClaimPhone("12345"), false);
	});
});
