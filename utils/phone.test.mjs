import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	parsePastedPhone,
	splitPhone,
	toInternationalDigits,
} from "./phone.ts";

describe("toInternationalDigits", () => {
	it("prefixes a Malaysian mobile that has no trunk 0", () => {
		assert.equal(toInternationalDigits("123456789"), "60123456789");
		assert.equal(toInternationalDigits("12-345 6789"), "60123456789");
	});

	it("prefixes a 011 mobile whose digits start with 1", () => {
		assert.equal(toInternationalDigits("1123456789"), "601123456789");
	});

	it("strips a local trunk 0 before adding 60", () => {
		assert.equal(toInternationalDigits("0123456789"), "60123456789");
		assert.equal(toInternationalDigits("011-2345 6789"), "601123456789");
	});

	it("leaves numbers that already include a country code unchanged", () => {
		assert.equal(toInternationalDigits("60123456789"), "60123456789");
		assert.equal(toInternationalDigits("+60 12-345 6789"), "60123456789");
		assert.equal(toInternationalDigits("6591234567"), "6591234567");
		assert.equal(toInternationalDigits("+1 415-555-2671"), "14155552671");
		assert.equal(toInternationalDigits("14155552671"), "14155552671");
	});
});

describe("splitPhone", () => {
	it("keeps a local Malaysian mobile on +60, including the leading 1", () => {
		assert.deepEqual(splitPhone("123456789"), {
			dialCode: "60",
			national: "123456789",
		});
		assert.deepEqual(splitPhone("1123456789"), {
			dialCode: "60",
			national: "1123456789",
		});
	});

	it("splits a real NANP number into +1", () => {
		assert.deepEqual(splitPhone("14155552671"), {
			dialCode: "1",
			national: "4155552671",
		});
	});

	it("splits Malaysia and Singapore country codes", () => {
		assert.deepEqual(splitPhone("60123456789"), {
			dialCode: "60",
			national: "123456789",
		});
		assert.deepEqual(splitPhone("6591234567"), {
			dialCode: "65",
			national: "91234567",
		});
	});
});

describe("parsePastedPhone", () => {
	it("does not treat a typed Malaysian mobile as an international paste", () => {
		assert.equal(parsePastedPhone("123456789"), null);
		assert.equal(parsePastedPhone("1123456789"), null);
	});

	it("accepts an explicit international paste", () => {
		assert.deepEqual(parsePastedPhone("+1 415-555-2671"), {
			dialCode: "1",
			national: "4155552671",
		});
		assert.deepEqual(parsePastedPhone("60123456789"), {
			dialCode: "60",
			national: "123456789",
		});
	});
});
