import AddToFlowAction from "@/components/Flows/Actions/AddToFlow";
import AssignDistrictCellAction from "@/components/Flows/Actions/AssignDistrictCellAction";
import AssignPersonAction from "@/components/Flows/Actions/AssignPersonAction";
import ChangeFieldAction from "@/components/Flows/Actions/ChangeField";
import MoveToStepAction from "@/components/Flows/Actions/MoveToStep";
import SendMessageAction from "@/components/Flows/Actions/SendMessage";

// Re-exported for backwards compatibility. Import directly from flowStatusAttrs
// for any new code to keep this file's dependency graph component-only.
export { defaultFlowStatusAttrs } from "@/constants/flowStatusAttrs";

export const ActionComponents = {
	SEND_MESSAGE: SendMessageAction,
	CHANGE_FIELD: ChangeFieldAction,
	MOVE_TO_STEP: MoveToStepAction,
	MOVE_TO_FLOW: AddToFlowAction,
	ASSIGN_DISTRICT_CELL: AssignDistrictCellAction,
	ASSIGN_PERSON: AssignPersonAction,
} as const;
