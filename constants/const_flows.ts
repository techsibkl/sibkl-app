import { FlowStatus } from "@/services/Flow/flow.types";

export const defaultFlowStatusAttrs = {
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
