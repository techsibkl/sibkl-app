import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveClaimedProfileEmail } from "./claimAccountEmail.ts";

describe("resolveClaimedProfileEmail", () => {
	it("keeps the login email when the directory row has none", () => {
		assert.equal(
			resolveClaimedProfileEmail("", "jane@example.com"),
			"jane@example.com",
		);
		assert.equal(
			resolveClaimedProfileEmail(null, " jane@example.com "),
			"jane@example.com",
		);
		assert.equal(
			resolveClaimedProfileEmail(undefined, "jane@example.com"),
			"jane@example.com",
		);
	});

	it("keeps a login email that replaced the directory email", () => {
		assert.equal(
			resolveClaimedProfileEmail("old@example.com", "new@example.com"),
			"new@example.com",
		);
	});

	it("falls back to the directory email when no login email was chosen", () => {
		assert.equal(
			resolveClaimedProfileEmail("old@example.com", ""),
			"old@example.com",
		);
		assert.equal(
			resolveClaimedProfileEmail(" old@example.com ", "   "),
			"old@example.com",
		);
		assert.equal(resolveClaimedProfileEmail("old@example.com", null), "old@example.com");
	});
});
