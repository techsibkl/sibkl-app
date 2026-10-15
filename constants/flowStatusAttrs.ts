import { FlowStatus } from "@/services/Flow/flow.types";

/**
 * Pure data — no component imports.
 * Extracted from const_flows.ts to break circular require cycles that caused
 * production (Hermes) crashes where module bindings were captured as undefined.
 */
export const defaultFlowStatusAttrs: Record<
	FlowStatus,
	{ label: string; icon: string; color: string }
> = {
	[FlowStatus.IRRELEVANT]: {
		label: "Irrelevant",
		icon: "uil:minus-circle",
		color: "gray",
	},
	[FlowStatus.NOT_STARTED]: {
		label: "Not Started",
		icon: "uil:circle",
		color: "gray",
	},
	[FlowStatus.IN_PROGRESS]: {
		label: "In Progress",
		icon: "uil:bowling-ball",
		color: "purple",
	},
	[FlowStatus.COMPLETED_SUCCESS]: {
		label: "Success",
		icon: "uil:check",
		color: "green",
	},
	[FlowStatus.COMPLETED_FAIL]: {
		label: "Failed",
		icon: "uil:times",
		color: "red",
	},
};
