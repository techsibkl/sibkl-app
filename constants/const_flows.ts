import AddToFlowAction from "@/components/Flows/Actions/AddToFlow";
import ChangeFieldAction from "@/components/Flows/Actions/ChangeField";
import MoveToStepAction from "@/components/Flows/Actions/MoveToStep";
import SendMessageAction from "@/components/Flows/Actions/SendMessage";
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

export const ActionComponents = {
	SEND_MESSAGE: SendMessageAction,
	CHANGE_FIELD: ChangeFieldAction,
	MOVE_TO_STEP: MoveToStepAction,
	MOVE_TO_FLOW: AddToFlowAction,
} as const;
