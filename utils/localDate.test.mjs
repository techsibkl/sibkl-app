import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	formatLocalDate,
	parseCalendarDate,
	toCalendarDateString,
} from "./localDate.ts";

describe("formatLocalDate", () => {
	it("keeps the calendar day of local midnight", () => {
		const localMidnight = new Date(2026, 9, 25, 0, 0, 0);
		assert.equal(formatLocalDate(localMidnight), "2026-10-25");
	});

	it("keeps the calendar day of local noon", () => {
		const localNoon = new Date(2026, 9, 25, 12, 0, 0);
		assert.equal(formatLocalDate(localNoon), "2026-10-25");
	});
});

describe("toCalendarDateString", () => {
	it("does not turn local midnight into the previous UTC day", () => {
		const localMidnight = new Date(2026, 9, 25, 0, 0, 0);
		const utcDay = localMidnight.toISOString().slice(0, 10);

		assert.equal(toCalendarDateString(localMidnight), "2026-10-25");
		assert.equal(toCalendarDateString(localMidnight.toISOString()), "2026-10-25");
		// East of UTC, the UTC date part is the previous day. Malaysia is UTC+8.
		if (localMidnight.getTimezoneOffset() < 0) {
			assert.equal(utcDay, "2026-10-24");
		}
	});

	it("keeps a date-only string on that calendar day", () => {
		assert.equal(toCalendarDateString("2026-10-25"), "2026-10-25");
	});

	it("rejects empty and invalid values", () => {
		assert.equal(toCalendarDateString(""), null);
		assert.equal(toCalendarDateString("not-a-date"), null);
		assert.equal(parseCalendarDate("2026-02-31"), null);
	});
});
